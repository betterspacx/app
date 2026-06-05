// Modified by konlyzx (2026) - Replaced Prisma client with Drizzle ORM D1 connection factory
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/drizzle/schema';

export function createDb(d1Database: any) {
  return drizzle(d1Database, { schema });
}

export type Db = ReturnType<typeof createDb>;
export { schema };
