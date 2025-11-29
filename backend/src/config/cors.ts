import cors from 'cors';

/**
 * CORS Configuration
 * Defines allowed origins, methods, and headers for cross-origin requests
 */

// Parse allowed origins from environment variable
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:8080', 'http://127.0.0.1:8080'];

// Add production URL if in production
if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

export const corsOptions: cors.CorsOptions = {
  /**
   * Origin validation function
   * Allows requests from whitelisted origins and requests with no origin (mobile apps, Postman, etc.)
   */
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl, or same-origin)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      console.warn(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS policy'));
    }
  },

  /**
   * Allow credentials (cookies, authorization headers, TLS client certificates)
   * Required for authentication with cookies
   */
  credentials: true,

  /**
   * Allowed HTTP methods
   */
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],

  /**
   * Allowed headers in the request
   */
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],

  /**
   * Headers exposed to the client
   */
  exposedHeaders: [
    'Set-Cookie',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],

  /**
   * Cache preflight requests for 24 hours
   * Reduces the number of OPTIONS requests
   */
  maxAge: 86400, // 24 hours in seconds

  /**
   * Pass the CORS preflight response to the next handler
   */
  preflightContinue: false,

  /**
   * Status code for successful OPTIONS requests
   */
  optionsSuccessStatus: 204,
};

/**
 * Log CORS configuration on startup
 */
export const logCorsConfig = () => {
  console.log('CORS Configuration:');
  console.log(`  Allowed Origins: ${allowedOrigins.join(', ')}`);
  console.log(`  Credentials: ${corsOptions.credentials}`);
  const methods = Array.isArray(corsOptions.methods) 
    ? corsOptions.methods.join(', ') 
    : corsOptions.methods;
  console.log(`  Methods: ${methods}`);
};
