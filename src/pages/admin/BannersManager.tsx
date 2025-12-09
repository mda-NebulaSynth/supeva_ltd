import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ExternalLink, ToggleLeft, ToggleRight, MapPin, Info, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { StaggeredList, StaggeredItem } from '../../components/animated/StaggeredList';
import { MediaUpload } from '../../components/MediaUpload';
import { BANNER_SLOTS, getBannerSlot } from '../../config/bannerSlots';
import { deleteImageFromStorage } from '../../utils/storageCleanup';

type AdBanner = Database['public']['Tables']['ad_banners']['Row'];
type AdBannerInsert = Database['public']['Tables']['ad_banners']['Insert'];
type AdBannerUpdate = Database['public']['Tables']['ad_banners']['Update'];

export const BannersManager = () => {
    const [banners, setBanners] = useState<AdBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null);
    const [formData, setFormData] = useState<AdBannerInsert>({
        slot_id: '',
        image_url: '',
        link_url: '',
        active: true
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('ad_banners')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBanners(data || []);
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.image_url) {
            alert('Please upload a banner image');
            return;
        }

        try {
            if (editingBanner) {
                const updateData: AdBannerUpdate = {
                    slot_id: formData.slot_id,
                    image_url: formData.image_url,
                    link_url: formData.link_url,
                    active: formData.active
                };

                const { error } = await supabase
                    .from('ad_banners')
                    // @ts-ignore - Supabase type inference issue
                    .update(updateData)
                    .eq('id', editingBanner.id);

                if (error) throw error;
            } else {
                const insertData: AdBannerInsert = {
                    slot_id: formData.slot_id,
                    image_url: formData.image_url,
                    link_url: formData.link_url,
                    active: formData.active ?? true
                };

                const { error } = await supabase
                    .from('ad_banners')
                    // @ts-ignore - Supabase type inference issue
                    .insert(insertData);

                if (error) throw error;
            }

            setFormData({
                slot_id: '',
                image_url: '',
                link_url: '',
                active: true
            });
            setShowForm(false);
            setEditingBanner(null);
            fetchBanners();
        } catch (error) {
            console.error('Error saving banner:', error);
            alert('Failed to save banner. Please try again.');
        }
    };

    const toggleActive = async (banner: AdBanner) => {
        try {
            const updateData: AdBannerUpdate = {
                active: !banner.active
            };

            const { error } = await supabase
                .from('ad_banners')
                // @ts-ignore - Supabase type inference issue
                .update(updateData)
                .eq('id', banner.id);

            if (error) throw error;
            fetchBanners();
        } catch (error) {
            console.error('Error toggling banner:', error);
            alert('Failed to update banner status. Please try again.');
        }
    };

    const handleEdit = (banner: AdBanner) => {
        setEditingBanner(banner);
        setFormData({
            slot_id: banner.slot_id,
            image_url: banner.image_url,
            link_url: banner.link_url,
            active: banner.active
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            const banner = banners.find(b => b.id === id);

            if (banner?.image_url) {
                await deleteImageFromStorage(banner.image_url);
            }

            const { error } = await supabase
                .from('ad_banners')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchBanners();
        } catch (error) {
            console.error('Error deleting banner:', error);
            alert('Failed to delete banner. Please try again.');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingBanner(null);
        setFormData({
            slot_id: '',
            image_url: '',
            link_url: '',
            active: true
        });
    };

    const isSlotOccupied = (slotId: string): boolean => {
        return banners.some(banner => banner.slot_id === slotId && banner.active && banner.id !== editingBanner?.id);
    };

    const selectedSlot = formData.slot_id ? getBannerSlot(formData.slot_id) : null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-display font-bold mb-2">Ad Banners</h1>
                    <p className="text-gray-600">Manage advertisement banners across your website</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Banner
                </button>
            </div>

            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6"
                >
                    <h2 className="text-2xl font-bold mb-6">
                        {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Banner Location *
                            </label>
                            <select
                                value={formData.slot_id}
                                onChange={(e) => setFormData({ ...formData, slot_id: e.target.value })}
                                className="input"
                                required
                            >
                                <option value="">-- Select where to display this banner --</option>
                                {BANNER_SLOTS.map((slot) => {
                                    const occupied = isSlotOccupied(slot.id);
                                    return (
                                        <option
                                            key={slot.id}
                                            value={slot.id}
                                            disabled={occupied}
                                        >
                                            {slot.label} {occupied ? '(Already in use)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Choose where visitors will see this banner on your website
                            </p>
                        </div>

                        {selectedSlot && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-blue-900 mb-2">
                                            {selectedSlot.label}
                                        </h4>
                                        <div className="space-y-2 text-sm text-blue-800">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                <span><strong>Page:</strong> {selectedSlot.page}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4" />
                                                <span>
                                                    <strong>Recommended Size:</strong> {selectedSlot.recommendedSize.width} × {selectedSlot.recommendedSize.height}px
                                                    <span className="ml-2 text-xs bg-blue-100 px-2 py-0.5 rounded">
                                                        Ratio {selectedSlot.aspectRatio}
                                                    </span>
                                                </span>
                                            </div>
                                            <p className="italic">{selectedSlot.description}</p>
                                            <p className="text-xs mt-2">
                                                <strong>Location:</strong> {selectedSlot.location}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Destination URL *
                            </label>
                            <input
                                type="url"
                                value={formData.link_url}
                                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                placeholder="https://example.com/your-offer"
                                className="input"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Where visitors go when they click the banner
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Banner Image *
                            </label>
                            {selectedSlot && (
                                <div className="mb-3 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                    For best results, upload an image sized {selectedSlot.recommendedSize.width} × {selectedSlot.recommendedSize.height}px
                                </div>
                            )}
                            <MediaUpload
                                images={formData.image_url ? [formData.image_url] : []}
                                videos={[]}
                                onImagesChange={(images) => {
                                    setFormData({ ...formData, image_url: images[0] || '' });
                                }}
                                onVideosChange={() => { }}
                                maxMedia={1}
                                maxFileSizeMB={2}
                                bucketName="ads"
                                showVideos={false}
                            />
                            {!formData.image_url && (
                                <p className="text-xs text-red-500 mt-1">* Banner image is required</p>
                            )}
                        </div>

                        {formData.image_url && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Live Preview
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                                    <p className="text-xs text-gray-500 mb-4 text-center font-medium">
                                        This is how your banner will appear to visitors
                                    </p>
                                    <div className="max-w-4xl mx-auto">
                                        <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white">
                                            <img
                                                src={formData.image_url}
                                                alt="Banner preview"
                                                className="w-full h-auto"
                                            />
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-md">
                                                Sponsored
                                            </div>
                                        </div>

                                        {formData.link_url && (
                                            <p className="text-xs text-gray-600 mt-3 text-center flex items-center justify-center gap-1">
                                                <ExternalLink className="w-3 h-3" />
                                                Clicking this banner will open: <span className="font-mono text-primary-600">{formData.link_url}</span>
                                            </p>
                                        )}
                                        {selectedSlot && (
                                            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                                                <p className="text-xs text-gray-600 text-center">
                                                    <strong>Display Location:</strong> {selectedSlot.label} ({selectedSlot.page})
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.active ?? true}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="active" className="text-sm font-medium">
                                Active (Display banner on website immediately)
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="submit" className="btn btn-primary">
                                {editingBanner ? 'Update Banner' : 'Create Banner'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="btn bg-gray-200 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {!showForm && (
                <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Available Banner Locations
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {BANNER_SLOTS.map((slot) => {
                            const occupied = isSlotOccupied(slot.id);
                            return (
                                <div
                                    key={slot.id}
                                    className={`p-4 rounded-lg border-2 transition-all ${occupied
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-white border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold text-sm">{slot.label}</h4>
                                        {occupied ? (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                Available
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">{slot.page}</p>
                                    <p className="text-xs text-gray-500">
                                        {slot.recommendedSize.width} × {slot.recommendedSize.height}px
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="h-48 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : banners.length === 0 ? (
                <div className="card p-12 text-center">
                    <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-4">No banners created yet</p>
                    <p className="text-gray-400 text-sm mb-6">
                        Create your first banner to start displaying ads on your website
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Your First Banner
                    </button>
                </div>
            ) : (
                <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((banner) => {
                        const slotInfo = getBannerSlot(banner.slot_id);
                        return (
                            <StaggeredItem key={banner.id}>
                                <div className="card p-6">
                                    <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100 group">
                                        <img
                                            src={banner.image_url}
                                            alt={`Banner for ${banner.slot_id}`}
                                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {!banner.active && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
                                                    Inactive
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="font-bold text-lg mb-1">
                                            {slotInfo?.label || banner.slot_id}
                                        </h3>
                                        {slotInfo && (
                                            <p className="text-xs text-gray-500 mb-2">
                                                {slotInfo.page} • {slotInfo.recommendedSize.width} × {slotInfo.recommendedSize.height}px
                                            </p>
                                        )}
                                        <a
                                            href={banner.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 hover:underline"
                                        >
                                            {banner.link_url.substring(0, 35)}...
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleActive(banner)}
                                            className={`flex-1 btn ${banner.active
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                } flex items-center justify-center gap-2 text-sm`}
                                        >
                                            {banner.active ? (
                                                <>
                                                    <ToggleRight className="w-4 h-4" />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <ToggleLeft className="w-4 h-4" />
                                                    Inactive
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(banner)}
                                            className="btn bg-blue-100 text-blue-700 hover:bg-blue-200"
                                            title="Edit banner"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(banner.id)}
                                            className="btn bg-red-100 text-red-700 hover:bg-red-200"
                                            title="Delete banner"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </StaggeredItem>
                        );
                    })}
                </StaggeredList>
            )}
        </div>
    );
};
