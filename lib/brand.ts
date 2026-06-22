// Modified by konlyzx (2026) - Removed hardcoded URLs; using environment variables
// Created by konlyzx (2026) - Central Better Flow brand constants (name, URLs, social links)
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

export const BRAND = {
  name: 'Better Flow',
  tagline: 'Record. Edit. Ship.',
  description:
    'The free browser studio for screen recordings and screenshots. Record with our Chrome extension, beautify in the editor, and export polished visuals in seconds.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  cdn: process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:3000',
  github: 'https://github.com/konlyzx/betterflow',
  twitter: 'https://x.com/konlyzx_',
} as const;
