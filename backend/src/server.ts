import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import passport from "./config/passport";
import session from "express-session";

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import musicRoutes from './routes/music';
import spotifyRoutes from './routes/spotify';
import spotifyApiRoutes from './routes/spotify-api';
import uploadRoutes from './routes/upload';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import { TokenRefreshScheduler } from './services/tokenRefreshScheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

// Middleware
app.use(limiter);
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:8080",
      "http://localhost:8080",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration for passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', spotifyRoutes);
app.use('/api/user', authenticate, userRoutes);
app.use('/api/music', authenticate, musicRoutes);
app.use('/api/spotify', authenticate, spotifyApiRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎵 Melody Map Backend Ready!`);
  
  // Start token refresh scheduler
  TokenRefreshScheduler.start();
});

export default app;
