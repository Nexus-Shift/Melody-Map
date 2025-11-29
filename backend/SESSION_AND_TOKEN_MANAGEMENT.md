# Session & Token Management Guide

## Overview

Melody Map uses a **dual authentication system**:

1. **JWT Tokens** for main app authentication (stateless)
2. **Database-stored tokens** for platform connections (Spotify, etc.)

## Authentication Flow

### 1. User Authentication (JWT)

```
User Signs In → JWT Token Generated → Stored in HTTP-only Cookie
      ↓
Valid for 7 days (configurable in JWT_SECRET)
      ↓
Verified on each request via authenticate middleware
```

**Implementation:**
- **Storage**: HTTP-only cookie (`auth_token`)
- **Validation**: `backend/src/middleware/auth.ts`
- **Expiry**: 7 days
- **Refresh**: Manual (user must re-login)

### 2. Platform Connections (Spotify)

```
User Connects Spotify → OAuth Flow → Tokens Stored in DB
      ↓
Access Token (1 hour) + Refresh Token (permanent)
      ↓
Auto-refreshed before expiry by background scheduler
```

**Implementation:**
- **Storage**: `platform_connections` table in PostgreSQL
- **Auto-refresh**: Every 30 minutes via `TokenRefreshScheduler`
- **Manual refresh**: Available via API endpoint

## Database Schema

### `platform_connections` Table

```sql
Column            | Type                     | Description
------------------|--------------------------|----------------------------------
id                | uuid                     | Primary key
user_id           | uuid                     | FK to users table
platform          | varchar(255)             | Platform name (e.g., 'spotify')
external_id       | varchar(255)             | User's ID on the platform
access_token      | text                     | Current access token
refresh_token     | text                     | Refresh token (for renewals)
token_expires_at  | timestamp with time zone | When access token expires
is_active         | boolean                  | Whether connection is active
created_at        | timestamp with time zone | When connected
updated_at        | timestamp with time zone | Last token refresh
```

**Constraints:**
- Unique constraint on `(user_id, platform)` - one connection per platform per user
- Foreign key to `users(id)` with CASCADE delete

## Token Refresh System

### Automatic Background Refresh

**Scheduler**: `backend/src/services/tokenRefreshScheduler.ts`

- **Frequency**: Every 30 minutes
- **Logic**: Refreshes tokens expiring within 5 minutes
- **Started**: Automatically when server starts
- **Logs**: Detailed console output for monitoring

```typescript
// Starts on server initialization
TokenRefreshScheduler.start();
```

### On-Demand Refresh

**Service**: `backend/src/services/spotifyTokenRefresh.ts`

**Methods:**
1. `refreshToken(connectionId)` - Refresh specific connection
2. `refreshAllExpiredTokens()` - Refresh all expiring tokens
3. `getValidAccessToken(userId)` - Get token, refresh if needed

### Middleware for API Calls

**File**: `backend/src/middleware/spotifyAuth.ts`

```typescript
// Use this middleware before Spotify API calls
router.get('/spotify-data', authenticate, ensureSpotifyToken, async (req, res) => {
  // req.spotifyAccessToken is guaranteed to be valid
  const token = req.spotifyAccessToken;
  // Make Spotify API call...
});
```

## API Endpoints

### Session Management

#### 1. Sign In (Get JWT)
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Signed in successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

Sets `auth_token` cookie (HTTP-only, 7 days)

#### 2. Get Current User
```http
GET /api/auth/me
Cookie: auth_token=<jwt>

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "connectedPlatforms": ["spotify"]
  }
}
```

#### 3. Sign Out
```http
POST /api/auth/signout

Response:
{
  "message": "Signed out successfully"
}
```

Clears `auth_token` cookie

### Spotify Connection Management

#### 1. Connect Spotify
```http
GET /api/auth/spotify
Cookie: auth_token=<jwt>
```

Redirects to Spotify OAuth, then back to `/dashboard?connected=spotify`

#### 2. Check Spotify Status
```http
GET /api/auth/spotify/status
Cookie: auth_token=<jwt>

Response:
{
  "connected": true,
  "isActive": true,
  "externalId": "spotify_user_id",
  "tokenStatus": {
    "isExpired": false,
    "expiresAt": "2025-11-27T23:30:00.000Z",
    "expiresInSeconds": 3540,
    "expiresInMinutes": 59,
    "willAutoRefresh": false
  },
  "lastUpdated": "2025-11-27T22:30:00.000Z",
  "connectedAt": "2025-11-27T20:00:00.000Z"
}
```

#### 3. Test Spotify Connection
```http
GET /api/auth/test-connection
Cookie: auth_token=<jwt>

Response:
{
  "connected": true,
  "spotifyUser": {
    "id": "spotify_user_id",
    "display_name": "User Name",
    "email": "user@example.com"
  }
}
```

#### 4. Disconnect Spotify
```http
POST /api/auth/spotify/disconnect
Cookie: auth_token=<jwt>

Response:
{
  "message": "Spotify disconnected successfully",
  "success": true
}
```

#### 5. Get All Connections
```http
GET /api/auth/connections
Cookie: auth_token=<jwt>

Response:
{
  "connections": [
    {
      "platform": "spotify",
      "external_id": "spotify_user_id",
      "created_at": "2025-11-27T20:00:00.000Z",
      "token_expires_at": "2025-11-27T23:30:00.000Z",
      "tokenValid": true,
      "expiresIn": 3540
    }
  ]
}
```

#### 6. Manual Token Refresh
```http
POST /api/auth/refresh-tokens
Cookie: auth_token=<jwt>

Response:
{
  "message": "Token refresh completed",
  "results": [
    {
      "connectionId": "uuid",
      "success": true
    }
  ]
}
```

## How It Works: Complete Flow

### Initial Setup
1. User registers/signs in → Gets JWT cookie
2. User clicks "Connect Spotify" → OAuth flow starts
3. After OAuth: Tokens stored in `platform_connections` table
4. Background scheduler starts refreshing tokens automatically

### During Usage
1. **Frontend makes API call** with JWT cookie
2. **`authenticate` middleware** validates JWT
3. **`ensureSpotifyToken` middleware** (if needed):
   - Checks token expiry
   - Auto-refreshes if < 5 minutes remaining
   - Attaches valid token to request
4. **Route handler** uses token to call Spotify API

### Token Lifecycle

```
Spotify Token Created (1 hour expiry)
      ↓
Scheduler checks every 30 minutes
      ↓
Token expires in < 5 minutes?
      ↓ YES
Automatically refresh using refresh_token
      ↓
Update database with new access_token
      ↓
Continue until refresh_token becomes invalid
      ↓
Mark connection as inactive
      ↓
User must reconnect
```

## Security Features

### JWT Security
- **HTTP-only cookies**: Cannot be accessed by JavaScript
- **Secure flag**: HTTPS-only in production
- **SameSite**: CSRF protection
- **Expiration**: 7 days (configurable)

### Platform Token Security
- **Encrypted storage**: Tokens stored as `text` (consider encryption)
- **Automatic cleanup**: Inactive connections after 7 days
- **Token validation**: Before each API call
- **Refresh handling**: Invalid refresh_token → Mark inactive

### CORS Protection
- **Whitelisted origins**: Only configured domains allowed
- **Credentials enabled**: For cookie transmission
- **Preflight caching**: 24-hour cache for performance

## Monitoring & Debugging

### Server Logs

```bash
# Token refresh scheduler
🔄 Starting token refresh scheduler...
✅ Token refresh scheduler started (runs every 30 minutes)

# Refresh cycle
🔄 Token refresh cycle starting at 2025-11-27T22:30:00.000Z
🔄 Refreshing 2 expiring Spotify token(s)...
✅ Refreshed token for connection uuid-1
✅ Refreshed token for connection uuid-2
📊 Token refresh complete: 2 succeeded, 0 failed
✅ Token refresh cycle completed

# Cleanup
🧹 Cleaned up 1 expired connection(s)
```

### Database Queries

```sql
-- Check all active connections
SELECT user_id, platform, 
       token_expires_at,
       EXTRACT(EPOCH FROM (token_expires_at - NOW())) / 60 as minutes_until_expiry,
       is_active
FROM platform_connections
WHERE is_active = true;

-- Check expired tokens
SELECT COUNT(*) 
FROM platform_connections 
WHERE token_expires_at < NOW() AND is_active = true;

-- Check user's connections
SELECT platform, external_id, token_expires_at, is_active
FROM platform_connections
WHERE user_id = 'user-uuid-here';
```

## Environment Variables

```env
# JWT Authentication
JWT_SECRET=your-secret-key-here                    # For JWT signing

# Session Management
SESSION_SECRET=your-session-secret-here            # For express-session

# Spotify OAuth
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret

# URLs
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:8080

# CORS
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

## Troubleshooting

### Issue: "Spotify not connected" error

**Causes:**
1. Token expired and refresh failed
2. Connection marked as inactive
3. User never connected Spotify

**Solution:**
```http
GET /api/auth/spotify/status    # Check connection status
POST /api/auth/spotify/disconnect    # Clear old connection
GET /api/auth/spotify    # Reconnect
```

### Issue: Tokens not refreshing

**Check:**
1. Scheduler running: Look for "Token refresh scheduler started" in logs
2. Database connectivity
3. Spotify credentials configured

**Manual refresh:**
```http
POST /api/auth/refresh-tokens
```

### Issue: JWT expired

**Cause:** User hasn't logged in for 7+ days

**Solution:**
- User must sign in again
- JWT tokens are not auto-refreshed (by design)

## Best Practices

### For Frontend Developers

1. **Always check connection status** before Spotify features
2. **Handle reconnection gracefully**:
   ```javascript
   if (error.code === 'SPOTIFY_NOT_CONNECTED') {
     // Show "Reconnect Spotify" button
   }
   ```
3. **Use JWT cookie** - don't try to extract/store it manually
4. **Check token expiry** from `/api/auth/spotify/status`

### For Backend Developers

1. **Use middleware** instead of manual token checks
2. **Log token operations** for debugging
3. **Handle refresh failures** gracefully
4. **Test token expiry** scenarios
5. **Monitor scheduler logs** for issues

## Future Improvements

- [ ] Add token encryption at rest
- [ ] Implement refresh token rotation
- [ ] Add webhook for Spotify token revocation
- [ ] Support multiple platform connections (Apple Music, etc.)
- [ ] Add metrics/monitoring dashboard
- [ ] Implement rate limiting per platform
- [ ] Add audit log for connection changes
