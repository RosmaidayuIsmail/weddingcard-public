/**
 * Client-side image upload via Cloudinary's unsigned upload API.
 * No secret key involved - an "unsigned upload preset" (configured in the
 * Cloudinary dashboard) is specifically designed to be safe to call directly
 * from the browser.
 */
export function useCloudinary() {
  const config = useRuntimeConfig().public

  const isConfigured = Boolean(config.cloudinaryCloudName && config.cloudinaryUploadPreset)

  async function uploadImage(file: Blob, folder?: string, filename = 'upload.png'): Promise<string> {
    if (!isConfigured) {
      throw new Error(
        'Cloudinary is not configured. Add NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.'
      )
    }

    const formData = new FormData()
    formData.append('file', file, file instanceof File ? file.name : filename)
    formData.append('upload_preset', config.cloudinaryUploadPreset)
    if (folder) formData.append('folder', folder)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null)
      throw new Error(errorBody?.error?.message || 'Upload failed. Check your Cloudinary cloud name and upload preset.')
    }

    const data = (await response.json()) as { secure_url: string }
    return data.secure_url
  }

  return { isConfigured, uploadImage }
}