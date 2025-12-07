// Light theme - Clean, modern design
export const lightTheme = {
  colors: {
    primary: {
      main: '#6366f1',      // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      contrast: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6',      // Violet
      light: '#a78bfa',
      dark: '#7c3aed',
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      contrast: '#ffffff',
    },
    accent: {
      main: '#ec4899',      // Pink
      light: '#f472b6',
      dark: '#db2777',
      contrast: '#ffffff',
    },
    success: {
      main: '#10b981',      // Emerald
      light: '#34d399',
      dark: '#059669',
      contrast: '#ffffff',
    },
    warning: {
      main: '#f59e0b',      // Amber
      light: '#fbbf24',
      dark: '#d97706',
      contrast: '#000000',
    },
    error: {
      main: '#ef4444',      // Red
      light: '#f87171',
      dark: '#dc2626',
      contrast: '#ffffff',
    },
    info: {
      main: '#0ea5e9',      // Sky
      light: '#38bdf8',
      dark: '#0284c7',
      contrast: '#ffffff',
    },
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },
    background: {
      default: '#f8fafc',   // Slate 50
      paper: '#ffffff',
      elevated: '#ffffff',
      dark: '#0f172a',
    },
    text: {
      primary: '#0f172a',   // Slate 900
      secondary: '#64748b', // Slate 500
      tertiary: '#94a3b8',  // Slate 400
      disabled: '#cbd5e1',  // Slate 300
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
      default: '#e2e8f0',   // Slate 200
      light: '#f1f5f9',     // Slate 100
      focus: '#6366f1',
    },
    glow: {
      cyan: '0 0 20px rgba(6, 182, 212, 0.15)',
      magenta: '0 0 20px rgba(236, 72, 153, 0.15)',
      green: '0 0 20px rgba(16, 185, 129, 0.15)',
    },
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
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    neon: '0 0 20px rgba(99, 102, 241, 0.15)',
    neonStrong: '0 0 30px rgba(99, 102, 241, 0.25)',
    neonPink: '0 0 20px rgba(236, 72, 153, 0.15)',
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

// Dark theme - Modern dark design matching admin panel
export const darkTheme = {
  colors: {
    primary: {
      main: '#818cf8',      // Indigo 400
      light: '#a5b4fc',
      dark: '#6366f1',
      50: '#1e1b4b',
      100: '#312e81',
      200: '#3730a3',
      300: '#4338ca',
      400: '#4f46e5',
      500: '#6366f1',
      600: '#818cf8',
      700: '#a5b4fc',
      800: '#c7d2fe',
      900: '#e0e7ff',
      contrast: '#0f172a',
    },
    secondary: {
      main: '#a78bfa',      // Violet 400
      light: '#c4b5fd',
      dark: '#8b5cf6',
      50: '#2e1065',
      100: '#4c1d95',
      200: '#5b21b6',
      300: '#6d28d9',
      400: '#7c3aed',
      500: '#8b5cf6',
      600: '#a78bfa',
      700: '#c4b5fd',
      800: '#ddd6fe',
      900: '#ede9fe',
      contrast: '#0f172a',
    },
    accent: {
      main: '#f472b6',      // Pink 400
      light: '#f9a8d4',
      dark: '#ec4899',
      contrast: '#0f172a',
    },
    success: {
      main: '#34d399',      // Emerald 400
      light: '#6ee7b7',
      dark: '#10b981',
      contrast: '#0f172a',
    },
    warning: {
      main: '#fbbf24',      // Amber 400
      light: '#fcd34d',
      dark: '#f59e0b',
      contrast: '#0f172a',
    },
    error: {
      main: '#f87171',      // Red 400
      light: '#fca5a5',
      dark: '#ef4444',
      contrast: '#0f172a',
    },
    info: {
      main: '#38bdf8',      // Sky 400
      light: '#7dd3fc',
      dark: '#0ea5e9',
      contrast: '#0f172a',
    },
    neutral: {
      50: '#0f172a',        // Slate 900
      100: '#1e293b',       // Slate 800
      200: '#334155',       // Slate 700
      300: '#475569',       // Slate 600
      400: '#64748b',       // Slate 500
      500: '#94a3b8',       // Slate 400
      600: '#cbd5e1',       // Slate 300
      700: '#e2e8f0',       // Slate 200
      800: '#f1f5f9',       // Slate 100
      900: '#f8fafc',       // Slate 50
    },
    background: {
      default: '#0f172a',   // Slate 900
      paper: '#1e293b',     // Slate 800
      elevated: '#334155',  // Slate 700
      dark: '#020617',      // Slate 950
    },
    text: {
      primary: '#f8fafc',   // Slate 50
      secondary: '#94a3b8', // Slate 400
      tertiary: '#64748b',  // Slate 500
      disabled: '#475569',  // Slate 600
      contrast: '#0f172a',
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
      default: '#334155',   // Slate 700
      light: '#1e293b',     // Slate 800
      focus: '#818cf8',
    },
    glow: {
      cyan: '0 0 30px rgba(56, 189, 248, 0.25)',
      magenta: '0 0 30px rgba(244, 114, 182, 0.25)',
      green: '0 0 30px rgba(52, 211, 153, 0.25)',
      indigo: '0 0 30px rgba(129, 140, 248, 0.25)',
    },
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
    neon: '0 0 20px rgba(129, 140, 248, 0.3)',
    neonStrong: '0 0 30px rgba(129, 140, 248, 0.4)',
    neonPink: '0 0 20px rgba(244, 114, 182, 0.3)',
  },
  transitions: lightTheme.transitions,
  breakpoints: lightTheme.breakpoints,
  zIndex: lightTheme.zIndex,
};

// Default export is light theme (for backwards compatibility)
export const theme = lightTheme;
