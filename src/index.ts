import { AuthConfig, AuthInstance, User } from './types'
import { createJwtService } from './services/jwt'
import { createPasswordService } from './services/password'
import { createAuthenticateMiddleware } from './middleware/authenticate'
import { requireAuth } from './middleware/requireAuth'
import { createAuthRoutes } from './routes/auth'

const defaultConfig = {
  jwtSecret: process.env.AUTH_JWT_SECRET || 'your-secret-key-change-this',
  jwtExpiresIn: process.env.AUTH_JWT_EXPIRES_IN
    ? parseInt(process.env.AUTH_JWT_EXPIRES_IN)
    : 604800, // 7 days
  bcryptRounds: parseInt(process.env.AUTH_BCRYPT_ROUNDS || '10'),
  cookieName: process.env.AUTH_COOKIE_NAME || 'auth_token',
  cookieMaxAge: parseInt(process.env.AUTH_COOKIE_MAX_AGE || '604800000'), // 7 days
  getUserById: async (): Promise<User | null> => {
    return await Promise.resolve(null)
  },
  getUserByEmail: async (): Promise<User | null> => {
    return await Promise.resolve(null)
  },
  createUser: () => {
    throw new Error('createUser not implemented')
  },
  validatePassword: async () => await Promise.resolve(false)
}

export function useAuth(userConfig: AuthConfig): AuthInstance {
  // Merge config with defaults
  const config: Required<AuthConfig> = {
    ...defaultConfig,
    ...userConfig
  }

  // Warn about missing JWT secret
  if (!userConfig.jwtSecret && !process.env.AUTH_JWT_SECRET) {
    console.warn(
      '⚠️  WARNING: No JWT secret provided. Using default (INSECURE).\n' +
        '   Set AUTH_JWT_SECRET environment variable or pass jwtSecret in config.'
    )
  }

  // Create services
  const { verifyToken, signToken } = createJwtService(config)
  const { hashPassword, comparePassword } = createPasswordService(config)

  // Create middleware
  const authenticate = createAuthenticateMiddleware(config, verifyToken)

  // Create router
  const router = createAuthRoutes(
    config,
    {
      signToken,
      hashPassword,
      comparePassword
    },
    authenticate
  )

  // Return the auth instance
  return {
    router,
    authenticate,
    requireAuth,
    signToken,
    verifyToken,
    hashPassword,
    comparePassword,
    config
  }
}
