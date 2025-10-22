import { Readable } from 'stream';
import cloudinary from '../config/cloudinary';
import type { UploadApiResponse } from 'cloudinary';

// Upload buffer to Cloudinary
export const uploadToCloudinary = async (
  buffer: Buffer,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: any[];
  } = {}
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'melody-map/avatars',
        public_id: options.public_id,
        transformation: options.transformation || [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', format: 'auto' }
        ],
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Upload failed - no result returned'));
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Don't throw error, as the main operation might still succeed
  }
};

// Extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const matches = url.match(/\/melody-map\/avatars\/([^/.]+)/);
    return matches ? `melody-map/avatars/${matches[1]}` : null;
  } catch {
    return null;
  }
};
