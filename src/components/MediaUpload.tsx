import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Video, Plus, Loader } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';

interface MediaUploadProps {
    images: string[];
    videos: string[];
    onImagesChange: (images: string[]) => void;
    onVideosChange: (videos: string[]) => void;
    maxMedia?: number;
    maxFileSizeMB?: number;
    bucketName?: string;
    showVideos?: boolean;
}

export const MediaUpload = ({
    images,
    videos,
    onImagesChange,
    onVideosChange,
    maxMedia = 5,
    maxFileSizeMB = 1,
    bucketName = 'projects',
    showVideos = true
}: MediaUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalMedia = images.length + (showVideos ? videos.length : 0);
    const canAddMore = totalMedia < maxMedia;

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('📤 MediaUpload: File select triggered');
        const files = Array.from(e.target.files || []);
        if (!files.length) {
            console.log('⚠️ MediaUpload: No files selected');
            return;
        }

        console.log(`📤 MediaUpload: ${files.length} files selected`);

        const remainingSlots = maxMedia - totalMedia;
        const filesToUpload = files.slice(0, remainingSlots);

        console.log(`📤 MediaUpload: Will upload ${filesToUpload.length} files (${remainingSlots} slots available)`);

        setUploading(true);
        setUploadProgress('Preparing files...');

        try {
            const uploadedUrls: string[] = [];

            for (let i = 0; i < filesToUpload.length; i++) {
                const file = filesToUpload[i];
                let fileToUpload = file;
                let fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';

                // Compression Step
                if (file.type.startsWith('image/')) {
                    setUploadProgress(`Compressing image ${i + 1} of ${filesToUpload.length}...`);

                    try {
                        // Check if file is small enough to skip heavy compression
                        // If < 0.5MB, just use it as is
                        if (file.size / 1024 / 1024 < 0.5) {
                            console.log(`Skipping compression for small file: ${file.name}`);
                        } else {
                            const compressionOptions = {
                                maxSizeMB: maxFileSizeMB,
                                maxWidthOrHeight: 1920,
                                useWebWorker: false, // Maintain main thread to avoid worker issues
                                fileType: 'image/jpeg',
                                initialQuality: 0.8
                            };

                            // Race compression against a 10s timeout
                            const compressionPromise = imageCompression(file, compressionOptions);
                            const timeoutPromise = new Promise<null>((resolve) =>
                                setTimeout(() => resolve(null), 10000)
                            );

                            const compressedFile = await Promise.race([compressionPromise, timeoutPromise]);

                            if (compressedFile) {
                                console.log(`Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                                fileToUpload = compressedFile;
                                fileExt = 'jpg'; // browser-image-compression exports as jpg/png
                            } else {
                                console.warn('Compression timed out, using original file');
                            }
                        }
                    } catch (compressionError) {
                        console.warn('Compression failed, using original file:', compressionError);
                        // Fallback to original file
                    }
                }

                setUploadProgress(`Uploading image ${i + 1} of ${filesToUpload.length}...`);

                // Generate unique filename
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                // Upload to Supabase Storage with timeout
                console.log(`📤 Uploading to bucket "${bucketName}" with path: ${filePath}`);

                // Create upload promise with 60 second timeout (larger files might take longer)
                const uploadPromise = supabase.storage
                    .from(bucketName)
                    .upload(filePath, fileToUpload, {
                        cacheControl: '3600',
                        upsert: false
                    });

                const uploadTimeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Upload timeout after 60 seconds')), 60000)
                );

                let uploadResult;
                try {
                    uploadResult = await Promise.race([uploadPromise, uploadTimeoutPromise]) as any;
                } catch (timeoutError: any) {
                    console.error('❌ Upload timeout or error:', timeoutError);
                    console.error('Error details:', {
                        message: timeoutError?.message,
                        stack: timeoutError?.stack,
                        bucketName,
                        filePath,
                        fileSize: fileToUpload.size
                    });
                    alert(`Upload failed for ${file.name}:\n${timeoutError?.message || 'Timeout after 60 seconds'}\n\nPlease check:\n1. Storage buckets exist in Supabase\n2. Storage policies allow uploads\n3. Your internet connection`);
                    continue;
                }

                const { data, error } = uploadResult;

                if (error) {
                    console.error('❌ Upload error:', error);
                    console.error('Error details:', {
                        message: error.message,
                        statusCode: error.statusCode,
                        bucketName,
                        filePath
                    });
                    alert(`Failed to upload ${file.name}:\n${error.message}\n\nThis usually means:\n1. Storage bucket "${bucketName}" doesn't exist\n2. You don't have permission to upload\n3. Run FIX_STORAGE_UPLOAD_ISSUE.sql`);
                    continue;
                }

                console.log('✅ Upload successful:', data);

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(filePath);

                console.log('✅ Public URL generated:', publicUrl);
                uploadedUrls.push(publicUrl);
            }

            if (uploadedUrls.length > 0) {
                console.log(`✅ All uploads complete! ${uploadedUrls.length} images uploaded`);
                onImagesChange([...images, ...uploadedUrls]);
            }
        } catch (error) {
            console.error('❌ MediaUpload error:', error);
            alert('Error processing files');
        } finally {
            console.log('🏁 MediaUpload: Resetting upload state');
            setUploading(false);
            setUploadProgress('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const addVideo = () => {
        if (!videoUrl.trim()) return;

        // Extract YouTube video ID or use URL as-is
        let processedUrl = videoUrl.trim();

        // Try multiple YouTube URL patterns
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,  // Standard YouTube URLs
            /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,                     // Embed URLs
            /vid:([a-zA-Z0-9_-]+)/                                       // Google search result URLs
        ];

        let videoId = null;
        for (const pattern of patterns) {
            const match = videoUrl.match(pattern);
            if (match) {
                videoId = match[1];
                break;
            }
        }

        if (videoId) {
            processedUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        onVideosChange([...videos, processedUrl]);
        setVideoUrl('');
    };

    const removeVideo = (index: number) => {
        const newVideos = videos.filter((_, i) => i !== index);
        onVideosChange(newVideos);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-700">Media Gallery</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        {showVideos
                            ? `Upload images or add video URLs (${totalMedia}/${maxMedia} items, max ${maxFileSizeMB}MB per image)`
                            : `Upload images from your device (${totalMedia}/${maxMedia} items, max ${maxFileSizeMB}MB each)`
                        }
                    </p>
                </div>
            </div>

            {/* Upload Images */}
            {canAddMore && (
                <div className="space-y-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full btn btn-secondary flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                {uploadProgress || 'Processing...'}
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Choose Images from Device
                            </>
                        )}
                    </button>

                    {/* Add Video URL */}
                    {showVideos && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="Paste YouTube video URL"
                                className="input flex-1 text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addVideo();
                                    }
                                }}
                                disabled={uploading}
                            />
                            <button
                                type="button"
                                onClick={addVideo}
                                disabled={!videoUrl.trim() || uploading}
                                className="btn btn-secondary px-4"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Media Grid */}
            {(images.length > 0 || videos.length > 0) && (
                <div className="space-y-4">
                    {/* Summary */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                            {images.length > 0 && `${images.length} image${images.length > 1 ? 's' : ''}`}
                            {images.length > 0 && videos.length > 0 && ' • '}
                            {videos.length > 0 && `${videos.length} video${videos.length > 1 ? 's' : ''}`}
                        </span>
                        <span className="text-gray-500">
                            {totalMedia}/{maxMedia} total
                        </span>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* Images */}
                        {images.map((image, index) => (
                            <motion.div
                                key={`img-${index}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-200 hover:border-primary-300 group bg-gray-50 shadow-sm hover:shadow-md transition-all"
                            >
                                <img
                                    src={image}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    Image {index + 1}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                    title="Remove image"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}

                        {/* Videos */}
                        {videos.map((video, index) => (
                            <motion.div
                                key={`vid-${index}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="relative aspect-video rounded-xl overflow-hidden border-2 border-red-200 hover:border-red-300 group bg-black shadow-sm hover:shadow-md transition-all"
                            >
                                {video.includes('youtube.com/embed') ? (
                                    <iframe
                                        src={video}
                                        className="w-full h-full"
                                        title={`Video ${index + 1}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                                        <div className="text-center">
                                            <Video className="w-12 h-12 text-white/60 mx-auto mb-2" />
                                            <p className="text-xs text-white/40">Video preview unavailable</p>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1.5">
                                    <Video className="w-3.5 h-3.5" />
                                    Video {index + 1}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeVideo(index)}
                                    className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10"
                                    title="Remove video"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {!canAddMore && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    Maximum of {maxMedia} items reached. Remove some to add more.
                </p>
            )}

            {uploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700 font-medium">
                        {uploadProgress}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                        Optimizing and uploading media...
                    </p>
                </div>
            )}
        </div>
    );
};
