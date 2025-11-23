# Design Language & Progress Update

## Theme: Meadow Green 🌿
**Philosophy**: "A fresh breeze of wind in a meadow."
We have moved away from harsh, digital "verdant" greens to a softer, more human and organic palette. The design aims to feel friendly, approachable, and calm.

### Core Design Tokens
- **Primary Hue**: ~145 (OKLCH) - A fresh, soft mint/grass green.
- **Border Radius**: `1rem` (16px) - Highly rounded corners for a softer, friendlier feel.
- **Typography**: Clean, legible, and airy (inherited from system/Tailwind defaults for now).

### Color Palette
| Token | Light Mode | Dark Mode | Description |
|-------|------------|-----------|-------------|
| **Background** | Pale Mint (`oklch(0.99 0.01 145)`) | Deep Forest (`oklch(0.15 0.04 145)`) | The canvas of the application. |
| **Primary** | Meadow Green (`oklch(0.65 0.16 145)`) | Meadow Green (`oklch(0.65 0.16 145)`) | Main actions and highlights. |
| **Foreground** | Dark Green/Grey | Pale Mint | Text content. |
| **Muted** | Soft Green Grey | Darker Green Grey | Secondary backgrounds and disabled states. |

## Implementation Status

### 1. Global Styles (`src/app.css`)
- Updated all CSS variables to use the new OKLCH color space values.
- Increased global border radius to `1rem`.
- Configured dark mode support with a cohesive "Deep Forest" theme.

### 2. Home Page (`src/routes/+page.svelte`)
- **Layout**: Centered, card-based layout for focus and simplicity.
- **Components Used**:
    - `Card`: Main container with glassmorphism effects (`backdrop-blur-sm`).
    - `Tabs`: To toggle between "Upload" and "URL" fetch modes.
    - `Input` / `Label`: Styled form elements.
    - `Lucide Icons`: `CloudUpload`, `Link`, `Calendar` for visual cues.
- **Interactions**:
    - Added a styled "Drag & Drop" zone for file uploads.
    - Hover effects on inputs and buttons to feel "alive".

## Next Steps
- Implement the actual file parsing logic (JS/TS).
- Connect the form to a backend or client-side parser.
- Add success/error states to the UI (toasts or alerts).
