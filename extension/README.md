# Better Flow - Chrome Screen Recorder Extension

A lightweight, high-performance Chrome Extension for capturing screen/tab recordings and uploading them directly to Better Flow editor via Cloudflare R2.

## Features

- 📱 **Tab Recording**: Capture your current browser tab
- 🖥️ **Screen Recording**: Capture your entire screen
- ⚡ **Fast Upload**: Automatic upload to Cloudflare R2
- 🎨 **Premium UI**: Glassmorphic dark theme matching Better Flow
- 📊 **Progress Tracking**: Real-time upload progress indicator

## Installation

1. Clone or download the extension folder
2. Open `chrome://extensions/` in your browser
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension folder
5. The Better Flow Recorder icon will appear in your toolbar

## File Structure

```
extension/
├── manifest.json              # Manifest V3 configuration
├── background/
│   └── background.js         # Service Worker for handling messages
├── offscreen/
│   ├── offscreen.html        # Offscreen document for recording
│   └── offscreen.js          # MediaRecorder implementation
├── popup/
│   ├── popup.html            # Popup UI
│   ├── popup.css             # Styling (glassmorphic theme)
│   └── popup.js              # Popup logic
└── README.md                 # This file
```

## How It Works

### Recording Flow

1. **User clicks "Record Tab" or "Record Screen"**
   - Popup sends message to background service worker
   - Background creates offscreen document if needed

2. **Offscreen Document Captures Media**
   - Uses `navigator.mediaDevices.getDisplayMedia()`
   - Records video using MediaRecorder API
   - Stores chunks in memory

3. **User clicks "Stop Recording"**
   - Offscreen document stops recording
   - Converts chunks to WebM blob

4. **Upload to Cloudflare R2**
   - Requests presigned URL from backend API
   - Uploads blob directly to R2 via PUT request
   - Opens editor with video URL as query parameter

### API Endpoints Required

The backend must provide:

- **POST `/api/upload-url`**
  - Request body: `{ fileName: string, contentType: string }`
  - Response: `{ uploadUrl: string, fileUrl: string }`

## Configuration

### Backend API Base URL

Edit `background.js` line 5:
```javascript
const API_BASE = 'https://betterflow.site';
```

### Video Format

Default: WebM with VP8 codec. Fallback to WebM if VP8 not supported.

Edit `offscreen.js` lines 51-59 to change format.

## Permissions

- `desktopCapture`: For screen/tab capture
- `tabs`: For accessing tab information
- `activeTab`: For current tab context
- `storage`: For storing preferences
- `offscreen`: For background recording

## Browser Compatibility

- Chrome 109+ (Manifest V3 support)
- Edge 109+
- Brave 1.49+

## Development

### Testing Locally

1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test the popup and recording functionality

### Debugging

- Right-click extension icon → "Inspect popup"
- Go to `chrome://extensions/` → "Service Worker" link
- Check console for errors

## Security Considerations

- All uploads use HTTPS
- Presigned URLs expire after use
- No credentials stored in extension
- Videos processed server-side before storage

## Performance Optimization

- Offscreen document handles recording (doesn't block UI)
- Efficient blob handling with chunked recording
- Minimal popup size (380px width)
- Lazy loading of offscreen document

## Future Enhancements

- [ ] Audio recording support
- [ ] Custom video quality settings
- [ ] Recording timer/duration limit
- [ ] Pause/resume functionality
- [ ] Local storage fallback
- [ ] Frame rate selection
- [ ] Keyboard shortcut support

## License

Apache License 2.0 - Copyright 2025 Kartik Labhshetwar

Created by konlyzx (2026)
