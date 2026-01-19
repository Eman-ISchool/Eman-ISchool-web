/**
 * Video Storage Utility
 * Handles video file storage, retrieval, and URL generation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

// Supabase storage bucket name for reels
const REELS_BUCKET = 'reels';

/**
 * Get Supabase admin client for storage operations
 */
function getSupabaseClient(): SupabaseClient<Database> {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables for storage operations');
    }
    return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

/**
 * Upload a video file to storage
 */
export async function uploadVideo(
    file: Buffer | File | Uint8Array,
    filename: string,
    contentType: string = 'video/mp4'
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const supabase = getSupabaseClient();

        // Generate unique filename to prevent collisions
        const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${filename}`;

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
            .from(REELS_BUCKET)
            .upload(uniqueFilename, file, {
                contentType,
                upsert: false,
            });

        if (error) {
            console.error('Error uploading video:', error);
            return {
                success: false,
                error: `Failed to upload video: ${error.message}`,
            };
        }

        // Get public URL (or signed URL for security)
        const { data: urlData } = supabase.storage
            .from(REELS_BUCKET)
            .getPublicUrl(data.path);

        return {
            success: true,
            url: urlData.publicUrl,
        };
    } catch (error: any) {
        console.error('Error in uploadVideo:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload video',
        };
    }
}

/**
 * Upload a thumbnail image to storage
 */
export async function uploadThumbnail(
    file: Buffer | File | Uint8Array,
    filename: string,
    contentType: string = 'image/jpeg'
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const supabase = getSupabaseClient();

        // Generate unique filename
        const uniqueFilename = `thumbnails/${Date.now()}-${Math.random().toString(36).substring(7)}-${filename}`;

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
            .from(REELS_BUCKET)
            .upload(uniqueFilename, file, {
                contentType,
                upsert: false,
            });

        if (error) {
            console.error('Error uploading thumbnail:', error);
            return {
                success: false,
                error: `Failed to upload thumbnail: ${error.message}`,
            };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(REELS_BUCKET)
            .getPublicUrl(data.path);

        return {
            success: true,
            url: urlData.publicUrl,
        };
    } catch (error: any) {
        console.error('Error in uploadThumbnail:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload thumbnail',
        };
    }
}

/**
 * Generate a signed URL for a video file (more secure than public URL)
 */
export async function generateSignedVideoUrl(
    path: string,
    expiresIn: number = 3600 // 1 hour default
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase.storage
            .from(REELS_BUCKET)
            .createSignedUrl(path, expiresIn);

        if (error) {
            console.error('Error generating signed URL:', error);
            return {
                success: false,
                error: `Failed to generate signed URL: ${error.message}`,
            };
        }

        return {
            success: true,
            url: data.signedUrl,
        };
    } catch (error: any) {
        console.error('Error in generateSignedVideoUrl:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate signed URL',
        };
    }
}

/**
 * Delete a video file from storage
 */
export async function deleteVideo(path: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getSupabaseClient();

        const { error } = await supabase.storage
            .from(REELS_BUCKET)
            .remove([path]);

        if (error) {
            console.error('Error deleting video:', error);
            return {
                success: false,
                error: `Failed to delete video: ${error.message}`,
            };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in deleteVideo:', error);
        return {
            success: false,
            error: error.message || 'Failed to delete video',
        };
    }
}

/**
 * Delete a thumbnail from storage
 */
export async function deleteThumbnail(path: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getSupabaseClient();

        const { error } = await supabase.storage
            .from(REELS_BUCKET)
            .remove([path]);

        if (error) {
            console.error('Error deleting thumbnail:', error);
            return {
                success: false,
                error: `Failed to delete thumbnail: ${error.message}`,
            };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in deleteThumbnail:', error);
        return {
            success: false,
            error: error.message || 'Failed to delete thumbnail',
        };
    }
}

/**
 * Get file info from storage
 */
export async function getFileInfo(path: string): Promise<{
    success: boolean;
    metadata?: { name: string; size: number; contentType: string };
    error?: string;
}> {
    try {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase.storage
            .from(REELS_BUCKET)
            .list('', { search: path });

        if (error) {
            console.error('Error getting file info:', error);
            return {
                success: false,
                error: `Failed to get file info: ${error.message}`,
            };
        }

        const file = data.find(f => f.name === path);
        if (!file) {
            return {
                success: false,
                error: 'File not found',
            };
        }

        return {
            success: true,
            metadata: {
                name: file.name,
                size: file.metadata?.size || 0,
                contentType: file.metadata?.mimetype || 'application/octet-stream',
            },
        };
    } catch (error: any) {
        console.error('Error in getFileInfo:', error);
        return {
            success: false,
            error: error.message || 'Failed to get file info',
        };
    }
}

/**
 * Validate video file format and size
 */
export function validateVideoFile(file: File | Buffer): {
    valid: boolean;
    error?: string;
    maxSize?: number;
    maxSizeMB?: number;
} {
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    const MAX_VIDEO_DURATION = 120; // 120 seconds (2 minutes)

    if (file instanceof File) {
        // Check file size
        if (file.size > MAX_VIDEO_SIZE) {
            return {
                valid: false,
                error: `Video file too large. Maximum size is ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
                maxSize: MAX_VIDEO_SIZE,
                maxSizeMB: MAX_VIDEO_SIZE / 1024 / 1024,
            };
        }

        // Check file type
        const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (!validTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Invalid video format. Supported formats: ${validTypes.join(', ')}`,
            };
        }

        return { valid: true };
    } else if (Buffer.isBuffer(file)) {
        // Check buffer size
        if (file.length > MAX_VIDEO_SIZE) {
            return {
                valid: false,
                error: `Video file too large. Maximum size is ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
                maxSize: MAX_VIDEO_SIZE,
                maxSizeMB: MAX_VIDEO_SIZE / 1024 / 1024,
            };
        }

        return { valid: true };
    }

    return {
        valid: false,
        error: 'Invalid file type. Expected File or Buffer.',
    };
}

/**
 * Validate thumbnail file format and size
 */
export function validateThumbnailFile(file: File | Buffer): {
    valid: boolean;
    error?: string;
    maxSize?: number;
    maxSizeMB?: number;
} {
    const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB

    if (file instanceof File) {
        // Check file size
        if (file.size > MAX_THUMBNAIL_SIZE) {
            return {
                valid: false,
                error: `Thumbnail file too large. Maximum size is ${MAX_THUMBNAIL_SIZE / 1024 / 1024}MB`,
                maxSize: MAX_THUMBNAIL_SIZE,
                maxSizeMB: MAX_THUMBNAIL_SIZE / 1024 / 1024,
            };
        }

        // Check file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Invalid image format. Supported formats: ${validTypes.join(', ')}`,
            };
        }

        return { valid: true };
    } else if (Buffer.isBuffer(file)) {
        // Check buffer size
        if (file.length > MAX_THUMBNAIL_SIZE) {
            return {
                valid: false,
                error: `Thumbnail file too large. Maximum size is ${MAX_THUMBNAIL_SIZE / 1024 / 1024}MB`,
                maxSize: MAX_THUMBNAIL_SIZE,
                maxSizeMB: MAX_THUMBNAIL_SIZE / 1024 / 1024,
            };
        }

        return { valid: true };
    }

    return {
        valid: false,
        error: 'Invalid file type. Expected File or Buffer.',
    };
}

/**
 * Extract filename from URL
 */
export function extractFilenameFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split('/').pop();
        return filename || null;
    } catch {
        return null;
    }
}

/**
 * Check if a URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        const validProtocols = ['http:', 'https:'];
        if (!validProtocols.includes(urlObj.protocol)) {
            return false;
        }

        // Check for video file extensions
        const videoExtensions = ['.mp4', '.webm', '.mov', '.avi'];
        const pathname = urlObj.pathname.toLowerCase();
        return videoExtensions.some(ext => pathname.endsWith(ext));
    } catch {
        return false;
    }
}

/**
 * Check if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        const validProtocols = ['http:', 'https:'];
        if (!validProtocols.includes(urlObj.protocol)) {
            return false;
        }

        // Check for image file extensions
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const pathname = urlObj.pathname.toLowerCase();
        return imageExtensions.some(ext => pathname.endsWith(ext));
    } catch {
        return false;
    }
}

/**
 * Initialize storage bucket if it doesn't exist
 * This should be called during setup/migration
 */
export async function initializeStorageBucket(): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const supabase = getSupabaseClient();

        // Check if bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(b => b.name === REELS_BUCKET);

        if (bucketExists) {
            return { success: true };
        }

        // Create bucket
        const { error } = await supabase.storage.createBucket(REELS_BUCKET, {
            public: false, // Use signed URLs for security
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp'],
        });

        if (error) {
            console.error('Error creating storage bucket:', error);
            return {
                success: false,
                error: `Failed to create storage bucket: ${error.message}`,
            };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in initializeStorageBucket:', error);
        return {
            success: false,
            error: error.message || 'Failed to initialize storage bucket',
        };
    }
}
