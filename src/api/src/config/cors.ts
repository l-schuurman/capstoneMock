/**
 * CORS Configuration
 * Imports allowed origins from centralized Team D config
 */

import TeamDConfig from '../../../../teamd.config.js'

// Import allowed origins from centralized config
export const corsOrigins = TeamDConfig.cors.allowedOrigins

export const corsConfig = {
  origin: corsOrigins,
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
