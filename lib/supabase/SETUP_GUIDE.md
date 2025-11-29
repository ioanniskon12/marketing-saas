# Supabase Setup Guide

## ✅ What's Included

Complete Supabase integration for Next.js 14 App Router with `@supabase/ssr`.

### Files Created

| File | Size | Purpose |
|------|------|---------|
| `client.js` | 2.5KB | Browser-side Supabase client |
| `server.js` | 6.7KB | Server-side Supabase client with helpers |
| `middleware.js` | 4.9KB | Auth middleware for route protection |
| `hooks.js` | 12KB | React hooks for common operations |
| `README.md` | 14KB | Comprehensive documentation |

## 🚀 Quick Setup

### 1. Environment Variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from: **Supabase Dashboard → Settings → API**

### 2. Middleware (Already Configured)

Your `/middleware.js` should have:

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

### 3. Database Schema

Run the SQL from `database/schema.sql` in Supabase SQL Editor to create all tables.

### 4. Start Using!

You're ready to use Supabase in your app!

## 📚 Usage Examples

### Client Component

```javascript
'use client';

import { useUser } from '@/lib/supabase/hooks';

export default function UserProfile() {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return <div>Welcome, {user.email}!</div>;
}
```

### Server Component

```javascript
import { getCurrentUser } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return <h1>Hello, {user.email}</h1>;
}
```

### Server Action

```javascript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPost(formData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: formData.get('title'),
      content: formData.get('content'),
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

## 🎣 Available Hooks

### useUser()
Get current user with real-time updates:
```javascript
const { user, loading, error } = useUser();
```

### useSession()
Get current session:
```javascript
const { session, loading, error } = useSession();
```

### useQuery()
Query database with automatic refetching:
```javascript
const { data, loading, error, refetch } = useQuery({
  table: 'posts',
  select: '*, user_profiles(*)',
  filters: { workspace_id: 'abc123' },
  orderBy: { column: 'created_at', ascending: false },
  limit: 10,
});
```

### useMutation()
Perform insert/update/delete operations:
```javascript
const { mutate, loading, error } = useMutation({
  table: 'posts',
  onSuccess: (data) => console.log('Created:', data),
});

await mutate('insert', { title: 'My Post' });
```

### useRealtimeSubscription()
Subscribe to real-time changes:
```javascript
const { data, loading, error } = useRealtimeSubscription({
  table: 'posts',
  filter: 'workspace_id=eq.abc123',
});
```

### useWorkspaces()
Get user's workspaces:
```javascript
const { workspaces, loading, error } = useWorkspaces();
```

### useWorkspaceAccess()
Check workspace access:
```javascript
const { hasAccess, role, loading } = useWorkspaceAccess('workspace-id');
```

### useFileUpload()
Upload files to Supabase Storage:
```javascript
const { upload, uploading, progress, url } = useFileUpload({
  bucket: 'media',
  onSuccess: (url) => console.log('Uploaded:', url),
});

await upload(file, 'path/to/file.jpg');
```

## 🛡️ Server Helpers

### Authentication

```javascript
import {
  getCurrentUser,
  getCurrentSession,
  isAuthenticated,
  requireAuth,
} from '@/lib/supabase/server';

// Get current user (returns null if not authenticated)
const user = await getCurrentUser();

// Get current session
const session = await getCurrentSession();

// Check if authenticated
if (await isAuthenticated()) {
  // User is logged in
}

// Require authentication (throws if not authenticated)
const user = await requireAuth();
```

### Workspace Helpers

```javascript
import {
  getUserWorkspaces,
  hasWorkspaceAccess,
  getUserWorkspaceRole,
} from '@/lib/supabase/server';

// Get user's workspaces
const workspaces = await getUserWorkspaces();

// Check workspace access
const hasAccess = await hasWorkspaceAccess('workspace-id');

// Get user's role in workspace
const role = await getUserWorkspaceRole('workspace-id');
// Returns: 'owner', 'admin', 'editor', 'contributor', 'viewer', or null
```

### Admin Client

```javascript
import { createAdminClient } from '@/lib/supabase/server';

// ⚠️ WARNING: Bypasses RLS policies!
const supabase = createAdminClient();

// Use for admin operations only
await supabase.from('users').delete().eq('id', userId);
```

## 🔒 Route Protection

Routes are automatically protected by middleware:

### Protected Routes (Require Auth)
- `/dashboard/*`
- `/calendar/*`
- `/analytics/*`
- `/content/*`
- `/scheduler/*`
- `/settings/*`
- `/team/*`
- `/inbox/*`
- `/library/*`

### Auth Routes (Redirect if Logged In)
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

### Public Routes
- `/` (landing page)
- `/pricing`
- `/features`
- `/about`
- `/contact`
- `/terms`
- `/privacy`

## 🔑 Authentication Examples

### Sign Up

```javascript
'use client';

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      full_name: 'John Doe',
    },
  },
});
```

### Sign In

```javascript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const supabase = createClient();
const router = useRouter();

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

if (!error) {
  router.push('/dashboard');
  router.refresh();
}
```

### Sign Out

```javascript
'use client';

import { signOut } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const router = useRouter();

await signOut();
router.push('/');
router.refresh();
```

### OAuth (Google, GitHub)

```javascript
'use client';

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

## 📊 Database Operations

### Select

```javascript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('workspace_id', workspaceId)
  .order('created_at', { ascending: false })
  .limit(10);
```

### Insert

```javascript
const { data, error } = await supabase
  .from('posts')
  .insert({
    title: 'My Post',
    content: 'Content here',
    workspace_id: workspaceId,
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
    workspace:workspaces (
      name,
      slug
    )
  `)
  .eq('workspace_id', workspaceId);
```

## 📦 Storage Operations

### Upload File

```javascript
const { data, error } = await supabase.storage
  .from('media')
  .upload(`${userId}/${fileName}`, file, {
    cacheControl: '3600',
    upsert: false,
  });
```

### Get Public URL

```javascript
const { data } = supabase.storage
  .from('media')
  .getPublicUrl('file-path');

console.log(data.publicUrl);
```

### Download File

```javascript
const { data, error } = await supabase.storage
  .from('media')
  .download('file-path');
```

### Delete File

```javascript
const { error } = await supabase.storage
  .from('media')
  .remove(['file-path']);
```

## 🔴 Real-time Subscriptions

```javascript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function RealtimePosts() {
  const [posts, setPosts] = useState([]);
  const supabase = createClient();

  useEffect(() => {
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
          if (payload.eventType === 'INSERT') {
            setPosts((current) => [payload.new, ...current]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <div>{/* Render posts */}</div>;
}
```

## ⚠️ Common Pitfalls

### 1. Using client in Server Components
```javascript
// ❌ Wrong
import { createClient } from '@/lib/supabase/client';

export default async function ServerComponent() {
  const supabase = createClient(); // This is the client version!
}

// ✅ Correct
import { createClient } from '@/lib/supabase/server';

export default async function ServerComponent() {
  const supabase = await createClient(); // Note the await!
}
```

### 2. Forgetting to await in Server Components
```javascript
// ❌ Wrong
const supabase = createClient(); // Missing await

// ✅ Correct
const supabase = await createClient();
```

### 3. Not handling errors
```javascript
// ❌ Wrong
const { data } = await supabase.from('posts').select('*');

// ✅ Correct
const { data, error } = await supabase.from('posts').select('*');
if (error) {
  console.error('Error:', error.message);
  return;
}
```

### 4. Forgetting to refresh after auth
```javascript
// ❌ Wrong
await supabase.auth.signOut();
router.push('/');

// ✅ Correct
await supabase.auth.signOut();
router.push('/');
router.refresh(); // Refresh to update server-side state
```

## 🎯 Best Practices

1. **Use Server Components when possible**
   - Better performance
   - Smaller client bundle
   - Direct database access

2. **Use Server Actions for mutations**
   - Type-safe
   - Automatic revalidation
   - Progressive enhancement

3. **Handle errors properly**
   - Always check for errors
   - Provide user feedback
   - Log errors for debugging

4. **Use RLS policies**
   - Security first
   - Row-level permissions
   - Workspace isolation

5. **Leverage hooks for Client Components**
   - Cleaner code
   - Automatic loading states
   - Real-time updates

## 📖 Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [@supabase/ssr](https://github.com/supabase/ssr)
- [Full README](./README.md)

## ✅ Testing Checklist

- [ ] Environment variables configured
- [ ] Middleware setup
- [ ] Database schema created
- [ ] RLS policies enabled
- [ ] Can sign up
- [ ] Can sign in
- [ ] Can sign out
- [ ] Protected routes redirect
- [ ] Auth routes redirect when logged in
- [ ] Database queries work
- [ ] Real-time subscriptions work
- [ ] File uploads work

---

**You're all set!** Start building your Social Media SaaS! 🚀
