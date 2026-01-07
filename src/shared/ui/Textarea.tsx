import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = ({ className, ...props }: Props): React.ReactElement => {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none',
        className
      )}
    />
  )
}

