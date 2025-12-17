# Owl Marketing Hub - Color Reference Guide

## Primary Orange Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#ff8c42` | Main brand color, buttons, primary icons |
| Primary Light | `#ffa866` | Hover states, light accents |
| Primary Dark | `#e67a35` | Active states, darker accents |
| Deep Orange | `#ff6b35` | Secondary accent, gradients |
| Dark Orange | `#cc6a2a` | Tertiary accents |
| Darker Orange | `#b35a20` | Deep accents, shadows |
| Darkest Orange | `#994a15` | Darkest shade |

## Primary Gradient

```css
background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
```

**Hover Gradient:**
```css
background: linear-gradient(135deg, #ffa866 0%, #ff8c42 100%);
```

## Theme Color Scale (50-900)

```javascript
primary: {
  50: '#fff5ee',   // Lightest background tint
  100: '#ffebdb',
  200: '#ffd4b8',
  300: '#ffbd94',
  400: '#ffa866',  // Light
  500: '#ff8c42',  // Main
  600: '#e67a35',  // Dark
  700: '#cc6a2a',
  800: '#b35a20',
  900: '#994a15',  // Darkest
}
```

## Secondary Colors (Dark)

| Color | Hex | Usage |
|-------|-----|-------|
| Secondary Main | `#1a1a1a` | Dark text, secondary buttons |
| Secondary Light | `#333333` | Hover states |
| Secondary Dark | `#000000` | Darkest |

## Semantic Colors

### Success (Green)
| Color | Hex |
|-------|-----|
| Main | `#22c55e` |
| Light | `#4ade80` |
| Dark | `#16a34a` |
| Background | `#dcfce7` |

### Warning (Yellow)
| Color | Hex |
|-------|-----|
| Main | `#eab308` |
| Light | `#facc15` |
| Dark | `#ca8a04` |
| Background | `#fef9c3` |

### Error (Red)
| Color | Hex |
|-------|-----|
| Main | `#dc2626` |
| Light | `#f87171` |
| Dark | `#b91c1c` |
| Background | `#fee2e2` |

### Info (Orange - matches brand)
| Color | Hex |
|-------|-----|
| Main | `#ff8c42` |

## Background Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Default | `#faf8f5` | Main background (warm white) |
| Paper | `#ffffff` | Cards, modals |
| Elevated | `#f5f1eb` | Elevated surfaces |
| Dark | `#0a0a0f` | Dark mode background |

## Text Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#1a1a1a` | Main text |
| Secondary | `#666666` | Descriptions, labels |
| Tertiary | `#999999` | Placeholder, hints |
| Disabled | `#cccccc` | Disabled text |
| Contrast | `#ffffff` | Text on dark/colored backgrounds |

## Neutral Scale

```javascript
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
}
```

## Border Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Default | `#e8e4de` | Standard borders |
| Light | `#f5f1eb` | Subtle borders |
| Focus | `#ff8c42` | Focus rings |

## Shadows & Glows

```css
/* Orange Glow */
box-shadow: 0 0 20px rgba(255, 140, 66, 0.15);

/* Strong Orange Glow */
box-shadow: 0 0 30px rgba(255, 140, 66, 0.25);

/* Button Hover Shadow */
box-shadow: 0 4px 20px rgba(255, 140, 66, 0.3);
```

## Platform Colors (Keep as-is)

| Platform | Hex |
|----------|-----|
| Facebook | `#1877f2` |
| Instagram | `#e4405f` |
| Twitter/X | `#1da1f2` |
| LinkedIn | `#0a66c2` |
| YouTube | `#ff0000` |
| TikTok | `#000000` |
| All Platforms | `#ff8c42` |

## Icon Colors for Dashboard Components

### Analytics Metrics Cards
| Metric | Color |
|--------|-------|
| Audience Growth | `#ff8c42` |
| Total Interactions | `#ffa866` |
| Total Reach | `#b35a20` |
| Click-Through Rate | `#ff6b35` |
| Engagement Rate | `#e67a35` |
| Post Frequency | `#cc6a2a` |

### Engagement Cards
| Metric | Color |
|--------|-------|
| Total Likes | `#ff8c42` |
| Total Comments | `#ff8c42` |
| Total Shares | `#ff6b35` |
| Impressions | `#e67a35` |

### Insight Cards
| Insight | Color |
|---------|-------|
| Best Performing Day | `#ffa866` |
| Optimal Posting Time | `#ff8c42` |
| Content Opportunity | `#e67a35` |
| Audience Growth | `#ff6b35` |

## Status Colors

### Post/Calendar Status
| Status | Color |
|--------|-------|
| Draft | `#6b7280` (gray) |
| Scheduled | `#ff8c42` (orange) |
| Published | `#22c55e` (green) |
| Failed | `#ef4444` (red) |

## Dark Mode Adjustments

In dark mode, primary orange becomes slightly lighter for better visibility:

| Color | Light Mode | Dark Mode |
|-------|------------|-----------|
| Primary | `#ff8c42` | `#ff9f5a` |
| Primary Light | `#ffa866` | `#ffb380` |
| Primary Dark | `#e67a35` | `#ff8c42` |

## CSS Variables (if needed)

```css
:root {
  --owl-primary: #ff8c42;
  --owl-primary-light: #ffa866;
  --owl-primary-dark: #e67a35;
  --owl-accent: #ff6b35;
  --owl-gradient: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
}
```

---

**Last Updated:** December 2024
**Brand:** Owl Marketing Hub
