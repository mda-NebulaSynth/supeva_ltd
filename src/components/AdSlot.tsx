import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface AdSlotProps {
    id: string;
    className?: string;
}

interface AdBanner {
    id: string;
    slot_id: string;
    image_url: string;
    link_url: string;
    active: boolean;
}

export const AdSlot = ({ id, className = '' }: AdSlotProps) => {
    const [ad, setAd] = useState<AdBanner | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const { data, error } = await supabase
                    .from('ad_banners')
                    .select('*')
                    .eq('slot_id', id)
                    .eq('active', true)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (error) throw error;
                setAd(data);
            } catch (error) {
                // Silently fail - no banner to show
                console.debug('No active banner for slot:', id);
            } finally {
                setLoading(false);
            }
        };

        fetchAd();
    }, [id]);

    if (loading) {
        return (
            <div className={`animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl shadow-sm ${className}`}>
                <div className="h-48 md:h-64 lg:h-72"></div>
            </div>
        );
    }

    if (!ad) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ${className}`}
            >
                <a
                    href={ad.link_url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="block group relative"
                    aria-label="Advertisement"
                >
                    {/* Loading state for image */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
                    )}

                    {/* Banner Image */}
                    <img
                        src={ad.image_url}
                        alt="Advertisement"
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        className={`w-full h-auto object-cover transition-all duration-500 ${
                            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        } group-hover:scale-105`}
                    />

                    {/* Sponsored Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-md">
                        Sponsored
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
            </motion.div>
        </AnimatePresence>
    );
};
