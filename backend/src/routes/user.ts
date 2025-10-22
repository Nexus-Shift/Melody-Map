import express from "express";
import { AuthRequest } from "../middleware/auth";
import { db } from "../config/database";

const router = express.Router();

// Get user profile
router.get("/profile", async (req: AuthRequest, res) => {
  try {
    const profile = await db("profiles")
      .where("user_id", req.authUser!.id)
      .first();

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ profile });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile
router.put("/profile", async (req: AuthRequest, res) => {
  try {
    const { display_name, avatar_url } = req.body;

    // Update profile
    await db("profiles").where("user_id", req.authUser!.id).update({
      display_name,
      avatar_url,
      updated_at: new Date(),
    });

    const updatedProfile = await db("profiles")
      .where("user_id", req.authUser!.id)
      .first();
    const updatedUser = await db("users").where("id", req.authUser!.id).first();

    res.json({
      profile: updatedProfile,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        displayName: updatedProfile?.display_name || updatedUser.username,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
