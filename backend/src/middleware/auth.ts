import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/database";

// Extend Express Request to avoid conflicts with passport User type
declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email: string;
        username?: string;
        auth_provider: string;
        google_id?: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  authUser?: {
    id: string;
    email: string;
    username?: string;
    auth_provider: string;
    google_id?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.auth_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    // Get user from database
    const user = await db("users").where("id", decoded.userId).first();

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.authUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      auth_provider: user.auth_provider,
      google_id: user.google_id,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
