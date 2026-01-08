import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Props = InputHTMLAttributes<HTMLInputElement>

export const Input = ({ className, ...props }: Props): React.ReactElement => {
  return (
    <input
      {...props}
      className={cn(
        'w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all duration-200 hover:border-gray-300',
        className
      )}
    />
  )
}
