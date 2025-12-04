import { type Response, type NextFunction } from 'express'
import { type AuthConfig, type AuthRequest } from '../types'
import { createUnauthorizedError } from '../utils/errors'
import { JwtPayload } from 'jsonwebtoken'

export function createAuthenticateMiddleware(
  config: Required<AuthConfig>,
  verifyToken: (token: string) => JwtPayload
) {
  return async function authenticate(
    req: AuthRequest,
    _: Response,
    next: NextFunction
  ) {
    try {
      // Try to get token from multiple sources
      const cookie = (req.cookies as { [config.cookieName]: string })?.[
        config.cookieName
      ]

      const token =
        cookie ||
        req.headers.authorization?.replace('Bearer ', '') ||
        (req.query.token as string)

      if (!token) {
        return next()
      }

      // Verify token
      const payload = verifyToken(token)
      const userId = payload.userId as string

      // Optionally fetch full user from database
      if (config.getUserById) {
        const user = await config.getUserById(userId)
        if (!user) {
          throw createUnauthorizedError('User not found')
        }
        req.user = user || undefined
      }

      req.userId = userId
      next()
    } catch (error) {
      next(error)
    }
  }
}
