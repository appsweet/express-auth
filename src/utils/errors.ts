export interface AuthError extends Error {
  statusCode: number
}

export function createAuthError(message: string, statusCode = 401): AuthError {
  const error = new Error(message) as AuthError
  error.name = 'AuthError'
  error.statusCode = statusCode
  return error
}

export function createValidationError(message: string): AuthError {
  const error = new Error(message) as AuthError
  error.name = 'ValidationError'
  error.statusCode = 400
  return error
}

export function createUnauthorizedError(message = 'Unauthorized'): AuthError {
  const error = new Error(message) as AuthError
  error.name = 'UnauthorizedError'
  error.statusCode = 401
  return error
}
