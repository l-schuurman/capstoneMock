/**
 * Team D Extensions to Shared Schemas
 *
 * Define extensions or modifications to shared database tables here.
 * These are additional tables that extend functionality of shared schemas.
 *
 * Example:
 *
 * import { pgTable, serial, varchar, timestamp, text, integer } from 'drizzle-orm/pg-core';
 * import { users } from '@large-event/database/schemas';
 *
 * export const teamDUserPreferences = pgTable('teamd_user_preferences', {
 *   id: serial('id').primaryKey(),
 *   userId: integer('user_id').references(() => users.id).notNull(),
 *   theme: varchar('theme', { length: 50 }).default('light'),
 *   notifications: varchar('notifications', { length: 10 }).default('enabled'),
 *   createdAt: timestamp('created_at').defaultNow(),
 * });
 *
 * export type TeamDUserPreference = typeof teamDUserPreferences.$inferSelect;
 * export type NewTeamDUserPreference = typeof teamDUserPreferences.$inferInsert;
 */

// Your schema extensions go here
