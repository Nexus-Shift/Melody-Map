import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import passport from "../config/passport";
import { db } from "../config/database";

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

// Helper function to set auth cookie
const setAuthCookie = (res: express.Response, token: string) => {
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/auth?error=oauth_failed`,
  }),
  (req: express.Request, res: express.Response) => {
    // Successful authentication
    const user = req.user as { id: string; email: string };
    const token = generateToken(user.id);
    setAuthCookie(res, token);

    // Redirect to frontend dashboard
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

// Sign up (Email/Password only - Google users use OAuth flow)
router.post(
  "/signup",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("username")
      .optional()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, username } = req.body;

      // Check if user already exists
      const existingUser = await db("users").where("email", email).first();
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Check if username already exists (if provided)
      if (username) {
        const existingUsername = await db("users")
          .where("username", username)
          .first();
        if (existingUsername) {
          return res.status(409).json({ error: "Username already taken" });
        }
      }

      // Hash password - required for local auth
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const userId = uuidv4();
      const finalUsername = username || email.split("@")[0];

      await db("users").insert({
        id: userId,
        email,
        username: finalUsername,
        password: hashedPassword,
        auth_provider: "local",
        google_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Create profile
      await db("profiles").insert({
        id: uuidv4(),
        user_id: userId,
        display_name: finalUsername,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Generate JWT and set cookie
      const token = generateToken(userId);
      setAuthCookie(res, token);

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: userId,
          email,
          username: finalUsername,
          displayName: finalUsername,
          auth_provider: "local",
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Sign in (Email/Password only - Google users use OAuth flow)
router.post(
  "/signin",
  [body("email").isEmail().normalizeEmail(), body("password").exists()],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user and profile
      const user = await db("users").where("email", email).first();
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if user is Google OAuth user (shouldn't use password login)
      if (user.auth_provider === "google") {
        return res.status(400).json({
          error:
            "This account uses Google sign-in. Please use the Google login button.",
          useGoogleAuth: true,
        });
      }

      // Check password for local users
      if (!user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const profile = await db("profiles").where("user_id", user.id).first();

      // Generate JWT and set cookie
      const token = generateToken(user.id);
      setAuthCookie(res, token);

      res.json({
        message: "Signed in successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName:
            profile?.display_name || user.username || user.email.split("@")[0],
          auth_provider: user.auth_provider,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Sign out
router.post("/signout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ message: "Signed out successfully" });
});

// Get current user
router.get("/me", async (req: express.Request, res: express.Response) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await db("users").where("id", decoded.userId).first();

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const profile = await db("profiles").where("user_id", user.id).first();
    
    // Get connected platforms
    const connections = await db("platform_connections")
      .where({ user_id: user.id, is_active: true })
      .pluck("platform");

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName:
          profile?.display_name || user.username || user.email.split("@")[0],
        auth_provider: user.auth_provider,
        connectedPlatforms: connections,
      },
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Check if user can change password (only local auth users)
router.get(
  "/can-change-password",
  async (req: express.Request, res: express.Response) => {
    try {
      const token = req.cookies.auth_token;
      if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      const user = await db("users").where("id", decoded.userId).first();

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      res.json({
        canChangePassword: user.auth_provider === "local",
        auth_provider: user.auth_provider,
      });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  }
);

// Change password (only for local auth users)
router.post(
  "/change-password",
  [
    body("currentPassword")
      .exists()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const token = req.cookies?.auth_token;
      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      const user = await db("users").where("id", decoded.userId).first();

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Only local auth users can change passwords
      if (user.auth_provider !== "local") {
        return res.status(403).json({
          error:
            "Google authenticated users cannot change passwords. Password changes must be done through Google.",
          auth_provider: user.auth_provider,
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Verify current password
      if (!user.password) {
        return res
          .status(400)
          .json({ error: "No password set for this account" });
      }

      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await db("users").where("id", user.id).update({
        password: hashedNewPassword,
        updated_at: new Date(),
      });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
