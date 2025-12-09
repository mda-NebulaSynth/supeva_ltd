import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { motion } from 'framer-motion';

type AdBanner = Database['public']['Tables']['ad_banners']['Row'];

interface AdBannerProps {
    slotId: string;
    className?: string;
}

export const AdBanner = ({ slotId, className = '' }: AdBannerProps) => {
    const [banner, setBanner] = useState<AdBanner | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanner();
    }, [slotId]);

    const fetchBanner = async () => {
        try {
            const { data, error } = await supabase
                .from('ad_banners')
                .select('*')
                .eq('slot_id', slotId)
                .eq('active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                // No banner found for this slot - that's okay
                if (error.code !== 'PGRST116') {
                    console.error('Error fetching banner:', error);
                }
                setBanner(null);
            } else {
                setBanner(data);
            }
        } catch (error) {
            console.error('Error fetching banner:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = () => {
        if (banner?.link_url) {
            // Track click analytics here if needed
            window.open(banner.link_url, '_blank', 'noopener,noreferrer');
        }
    };

    if (loading || !banner) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`ad-banner ${className}`}
        >
            <button
                onClick={handleClick}
                className="relative block w-full overflow-hidden rounded-xl group cursor-pointer"
                aria-label="Advertisement"
            >
                <img
                    src={banner.image_url}
                    alt="Advertisement"
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                    Ad
                </div>
            </button>
        </motion.div>
    );
};
