// Light theme - Owl Marketing Style
export const lightTheme = {
  mode: 'light',
  colors: {
    primary: {
      main: '#ff8c42',      // Orange
      light: '#ffa866',
      dark: '#e67a35',
      50: '#fff5ee',
      100: '#ffebdb',
      200: '#ffd4b8',
      300: '#ffbd94',
      400: '#ffa866',
      500: '#ff8c42',
      600: '#e67a35',
      700: '#cc6a2a',
      800: '#b35a20',
      900: '#994a15',
      contrast: '#ffffff',
    },
    secondary: {
      main: '#1a1a1a',      // Dark
      light: '#333333',
      dark: '#000000',
      50: '#f5f5f5',
      100: '#e5e5e5',
      200: '#cccccc',
      300: '#b3b3b3',
      400: '#808080',
      500: '#666666',
      600: '#4d4d4d',
      700: '#333333',
      800: '#1a1a1a',
      900: '#000000',
      contrast: '#ffffff',
    },
    accent: {
      main: '#ff6b35',      // Deep Orange
      light: '#ff8c5a',
      dark: '#e55a25',
      contrast: '#ffffff',
    },
    success: {
      main: '#22c55e',      // Green
      light: '#4ade80',
      dark: '#16a34a',
      bg: '#dcfce7',
      contrast: '#ffffff',
    },
    warning: {
      main: '#eab308',      // Yellow
      light: '#facc15',
      dark: '#ca8a04',
      bg: '#fef9c3',
      contrast: '#000000',
    },
    error: {
      main: '#dc2626',      // Red
      light: '#f87171',
      dark: '#b91c1c',
      bg: '#fee2e2',
      contrast: '#ffffff',
    },
    info: {
      main: '#3b82f6',      // Blue
      light: '#60a5fa',
      dark: '#2563eb',
      bg: '#dbeafe',
      contrast: '#ffffff',
    },
    neutral: {
      50: '#faf8f5',
      100: '#f5f1eb',
      200: '#e8e4de',
      300: '#d4d0ca',
      400: '#a8a49e',
      500: '#7c7872',
      600: '#5c5854',
      700: '#3d3935',
      800: '#1f1b17',
      900: '#0a0a0f',
    },
    background: {
      default: '#faf8f5',   // Warm white
      paper: '#ffffff',
      elevated: '#f5f1eb',
      dark: '#0a0a0f',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
      tertiary: '#999999',
      disabled: '#cccccc',
      contrast: '#ffffff',
    },
    platforms: {
      facebook: '#1877f2',
      instagram: '#e4405f',
      twitter: '#1da1f2',
      linkedin: '#0a66c2',
      youtube: '#ff0000',
      tiktok: '#000000',
    },
    border: {
      default: '#e8e4de',
      light: '#f5f1eb',
      focus: '#ff8c42',
    },
    glow: {
      orange: '0 0 20px rgba(255, 140, 66, 0.15)',
      orangeStrong: '0 0 30px rgba(255, 140, 66, 0.25)',
    },
  },
  gradients: {
    primary: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
    primaryHover: 'linear-gradient(135deg, #ffa866 0%, #ff8c42 100%)',
    dark: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
  },
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    neon: '0 0 20px rgba(255, 140, 66, 0.15)',
    neonStrong: '0 0 30px rgba(255, 140, 66, 0.25)',
  },
  transitions: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    overlay: 1040,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Dark theme - Owl Marketing Dark Style
export const darkTheme = {
  mode: 'dark',
  colors: {
    primary: {
      main: '#ff9f5a',      // Lighter Orange for dark mode
      light: '#ffb380',
      dark: '#ff8c42',
      50: '#2a1f17',
      100: '#3d2a1a',
      200: '#4f351d',
      300: '#624020',
      400: '#8c5a2d',
      500: '#b3733a',
      600: '#d98d47',
      700: '#ff9f5a',
      800: '#ffb380',
      900: '#ffc7a6',
      contrast: '#1a1a1a',
    },
    secondary: {
      main: '#ffffff',      // White for dark mode
      light: '#ffffff',
      dark: '#e5e5e5',
      50: '#1a1a1a',
      100: '#333333',
      200: '#4d4d4d',
      300: '#666666',
      400: '#808080',
      500: '#999999',
      600: '#b3b3b3',
      700: '#cccccc',
      800: '#e5e5e5',
      900: '#ffffff',
      contrast: '#1a1a1a',
    },
    accent: {
      main: '#ff7a45',      // Deep Orange for dark mode
      light: '#ff9966',
      dark: '#ff6b35',
      contrast: '#1a1a1a',
    },
    success: {
      main: '#4ade80',      // Green
      light: '#86efac',
      dark: '#22c55e',
      bg: '#14532d',
      contrast: '#1a1a1a',
    },
    warning: {
      main: '#facc15',      // Yellow
      light: '#fde047',
      dark: '#eab308',
      bg: '#713f12',
      contrast: '#1a1a1a',
    },
    error: {
      main: '#f87171',      // Red
      light: '#fca5a5',
      dark: '#ef4444',
      bg: '#7f1d1d',
      contrast: '#1a1a1a',
    },
    info: {
      main: '#60a5fa',      // Blue
      light: '#93c5fd',
      dark: '#3b82f6',
      bg: '#1e3a5f',
      contrast: '#1a1a1a',
    },
    neutral: {
      50: '#0a0a0f',
      100: '#141419',
      200: '#1e1e26',
      300: '#28282f',
      400: '#3a3a44',
      500: '#6b7280',
      600: '#9ca3af',
      700: '#d1d5db',
      800: '#e5e7eb',
      900: '#f3f4f6',
    },
    background: {
      default: '#0a0a0f',   // Deep dark
      paper: '#141419',     // Card background
      elevated: '#1e1e26',  // Elevated surfaces
      dark: '#050507',      // Darkest
    },
    text: {
      primary: '#ffffff',
      secondary: '#9ca3af',
      tertiary: '#6b7280',
      disabled: '#4b5563',
      contrast: '#1a1a1a',
    },
    platforms: {
      facebook: '#1877f2',
      instagram: '#e4405f',
      twitter: '#1da1f2',
      linkedin: '#0a66c2',
      youtube: '#ff0000',
      tiktok: '#ffffff',
    },
    border: {
      default: '#2e2e38',
      light: '#1e1e26',
      focus: '#ff9f5a',
    },
    glow: {
      orange: '0 0 30px rgba(255, 159, 90, 0.25)',
      orangeStrong: '0 0 40px rgba(255, 159, 90, 0.35)',
    },
  },
  gradients: {
    primary: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
    primaryHover: 'linear-gradient(135deg, #ffa866 0%, #ff8c42 100%)',
    dark: 'linear-gradient(135deg, #1e1e26 0%, #141419 100%)',
  },
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    neon: '0 0 20px rgba(255, 159, 90, 0.3)',
    neonStrong: '0 0 30px rgba(255, 159, 90, 0.4)',
  },
  transitions: lightTheme.transitions,
  breakpoints: lightTheme.breakpoints,
  zIndex: lightTheme.zIndex,
};

// Default export is light theme (for backwards compatibility)
export const theme = lightTheme;
