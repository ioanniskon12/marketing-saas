'use client';

import StyledComponentsRegistry from '../components/StyledComponentsRegistry';
import { ThemeProvider } from 'styled-components';
import { theme, darkTheme } from '../styles/theme';
import GlobalStyles from '../styles/GlobalStyles';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../components/auth/AuthProvider';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';
import { ThemeContextProvider, useTheme } from '../contexts/ThemeContext';
import DarkModeToggle from '../components/DarkModeToggle';
import { usePathname } from 'next/navigation';

/**
 * Theme Wrapper Component
 * Wraps children with the correct theme based on dark mode state
 */
function ThemeWrapper({ children }) {
  const { isDarkMode } = useTheme();
  const pathname = usePathname();
  const currentTheme = isDarkMode ? darkTheme : theme;

  // Show fixed dark mode toggle only on specific pages (not homepage, auth pages, dashboard, or share pages)
  // Dashboard pages have the toggle integrated into the sidebar
  // Homepage, auth pages, and share pages don't need dark mode toggle
  const showFixedToggle = pathname &&
    !pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/share') &&
    pathname !== '/' &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/register') &&
    !pathname.startsWith('/forgot-password') &&
    !pathname.startsWith('/reset-password');

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyles />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDarkMode ? '#1e293b' : '#1F2937',
            color: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            iconTheme: {
              primary: isDarkMode ? '#10b981' : '#8B5CF6',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {children}
      {showFixedToggle && <DarkModeToggle />}
    </ThemeProvider>
  );
}

/**
 * Root Layout Component
 * Provides theme, global styles, auth context, workspace context, and toast notifications to the entire app
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Social Media SaaS - Manage All Your Social Media in One Place</title>
        <meta name="description" content="Manage all your social media accounts in one place. Schedule posts, analyze performance, and grow your audience." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <ThemeContextProvider>
            <AuthProvider>
              <WorkspaceProvider>
                <ThemeWrapper>
                  {children}
                </ThemeWrapper>
              </WorkspaceProvider>
            </AuthProvider>
          </ThemeContextProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
