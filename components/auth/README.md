# Authentication System

Complete authentication system with email/password and OAuth support, built with Supabase and styled-components.

## Files

| File | Description |
|------|-------------|
| `AuthProvider.jsx` | React context provider for auth state |
| `UserMenu.jsx` | User avatar and dropdown menu component |
| `/app/login/page.jsx` | Combined login/signup page |
| `/app/forgot-password/page.jsx` | Password reset request page |
| `/app/reset-password/page.jsx` | New password entry page |
| `/app/api/auth/callback/route.js` | OAuth callback handler |
| `/middleware.js` | Route protection middleware |

## Features

### ✅ Email/Password Authentication
- Login with email and password
- Sign up with name, email, and password
- Email verification
- Password validation (min 6 characters)
- Real-time form validation
- Error handling with user-friendly messages

### ✅ OAuth Authentication
- Google Sign-In
- GitHub Sign-In
- Automatic profile creation
- Seamless redirect handling

### ✅ Password Management
- Forgot password flow
- Reset password with email link
- Password confirmation
- Secure password requirements

### ✅ User Management
- Auth context provider
- Real-time auth state updates
- Automatic token refresh
- User profile display
- Sign out functionality

### ✅ Route Protection
- Automatic redirect for unauthenticated users
- Protected dashboard routes
- Auth page redirects for logged-in users
- Post-login redirect to original destination

## Quick Start

### 1. Configure Supabase

In your Supabase dashboard:

1. **Enable Email Authentication:**
   - Go to Authentication → Settings
   - Enable Email provider
   - Configure email templates (optional)

2. **Enable OAuth Providers:**
   - Go to Authentication → Providers
   - Enable Google (add Client ID and Secret)
   - Enable GitHub (add Client ID and Secret)
   - Add redirect URLs: `http://localhost:3000/api/auth/callback`

3. **Set Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Wrap Your App with AuthProvider

Update `app/layout.js`:

```javascript
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 3. Use Auth in Components

```javascript
'use client';

import { useAuth } from '@/components/auth/AuthProvider';

export default function MyComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Hello, {user.email}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Usage Examples

### Login Page

Already created at `/app/login/page.jsx`. Features:
- Tab switching between login and signup
- Email/password validation
- OAuth buttons
- Forgot password link
- Error handling
- Loading states
- Responsive design

Access at: `http://localhost:3000/login`

### Using Auth Context

```javascript
import { useAuth } from '@/components/auth/AuthProvider';

function ProfileComponent() {
  const { user, session, loading, signOut } = useAuth();

  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>Name: {user?.user_metadata?.full_name}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Require Authentication

```javascript
import { RequireAuth } from '@/components/auth/AuthProvider';

export default function ProtectedPage() {
  return (
    <RequireAuth>
      <div>This content is protected</div>
    </RequireAuth>
  );
}
```

### Guest Only Content

```javascript
import { GuestOnly } from '@/components/auth/AuthProvider';

export default function HomePage() {
  return (
    <GuestOnly>
      <div>This shows only to logged-out users</div>
    </GuestOnly>
  );
}
```

### User Menu Component

```javascript
import UserMenu from '@/components/auth/UserMenu';

export default function Navbar() {
  return (
    <nav>
      <div>Logo</div>
      <UserMenu />
    </nav>
  );
}
```

## Authentication Flow

### Sign Up Flow

1. User fills out signup form (name, email, password)
2. Client validates input
3. Call `supabase.auth.signUp()`
4. Supabase sends verification email
5. User clicks verification link
6. User is redirected to login
7. User signs in with verified email

### Sign In Flow

1. User enters email and password
2. Client validates input
3. Call `supabase.auth.signInWithPassword()`
4. Session is created
5. User is redirected to dashboard
6. Server-side state is refreshed

### OAuth Flow

1. User clicks OAuth button (Google/GitHub)
2. Call `supabase.auth.signInWithOAuth()`
3. User is redirected to provider
4. User authorizes app
5. Provider redirects to `/api/auth/callback`
6. Code is exchanged for session
7. Profile is created if new user
8. User is redirected to dashboard

### Password Reset Flow

1. User clicks "Forgot Password"
2. User enters email
3. Call `supabase.auth.resetPasswordForEmail()`
4. Supabase sends reset email
5. User clicks reset link
6. User is redirected to `/reset-password`
7. User enters new password
8. Call `supabase.auth.updateUser({ password })`
9. User is redirected to login

### Sign Out Flow

1. User clicks sign out
2. Call `signOut()` from context
3. Session is cleared
4. User is redirected to home
5. Server-side state is refreshed

## Protected Routes

Routes are automatically protected by middleware:

### Protected (Require Auth)
- `/dashboard/*`
- `/calendar/*`
- `/analytics/*`
- `/content/*`
- `/scheduler/*`
- `/settings/*`
- `/team/*`
- `/inbox/*`
- `/library/*`

### Auth Pages (Redirect if Logged In)
- `/login`
- `/register` (redirects to `/login`)
- `/forgot-password`
- `/reset-password`

### Public Routes
- `/` (landing page)
- `/pricing`
- `/features`
- `/about`
- `/terms`
- `/privacy`

## Styling

All components use styled-components with the purple theme:

### Customization

Edit colors in `/styles/theme.js`:
```javascript
colors: {
  primary: {
    main: '#8B5CF6', // Change primary color
    light: '#A78BFA',
    dark: '#7C3AED',
  },
}
```

### Override Styles

```javascript
import styled from 'styled-components';
import { AuthProvider } from '@/components/auth/AuthProvider';

const StyledProvider = styled(AuthProvider)`
  /* Custom styles */
`;
```

## Error Handling

### Client-Side Errors

All forms include comprehensive error handling:

```javascript
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Success
} catch (error) {
  // Handle specific errors
  if (error.message.includes('Invalid login credentials')) {
    toast.error('Invalid email or password');
  } else if (error.message.includes('Email not confirmed')) {
    toast.error('Please verify your email');
  } else {
    toast.error(error.message);
  }
}
```

### Common Errors

| Error | Message | Solution |
|-------|---------|----------|
| Invalid credentials | "Invalid email or password" | Check email/password |
| Email not confirmed | "Please verify your email" | Check inbox for verification |
| User already registered | "Account already exists" | Use login instead |
| Weak password | "Password is too weak" | Use stronger password |
| Rate limit | "Too many requests" | Wait before retrying |

## OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
6. Copy Client ID and Secret to Supabase dashboard

### GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Add application details
4. Add Authorization callback URL:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
5. Generate client secret
6. Copy Client ID and Secret to Supabase dashboard

## Security Best Practices

### ✅ Implemented

1. **PKCE Flow** - Enhanced security for OAuth
2. **HTTP-Only Cookies** - Session stored securely
3. **Auto Token Refresh** - Seamless session management
4. **Rate Limiting** - Built into Supabase
5. **Email Verification** - Confirm user emails
6. **Password Strength** - Minimum 6 characters
7. **HTTPS Only** - Production URLs only
8. **RLS Policies** - Row-level security in database

### 📋 Recommendations

1. **Enable 2FA** - Add two-factor authentication
2. **Monitor Auth** - Track failed login attempts
3. **Limit Sessions** - Expire old sessions
4. **Audit Logs** - Track auth events
5. **Strong Passwords** - Enforce password policies
6. **Captcha** - Add reCAPTCHA for signup

## Testing

### Test Email/Password Auth

```javascript
// Sign up
await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test123',
  options: {
    data: {
      full_name: 'Test User',
    },
  },
});

// Sign in
await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'test123',
});

// Sign out
await supabase.auth.signOut();
```

### Test OAuth

1. Click Google/GitHub button
2. Authorize with provider
3. Check redirect to dashboard
4. Verify profile created
5. Check session persists

### Test Password Reset

1. Click "Forgot Password"
2. Enter email
3. Check email inbox
4. Click reset link
5. Enter new password
6. Verify redirect to login
7. Login with new password

## Troubleshooting

### "Invalid login credentials"
- Check email is verified
- Verify password is correct
- Check user exists in Supabase

### "Email not confirmed"
- Check spam folder for verification email
- Resend verification from Supabase dashboard
- Disable email verification (dev only)

### OAuth not working
- Check provider credentials
- Verify redirect URLs
- Check provider is enabled in Supabase
- Test in incognito window

### Session not persisting
- Check cookies are enabled
- Verify middleware is configured
- Check domain settings
- Clear browser cache

### Redirect loop
- Check protected route configuration
- Verify middleware matcher
- Check for conflicting redirects
- Test in different browser

## API Reference

### AuthProvider

```javascript
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';

// Context value
const {
  user,      // Current user object or null
  session,   // Current session object or null
  loading,   // Boolean loading state
  signOut,   // Function to sign out
} = useAuth();
```

### RequireAuth Component

```javascript
import { RequireAuth } from '@/components/auth/AuthProvider';

<RequireAuth fallback={<Loading />}>
  <ProtectedContent />
</RequireAuth>
```

### GuestOnly Component

```javascript
import { GuestOnly } from '@/components/auth/AuthProvider';

<GuestOnly fallback={<AlreadyLoggedIn />}>
  <LoginForm />
</GuestOnly>
```

### UserMenu Component

```javascript
import UserMenu from '@/components/auth/UserMenu';

<UserMenu />
```

## Migration from Pages Router

If migrating from Pages Router:

1. Move auth pages to `app/` directory
2. Add `'use client'` directive
3. Update imports to use `@/` alias
4. Replace `useRouter` from `next/navigation`
5. Update middleware to use `updateSession`
6. Wrap app with `AuthProvider`

## Production Checklist

- [ ] Email verification enabled
- [ ] OAuth providers configured
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Error tracking setup
- [ ] Email templates customized
- [ ] Terms and privacy pages created
- [ ] Session timeout configured
- [ ] Password policy defined
- [ ] Backup auth method available
- [ ] Auth events logged
- [ ] Security headers configured
- [ ] CORS configured properly

---

**Your authentication system is ready!** 🎉

All features are production-ready and follow security best practices.
