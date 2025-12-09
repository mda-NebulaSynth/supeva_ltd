import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Image as ImageIcon, Video, ChevronDown, ChevronUp } from 'lucide-react';
import type { Database } from '../lib/database.types';

type ProjectUpdate = Database['public']['Tables']['project_updates']['Row'];

interface ProjectTimelineProps {
    updates: ProjectUpdate[];
}

export const ProjectTimeline = ({ updates }: ProjectTimelineProps) => {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const toggleExpanded = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getMonthYear = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    };

    if (updates.length === 0) {
        return (
            <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No updates available for this project yet.</p>
            </div>
        );
    }

    return (
        <>
            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-accent-500 to-primary-300 hidden md:block" />

                {/* Timeline Items */}
                <div className="space-y-8">
                    {updates.map((update, index) => {
                        const updateImages = update.images as string[] || [];
                        const isExpanded = expandedIds.has(update.id);
                        const isLast = index === updates.length - 1;

                        return (
                            <motion.div
                                key={update.id}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    ease: [0.25, 0.1, 0.25, 1]
                                }}
                                className="relative"
                            >
                                <div className="flex gap-6">
                                    {/* Timeline Node */}
                                    <div className="hidden md:flex flex-col items-center flex-shrink-0">
                                        {/* Date Badge */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                delay: index * 0.1 + 0.2,
                                                type: 'spring',
                                                stiffness: 200,
                                                damping: 15
                                            }}
                                            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg relative z-10"
                                        >
                                            <Calendar className="w-6 h-6 text-white" />

                                            {/* Pulse Animation */}
                                            {index === 0 && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-full bg-primary-500"
                                                    initial={{ scale: 1, opacity: 0.5 }}
                                                    animate={{ scale: 1.5, opacity: 0 }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: 'easeOut'
                                                    }}
                                                />
                                            )}
                                        </motion.div>

                                        {/* Month/Year Label */}
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 + 0.3 }}
                                            className="mt-2 px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600"
                                        >
                                            {getMonthYear(update.created_at)}
                                        </motion.div>
                                    </div>

                                    {/* Content Card */}
                                    <motion.div
                                        className="flex-1 pb-8"
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <motion.div
                                            className="card p-6 relative overflow-hidden cursor-pointer"
                                            onClick={() => toggleExpanded(update.id)}
                                            whileHover={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)' }}
                                        >
                                            {/* Gradient Accent */}
                                            <motion.div
                                                className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-500 to-accent-500"
                                                initial={{ height: 0 }}
                                                animate={{ height: '100%' }}
                                                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                            />

                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 pr-4">
                                                    <motion.h3
                                                        className="text-xl md:text-2xl font-bold text-gray-900 mb-2"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: index * 0.1 + 0.4 }}
                                                    >
                                                        {update.title}
                                                    </motion.h3>
                                                    <motion.div
                                                        className="flex items-center gap-2 text-sm text-gray-500"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: index * 0.1 + 0.5 }}
                                                    >
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(update.created_at)}
                                                    </motion.div>
                                                </div>

                                                {/* Expand/Collapse Button */}
                                                <motion.button
                                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-gray-600" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                                    )}
                                                </motion.button>
                                            </div>

                                            {/* Description Preview */}
                                            <motion.p
                                                className={`text-gray-700 mb-4 ${!isExpanded ? 'line-clamp-2' : ''}`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.1 + 0.6 }}
                                            >
                                                {update.description}
                                            </motion.p>

                                            {/* Media Indicators */}
                                            {!isExpanded && (updateImages.length > 0 || update.video_url) && (
                                                <motion.div
                                                    className="flex items-center gap-4 text-sm text-gray-500"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.1 + 0.7 }}
                                                >
                                                    {updateImages.length > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <ImageIcon className="w-4 h-4" />
                                                            <span>{updateImages.length} {updateImages.length === 1 ? 'image' : 'images'}</span>
                                                        </div>
                                                    )}
                                                    {update.video_url && (
                                                        <div className="flex items-center gap-1">
                                                            <Video className="w-4 h-4" />
                                                            <span>Video</span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {/* Expanded Content */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="overflow-hidden"
                                                    >
                                                        {/* Images Grid */}
                                                        {updateImages.length > 0 && (
                                                            <motion.div
                                                                className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4"
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.1 }}
                                                            >
                                                                {updateImages.map((image, idx) => (
                                                                    <motion.img
                                                                        key={idx}
                                                                        src={image}
                                                                        alt={`Update ${idx + 1}`}
                                                                        className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                                                        whileHover={{ scale: 1.05, zIndex: 10 }}
                                                                        transition={{ type: 'spring', stiffness: 300 }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedImage(image);
                                                                        }}
                                                                    />
                                                                ))}
                                                            </motion.div>
                                                        )}

                                                        {/* Video */}
                                                        {update.video_url && (
                                                            <motion.div
                                                                className="aspect-video rounded-lg overflow-hidden bg-gray-900"
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.2 }}
                                                            >
                                                                <iframe
                                                                    src={update.video_url}
                                                                    className="w-full h-full"
                                                                    allowFullScreen
                                                                    title={update.title}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </motion.div>
                                </div>

                                {/* Connector Animation - Only if not last */}
                                {!isLast && (
                                    <motion.div
                                        className="hidden md:block absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-primary-400 to-transparent"
                                        initial={{ scaleY: 0, transformOrigin: 'top' }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ delay: index * 0.1 + 0.8, duration: 0.5 }}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Image Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.button
                            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ChevronUp className="w-8 h-8" />
                        </motion.button>
                        <motion.img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-full object-contain"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
