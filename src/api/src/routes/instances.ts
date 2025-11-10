/**
 * Instance Management Routes
 * Endpoints for managing and accessing organization instances
 */

import type { FastifyInstance } from 'fastify'
import { db } from '@teamd/database'
import {
  instances,
  organizations,
  userInstanceAccess,
} from '@teamd/database/overlays'
import { eq, and } from 'drizzle-orm'
import { successResponse, errorResponse, notFoundResponse } from '../utils/response.js'
import { requireAuth } from '../middleware/auth.js'

export default async function instanceRoutes(fastify: FastifyInstance) {
  /**
   * GET /instances
   * Get all instances accessible to the current user
   */
  fastify.get(
    '/instances',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      const userId = request.user?.id

      if (!userId) {
        return errorResponse(reply, 'User not authenticated', 401)
      }

      try {
        // Get all instance access for this user
        const userAccess = await db
          .select({
            instanceId: userInstanceAccess.instanceId,
            accessLevel: userInstanceAccess.accessLevel,
            instanceName: instances.name,
            ownerOrgId: instances.ownerOrganizationId,
            ownerOrgName: organizations.name,
            ownerOrgAcronym: organizations.acronym,
          })
          .from(userInstanceAccess)
          .innerJoin(instances, eq(userInstanceAccess.instanceId, instances.id))
          .innerJoin(organizations, eq(instances.ownerOrganizationId, organizations.id))
          .where(eq(userInstanceAccess.userId, userId))

        // Map to response format
        const instancesList = userAccess.map((access) => ({
          id: access.instanceId,
          name: access.instanceName,
          accessLevel: access.accessLevel,
          ownerOrganization: {
            id: access.ownerOrgId,
            name: access.ownerOrgName,
            acronym: access.ownerOrgAcronym,
          },
        }))

        return successResponse(reply, {
          instances: instancesList,
          count: instancesList.length
        })
      } catch (error) {
        console.error('Error fetching instances:', error instanceof Error ? error.message : String(error))
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
        fastify.log.error('Error fetching instances:', error)
        return errorResponse(reply, 'Failed to fetch instances', 500)
      }
    }
  )

  /**
   * GET /instances/:id
   * Get specific instance details
   */
  fastify.get<{
    Params: { id: string }
  }>(
    '/instances/:id',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      const userId = request.user?.id
      const instanceId = parseInt(request.params.id)

      if (!userId) {
        return errorResponse(reply, 'User not authenticated', 401)
      }

      if (isNaN(instanceId)) {
        return errorResponse(reply, 'Invalid instance ID', 400, 'VALIDATION_ERROR')
      }

      try {
        // Check if user has access to this instance
        const [access] = await db
          .select()
          .from(userInstanceAccess)
          .where(
            and(
              eq(userInstanceAccess.userId, userId),
              eq(userInstanceAccess.instanceId, instanceId)
            )
          )
          .limit(1)

        if (!access) {
          return errorResponse(reply, 'Access denied to this instance', 403)
        }

        // Get instance details
        const [instance] = await db
          .select({
            id: instances.id,
            name: instances.name,
            ownerOrgId: instances.ownerOrganizationId,
            ownerOrgName: organizations.name,
            ownerOrgAcronym: organizations.acronym,
          })
          .from(instances)
          .innerJoin(organizations, eq(instances.ownerOrganizationId, organizations.id))
          .where(eq(instances.id, instanceId))
          .limit(1)

        if (!instance) {
          return notFoundResponse(reply, 'Instance not found')
        }

        return successResponse(reply, {
          instance: {
            id: instance.id,
            name: instance.name,
            accessLevel: access.accessLevel,
            ownerOrganization: {
              id: instance.ownerOrgId,
              name: instance.ownerOrgName,
              acronym: instance.ownerOrgAcronym,
            },
          },
        })
      } catch (error) {
        console.error('Error fetching instance:', error instanceof Error ? error.message : String(error))
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
        fastify.log.error('Error fetching instance:', error)
        return errorResponse(reply, 'Failed to fetch instance', 500)
      }
    }
  )
}
