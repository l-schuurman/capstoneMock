/**
 * Team D Specific Tables
 *
 * Invoice Generator - Organization & Instance Infrastructure
 *
 * ACCESS CONTROL ARCHITECTURE:
 * =============================
 * 1. Organizations: Groups of users (CFES, CALE, MES, student groups, etc.)
 * 2. Instances: Applications/portals owned by organizations (events, dashboards, etc.)
 * 3. user_organizations: Membership roster - defines who belongs to which org
 *    - Organization membership does NOT grant automatic instance access
 *    - Org admins can grant instance access to members of their organization
 * 4. user_instance_access: SINGLE SOURCE OF TRUTH for all authorization
 *    - All access is explicit (no automatic/inherited permissions)
 *    - Portal-level access: web_user, web_admin, or both
 *    - Future: Feature-based permissions will layer on top of portal access
 *
 * Authorization Flow:
 * - User joins organization → record in user_organizations (eligibility pool)
 * - Org admin/system admin grants access → record in user_instance_access
 * - User tries to access instance → check user_instance_access ONLY
 */

import { pgTable, serial, varchar, timestamp, text, integer, boolean, unique } from 'drizzle-orm/pg-core';
import { users } from '@large-event/database/schemas';

/**
 * Organizations table
 * Represents actual entities: CFES, CALE, MES, student groups, other eng societies, etc.
 */
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  acronym: varchar('acronym', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Instances table
 * Represents a switchable dashboard/portal/workspace owned by an organization
 */
export const instances = pgTable('instances', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ownerOrganizationId: integer('owner_organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * User Organizations table
 *
 * PURPOSE: Defines organizational membership and eligibility pools.
 * - Organization membership does NOT automatically grant instance access
 * - This is an "eligibility pool" - org admins can grant access to org members
 * - `isOrganizationAdmin`: Grants permission to manage instance access for org members
 *
 * IMPORTANT: This table is NOT used for authorization checks.
 * See `userInstanceAccess` for actual access control.
 */
export const userOrganizations = pgTable('user_organizations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  isOrganizationAdmin: boolean('is_organization_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userOrgUnique: unique('user_org_unique').on(table.userId, table.organizationId),
}));

/**
 * User Instance Access table
 *
 * PURPOSE: SINGLE SOURCE OF TRUTH for all instance authorization.
 * - All instance access must be explicitly granted (no automatic/inherited access)
 * - Always check this table (and ONLY this table) for authorization decisions
 * - Access is granted by org admins or system admins
 *
 * Access Levels:
 * - 'web_user': Access to user portal only (students/attendees)
 * - 'web_admin': Access to admin portal only (event organizers)
 * - 'both': Access to both user and admin portals (org executives, system admins)
 * - 'none': Explicitly denied (can delete record instead)
 *
 * Future: Feature-based permissions will layer on top of this portal-level access
 */
export const userInstanceAccess = pgTable('user_instance_access', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  instanceId: integer('instance_id')
    .notNull()
    .references(() => instances.id, { onDelete: 'cascade' }),
  accessLevel: varchar('access_level', { length: 20 }).notNull(), // 'web_user' | 'web_admin' | 'both' | 'none'
  grantedBy: integer('granted_by')
    .references(() => users.id, { onDelete: 'set null' }),
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userInstanceUnique: unique('user_instance_unique').on(table.userId, table.instanceId),
}));

// Type exports
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type Instance = typeof instances.$inferSelect;
export type NewInstance = typeof instances.$inferInsert;

export type UserOrganization = typeof userOrganizations.$inferSelect;
export type NewUserOrganization = typeof userOrganizations.$inferInsert;

export type UserInstanceAccess = typeof userInstanceAccess.$inferSelect;
export type NewUserInstanceAccess = typeof userInstanceAccess.$inferInsert;
