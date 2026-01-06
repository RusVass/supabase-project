import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('об\'єднує класи', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('обробляє умовні класи', () => {
    const condition = false
    expect(cn('foo', condition && 'bar', 'baz')).toBe('foo baz')
  })

  it('обробляє масиви класів', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('вирішує конфлікти Tailwind класів', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('повертає порожній рядок для порожніх аргументів', () => {
    expect(cn()).toBe('')
    expect(cn('', null, undefined)).toBe('')
  })
})

