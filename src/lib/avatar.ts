// Simple MD5 hash implementation for Gravatar
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

// Generate Gravatar URL
export const getGravatarUrl = (email: string, size: number = 200): string => {
  const hash = simpleHash(email.toLowerCase().trim());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
};

// Get display avatar URL with fallback chain
export const getDisplayAvatarUrl = (
  avatarUrl: string | null | undefined,
  email: string,
  size: number = 200,
  useDefault: boolean = false
): string | null => {
  // 1. Use custom avatar if available
  if (avatarUrl) {
    return avatarUrl;
  }
  
  // 2. Return null for default avatar component if requested
  if (useDefault) {
    return null;
  }
  
  // 3. Fallback to Gravatar
  return getGravatarUrl(email, size);
};

// Get avatar fallback text from name or email
export const getAvatarFallback = (
  displayName: string | null | undefined,
  username: string | null | undefined,
  email: string
): string => {
  if (displayName) {
    return displayName.charAt(0).toUpperCase();
  }
  
  if (username) {
    return username.charAt(0).toUpperCase();
  }
  
  return email.charAt(0).toUpperCase();
};
