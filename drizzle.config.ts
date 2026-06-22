// Modified by konlyzx (2026) - Added Cloudflare D1 deployment instructions in comments
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

import type { Config } from 'drizzle-kit';

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './dev.db',
  },
  // For Cloudflare D1 deployment
  // Use wrangler to execute migrations: wrangler d1 execute better-flow-db --file=./drizzle/migrations/0001_init.sql
} satisfies Config;
