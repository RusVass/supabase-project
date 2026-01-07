import { supabase } from '../../lib/supabase'

const BUCKET_NAME = 'profiles'
const AVATAR_FOLDER = 'avatars'
const COVER_FOLDER = 'covers'
const GALLERY_FOLDER = 'gallery'

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || 'jpg'
}

function generateFileName(userId: string, folder: string, originalName: string): string {
  const ext = getFileExtension(originalName)
  const timestamp = Date.now()
  return `${folder}/${userId}/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileName = generateFileName(userId, AVATAR_FOLDER, file.name)
  const fileExt = getFileExtension(file.name)

  const validExtensions = ['jpg', 'jpeg', 'png', 'webp']
  if (!validExtensions.includes(fileExt)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB')
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
      throw new Error(`Storage bucket '${BUCKET_NAME}' not found. Please create it in Supabase Dashboard → Storage. See STORAGE_SETUP.md for instructions.`)
    }
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return publicUrl
}

export async function uploadCover(userId: string, file: File): Promise<string> {
  const fileName = generateFileName(userId, COVER_FOLDER, file.name)
  const fileExt = getFileExtension(file.name)

  const validExtensions = ['jpg', 'jpeg', 'png', 'webp']
  if (!validExtensions.includes(fileExt)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.')
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size must be less than 10MB')
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
      throw new Error(`Storage bucket '${BUCKET_NAME}' not found. Please create it in Supabase Dashboard → Storage. See STORAGE_SETUP.md for instructions.`)
    }
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return publicUrl
}

export async function uploadGalleryImage(userId: string, file: File): Promise<string> {
  const fileName = generateFileName(userId, GALLERY_FOLDER, file.name)
  const fileExt = getFileExtension(file.name)

  const validExtensions = ['jpg', 'jpeg', 'png', 'webp']
  if (!validExtensions.includes(fileExt)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.')
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size must be less than 10MB')
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
      throw new Error(`Storage bucket '${BUCKET_NAME}' not found. Please create it in Supabase Dashboard → Storage. See STORAGE_SETUP.md for instructions.`)
    }
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return publicUrl
}

export async function deleteImage(fileUrl: string): Promise<void> {
  const url = new URL(fileUrl)
  const pathParts = url.pathname.split('/')
  const bucketIndex = pathParts.findIndex(part => part === BUCKET_NAME)
  
  if (bucketIndex === -1) {
    throw new Error('Invalid file URL')
  }

  const filePath = pathParts.slice(bucketIndex + 1).join('/')

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (error) throw error
}

