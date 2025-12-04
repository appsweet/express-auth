import { Request, Response, NextFunction, Router } from 'express'
import jwt, { type JwtPayload } from 'jsonwebtoken'

export interface AuthConfig {
  jwtSecret?: jwt.Secret
  jwtExpiresIn?: number
  bcryptRounds?: number
  cookieName?: string
  cookieMaxAge?: number
  getUserById?: (id: string) => Promise<User | null>
  getUserByEmail?: (email: string) => Promise<User | null>
  createUser?: (data: CreateUserData) => Promise<User>
  validatePassword?: (user: User, password: string) => Promise<boolean>
}

export interface User {
  id: string
  email: string
  password?: string
  [key: string]: unknown
}

export interface CreateUserData {
  email: string
  password: string
  [key: string]: unknown
}

export interface AuthRequest extends Request {
  user?: User
  userId?: string
}

export type AuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void

export interface AuthInstance {
  router: Router
  authenticate: (
    req: AuthRequest,
    _: Response,
    next: NextFunction
  ) => Promise<void> | void
  requireAuth: AuthMiddleware
  signToken: (payload: Omit<JwtPayload, 'iat' | 'exp'>) => string
  verifyToken: (token: string) => JwtPayload
  hashPassword: (password: string) => Promise<string>
  comparePassword: (password: string, hash: string) => Promise<boolean>
  config: Required<AuthConfig>
}
