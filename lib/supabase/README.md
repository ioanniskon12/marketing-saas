# Supabase Client Utilities

Complete Supabase integration for Next.js 14 App Router using `@supabase/ssr`.

## Files

### 1. `client.js` - Browser Client
For use in Client Components and browser-side code.

### 2. `server.js` - Server Client
For use in Server Components, Server Actions, and Route Handlers.

### 3. `middleware.js` - Auth Middleware
Handles authentication and route protection.

## Quick Start

### Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Middleware Setup

Already configured in `/middleware.js`:
```javascript
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

## Usage Examples

### Client Components

```javascript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

export default function MyClientComponent() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <div>Hello {user?.email}</div>;
}
```

### Server Components

```javascript
import { createClient, getCurrentUser } from '@/lib/supabase/server';

export default async function MyServerComponent() {
  // Method 1: Create client and query
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .limit(10);

  // Method 2: Use helper function
  const user = await getCurrentUser();

  return (
    <div>
      <p>Logged in as: {user?.email}</p>
      <ul>
        {posts?.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Server Actions

```javascript
'use server';

import { createClient, requireAuth } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPost(formData) {
  // Require authentication
  const user = await requireAuth();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: formData.get('title'),
      content: formData.get('content'),
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { data };
}
```

### Route Handlers

```javascript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('posts')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
```

## Helper Functions

### Client-Side Helpers

```javascript
import { getCurrentUser, getCurrentSession, signOut } from '@/lib/supabase/client';

// Get current user
const user = await getCurrentUser();

// Get current session
const session = await getCurrentSession();

// Sign out
await signOut();
```

### Server-Side Helpers

```javascript
import {
  getCurrentUser,
  getCurrentSession,
  isAuthenticated,
  requireAuth,
  getUserWorkspaces,
  hasWorkspaceAccess,
  getUserWorkspaceRole,
} from '@/lib/supabase/server';

// Get current user
const user = await getCurrentUser();

// Get current session
const session = await getCurrentSession();

// Check if authenticated
const isAuth = await isAuthenticated();

// Require authentication (throws if not authenticated)
const user = await requireAuth();

// Get user's workspaces
const workspaces = await getUserWorkspaces();

// Check workspace access
const hasAccess = await hasWorkspaceAccess('workspace-uuid');

// Get user's role in workspace
const role = await getUserWorkspaceRole('workspace-uuid');
```

### Admin Client (Server-Side Only)

```javascript
import { createAdminClient } from '@/lib/supabase/server';

// ⚠️ WARNING: Bypasses RLS policies!
const supabase = createAdminClient();

// Can perform admin operations
await supabase.from('users').delete().eq('id', userId);
```

## Authentication Examples

### Sign Up

```javascript
'use client';

import { createClient } from '@/lib/supabase/client';

export default function SignUpForm() {
  const supabase = createClient();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const { data, error } = await supabase.auth.signUp({
      email: formData.get('email'),
      password: formData.get('password'),
      options: {
        data: {
          full_name: formData.get('name'),
        },
      },
    });

    if (error) {
      console.error(error);
    } else {
      // Redirect to email confirmation page
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <input name="name" placeholder="Full Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Sign In

```javascript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignInForm() {
  const supabase = createClient();
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (error) {
      console.error(error);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Sign Out

```javascript
'use client';

import { signOut } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

### OAuth (Google, GitHub, etc.)

```javascript
'use client';

import { createClient } from '@/lib/supabase/client';

export default function OAuthButtons() {
  const supabase = createClient();

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      <button onClick={signInWithGithub}>Sign in with GitHub</button>
    </>
  );
}
```

## Route Protection

Routes are automatically protected by the middleware:

### Protected Routes (Require Authentication)
- `/dashboard/*`
- `/calendar/*`
- `/analytics/*`
- `/content/*`
- `/scheduler/*`
- `/settings/*`
- `/team/*`
- `/inbox/*`
- `/library/*`

### Auth Routes (Redirect if Authenticated)
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

### Public Routes
- `/`
- `/pricing`
- `/features`
- `/about`
- `/contact`
- `/terms`
- `/privacy`

### Custom Route Protection

```javascript
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';

export default async function ProtectedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <div>Protected content</div>;
}
```

## Database Queries

### Select

```javascript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);
```

### Insert

```javascript
const { data, error } = await supabase
  .from('posts')
  .insert({
    title: 'My Post',
    content: 'Post content',
    user_id: userId,
  })
  .select()
  .single();
```

### Update

```javascript
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'Updated Title' })
  .eq('id', postId)
  .select()
  .single();
```

### Delete

```javascript
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId);
```

### Joins

```javascript
const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    user_profiles (
      full_name,
      avatar_url
    ),
    comments (
      id,
      content,
      created_at
    )
  `)
  .eq('workspace_id', workspaceId);
```

## Real-time Subscriptions

```javascript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function RealtimePosts() {
  const [posts, setPosts] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    supabase
      .from('posts')
      .select('*')
      .then(({ data }) => setPosts(data || []));

    // Subscribe to changes
    const channel = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('Change received!', payload);

          if (payload.eventType === 'INSERT') {
            setPosts((current) => [payload.new, ...current]);
          }

          if (payload.eventType === 'UPDATE') {
            setPosts((current) =>
              current.map((post) =>
                post.id === payload.new.id ? payload.new : post
              )
            );
          }

          if (payload.eventType === 'DELETE') {
            setPosts((current) =>
              current.filter((post) => post.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## Storage

### Upload File

```javascript
const { data, error } = await supabase.storage
  .from('media')
  .upload(`${userId}/${fileName}`, file, {
    cacheControl: '3600',
    upsert: false,
  });
```

### Download File

```javascript
const { data, error } = await supabase.storage
  .from('media')
  .download('file-path');
```

### Get Public URL

```javascript
const { data } = supabase.storage
  .from('media')
  .getPublicUrl('file-path');

console.log(data.publicUrl);
```

### Delete File

```javascript
const { error } = await supabase.storage
  .from('media')
  .remove(['file-path']);
```

## Error Handling

```javascript
const { data, error } = await supabase
  .from('posts')
  .select('*');

if (error) {
  // Handle different error types
  if (error.code === 'PGRST116') {
    console.log('No rows found');
  } else if (error.code === '42501') {
    console.log('Permission denied (RLS)');
  } else {
    console.error('Database error:', error.message);
  }
}
```

## Best Practices

1. **Always use try-catch with async/await**
   ```javascript
   try {
     const { data, error } = await supabase.from('posts').select('*');
     if (error) throw error;
   } catch (error) {
     console.error('Error:', error);
   }
   ```

2. **Use Server Components when possible**
   - Better performance
   - Reduced client bundle size
   - Direct database access

3. **Use Server Actions for mutations**
   - Type-safe
   - Automatic revalidation
   - Better UX with progressive enhancement

4. **Enable RLS on all tables**
   - Security first
   - Row-level permissions
   - Workspace isolation

5. **Use helper functions**
   - Reduces boilerplate
   - Consistent error handling
   - Better maintainability

## Troubleshooting

### Session not persisting
- Check middleware is configured
- Verify cookies are being set
- Check domain/path settings

### RLS errors (42501)
- Verify policies exist
- Check user authentication
- Test with service role key (temporarily)

### CORS errors
- Only in client-side code
- Check Supabase dashboard settings
- Verify allowed origins

### Type errors
- Check table/column names
- Verify data types match schema
- Use `.select()` for better typing

---

For more information, see:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [@supabase/ssr Package](https://github.com/supabase/ssr)
