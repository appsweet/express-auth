import { greet, add } from '../src'

describe('greet', () => {
  it('should return a greeting', () => {
    expect(greet('World')).toBe('Hello, World!')
  })
})

describe('add', () => {
  it('should add two numbers', () => {
    expect(add(2, 3)).toBe(5)
  })
})
