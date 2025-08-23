# Animated Icons with Hover Triggers

DISCLAIMER: AI Generated but content is actually surprisingly good

This directory contains animated icons that can be triggered by hovering over their parent elements (buttons, dropdown menu items, etc.).

## Components

### `AnimatedDropdownItem`

A wrapper around `DropdownMenuItem` that automatically triggers icon animations on hover.

```tsx
import {
  AnimatedDropdownItem,
  SquarePenIcon,
} from "@/components/animated-icons";

<AnimatedDropdownItem
  icon={SquarePenIcon}
  onClick={() => handleRename()}
  destructive={false} // Optional: for destructive actions
>
  Rename
</AnimatedDropdownItem>;
```

### `AnimatedButton`

A wrapper around `Button` that automatically triggers icon animations on hover.

```tsx
import { AnimatedButton, SettingsGearIcon } from '@/components/animated-icons';

// Icon-only button
<AnimatedButton
  variant="ghost"
  size="icon"
  icon={SettingsGearIcon}
  iconOnly
/>

// Button with text
<AnimatedButton
  variant="default"
  icon={DownloadIcon}
  onClick={() => handleDownload()}
>
  Download
</AnimatedButton>
```

### `useAnimatedIcon` Hook

A custom hook that manages animated icon refs and provides hover handlers.

```tsx
import { useAnimatedIcon, DeleteIcon } from "@/components/animated-icons";

function CustomComponent() {
  const { iconRef, handleMouseEnter, handleMouseLeave } = useAnimatedIcon();

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <DeleteIcon ref={iconRef} />
      <span>Custom hover area</span>
    </div>
  );
}
```

## Available Icons

- `DeleteIcon` - Trash can with lid animation
- `DownloadIcon` - Download arrow with bounce animation
- `SquarePenIcon` - Pen with writing animation
- `SettingsGearIcon` - Gear with rotation animation
- `TelescopeIcon` - Telescope with focus animation
- `TrendingUpIcon` - Trending up with growth animation
- `MessageSquareMoreIcon` - Message with dots animation
- `FileTextIcon` - File with text animation
- `TrendingUpDownIcon` - Trending with oscillation animation
- `UsersIcon` - Users with group animation

## How It Works

Each animated icon:

1. Uses `forwardRef` with an imperative handle that exposes `startAnimation()` and `stopAnimation()` methods
2. Has an `isControlledRef` to track if it's being controlled externally
3. Only triggers its own mouse events when not externally controlled

The wrapper components use the `useAnimatedIcon` hook to:

1. Create a ref to the icon
2. Provide `handleMouseEnter` and `handleMouseLeave` functions
3. Automatically trigger the icon's animation when the parent element is hovered

This creates a seamless experience where hovering over a button or dropdown item triggers the icon's micro-animation.
