import imageCompression from 'browser-image-compression'

export const PHOTO_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  preserveExif: false,
  fileType: 'image/jpeg',
} as const

export function usePhotoCompression() {
  return {
    async compress(file: File): Promise<File> {
      return imageCompression(file, PHOTO_COMPRESSION_OPTIONS)
    },
  }
}
