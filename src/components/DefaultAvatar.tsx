import React from 'react';

interface DefaultAvatarProps {
  className?: string;
  size?: number;
}

export const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ className = "", size = 128 }) => {
  // Create unique IDs for this instance to avoid conflicts
  const uniqueId = React.useMemo(() => Math.random().toString(36).substr(2, 9), []);
  const gradientId = `avatarGradient-${uniqueId}`;
  const shadowId = `shadow-${uniqueId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0.7)" />
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="hsl(var(--primary) / 0.3)"/>
        </filter>
      </defs>
      
      <circle
        cx="64"
        cy="64"
        r="64"
        fill={`url(#${gradientId})`}
        filter={`url(#${shadowId})`}
      />
      
      {/* Music note decoration in background */}
      <g opacity="0.1" transform="translate(20, 20)">
        <path
          d="M24 8 L24 50 C22 52, 18 52, 16 50 C14 48, 14 44, 16 42 C18 40, 22 40, 24 42 L24 20 L40 16 L40 46 C38 48, 34 48, 32 46 C30 44, 30 40, 32 38 C34 36, 38 36, 40 38 L40 8 Z"
          fill="hsl(var(--primary-foreground))"
        />
      </g>
      
      {/* User icon */}
      <g transform="translate(32, 24)">
        {/* Head */}
        <circle
          cx="32"
          cy="28"
          r="18"
          fill="hsl(var(--primary-foreground))"
          opacity="0.9"
        />
        
        {/* Body */}
        <path
          d="M12 80 C12 65, 20 52, 32 52 C44 52, 52 65, 52 80 L52 80 L12 80 Z"
          fill="hsl(var(--primary-foreground))"
          opacity="0.9"
        />
      </g>
    </svg>
  );
};

export default DefaultAvatar;
