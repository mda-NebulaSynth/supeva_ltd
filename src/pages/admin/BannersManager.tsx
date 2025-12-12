import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ExternalLink, ToggleLeft, ToggleRight, MapPin, Info, Image as ImageIcon, AlertCircle, Link, Globe, Upload, X } from 'lucide-react';
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
    const location = useLocation();
    const mountedRef = useRef(true);
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
    const [errors, setErrors] = useState<{
        slot_id?: string;
        image_url?: string;
        link_url?: string;
    }>({});

    useEffect(() => {
        mountedRef.current = true;
        fetchBanners();

        return () => {
            mountedRef.current = false;
        };
    }, [location.key]); // Refetch when navigating to this page

    const fetchBanners = async () => {
        try {
            console.log('📋 Fetching banners...');
            setLoading(true);
            const { data, error } = await supabase
                .from('ad_banners')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!mountedRef.current) {
                console.log('⚠️ BannersManager unmounted, skipping state update');
                return;
            }

            console.log('✅ Banners loaded:', data?.length || 0);
            setBanners(data || []);
        } catch (error) {
            console.error('❌ Error fetching banners:', error);
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    };

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!formData.slot_id.trim()) {
            newErrors.slot_id = 'Banner location is required';
        }

        if (!formData.image_url.trim()) {
            newErrors.image_url = 'Banner image is required';
        }

        if (!formData.link_url.trim()) {
            newErrors.link_url = 'Destination URL is required';
        } else if (!isValidUrl(formData.link_url)) {
            newErrors.link_url = 'Please enter a valid URL (e.g., https://example.com)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            console.log('💾 Saving banner...');

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
                console.log('✅ Banner updated successfully');
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
                console.log('✅ Banner created successfully');
            }

            if (!mountedRef.current) {
                console.log('⚠️ Component unmounted after save');
                return;
            }

            setFormData({
                slot_id: '',
                image_url: '',
                link_url: '',
                active: true
            });
            setErrors({});
            setShowForm(false);
            setEditingBanner(null);
            await fetchBanners();
        } catch (error) {
            console.error('❌ Error saving banner:', error);
            if (mountedRef.current) {
                alert('Failed to save banner. Please try again.');
            }
        }
    };

    const toggleActive = async (banner: AdBanner) => {
        try {
            console.log('🔄 Toggling banner status...');
            const updateData: AdBannerUpdate = {
                active: !banner.active
            };

            const { error } = await supabase
                .from('ad_banners')
                // @ts-ignore - Supabase type inference issue
                .update(updateData)
                .eq('id', banner.id);

            if (error) throw error;
            console.log('✅ Banner status toggled');

            if (!mountedRef.current) return;
            await fetchBanners();
        } catch (error) {
            console.error('❌ Error toggling banner:', error);
            if (mountedRef.current) {
                alert('Failed to update banner status. Please try again.');
            }
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
        setErrors({});
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner? This action cannot be undone.')) return;

        try {
            console.log('🗑️ Deleting banner...');
            const banner = banners.find(b => b.id === id);

            if (banner?.image_url) {
                await deleteImageFromStorage(banner.image_url);
            }

            const { error } = await supabase
                .from('ad_banners')
                .delete()
                .eq('id', id);

            if (error) throw error;
            console.log('✅ Banner deleted successfully');

            if (!mountedRef.current) return;
            await fetchBanners();
        } catch (error) {
            console.error('❌ Error deleting banner:', error);
            if (mountedRef.current) {
                alert('Failed to delete banner. Please try again.');
            }
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
        setErrors({});
    };

    const isSlotOccupied = (slotId: string): boolean => {
        return banners.some(banner => banner.slot_id === slotId && banner.active && banner.id !== editingBanner?.id);
    };

    const selectedSlot = formData.slot_id ? getBannerSlot(formData.slot_id) : null;

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Ad Banners</h1>
                    <p className="text-sm sm:text-base text-gray-600">Manage advertisement banners across your website</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm sm:text-base">Add Banner</span>
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                        </h2>
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Close form"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Banner Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Banner Location <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                </div>
                                <select
                                    value={formData.slot_id}
                                    onChange={(e) => {
                                        setFormData({ ...formData, slot_id: e.target.value });
                                        if (errors.slot_id) setErrors({ ...errors, slot_id: undefined });
                                    }}
                                    className={`w-full pl-12 pr-4 py-3.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.slot_id ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
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
                                                className={occupied ? 'text-gray-400' : ''}
                                            >
                                                {slot.label} {occupied ? '(Already in use)' : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            {errors.slot_id && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{errors.slot_id}</span>
                                </div>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                Choose where visitors will see this banner on your website
                            </p>
                        </div>

                        {/* Slot Information */}
                        {selectedSlot && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-blue-900 mb-3">
                                            {selectedSlot.label}
                                        </h4>
                                        <div className="space-y-3 text-sm text-blue-800">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Page:</span>
                                                <span>{selectedSlot.page}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium">Recommended Size:</span>
                                                <span className="px-2 py-1 bg-blue-100 rounded text-xs font-mono">
                                                    {selectedSlot.recommendedSize.width} × {selectedSlot.recommendedSize.height}px
                                                </span>
                                                <span className="px-2 py-1 bg-blue-200 rounded text-xs">
                                                    Ratio {selectedSlot.aspectRatio}
                                                </span>
                                            </div>
                                            <p className="italic border-t border-blue-300 pt-3 mt-3">{selectedSlot.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Destination URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Destination URL <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Link className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    value={formData.link_url}
                                    onChange={(e) => {
                                        setFormData({ ...formData, link_url: e.target.value });
                                        if (errors.link_url) setErrors({ ...errors, link_url: undefined });
                                    }}
                                    placeholder="https://example.com/your-offer"
                                    className={`w-full pl-12 pr-4 py-3.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.link_url ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                                    required
                                />
                            </div>
                            {errors.link_url && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{errors.link_url}</span>
                                </div>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                Where visitors go when they click the banner
                            </p>
                        </div>

                        {/* Banner Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Banner Image <span className="text-red-500">*</span>
                            </label>
                            {selectedSlot && (
                                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <ImageIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                Recommended Size
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                For best results, upload an image sized {selectedSlot.recommendedSize.width} × {selectedSlot.recommendedSize.height}px
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <MediaUpload
                                images={formData.image_url ? [formData.image_url] : []}
                                videos={[]}
                                onImagesChange={(images) => {
                                    setFormData({ ...formData, image_url: images[0] || '' });
                                    if (errors.image_url) setErrors({ ...errors, image_url: undefined });
                                }}
                                onVideosChange={() => { }}
                                maxMedia={1}
                                maxFileSizeMB={2}
                                bucketName="ads"
                                showVideos={false}
                            />
                            {errors.image_url && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{errors.image_url}</span>
                                </div>
                            )}
                        </div>

                        {/* Live Preview */}
                        {formData.image_url && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Globe className="w-5 h-5 text-gray-700" />
                                    <label className="text-sm font-medium text-gray-700">Live Preview</label>
                                </div>
                                <div className="border border-gray-300 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                                    <p className="text-xs text-gray-600 mb-4 text-center font-medium">
                                        This is how your banner will appear to visitors
                                    </p>
                                    <div className="relative overflow-hidden rounded-lg shadow-lg bg-white">
                                        <img
                                            src={formData.image_url}
                                            alt="Banner preview"
                                            className="w-full h-auto max-h-[200px] sm:max-h-[250px] object-contain"
                                        />
                                        <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded-md">
                                            Sponsored
                                        </div>
                                    </div>

                                    {formData.link_url && (
                                        <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">
                                                    Click destination: <span className="font-mono text-blue-600">{formData.link_url}</span>
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Active Toggle */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.active ?? true}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <label htmlFor="active" className="text-sm font-medium text-gray-900 cursor-pointer">
                                    Active Banner
                                </label>
                                <p className="text-xs text-gray-600 mt-1">
                                    Display this banner immediately on the website
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${formData.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {formData.active ? 'ON' : 'OFF'}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                            <button 
                                type="submit" 
                                className="w-full sm:flex-1 px-6 py-3.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Upload className="w-5 h-5" />
                                {editingBanner ? 'Update Banner' : 'Create Banner'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Available Locations */}
            {!showForm && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Available Banner Locations
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {BANNER_SLOTS.map((slot) => {
                            const occupied = isSlotOccupied(slot.id);
                            return (
                                <div
                                    key={slot.id}
                                    className={`p-4 rounded-lg border-2 transition-all ${occupied
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm mb-1">{slot.label}</h4>
                                            <p className="text-xs text-gray-600">{slot.page}</p>
                                        </div>
                                        {occupied ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full whitespace-nowrap">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full whitespace-nowrap">
                                                Available
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-700">
                                            <span className="font-medium">Size:</span> {slot.recommendedSize.width} × {slot.recommendedSize.height}px
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed">{slot.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow border border-gray-200 p-6 animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : banners.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 sm:p-12 text-center">
                    <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-6" />
                    <p className="text-lg font-medium text-gray-900 mb-3">No banners created yet</p>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Create your first banner to start displaying ads on your website
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Create Your First Banner
                    </button>
                </div>
            ) : (
                <StaggeredList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {banners.map((banner) => {
                        const slotInfo = getBannerSlot(banner.slot_id);
                        return (
                            <StaggeredItem key={banner.id}>
                                <div className="bg-white rounded-xl shadow border border-gray-200 p-4 sm:p-6">
                                    {/* Banner Image */}
                                    <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100 group">
                                        <img
                                            src={banner.image_url}
                                            alt={`Banner for ${banner.slot_id}`}
                                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {!banner.active && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-medium">
                                                    Inactive
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Banner Info */}
                                    <div className="mb-5">
                                        <h3 className="font-bold text-gray-900 text-lg mb-2">
                                            {slotInfo?.label || banner.slot_id}
                                        </h3>
                                        {slotInfo && (
                                            <p className="text-xs text-gray-500 mb-3">
                                                {slotInfo.page} • {slotInfo.recommendedSize.width} × {slotInfo.recommendedSize.height}px
                                            </p>
                                        )}
                                        <a
                                            href={banner.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2 hover:underline truncate"
                                        >
                                            <Link className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{banner.link_url}</span>
                                        </a>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleActive(banner)}
                                            className={`flex-1 px-3 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm ${banner.active
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {banner.active ? (
                                                <>
                                                    <ToggleRight className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Active</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ToggleLeft className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Inactive</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(banner)}
                                            className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                                            title="Edit banner"
                                            aria-label="Edit banner"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(banner.id)}
                                            className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                                            title="Delete banner"
                                            aria-label="Delete banner"
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