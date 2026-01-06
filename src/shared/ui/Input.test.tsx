import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('renders input', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('displays placeholder', () => {
    render(<Input placeholder="Enter email" />)
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
  })

  it('accepts and displays value', () => {
    render(<Input value="test@example.com" readOnly />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('test@example.com')
  })

  it('calls onChange on input', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'test')
    expect(handleChange).toHaveBeenCalled()
  })

  it('disables input when disabled', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('sets type attribute', () => {
    render(<Input type="password" data-testid="password-input" />)
    const input = screen.getByTestId('password-input') as HTMLInputElement
    expect(input.type).toBe('password')
  })

  it('accepts custom classes', () => {
    render(<Input className="custom-input" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input')
  })

  it('passes other HTML attributes', () => {
    render(<Input required data-testid="email-input" />)
    const input = screen.getByTestId('email-input')
    expect(input).toBeRequired()
  })
})

