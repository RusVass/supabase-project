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

export async function deleteAllUserFiles(userId: string): Promise<void> {
  // Delete all files in user's folders (avatars, covers, gallery)
  const folders = [AVATAR_FOLDER, COVER_FOLDER, GALLERY_FOLDER]
  
  for (const folder of folders) {
    const folderPath = `${folder}/${userId}`
    
    // List all files in the folder
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folderPath)
    
    if (listError) {
      // If folder doesn't exist, continue to next folder
      if (listError.message.includes('not found')) {
        continue
      }
      throw listError
    }
    
    if (files && files.length > 0) {
      // Delete all files in the folder
      const filePaths = files.map(file => `${folderPath}/${file.name}`)
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths)
      
      if (deleteError) {
        // Log error but continue - some files might already be deleted
        console.warn(`Error deleting files from ${folderPath}:`, deleteError)
      }
    }
  }
}

