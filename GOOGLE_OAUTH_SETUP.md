# Google OAuth Setup Guide

## Setting up Google OAuth for Melody Map

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API or Google People API

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in application details:
   - App name: Melody Map
   - User support email: your email
   - Developer contact information: your email

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - Your production callback URL
5. Copy the Client ID and Client Secret

### 4. Configure Environment Variables

Create a `.env` file in the backend directory with:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### 5. Test the Integration

1. Start the backend server: `npm run dev`
2. Start the frontend: `npm run dev`
3. Navigate to the auth page and try "Continue with Google"

## Features Implemented

- ✅ Dual authentication (Google OAuth + Email/Password)
- ✅ Database schema with auth_provider field
- ✅ Nullable password for Google users
- ✅ Proper validation preventing password changes for Google users
- ✅ Account linking (local users can link Google accounts)
- ✅ Error handling for mixed authentication attempts
- ✅ Frontend UI with Google sign-in button

## Security Considerations

- Google users cannot set or modify passwords
- Local users must provide valid passwords
- Proper session management with secure cookies
- CSRF protection with proper CORS configuration
