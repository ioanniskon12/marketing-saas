# UI Components

Reusable UI components built with styled-components and the purple theme.

## Components

### Button

Versatile button component with multiple variants, sizes, and states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' (default: 'primary')
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `fullWidth`: boolean (default: false)
- `loading`: boolean (default: false)
- `disabled`: boolean (default: false)

**Examples:**

```jsx
import { Button } from '@/components/ui';

// Primary button
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// Outline button
<Button variant="outline">
  Secondary Action
</Button>

// Loading button
<Button loading>
  Submitting...
</Button>

// Danger button (for delete actions)
<Button variant="danger" size="sm">
  Delete
</Button>

// Full width button
<Button fullWidth>
  Sign Up
</Button>
```

---

### Input

Input field with label, error states, and icon support.

**Props:**
- `label`: string
- `type`: string (default: 'text')
- `placeholder`: string
- `value`: string
- `onChange`: function
- `error`: string
- `helperText`: string
- `required`: boolean (default: false)
- `disabled`: boolean (default: false)
- `leftIcon`: React.ReactNode
- `rightIcon`: React.ReactNode
- `onRightIconClick`: function

**Examples:**

```jsx
import { Input } from '@/components/ui';
import { Mail, Eye, EyeOff } from 'lucide-react';

// Basic input
<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Input with icon
<Input
  label="Email"
  leftIcon={<Mail size={20} />}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Password input with toggle
<Input
  label="Password"
  type={showPassword ? 'text' : 'password'}
  leftIcon={<Lock size={20} />}
  rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  onRightIconClick={() => setShowPassword(!showPassword)}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

// Input with error
<Input
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error="Username is required"
  required
/>

// Input with helper text
<Input
  label="Password"
  type="password"
  helperText="Must be at least 8 characters"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

---

### Select

Styled select dropdown with label and error states.

**Props:**
- `label`: string
- `value`: string
- `onChange`: function
- `options`: Array<{value: string, label: string}>
- `placeholder`: string (default: 'Select an option')
- `error`: string
- `helperText`: string
- `required`: boolean (default: false)
- `disabled`: boolean (default: false)

**Examples:**

```jsx
import { Select } from '@/components/ui';

// Basic select
<Select
  label="Platform"
  value={platform}
  onChange={(e) => setPlatform(e.target.value)}
  options={[
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'linkedin', label: 'LinkedIn' },
  ]}
/>

// Select with custom placeholder
<Select
  label="Country"
  placeholder="Choose your country"
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  options={countries}
/>

// Select with error
<Select
  label="Post Status"
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  error="Please select a status"
  required
  options={statusOptions}
/>
```

---

### Modal

Reusable modal dialog with overlay and animations.

**Props:**
- `isOpen`: boolean (required)
- `onClose`: function (required)
- `title`: string
- `children`: React.ReactNode (required)
- `footer`: React.ReactNode
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `closeOnOverlayClick`: boolean (default: true)
- `showCloseButton`: boolean (default: true)

**Examples:**

```jsx
import { Modal, Button } from '@/components/ui';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              Confirm
            </Button>
          </>
        }
      >
        <p>Are you sure you want to proceed?</p>
      </Modal>
    </>
  );
}

// Large modal without close button
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Edit Post"
  size="lg"
  showCloseButton={false}
>
  <PostEditForm />
</Modal>

// Modal that cannot be closed by clicking overlay
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Important Notice"
  closeOnOverlayClick={false}
>
  <p>Please read this carefully.</p>
</Modal>
```

---

### Card

Container component with consistent styling and variants.

**Props:**
- `variant`: 'default' | 'outlined' | 'elevated' | 'ghost' (default: 'default')
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' (default: 'xl')
- `hoverable`: boolean (default: false)
- `clickable`: boolean (default: false)
- `fullWidth`: boolean (default: false)

**Subcomponents:**
- `Card.Header`: Header section with bottom border
- `Card.Title`: Styled title
- `Card.Description`: Styled description text
- `Card.Body`: Body section
- `Card.Footer`: Footer section with top border

**Examples:**

```jsx
import { Card } from '@/components/ui';

// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Card with subcomponents
<Card>
  <Card.Header>
    <Card.Title>Analytics Overview</Card.Title>
    <Card.Description>
      Your performance metrics for the last 30 days
    </Card.Description>
  </Card.Header>

  <Card.Body>
    <AnalyticsChart />
  </Card.Body>

  <Card.Footer>
    <Button variant="outline" size="sm">View Details</Button>
  </Card.Footer>
</Card>

// Hoverable card
<Card hoverable onClick={handleClick}>
  <h3>Click me!</h3>
  <p>I have a hover effect</p>
</Card>

// Outlined card with custom padding
<Card variant="outlined" padding="lg">
  Content with large padding
</Card>

// Elevated card (larger shadow)
<Card variant="elevated">
  <p>This card has a larger shadow</p>
</Card>

// Ghost card (no border or shadow)
<Card variant="ghost">
  <p>Minimal styling</p>
</Card>
```

---

### Spinner

Loading spinner with different sizes and colors.

**Props:**
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `variant`: 'primary' | 'secondary' | 'white' | 'gray' | 'success' | 'error' (default: 'primary')
- `label`: string
- `fullScreen`: boolean (default: false)

**Examples:**

```jsx
import { Spinner, PageSpinner } from '@/components/ui';

// Basic spinner
<Spinner size="md" />

// Spinner with label
<Spinner size="lg" label="Loading..." />

// Full-screen loading overlay
<Spinner size="xl" fullScreen />

// Or use convenience component
<PageSpinner label="Loading data..." />

// Inline spinner with text
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <Spinner size="sm" />
  <span>Processing...</span>
</div>

// Different color variants
<Spinner variant="primary" />
<Spinner variant="success" />
<Spinner variant="error" />
<Spinner variant="white" /> {/* For dark backgrounds */}
```

---

### Toast

Toast notifications using react-hot-toast with custom styling.

**Functions:**
- `showToast.success(message, title?)`: Success notification
- `showToast.error(message, title?)`: Error notification
- `showToast.info(message, title?)`: Info notification
- `showToast.warning(message, title?)`: Warning notification
- `showToast.promise(promise, messages)`: Promise-based notification

**Examples:**

```jsx
import { showToast, toast } from '@/components/ui';

// Success toast
showToast.success('Post published successfully!');

// Error toast
showToast.error('Failed to publish post', 'Error');

// Info toast
showToast.info('Your changes have been saved');

// Warning toast
showToast.warning('This action cannot be undone');

// Promise toast (shows loading, then success/error)
showToast.promise(
  savePost(),
  {
    loading: 'Saving post...',
    success: 'Post saved successfully!',
    error: 'Failed to save post',
  }
);

// Or use the standard react-hot-toast API
toast.success('Simple success message');
toast.error('Simple error message');

// Dismiss all toasts
toast.dismiss();

// Dismiss specific toast
const toastId = showToast.success('Message');
toast.dismiss(toastId);
```

---

## Usage Patterns

### Form with Validation

```jsx
import { Input, Select, Button, showToast } from '@/components/ui';
import { useState } from 'react';

function CreatePostForm() {
  const [formData, setFormData] = useState({
    title: '',
    platform: '',
    content: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.platform) newErrors.platform = 'Platform is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await createPost(formData);
      showToast.success('Post created successfully!');
    } catch (error) {
      showToast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        error={errors.title}
        required
      />

      <Select
        label="Platform"
        value={formData.platform}
        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
        options={platforms}
        error={errors.platform}
        required
      />

      <Input
        label="Content"
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
      />

      <Button type="submit" loading={loading} fullWidth>
        Create Post
      </Button>
    </form>
  );
}
```

### Confirmation Modal

```jsx
import { Modal, Button } from '@/components/ui';
import { useState } from 'react';

function DeleteButton({ onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete();
      setIsOpen(false);
      showToast.success('Item deleted successfully');
    } catch (error) {
      showToast.error('Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Delete
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Deletion"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={loading}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
      </Modal>
    </>
  );
}
```

### Loading States

```jsx
import { Card, Spinner } from '@/components/ui';
import { useEffect, useState } from 'react';

function DataCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Spinner size="lg" label="Loading data..." />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Data Overview</Card.Title>
      </Card.Header>
      <Card.Body>
        {data && <DataDisplay data={data} />}
      </Card.Body>
    </Card>
  );
}
```

---

## Styling Customization

All components use the theme from `styles/theme.js`. To customize colors, spacing, or typography, edit the theme file:

```javascript
// styles/theme.js
export const theme = {
  colors: {
    primary: {
      main: '#8B5CF6',  // Change this for different primary color
      // ...
    },
  },
  // ...
};
```

Components automatically inherit theme changes, maintaining consistency across the entire application.

---

## Accessibility

All components follow accessibility best practices:

- **Buttons**: Support keyboard navigation and focus states
- **Inputs**: Include proper labels, ARIA attributes, and error announcements
- **Modals**: Trap focus, close on Escape, and use proper ARIA roles
- **Spinners**: Include loading labels for screen readers

---

## Best Practices

1. **Import from index**: Always import from `@/components/ui` for consistency
   ```jsx
   import { Button, Input } from '@/components/ui';
   ```

2. **Use semantic variants**: Choose the right variant for the action
   - Use `danger` for destructive actions (delete, cancel)
   - Use `primary` for main actions (submit, save)
   - Use `outline` for secondary actions

3. **Provide feedback**: Always show loading states and toast notifications
   ```jsx
   <Button loading={isSubmitting}>Submit</Button>
   ```

4. **Form validation**: Show clear error messages
   ```jsx
   <Input error={errors.email} required />
   ```

5. **Responsive design**: Components are mobile-friendly by default

---

## Component Status

| Component | Status | Version |
|-----------|--------|---------|
| Button | ✅ Complete | 1.0 |
| Input | ✅ Complete | 1.0 |
| Select | ✅ Complete | 1.0 |
| Modal | ✅ Complete | 1.0 |
| Card | ✅ Complete | 1.0 |
| Spinner | ✅ Complete | 1.0 |
| Toast | ✅ Complete | 1.0 |

---

**Last Updated:** 2025-11-06
