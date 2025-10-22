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
        connectedPlatforms?: string[];
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
    connectedPlatforms?: string[];
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

    // Get user from database with connected platforms
    const user = await db("users").where("id", decoded.userId).first();

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Get connected platforms (only active and non-expired)
    const allConnections = await db("platform_connections")
      .where({ user_id: user.id, is_active: true })
      .select('platform', 'token_expires_at');
    
    // Debug: connections validated in background

    const connections = allConnections
      .filter(c => new Date(c.token_expires_at) > new Date())
      .map(c => c.platform);

    req.authUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      auth_provider: user.auth_provider,
      google_id: user.google_id,
      connectedPlatforms: connections,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
