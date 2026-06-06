![Better Flow Preview](/public/demo/new-demo.png)

# Better Flow

A free, browser-based screenshot editor. Beautiful backgrounds, device frames, 3D effects, animations, and video export. No signup, no watermarks.

**Live:** [betterflow.site](https://betterflow.site)

## Features

- **100+ Backgrounds** — gradients, solid colors, images, blur, noise
- **Browser Mockups** — Safari & Chrome (light/dark) with realistic toolbars, adjustable header size, and custom URL
- **Device Frames** — Arc browser, Polaroid, glass, outline, border styles
- **3D Transforms** — 30+ perspective presets with realistic depth
- **Draw & Markup** — arrows, shapes, blur regions, text overlays
- **Tweet & Code Snippets** — import tweets, generate code images
- **Animations** — 20+ presets, timeline editor, keyframe control
- **Video Export** — MP4, WebM, GIF with hardware-accelerated encoding
- **High-Res Export** — PNG/JPG up to 5x scale, fully in-browser
- **Chrome Extension** — Record screen directly from browser with one click
- **Multi-Slide Support** — Create slideshow presentations with multiple images
- **IndexedDB Storage** — Auto-save drafts locally, never lose your work

## How to Use

### Desktop
1. Upload an image or drag and drop
2. Choose a background or gradient
3. Add device frames or borders
4. Apply 3D transforms and effects
5. Export as image or video

### Chrome Extension
1. Install the Better Flow Chrome extension
2. Click the extension icon while on any webpage
3. Select capture area (full page or visible)
4. Recording uploads automatically to the editor
5. Edit and export your recording

## Quick Start

```bash
git clone https://github.com/konlyzx/betterflow.git
cd betterflow
pnpm install
pnpm run dev
```

**⚠️ Important:** Use pnpm for development and contributions.

Open [localhost:3000](http://localhost:3000)

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cloudflare R2 (required for backgrounds)
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-r2-bucket-url
NEXT_PUBLIC_CDN_URL=https://your-cdn-domain
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_ACCOUNT_ID=your_account_id
R2_API_TOKEN=your_api_token
```

## Tech Stack

**Core:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4

**Canvas:** Konva · React-Konva · html2canvas · modern-screenshot

**State:** Zustand · IndexedDB

**Video:** FFmpeg WASM · WebCodecs · MediaRecorder

**Storage:** Cloudflare R2 · IndexedDB

**UI:** Radix UI · Hugeicons

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start
```

## Deployment

This project can be deployed to:
- **Vercel** - Recommended for Next.js applications
- **Docker** - Containerized deployment

### Vercel Deployment

For Vercel deployment:

1. **Connect your repository** to Vercel
2. **Configure build settings:**
   - **Framework Preset**: Next.js
   - **Build command**: `pnpm run build` (auto-detected)
   - **Output directory**: `.next` (auto-detected)
3. **Configure environment variables** in Vercel dashboard (see Environment Setup section)
4. **Deploy** - Vercel will automatically build and deploy on push to main branch

**Note:** Vercel natively supports Next.js with no additional configuration needed.

## Project Structure

```
better-flow/
├── app/              # Next.js App Router
│   ├── api/         # API routes (upload, export, proxy)
│   └── editor/      # Main editor page
├── components/      # React components
│   ├── canvas/      # Konva canvas rendering
│   ├── timeline/    # Animation timeline
│   └── ui/          # Reusable UI components
├── lib/            # Utilities and helpers
│   ├── animation/   # Animation engine
│   ├── export/      # Export functionality
│   └── store/       # Zustand state management
├── hooks/          # Custom React hooks
└── public/         # Static assets
```

## Key Features Explained

### Animation System
- 20+ animation presets organized by category (reveal, flip, perspective, orbit, depth)
- Timeline editor with keyframe control
- Real-time preview with smooth playback
- Export animations as MP4, WebM, or GIF

### Video Export
- Hardware-accelerated encoding via WebCodecs API
- FFmpeg WASM fallback for broader browser support
- Multiple quality presets (high, medium, low)
- Progress tracking during export

### Storage
- IndexedDB for local draft auto-save
- Cloudflare R2 for asset storage
- No server-side database required
- Works offline after initial load

### Chrome Extension
- One-click screen recording
- Automatic upload to editor
- Supports full page and visible area capture
- Seamless integration with web editor

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## About

This project is based on a fork of [KartikLabhshetwar/screenshot-studio](https://github.com/KartikLabhshetwar/screenshot-studio) under Apache 2.0 license.

## License

[Apache License 2.0](./LICENSE)
