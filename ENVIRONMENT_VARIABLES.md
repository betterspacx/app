// Modified by konlyzx (2026) - Removed Better Auth references and hardcoded site URLs
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

# Better Flow Environment Variables

Copy these variables to your `.env` file and configure them with your values.

## Required Variables

### Site Configuration
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Cloudflare R2 Configuration
```env
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-r2-bucket-url
NEXT_PUBLIC_R2_CUSTOM_DOMAIN=your-r2-custom-domain
NEXT_PUBLIC_CDN_URL=https://your-cdn-domain
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=betterflow-storage
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
R2_API_TOKEN=your_r2_api_token
```

### Cloudflare D1 Database Configuration
```env
CLOUDFLARE_D1_DATABASE_ID=your_d1_database_id
```

## Optional Variables

### Google Search Console Verification
```env
GOOGLE_SITE_VERIFICATION=your_google_site_verification_code
```

### Analytics (Optional)
```env
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Database (Optional - if using D1)
```env
DATABASE_URL=your_database_url
```

### Social Media Links (Optional)
```env
NEXT_PUBLIC_GITHUB_URL=https://github.com/konlyzx/betterflow
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/konlyzx_
```

## Notes

- `NEXT_PUBLIC_SITE_URL` defaults to `http://localhost:3000` in development
- R2 configuration is required for background images to work properly
- Social media links are used in SEO metadata and GitHub star button
