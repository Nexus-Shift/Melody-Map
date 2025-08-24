
# Melody Map 🎵

A modern music analytics platform that helps you discover insights about your listening habits across multiple streaming platforms.

## Features

- **Multi-Platform Integration**: Connect Spotify, Apple Music, and Deezer
- **Listening Analytics**: Track your music consumption patterns
- **Genre Analysis**: Discover your top genres and musical preferences
- **Beautiful Dashboard**: Modern, responsive UI with dark theme
- **Secure Authentication**: JWT-based authentication system

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Query** for data fetching
- **React Router** for navigation

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database
- **Knex.js** for migrations and queries
- **JWT** authentication
- **bcryptjs** for password hashing

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/sachinpandit140/Melody-Map.git
cd Melody-Map
```

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Install backend dependencies:**
```bash
cd backend
npm install
```

4. **Setup PostgreSQL database:**
```bash
createdb melody_map_dev
```

5. **Configure environment variables:**
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your database credentials

# Frontend (in root directory)
cp .env.local.example .env.local
```

6. **Run database migrations:**
```bash
cd backend
npm run migrate
```

7. **Start the development servers:**
```bash
# Start both frontend and backend
npm run dev:all

# Or start them separately:
npm run dev          # Frontend only
npm run dev:backend  # Backend only
```

The app will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001

## Project Structure

```
melody-map/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   └── assets/            # Static assets
└── backend/               # Express.js backend
    ├── src/
    │   ├── routes/        # API routes
    │   ├── middleware/    # Express middleware
    │   └── config/        # Configuration files
    └── migrations/        # Database migrations
```

## API Documentation

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/me` - Get current user

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

### Music (Coming Soon)
- `GET /api/music/platforms` - Connected platforms
- `GET /api/music/history` - Listening history
- `GET /api/music/genres` - Top genres
- `GET /api/music/stats` - Listening statistics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Lucide](https://lucide.dev/) for the icons
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
