import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: string;
}

/**
 * Streams a Multer in-memory buffer straight to Cloudinary.
 * Replaces multer-storage-cloudinary (which pins to Cloudinary v1) so we can
 * stay on Cloudinary v2 without a dependency conflict.
 */
export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result?: UploadApiResponse) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type });
      }
    );
    stream.end(buffer);
  });
}

export function extractCloudinaryPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}
