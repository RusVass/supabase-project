import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Props = ButtonHTMLAttributes<HTMLButtonElement>

export const Button = ({ className, ...props }: Props): React.ReactElement => {
  return (
    <button
      {...props}
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    />
  )
}
