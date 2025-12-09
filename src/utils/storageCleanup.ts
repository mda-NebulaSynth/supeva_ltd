import { supabase } from '../lib/supabase';

/**
 * Extracts the file path from a Supabase storage URL
 * Example: https://xxx.supabase.co/storage/v1/object/public/blog/abc123.jpg -> abc123.jpg
 */
export const extractFilePathFromUrl = (url: string): string | null => {
    try {
        // Match pattern: /storage/v1/object/public/{bucket}/{path}
        const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting file path from URL:', error);
        return null;
    }
};

/**
 * Extracts the bucket name from a Supabase storage URL
 * Example: https://xxx.supabase.co/storage/v1/object/public/blog/abc123.jpg -> blog
 */
export const extractBucketFromUrl = (url: string): string | null => {
    try {
        const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\//);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting bucket from URL:', error);
        return null;
    }
};

/**
 * Deletes a single image from Supabase storage
 * @param imageUrl - The full public URL of the image
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const deleteImageFromStorage = async (imageUrl: string): Promise<boolean> => {
    try {
        const bucket = extractBucketFromUrl(imageUrl);
        const filePath = extractFilePathFromUrl(imageUrl);

        if (!bucket || !filePath) {
            console.warn('Could not extract bucket or file path from URL:', imageUrl);
            return false;
        }

        console.log(`🗑️ Deleting from bucket "${bucket}": ${filePath}`);

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error('Error deleting file from storage:', error);
            return false;
        }

        console.log('✅ Successfully deleted file from storage');
        return true;
    } catch (error) {
        console.error('Exception while deleting file from storage:', error);
        return false;
    }
};

/**
 * Deletes multiple images from Supabase storage
 * @param imageUrls - Array of full public URLs
 * @returns Promise<number> - Number of successfully deleted files
 */
export const deleteImagesFromStorage = async (imageUrls: string[]): Promise<number> => {
    let successCount = 0;

    for (const url of imageUrls) {
        const success = await deleteImageFromStorage(url);
        if (success) successCount++;
    }

    return successCount;
};

/**
 * Deletes all images associated with a record before deleting the record
 * Usage: Call this before deleting a database record that has image URLs
 *
 * @param imageUrls - Array of image URLs or single URL
 * @returns Promise<boolean> - true if all deletions successful
 */
export const cleanupImagesBeforeDelete = async (
    imageUrls: string | string[]
): Promise<boolean> => {
    try {
        const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
        const validUrls = urls.filter(url => url && url.includes('/storage/'));

        if (validUrls.length === 0) {
            console.log('No storage URLs to clean up');
            return true;
        }

        console.log(`🧹 Cleaning up ${validUrls.length} image(s) from storage...`);
        const deletedCount = await deleteImagesFromStorage(validUrls);

        console.log(`✅ Cleaned up ${deletedCount}/${validUrls.length} images`);
        return deletedCount === validUrls.length;
    } catch (error) {
        console.error('Error in cleanupImagesBeforeDelete:', error);
        return false;
    }
};

/**
 * Helper to extract all image URLs from a record object
 * Searches common field names: image, images, image_url, avatar_url, profile_image, etc.
 */
export const extractImageUrlsFromRecord = (record: any): string[] => {
    const imageUrls: string[] = [];
    const imageFields = [
        'image',
        'images',
        'image_url',
        'avatar_url',
        'profile_image',
        'photo',
        'photos',
        'thumbnail',
        'cover_image',
        'banner_image'
    ];

    for (const field of imageFields) {
        const value = record[field];
        if (value) {
            if (Array.isArray(value)) {
                imageUrls.push(...value.filter(url => typeof url === 'string' && url.includes('/storage/')));
            } else if (typeof value === 'string' && value.includes('/storage/')) {
                imageUrls.push(value);
            }
        }
    }

    return imageUrls;
};
