import { useRef, useState, useEffect } from 'react'
import { Button } from './Button'
import { cn } from '../../lib/utils'

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>
  onRemove?: () => Promise<void>
  currentUrl?: string | null
  label?: string
  accept?: string
  maxSizeMB?: number
  className?: string
  aspectRatio?: 'square' | 'wide' | 'cover'
}

export const ImageUpload = ({
  onUpload,
  onRemove,
  currentUrl,
  label = 'Upload image',
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMB = 10,
  className,
  aspectRatio = 'square',
}: ImageUploadProps): React.ReactElement => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(currentUrl || null)

  // Sync preview with currentUrl when it changes
  useEffect(() => {
    setPreview(currentUrl || null)
  }, [currentUrl])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      await onUpload(file)
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      setPreview(currentUrl || null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = async (): Promise<void> => {
    if (!onRemove) {
      // If no onRemove callback, just clear preview
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setIsRemoving(true)
    setError('')
    try {
      await onRemove()
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove image'
      setError(errorMessage)
    } finally {
      setIsRemoving(false)
    }
  }

  const aspectRatioClasses = {
    square: 'aspect-square',
    wide: 'aspect-video',
    cover: 'aspect-[21/9]',
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
      )}
      
      <div className="relative">
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className={cn(
                'w-full rounded-lg object-cover border border-gray-200',
                aspectRatioClasses[aspectRatio]
              )}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-white/90 text-gray-900 hover:bg-white text-sm px-3 py-1.5"
              >
                {isUploading ? 'Uploading...' : 'Change'}
              </Button>
              <Button
                type="button"
                onClick={handleRemove}
                disabled={isUploading || isRemoving}
                className="bg-red-500/90 text-white hover:bg-red-600 text-sm px-3 py-1.5"
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors bg-gray-50',
              aspectRatioClasses[aspectRatio]
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center p-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-4h4m-4-4v8m0 0v-8m0 4h4"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Click to upload
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, WebP up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

