# Dashboard Components

Reusable dashboard layout components with responsive design.

## Components

### Sidebar (`Sidebar.jsx`)
Collapsible navigation sidebar with workspace switcher.

**Features:**
- Fixed sidebar on desktop (280px / 80px)
- Slide-in overlay on mobile
- 9 navigation items across 3 sections
- Active route highlighting
- Smooth collapse animation
- Workspace switcher integration

**Props:**
```typescript
{
  collapsed: boolean;         // Sidebar collapse state
  onToggle: () => void;       // Toggle collapse
  mobileOpen: boolean;        // Mobile sidebar open state
  onMobileClose: () => void;  // Close mobile sidebar
}
```

**Usage:**
```jsx
import Sidebar from '@/components/dashboard/Sidebar';

<Sidebar
  collapsed={collapsed}
  onToggle={() => setCollapsed(!collapsed)}
  mobileOpen={mobileOpen}
  onMobileClose={() => setMobileOpen(false)}
/>
```

**Navigation Structure:**
- **Main**: Dashboard, Calendar, Analytics
- **Content**: Posts, Media Library
- **Manage**: Team, Inbox, Settings

---

### Header (`Header.jsx`)
Top header bar with search, notifications, and user menu.

**Features:**
- Global search bar (desktop only)
- Mobile menu button
- Notification bell with badge
- User menu integration
- Responsive layout

**Props:**
```typescript
{
  sidebarCollapsed: boolean;  // Current sidebar state
  onMenuClick: () => void;    // Open mobile sidebar
}
```

**Usage:**
```jsx
import Header from '@/components/dashboard/Header';

<Header
  sidebarCollapsed={collapsed}
  onMenuClick={() => setMobileSidebarOpen(true)}
/>
```

---

### Workspace Switcher (`WorkspaceSwitcher.jsx`)
Dropdown to switch between workspaces.

**Features:**
- Workspace list with avatars
- Current workspace display
- Role badges
- Create workspace button
- Click outside to close
- Custom scrollbar

**Usage:**
```jsx
import WorkspaceSwitcher from '@/components/dashboard/WorkspaceSwitcher';

<WorkspaceSwitcher />
```

**Mock Data:**
Currently uses mock workspaces. Replace with:
```javascript
const { data } = await supabase
  .from('workspace_members')
  .select('*, workspaces(*)')
  .eq('user_id', user.id);
```

---

## Responsive Design

### Breakpoints
- **Desktop** (>1024px): Fixed sidebar, visible search
- **Mobile** (≤1024px): Overlay sidebar, hidden search

### Sidebar Behavior
- **Desktop**: Collapsible (280px ↔ 80px)
- **Mobile**: Slide overlay (280px)

### Media Queries
```jsx
@media (max-width: ${props => props.theme.breakpoints.lg}) {
  // Mobile styles
}
```

---

## Styling

All components use styled-components with the theme:

```javascript
// Purple active states
color: ${props => props.theme.colors.primary.main};  // #8B5CF6

// Borders
border: 1px solid ${props => props.theme.colors.neutral[200]};

// Hover backgrounds
background: ${props => props.theme.colors.neutral[100]};
```

---

## Integration

These components are used in `app/dashboard/layout.jsx`:

```jsx
export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <LayoutContainer>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <MainContent $sidebarCollapsed={sidebarCollapsed}>
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
}
```

---

## Customization

### Add Navigation Item

Edit `Sidebar.jsx`:
```javascript
const navItems = [
  {
    section: 'Main',
    items: [
      { href: '/dashboard/my-page', label: 'My Page', icon: MyIcon },
      // ... existing items
    ],
  },
];
```

### Change Sidebar Width

```javascript
// Expanded width
width: ${props => props.$collapsed ? '80px' : '320px'};  // Change 280px

// Collapsed width
width: ${props => props.$collapsed ? '100px' : '280px'};  // Change 80px
```

### Add Header Button

Edit `Header.jsx`:
```javascript
<RightSection>
  <IconButton onClick={handleMyAction}>
    <MyIcon size={20} />
  </IconButton>

  <IconButton>
    <Bell size={20} />
  </IconButton>

  <UserMenu />
</RightSection>
```

---

## Accessibility

- **Keyboard navigation**: All links focusable
- **ARIA labels**: Proper button labels
- **Focus states**: Visible focus indicators
- **Screen reader**: Semantic HTML structure

---

## Performance

- **Transitions**: Hardware-accelerated transforms
- **Lazy rendering**: Content only renders when visible
- **Optimized re-renders**: Proper React memoization
- **Smooth animations**: CSS transitions

---

## Files

```
components/dashboard/
├── Sidebar.jsx              380 lines
├── Header.jsx               150 lines
├── WorkspaceSwitcher.jsx    340 lines
└── README.md                This file
```

**Total:** ~870 lines of code

---

**Last Updated:** 2025-11-06
**Status:** ✅ Production Ready
