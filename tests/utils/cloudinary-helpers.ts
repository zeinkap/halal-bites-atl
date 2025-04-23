import { v2 as cloudinary } from 'cloudinary';

/**
 * Interface for Cloudinary resource objects
 * Represents the structure of a resource returned by Cloudinary's API
 * 
 * @property public_id - Unique identifier for the resource in Cloudinary
 * @property [key: string] - Additional dynamic properties returned by Cloudinary
 */
interface CloudinaryResource {
  public_id: string;
  [key: string]: string | number | boolean | undefined;
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Array to track uploaded images for cleanup during test runs
const uploadedTestImages: string[] = [];

/**
 * Creates a test image buffer for upload testing
 * Generates a minimal 1x1 pixel black PNG image
 * Used for testing image upload functionality without large file sizes
 * 
 * The buffer contains the binary data for a valid PNG file with:
 * - PNG signature
 * - IHDR chunk (image header)
 * - IDAT chunk (image data)
 * - IEND chunk (image end)
 * 
 * @returns Buffer containing a valid 1x1 PNG image
 */
export function createTestImageBuffer(): Buffer {
  // Create a 1x1 pixel black PNG image
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0d, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0x60, 0x60, 0x60, 0x60,
    0x00, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00,
    0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ]);
}

/**
 * Uploads a test image to Cloudinary
 * Converts the image buffer to base64 and uploads to a designated test folder
 * Tracks the uploaded image's public_id for later cleanup
 * 
 * @param imageBuffer - Buffer containing the image data to upload
 * @returns Promise resolving to the Cloudinary secure URL of the uploaded image
 * @throws Error if the upload fails
 */
export async function uploadTestImage(imageBuffer: Buffer): Promise<string> {
  const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
  
  const result = await cloudinary.uploader.upload(base64Image, {
    folder: process.env.CLOUDINARY_TEST_FOLDER || 'test_uploads',
    resource_type: 'auto'
  });

  uploadedTestImages.push(result.public_id);
  return result.secure_url;
}

/**
 * Deletes all test images uploaded during the current test run
 * Processes deletions in batches of 10 to avoid API limits
 * Clears the tracking array after successful deletion
 * 
 * Uses Cloudinary's delete_resources API to:
 * - Remove images from storage
 * - Invalidate CDN caches
 * - Clean up all versions of the images
 * 
 * @throws Error if cleanup fails, includes error details in console
 */
export async function cleanupTestImages(): Promise<void> {
  if (uploadedTestImages.length === 0) return;

  try {
    // Delete images in batches of 10
    const batches = [];
    for (let i = 0; i < uploadedTestImages.length; i += 10) {
      const batch = uploadedTestImages.slice(i, i + 10);
      batches.push(batch);
    }

    await Promise.all(
      batches.map(batch =>
        cloudinary.api.delete_resources(batch, {
          resource_type: 'image',
          invalidate: true
        })
      )
    );

    // Clear the array
    uploadedTestImages.length = 0;
  } catch (error) {
    console.error('Error cleaning up test images:', error);
    throw error;
  }
}

/**
 * Deletes all images in the designated test folder
 * Used for complete cleanup of test resources
 * 
 * Process:
 * 1. Searches for all resources in the test folder
 * 2. Extracts public_ids from the search results
 * 3. Deletes all found resources in a single batch
 * 4. Invalidates CDN caches for the deleted resources
 * 
 * @throws Error if cleanup fails, includes error details in console
 */
export async function cleanupTestFolder(): Promise<void> {
  try {
    const folder = process.env.CLOUDINARY_TEST_FOLDER || 'test_uploads';
    const { resources } = await cloudinary.search
      .expression(`folder:${folder}`)
      .execute();

    if (resources.length > 0) {
      const publicIds = resources.map((resource: CloudinaryResource) => resource.public_id);
      await cloudinary.api.delete_resources(publicIds, {
        resource_type: 'image',
        invalidate: true
      });
    }
  } catch (error) {
    console.error('Error cleaning up test folder:', error);
    throw error;
  }
} 