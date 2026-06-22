// Created by konlyzx (2026) - Drizzle ORM schema for Cloudflare D1 (projects and assets tables)
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

export const assets = sqliteTable(
  'assets',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'upload', 'capture', 'export'
    url: text('url').notNull(),
    path: text('path').notNull(),
    createdAt: text('created_at').notNull().default(new Date().toISOString()),
    updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
  },
  (table) => ({
    projectIdIdx: index('idx_assets_project_id').on(table.projectId),
    typeIdx: index('idx_assets_type').on(table.type),
  })
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
