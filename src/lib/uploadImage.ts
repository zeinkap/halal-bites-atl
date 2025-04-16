import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: Buffer, mimeType: string): Promise<string> {
  try {
    // Convert buffer to base64
    const base64Data = `data:${mimeType};base64,${file.toString('base64')}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'halal-restaurants-atl/comments',
      resource_type: 'auto',
      transformation: [
        { width: 1000, crop: 'limit' }, // Limit max width while maintaining aspect ratio
        { quality: 'auto' }, // Automatic quality optimization
        { fetch_format: 'auto' } // Automatic format optimization
      ]
    });

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
} 