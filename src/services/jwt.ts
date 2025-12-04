import jwt, { type JwtPayload } from 'jsonwebtoken'
import { AuthConfig } from '../types'

export function createJwtService(config: Required<AuthConfig>) {
  return {
    signToken: (payload: JwtPayload): string => {
      return jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn || 3600
      })
    },

    verifyToken: (token: string): JwtPayload => {
      const decoded = jwt.verify(token, config.jwtSecret)
      return decoded as JwtPayload
    }
  }
}
