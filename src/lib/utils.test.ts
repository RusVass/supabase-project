import { describe, it, expect } from 'vitest'
import { cn } from './utils'

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

