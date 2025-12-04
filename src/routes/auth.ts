import { Router, Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { AuthConfig, AuthRequest } from '../types'
import { createValidationError, createUnauthorizedError } from '../utils/errors'

export function createAuthRoutes(
  config: Required<AuthConfig>,
  services: {
    signToken: (payload: jwt.JwtPayload) => string
    hashPassword: (password: string) => Promise<string>
    comparePassword: (password: string, hash: string) => Promise<boolean>
  },
  authenticate: (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void
): Router {
  const router = Router()

  // POST /register
  router.post(
    '/register/password',
    [
      body('email').isEmail().normalizeEmail(),
      body('password').isLength({ min: 8 })
    ],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          throw createValidationError(
            'Invalid input: ' +
              errors
                .array()
                .map((e) => {
                  e.msg
                })
                .join(', ')
          )
        }

        const { email, password, ...extra } = req.body as {
          email: string
          password: string
          [key: string]: unknown
        }

        // Check if user exists
        const existingUser = await config.getUserByEmail(email)
        if (existingUser) {
          throw createValidationError('User already exists')
        }

        // Hash password and create user
        const hashedPassword = await services.hashPassword(password)
        const user = await config.createUser({
          email,
          password: hashedPassword,
          ...extra
        })

        // Generate token
        const token = services.signToken({
          userId: user.id
        })

        // Set cookie
        res.cookie(config.cookieName, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: config.cookieMaxAge
        })

        res.status(201).json({
          success: true,
          token,
          user: { id: user.id, email: user.email }
        })
      } catch (error) {
        next(error)
      }
    }
  )

  // POST /login
  router.post(
    '/login/password',
    [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          throw createValidationError('Invalid input')
        }

        const { email, password } = req.body as {
          email: string
          password: string
        }

        // Find user
        const user = await config.getUserByEmail(email)
        if (!user) {
          throw createUnauthorizedError('Invalid credentials')
        }

        // Validate password
        let isValid = false
        if (config.validatePassword) {
          isValid = await config.validatePassword(user, password)
        } else if (user.password) {
          isValid = await services.comparePassword(password, user.password)
        }

        if (!isValid) {
          throw createUnauthorizedError('Invalid credentials')
        }

        // Generate token
        const token = services.signToken({
          userId: user.id
        })

        // Set cookie
        res.cookie(config.cookieName, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: config.cookieMaxAge
        })

        res.json({
          success: true,
          token,
          user: { id: user.id, email: user.email }
        })
      } catch (error) {
        next(error)
      }
    }
  )

  // POST /logout
  router.post('/logout', (_: Request, res: Response) => {
    res.clearCookie(config.cookieName)
    res.json({ success: true, message: 'Logged out successfully' })
  })

  // GET /me
  router.get('/me', authenticate, (req: Request, res: Response) => {
    res.json({
      success: true,
      user: (
        req as {
          user?: { id: string }
        }
      ).user || {
        id: (
          req as {
            userId?: string
          }
        ).userId
      }
    })
  })

  return router
}
