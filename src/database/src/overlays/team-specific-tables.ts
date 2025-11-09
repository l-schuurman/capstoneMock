/**
 * Team D Specific Tables
 *
 * Define your team-specific database tables here.
 * These tables are overlays on top of the shared database schema.
 *
 * Example:
 *
 * import { pgTable, serial, varchar, timestamp, text, integer } from 'drizzle-orm/pg-core';
 * import { users } from '@large-event/database/schemas';
 *
 * export const teamDProjects = pgTable('teamd_projects', {
 *   id: serial('id').primaryKey(),
 *   name: varchar('name', { length: 255 }).notNull(),
 *   description: text('description'),
 *   createdAt: timestamp('created_at').defaultNow(),
 * });
 *
 * export type TeamDProject = typeof teamDProjects.$inferSelect;
 * export type NewTeamDProject = typeof teamDProjects.$inferInsert;
 */

// Your team-specific tables go here
