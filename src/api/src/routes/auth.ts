/**
 * Authentication Routes
 */

import type { FastifyInstance } from 'fastify'
import { findUserByEmail, generateToken } from '@large-event/api'
import { db, users } from '@large-event/database'
import { successResponse, errorResponse, unauthorizedResponse } from '../utils/response.js'
import { requireAuth } from '../middleware/auth.js'
import { attachRole } from '../middleware/rbac.js'

export default async function authRoutes(fastify: FastifyInstance) {
  /**
   * POST /auth/login
   * User login - creates user if doesn't exist (simplified auth for MVP)
   */
  fastify.post<{
    Body: { email: string; password?: string }
  }>('/auth/login', async (request, reply) => {
    const { email, password } = request.body

    if (!email) {
      return errorResponse(reply, 'Email is required', 400, 'VALIDATION_ERROR')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return errorResponse(reply, 'Invalid email format', 400, 'VALIDATION_ERROR')
    }

    try {
      // Find or create user (simplified for MVP - no password validation yet)
      let user = await findUserByEmail(email)

      if (!user) {
        // Create new user
        const [newUser] = await db.insert(users).values({ email }).returning()
        user = newUser
      }

      // Attach role based on email
      const userWithRole = attachRole(user)

      // Generate JWT token
      const token = generateToken(userWithRole)

      // Set HTTP-only cookie
      reply.setCookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60, // 24 hours
      })

      return successResponse(reply, {
        user: userWithRole,
        token,
      })
    } catch (error) {
      fastify.log.error('Login error:', error)
      return errorResponse(reply, 'Login failed', 500, 'LOGIN_ERROR')
    }
  })

  /**
   * POST /auth/logout
   * Clear auth cookie
   */
  fastify.post('/auth/logout', async (request, reply) => {
    reply.clearCookie('auth-token', { path: '/' })
    return successResponse(reply, { message: 'Logged out successfully' })
  })

  /**
   * GET /auth/me
   * Get current authenticated user
   */
  fastify.get(
    '/auth/me',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      const user = request.user

      if (!user) {
        return unauthorizedResponse(reply)
      }

      return successResponse(reply, { user })
    }
  )

  /**
   * GET /auth/token
   * Get current JWT token (for debugging/testing)
   */
  fastify.get(
    '/auth/token',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      const token = request.cookies['auth-token'] || request.headers.authorization?.substring(7)

      return successResponse(reply, { token })
    }
  )
}
