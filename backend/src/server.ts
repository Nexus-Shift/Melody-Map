import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import passport from "./config/passport";
import session from "express-session";
import { corsOptions, logCorsConfig } from "./config/cors";

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import musicRoutes from './routes/music';
import spotifyRoutes from './routes/spotify';
import spotifyApiRoutes from './routes/spotify-api';
import deezerRoutes from './routes/deezer';
import deezerApiRoutes from './routes/deezer-api';
import uploadRoutes from './routes/upload';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import { TokenRefreshScheduler } from './services/tokenRefreshScheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration
// Imported from ./config/cors.ts for better organization
// Allows requests from whitelisted origins defined in CORS_ORIGINS env variable

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit for development
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting in development mode
    return process.env.NODE_ENV !== 'production';
  }
});

// Middleware
app.use(cors(corsOptions));
app.use(limiter);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
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
app.use('/api/auth', deezerRoutes);
app.use('/api/user', authenticate, userRoutes);
app.use('/api/music', authenticate, musicRoutes);
app.use('/api/spotify', authenticate, spotifyApiRoutes);
app.use('/api/deezer', authenticate, deezerApiRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Melody Map Backend Ready!`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Log CORS configuration
  logCorsConfig();
  
  // Start token refresh scheduler
  TokenRefreshScheduler.start();
});

export default app;
