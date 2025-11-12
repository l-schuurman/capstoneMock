/**
 * Team D Mobile Type Definitions
 */

// Inline type definitions to avoid workspace dependency issues during build
// These mirror the types from @large-event/api-types

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  teamId?: string;
}

export interface OrganizationSummary {
  id: number;
  name: string;
  acronym: string | null;
}

export type InstanceAccessLevel = 'web_user' | 'web_admin' | 'both';

export interface InstanceResponse {
  id: number;
  name: string;
  accessLevel: InstanceAccessLevel;
  ownerOrganization: OrganizationSummary;
}

/**
 * Props passed to Team D mobile components by mobile-shell
 */
export interface TeamComponentProps {
  user: AuthUser;
  token: string;
  instances: InstanceResponse[];
  onNavigateBack?: () => void;
}
