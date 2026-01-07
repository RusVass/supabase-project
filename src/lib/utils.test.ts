import { describe, it, expect } from 'vitest'
import { cn, calculateAge, validatePhone } from './utils'

describe('cn', () => {
  it('merges classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    const condition = false
    expect(cn('foo', condition && 'bar', 'baz')).toBe('foo baz')
  })

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('resolves Tailwind class conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('returns empty string for empty arguments', () => {
    expect(cn()).toBe('')
    expect(cn('', null, undefined)).toBe('')
  })
})

describe('calculateAge', () => {
  it('calculates age correctly for past date', () => {
    const today = new Date()
    const birthYear = today.getFullYear() - 25
    const birthMonth = today.getMonth()
    const birthDay = today.getDate()
    const birthDate = `${birthYear}-${String(birthMonth + 1).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`
    expect(calculateAge(birthDate)).toBe(25)
  })

  it('returns null for null input', () => {
    expect(calculateAge(null)).toBeNull()
  })

  it('returns null for invalid date', () => {
    expect(calculateAge('invalid-date')).toBeNull()
  })

  it('handles birthday not yet occurred this year', () => {
    const today = new Date()
    const birthYear = today.getFullYear() - 30
    const birthMonth = today.getMonth() + 1
    const birthDay = today.getDate() + 1
    const birthDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`
    expect(calculateAge(birthDate)).toBe(29)
  })

  it('returns null for future date', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    expect(calculateAge(futureDate.toISOString().split('T')[0])).toBeNull()
  })
})

describe('validatePhone', () => {
  it('validates phone with plus sign', () => {
    expect(validatePhone('+1234567890')).toBe(true)
  })

  it('validates phone without plus sign', () => {
    expect(validatePhone('1234567890')).toBe(true)
  })

  it('validates phone with spaces and dashes', () => {
    expect(validatePhone('+1 234-567-890')).toBe(true)
  })

  it('validates phone with parentheses', () => {
    expect(validatePhone('(123) 456-7890')).toBe(true)
  })

  it('rejects phone that is too short', () => {
    expect(validatePhone('123')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validatePhone('')).toBe(false)
  })

  it('rejects phone with only letters', () => {
    expect(validatePhone('abcdefghij')).toBe(false)
  })
})

