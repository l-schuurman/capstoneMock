/**
 * Role-Based Access Control (RBAC) Middleware
 * Determines user roles based on email or other criteria
 */

import type { AuthUser } from './auth.js'

/**
 * Admin email patterns
 * Add admin email addresses or patterns here
 */
const ADMIN_EMAILS = [
  'admin@teamd.local',
  'admin@large-event.com',
]

/**
 * Check if email matches admin pattern
 */
function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email) || email.endsWith('@admin.teamd.local')
}

/**
 * Determine user role based on email or other criteria
 */
export function getUserRole(user: AuthUser): 'admin' | 'user' {
  if (isAdminEmail(user.email)) {
    return 'admin'
  }
  return 'user'
}

/**
 * Attach role to user object
 */
export function attachRole(user: AuthUser): AuthUser {
  return {
    ...user,
    role: getUserRole(user),
  }
}
