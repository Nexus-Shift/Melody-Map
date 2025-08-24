# Melody Map Backend

Express.js backend API for the Melody Map music analytics platform.

## Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Setup PostgreSQL database:**
```bash
# Create database
createdb melody_map_dev

# Or using psql
psql -U postgres
CREATE DATABASE melody_map_dev;
```

3. **Environment setup:**
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

4. **Run migrations:**
```bash
npm run migrate
```

5. **Start development server:**
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/me` - Get current user

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Music (Future)
- `GET /api/music/platforms` - Get connected platforms
- `GET /api/music/history` - Get listening history
- `GET /api/music/genres` - Get top genres
- `GET /api/music/stats` - Get listening statistics

## Database Schema

### Tables
- `users` - User accounts with authentication
- `profiles` - User profile information
- `platform_connections` - OAuth connections to music platforms
- `artists` - Music artist information
- `tracks` - Track/song information
- `listening_history` - User listening activity

## Development

The backend uses:
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Knex.js** - Query builder and migrations
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Future Features

- Spotify API integration
- Apple Music API integration
- Deezer API integration
- Real-time music analytics
- Listening habit insights
