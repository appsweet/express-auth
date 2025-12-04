import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types'
import { createUnauthorizedError } from '../utils/errors'

export function requireAuth(
  req: AuthRequest,
  _: Response,
  next: NextFunction
): void {
  if (!req.user && !req.userId) {
    throw createUnauthorizedError('Authentication required')
  }
  next()
}
