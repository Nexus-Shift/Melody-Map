# 🎵 Spotify Integration Setup Guide

This guide will help you set up Spotify API integration for Melody Map.

## 1. Create a Spotify App

1. **Go to Spotify Developer Dashboard**
   - Visit: https://developer.spotify.com/dashboard
   - Login with your Spotify account

2. **Create a New App**
   - Click "Create an App"
   - App Name: `Melody Map` (or your preferred name)
   - App Description: `Music analytics dashboard`
   - Redirect URI: `http://127.0.0.1:3001/api/auth/spotify/callback`
     - **Alternative**: `http://localhost:3001/api/auth/spotify/callback`
     - **Tip**: You can add both URIs for maximum compatibility
   - Check the box agreeing to terms

3. **Get Your Credentials**
   - After creating, you'll see your app dashboard
   - Copy the **Client ID**
   - Click "Show Client Secret" and copy the **Client Secret**

## 2. Configure Your Backend

1. **Update your `.env` file:**
```bash
# Add these to your backend/.env file
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
BACKEND_URL=http://localhost:3001
```

2. **Restart your backend server:**
```bash
cd backend
npm run dev
```

## 3. Test the Integration

1. **Start both servers:**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend  
cd backend && npm run dev
```

2. **Test the flow:**
   - Go to http://localhost:8080
   - Login to your account
   - Click "Connect Spotify" on the dashboard
   - Authorize the app on Spotify
   - You should be redirected back to the dashboard

## 4. Available Spotify Endpoints

Once connected, these endpoints will be available:

- **GET** `/api/spotify/spotify/profile` - User's Spotify profile
- **GET** `/api/spotify/spotify/top-tracks` - User's top tracks
- **GET** `/api/spotify/spotify/top-artists` - User's top artists  
- **GET** `/api/spotify/spotify/recently-played` - Recently played tracks
- **GET** `/api/spotify/spotify/currently-playing` - Currently playing track

### Query Parameters:
- `time_range`: `short_term` (4 weeks), `medium_term` (6 months), `long_term` (all time)
- `limit`: Number of items to return (1-50)

## 5. Production Setup

For production deployment:

1. **Update Redirect URI in Spotify App:**
   - Add your production domain: `https://yourdomain.com/api/auth/spotify/callback`

2. **Update Environment Variables:**
```bash
BACKEND_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

## 6. Troubleshooting

**Common Issues:**

1. **"Invalid redirect URI"**
   - Make sure the redirect URI in Spotify dashboard exactly matches your backend URL
   - Check for trailing slashes

2. **"Invalid client"**
   - Double-check your Client ID and Client Secret
   - Make sure they're set in the correct `.env` file

3. **CORS errors**
   - Ensure `FRONTEND_URL` is correctly set in backend environment
   - Check that both servers are running on the expected ports

4. **Token expired**
   - Currently, users need to reconnect when tokens expire
   - Token refresh will be implemented in a future update

## 7. What's Next?

After setting up Spotify integration:

1. **Test the connection** by clicking "Connect Spotify"
2. **Check the browser network tab** to see API calls
3. **View your data** in the dashboard (coming soon)
4. **Explore the API endpoints** using tools like Postman

The foundation is now set for rich music analytics! 🎶