// Mock data for Deezer when API credentials are not available
export const mockDeezerProfile = {
  id: 123456789,
  name: "Demo User",
  email: "demo@example.com",
  country: "US",
  picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=deezer",
  picture_small: "https://api.dicebear.com/7.x/avataaars/svg?seed=deezer&size=56",
  picture_medium: "https://api.dicebear.com/7.x/avataaars/svg?seed=deezer&size=128",
  picture_big: "https://api.dicebear.com/7.x/avataaars/svg?seed=deezer&size=256",
  picture_xl: "https://api.dicebear.com/7.x/avataaars/svg?seed=deezer&size=512",
};

export const mockDeezerTracks = [
  {
    id: 1,
    title: "Blinding Lights",
    duration: 200,
    preview: "",
    link: "https://www.deezer.com/track/1",
    rank: 950000,
    artist: {
      id: 1,
      name: "The Weeknd",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=weeknd",
      picture_medium: "https://api.dicebear.com/7.x/avataaars/svg?seed=weeknd&size=128",
    },
    album: {
      id: 1,
      title: "After Hours",
      cover: "https://picsum.photos/seed/album1/300",
      cover_medium: "https://picsum.photos/seed/album1/300",
      cover_big: "https://picsum.photos/seed/album1/500",
    },
  },
  {
    id: 2,
    title: "Levitating",
    duration: 203,
    preview: "",
    link: "https://www.deezer.com/track/2",
    rank: 920000,
    artist: {
      id: 2,
      name: "Dua Lipa",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=dua",
      picture_medium: "https://api.dicebear.com/7.x/avataaars/svg?seed=dua&size=128",
    },
    album: {
      id: 2,
      title: "Future Nostalgia",
      cover: "https://picsum.photos/seed/album2/300",
      cover_medium: "https://picsum.photos/seed/album2/300",
      cover_big: "https://picsum.photos/seed/album2/500",
    },
  },
  {
    id: 3,
    title: "Save Your Tears",
    duration: 215,
    preview: "",
    link: "https://www.deezer.com/track/3",
    rank: 910000,
    artist: {
      id: 1,
      name: "The Weeknd",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=weeknd",
      picture_medium: "https://api.dicebear.com/7.x/avataaars/svg?seed=weeknd&size=128",
    },
    album: {
      id: 1,
      title: "After Hours",
      cover: "https://picsum.photos/seed/album1/300",
      cover_medium: "https://picsum.photos/seed/album1/300",
      cover_big: "https://picsum.photos/seed/album1/500",
    },
  },
  {
    id: 4,
    title: "Peaches",
    duration: 198,
    preview: "",
    link: "https://www.deezer.com/track/4",
    rank: 900000,
    artist: {
      id: 3,
      name: "Justin Bieber",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=bieber",
      picture_medium: "https://api.dicebear.com/7.x/avataaars/svg?seed=bieber&size=128",
    },
    album: {
      id: 3,
      title: "Justice",
      cover: "https://picsum.photos/seed/album3/300",
      cover_medium: "https://picsum.photos/seed/album3/300",
      cover_big: "https://picsum.photos/seed/album3/500",
    },
  },
  {
    id: 5,
    title: "Good 4 U",
    duration: 178,
    preview: "",
    link: "https://www.deezer.com/track/5",
    rank: 890000,
    artist: {
      id: 4,
      name: "Olivia Rodrigo",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=olivia",
      picture_medium: "https://api.dicebear.com/7.x/avataaars/svg?seed=olivia&size=128",
    },
    album: {
      id: 4,
      title: "SOUR",
      cover: "https://picsum.photos/seed/album4/300",
      cover_medium: "https://picsum.photos/seed/album4/300",
      cover_big: "https://picsum.photos/seed/album4/500",
    },
  },
];

export const mockDeezerArtists = [
  {
    id: 1,
    name: "The Weeknd",
    link: "https://www.deezer.com/artist/1",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=weeknd",
    picture_medium: "https://api.dicebear.com/7.x/avataaars/svg?seed=weeknd&size=128",
    picture_big: "https://api.dicebear.com/7.x/avataaars/svg?seed=weeknd&size=256",
    nb_fan: 15420000,
    nb_album: 8,
  },
  {
    id: 2,
    name: "Dua Lipa",
    link: "https://www.deezer.com/artist/2",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=dua",
    picture_medium: "https://api.dicebear.com/7.x/avataaars/svg?seed=dua&size=128",
    picture_big: "https://api.dicebear.com/7.x/avataaars/svg?seed=dua&size=256",
    nb_fan: 12850000,
    nb_album: 5,
  },
  {
    id: 3,
    name: "Justin Bieber",
    link: "https://www.deezer.com/artist/3",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=bieber",
    picture_medium: "https://api.dicebear.com/7.x/avataaars/svg?seed=bieber&size=128",
    picture_big: "https://api.dicebear.com/7.x/avataaars/svg?seed=bieber&size=256",
    nb_fan: 18920000,
    nb_album: 12,
  },
  {
    id: 4,
    name: "Olivia Rodrigo",
    link: "https://www.deezer.com/artist/4",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=olivia",
    picture_medium: "https://api.dicebear.com/7.x/avataaars/svg?seed=olivia&size=128",
    picture_big: "https://api.dicebear.com/7.x/avataaars/svg?seed=olivia&size=256",
    nb_fan: 9430000,
    nb_album: 2,
  },
];

export const mockDeezerStats = {
  totalTracks: 156,
  totalArtists: 48,
  totalAlbums: 32,
  topGenres: [
    { genre: "Pop", count: 45 },
    { genre: "R&B", count: 32 },
    { genre: "Electronic", count: 28 },
    { genre: "Hip Hop", count: 22 },
    { genre: "Rock", count: 18 },
  ],
  listeningTimeEstimate: 520, // minutes
};

// Mock data for Apple Music when API is not available
export const mockAppleMusicProfile = {
  id: "987654321",
  name: "Demo User",
  handle: "@demouser",
  artwork: "https://api.dicebear.com/7.x/avataaars/svg?seed=apple",
};

export const mockAppleMusicTracks = [
  {
    id: "am1",
    name: "As It Was",
    artistName: "Harry Styles",
    albumName: "Harry's House",
    duration_ms: 167000,
    artwork: "https://picsum.photos/seed/am1/300",
    playCount: 450,
  },
  {
    id: "am2",
    name: "Anti-Hero",
    artistName: "Taylor Swift",
    albumName: "Midnights",
    duration_ms: 200000,
    artwork: "https://picsum.photos/seed/am2/300",
    playCount: 420,
  },
  {
    id: "am3",
    name: "Flowers",
    artistName: "Miley Cyrus",
    albumName: "Endless Summer Vacation",
    duration_ms: 200000,
    artwork: "https://picsum.photos/seed/am3/300",
    playCount: 380,
  },
  {
    id: "am4",
    name: "Unholy",
    artistName: "Sam Smith & Kim Petras",
    albumName: "Gloria",
    duration_ms: 156000,
    artwork: "https://picsum.photos/seed/am4/300",
    playCount: 360,
  },
  {
    id: "am5",
    name: "Kill Bill",
    artistName: "SZA",
    albumName: "SOS",
    duration_ms: 153000,
    artwork: "https://picsum.photos/seed/am5/300",
    playCount: 340,
  },
];

export const mockAppleMusicArtists = [
  {
    id: "ama1",
    name: "Taylor Swift",
    artwork: "https://api.dicebear.com/7.x/avataaars/svg?seed=taylor",
    genres: ["Pop", "Country"],
  },
  {
    id: "ama2",
    name: "Harry Styles",
    artwork: "https://api.dicebear.com/7.x/avataaars/svg?seed=harry",
    genres: ["Pop", "Rock"],
  },
  {
    id: "ama3",
    name: "SZA",
    artwork: "https://api.dicebear.com/7.x/avataaars/svg?seed=sza",
    genres: ["R&B", "Soul"],
  },
  {
    id: "ama4",
    name: "Miley Cyrus",
    artwork: "https://api.dicebear.com/7.x/avataaars/svg?seed=miley",
    genres: ["Pop", "Rock"],
  },
];

export const mockAppleMusicStats = {
  totalTracks: 203,
  totalArtists: 67,
  topGenres: [
    { genre: "Pop", count: 78 },
    { genre: "Rock", count: 45 },
    { genre: "Hip Hop", count: 34 },
    { genre: "R&B", count: 28 },
    { genre: "Electronic", count: 18 },
  ],
  listeningTimeEstimate: 720, // minutes
};

// Helper to check if using mock data
export const useMockDeezerData = () => {
  const deezerAppId = import.meta.env.VITE_DEEZER_APP_ID;
  return !deezerAppId || deezerAppId === 'YOUR_DEEZER_APP_ID_HERE';
};

export const useMockAppleMusicData = () => {
  // Apple Music is always mock for now since API is paid
  return true;
};
