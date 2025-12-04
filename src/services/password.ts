import bcrypt from 'bcrypt'
import { AuthConfig } from '../types'

export function createPasswordService(config: Required<AuthConfig>) {
  return {
    hashPassword: (password: string) => {
      return bcrypt.hash(password, config.bcryptRounds)
    },

    comparePassword: (password: string, hash: string) => {
      return bcrypt.compare(password, hash)
    }
  }
}
