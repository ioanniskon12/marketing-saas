// Light theme with new color scheme
export const lightTheme = {
  colors: {
    primary: {
      main: '#7B57E0',      // Purpure
      light: '#9B7FE8',
      dark: '#6340CC',
      50: '#F5F2FD',
      100: '#EBE5FA',
      200: '#D7CBF5',
      300: '#C3B1F0',
      400: '#9B7FE8',
      500: '#7B57E0',
      600: '#6340CC',
      700: '#5434AD',
      800: '#45288E',
      900: '#361F6F',
      contrast: '#ffffff',
    },
    secondary: {
      main: '#5DAEEE',      // Blue
      light: '#7DC0F2',
      dark: '#3D8ACA',
      50: '#EBF6FE',
      100: '#D7EDFD',
      200: '#AFDBFB',
      300: '#87C9F9',
      400: '#7DC0F2',
      500: '#5DAEEE',
      600: '#3D8ACA',
      700: '#2E6B97',
      800: '#1E4C64',
      900: '#0F2D31',
      contrast: '#ffffff',
    },
    accent: {
      main: '#7B57E0',      // Purpure
      light: '#9B7FE8',
      dark: '#6340CC',
      contrast: '#ffffff',
    },
    success: {
      main: '#5CC099',      // Green
      light: '#7DCDAD',
      dark: '#3D9D77',
      contrast: '#ffffff',
    },
    warning: {
      main: '#FFC565',      // Yellow
      light: '#FFD484',
      dark: '#E5A646',
      contrast: '#000000',
    },
    error: {
      main: '#F9837C',      // Salmon
      light: '#FA9F9A',
      dark: '#E05F57',
      contrast: '#ffffff',
    },
    info: {
      main: '#5DAEEE',      // Blue
      light: '#7DC0F2',
      dark: '#3D8ACA',
      contrast: '#ffffff',
    },
    neutral: {
      50: '#FFFFFF',        // White
      100: '#F1F3F4',      // Gray 2 (BG)
      200: '#DCE3EB',      // Gray 3 (Dash)
      300: '#DCDCDD',      // Gray 1 (Stroke)
      400: '#B8BCBF',
      500: '#94999C',
      600: '#707579',
      700: '#4C5256',
      800: '#282E33',
      900: '#000000',      // Black
    },
    background: {
      default: '#F1F3F4',  // Gray 2 (BG)
      paper: '#FFFFFF',    // White (Unit BG)
      elevated: '#FFFFFF',
      dark: '#000000',
    },
    text: {
      primary: '#000000',
      secondary: '#4C5256',
      disabled: '#94999C',
      contrast: '#FFFFFF',
    },
    // Social platform colors
    platforms: {
      facebook: '#1877f2',
      instagram: '#e4405f',
      twitter: '#1da1f2',
      linkedin: '#0a66c2',
    },
    // Border colors
    border: {
      default: '#DCDCDD',  // Gray 1 (Stroke)
      light: '#DCE3EB',    // Gray 3 (Dash)
      focus: '#7B57E0',    // Purpure
    },
    // Glow effects (subtle for light theme)
    glow: {
      cyan: '0 0 10px rgba(93, 174, 238, 0.2)',
      magenta: '0 0 10px rgba(123, 87, 224, 0.2)',
      green: '0 0 10px rgba(92, 192, 153, 0.2)',
    },
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    },
    fontSize: {
      xs: '0.5625rem',    // 9px
      sm: '0.6875rem',    // 11px
      base: '0.75rem',    // 12px
      lg: '0.8125rem',    // 13px
      xl: '0.875rem',     // 14px
      '2xl': '1rem',      // 16px
      '3xl': '1.125rem',  // 18px
      '4xl': '1.375rem',  // 22px
      '5xl': '1.625rem',  // 26px
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
    xs: '0.125rem',  // 2px
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    neon: '0 0 10px rgba(123, 87, 224, 0.2), 0 0 20px rgba(123, 87, 224, 0.1)',
    neonStrong: '0 0 15px rgba(123, 87, 224, 0.3), 0 0 30px rgba(123, 87, 224, 0.2)',
    neonPink: '0 0 10px rgba(249, 131, 124, 0.2), 0 0 20px rgba(249, 131, 124, 0.1)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
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
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Dark theme with new color scheme
export const darkTheme = {
  colors: {
    primary: {
      main: '#7B57E0',      // Purpure
      light: '#9B7FE8',
      dark: '#6340CC',
      50: '#1A1524',
      100: '#2D2440',
      200: '#40335C',
      300: '#534278',
      400: '#6340CC',
      500: '#7B57E0',
      600: '#9B7FE8',
      700: '#BB9FF0',
      800: '#DBC7F8',
      900: '#EDE5FC',
      contrast: '#FFFFFF',
    },
    secondary: {
      main: '#5395CF',      // Blue (dark mode)
      light: '#6FA8D9',
      dark: '#3777B3',
      50: '#0D1821',
      100: '#1A2F42',
      200: '#274663',
      300: '#3777B3',
      400: '#5395CF',
      500: '#6FA8D9',
      600: '#8BBBE3',
      700: '#A7CEED',
      800: '#C3E1F7',
      900: '#E1F0FB',
      contrast: '#FFFFFF',
    },
    accent: {
      main: '#7B57E0',      // Purpure
      light: '#9B7FE8',
      dark: '#6340CC',
      contrast: '#FFFFFF',
    },
    success: {
      main: '#47A785',      // Green (dark mode)
      light: '#5FBB99',
      dark: '#3A8C6B',
      contrast: '#FFFFFF',
    },
    warning: {
      main: '#EFB047',      // Yellow (dark mode)
      light: '#F3C468',
      dark: '#D59831',
      contrast: '#000000',
    },
    error: {
      main: '#F9837C',      // Salmon
      light: '#FA9F9A',
      dark: '#E05F57',
      contrast: '#FFFFFF',
    },
    info: {
      main: '#5395CF',      // Blue (dark mode)
      light: '#6FA8D9',
      dark: '#3777B3',
      contrast: '#FFFFFF',
    },
    neutral: {
      50: '#0D0F11',       // Gray 1 (BG)
      100: '#191D23',      // Gray 2 (Unit BG)
      200: '#262C36',      // Gray 3 (Unit BG 2)
      300: '#334E68',      // Gray 4 (Dash)
      400: '#576776',      // Gray 5 (Stroke)
      500: '#7A8CA0',
      600: '#9DB1CA',
      700: '#C0D6F4',
      800: '#E3F1FF',
      900: '#FFFFFF',      // White
    },
    background: {
      default: '#0D0F11',  // Gray 1 (BG)
      paper: '#191D23',    // Gray 2 (Unit BG)
      elevated: '#262C36', // Gray 3 (Unit BG 2)
      dark: '#0D0F11',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9DB1CA',
      disabled: '#576776',
      contrast: '#000000',
    },
    // Social platform colors
    platforms: {
      facebook: '#1877f2',
      instagram: '#e4405f',
      twitter: '#1da1f2',
      linkedin: '#0a66c2',
    },
    // Glow effects for dark theme
    glow: {
      cyan: '0 0 20px rgba(83, 149, 207, 0.5)',
      magenta: '0 0 20px rgba(123, 87, 224, 0.5)',
      green: '0 0 20px rgba(71, 167, 133, 0.5)',
      yellow: '0 0 20px rgba(239, 176, 71, 0.5)',
      red: '0 0 20px rgba(249, 131, 124, 0.5)',
    },
    // Border colors
    border: {
      default: '#334E68',  // Gray 4 (Dash)
      light: '#576776',    // Gray 5 (Stroke)
      focus: '#7B57E0',    // Purpure
    },
  },
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.6), 0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    // Glow shadows
    neon: '0 0 10px rgba(123, 87, 224, 0.3), 0 0 30px rgba(123, 87, 224, 0.2)',
    neonStrong: '0 0 20px rgba(123, 87, 224, 0.5), 0 0 40px rgba(123, 87, 224, 0.3)',
    neonPink: '0 0 10px rgba(249, 131, 124, 0.3), 0 0 30px rgba(249, 131, 124, 0.2)',
  },
  transitions: lightTheme.transitions,
  breakpoints: lightTheme.breakpoints,
  zIndex: lightTheme.zIndex,
};

// Default export is light theme (for backwards compatibility)
export const theme = lightTheme;
