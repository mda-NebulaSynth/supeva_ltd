import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Star, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { StaggeredList, StaggeredItem } from '../../components/animated/StaggeredList';
import { MediaUpload } from '../../components/MediaUpload';
import { deleteImageFromStorage } from '../../utils/storageCleanup';
import { useManagerData } from '../../hooks/useManagerData';

type Testimonial = Database['public']['Tables']['testimonials']['Row'];
type TestimonialInsert = Database['public']['Tables']['testimonials']['Insert'];

export const TestimonialsManager = () => {
    const { data: testimonials, loading, refetch, mountedRef } = useManagerData<Testimonial>(
        async () => {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        'TestimonialsManager'
    );
    const [showForm, setShowForm] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [formData, setFormData] = useState<TestimonialInsert>({
        name: '',
        role: '',
        content: '',
        image: '',
        rating: 5,
        active: true
    });


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            console.log('💾 Saving testimonial...');

            if (editingTestimonial) {
                const updateData: Database['public']['Tables']['testimonials']['Update'] = {
                    name: formData.name,
                    role: formData.role,
                    content: formData.content,
                    image: formData.image,
                    rating: formData.rating,
                    active: formData.active
                };

                const { error } = await supabase
                    .from('testimonials')
                    // @ts-ignore - Supabase type inference issue
                    .update(updateData)
                    .eq('id', editingTestimonial.id);

                if (error) throw error;
                console.log('✅ Testimonial updated');
            } else {
                const insertData: TestimonialInsert = {
                    name: formData.name || '',
                    role: formData.role || '',
                    content: formData.content || '',
                    image: formData.image || '',
                    rating: formData.rating ?? 5,
                    active: formData.active ?? true
                };

                const { error } = await supabase
                    .from('testimonials')
                    // @ts-ignore - Supabase type inference issue
                    .insert(insertData);

                if (error) throw error;
                console.log('✅ Testimonial created');
            }

            if (!mountedRef.current) return;

            // Reset form and refresh
            setFormData({
                name: '',
                role: '',
                content: '',
                image: '',
                rating: 5,
                active: true
            });
            setShowForm(false);
            setEditingTestimonial(null);
            await refetch();
        } catch (error) {
            console.error('❌ Error saving testimonial:', error);
            if (mountedRef.current) {
                alert('Failed to save testimonial. Please try again.');
            }
        }
    };

    const handleEdit = (testimonial: Testimonial) => {
        setEditingTestimonial(testimonial);
        setFormData({
            name: testimonial.name,
            role: testimonial.role,
            content: testimonial.content,
            image: testimonial.image,
            rating: testimonial.rating,
            active: testimonial.active
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;

        try {
            console.log('🗑️ Deleting testimonial...');
            // Find the testimonial to get its image URL before deletion
            const testimonial = testimonials.find(t => t.id === id);

            // Delete image from storage first if it exists
            if (testimonial?.image) {
                await deleteImageFromStorage(testimonial.image);
            }

            // Then delete from database
            const { error } = await supabase
                .from('testimonials')
                .delete()
                .eq('id', id);

            if (error) throw error;
            console.log('✅ Testimonial deleted');

            if (!mountedRef.current) return;
            await refetch();
        } catch (error) {
            console.error('❌ Error deleting testimonial:', error);
            if (mountedRef.current) {
                alert('Failed to delete testimonial. Please try again.');
            }
        }
    };

    const toggleActive = async (testimonial: Testimonial) => {
        try {
            console.log('💾 Saving testimonial status...');
            const updateData: Database['public']['Tables']['testimonials']['Update'] = {
                active: !testimonial.active
            };

            const { error } = await supabase
                .from('testimonials')
                // @ts-ignore - Supabase type inference issue
                .update(updateData)
                .eq('id', testimonial.id);

            if (error) throw error;
            console.log('✅ Testimonial status updated');

            if (!mountedRef.current) return;
            await refetch();
        } catch (error) {
            console.error('❌ Error toggling testimonial:', error);
            if (mountedRef.current) {
                alert('Failed to update testimonial status. Please try again.');
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingTestimonial(null);
        setFormData({
            name: '',
            role: '',
            content: '',
            image: '',
            rating: 5,
            active: true
        });
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-display font-bold mb-2">Testimonials</h1>
                    <p className="text-gray-600">Manage client testimonials and reviews</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Testimonial
                </button>
            </div>

            {/* Testimonial Form */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6"
                >
                    <h2 className="text-2xl font-bold mb-6">
                        {editingTestimonial ? 'Edit Testimonial' : 'Create New Testimonial'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Client Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Role/Position *
                                </label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    placeholder="CEO, Company Name"
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Testimonial Content *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Share your experience working with us..."
                                className="input min-h-[120px]"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.content.length} characters
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <MediaUpload
                                    images={formData.image ? [formData.image] : []}
                                    videos={[]}
                                    onImagesChange={(images) => setFormData({ ...formData, image: images[0] || '' })}
                                    onVideosChange={() => { }}
                                    maxMedia={1}
                                    maxFileSizeMB={0.3}
                                    bucketName="testimonials"
                                    showVideos={false}
                                />
                                {!formData.image && (
                                    <p className="text-xs text-red-500 mt-1">* Client photo is required</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Rating *
                                </label>
                                <select
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                    className="input"
                                    required
                                >
                                    <option value={5}>5 Stars - Excellent</option>
                                    <option value={4}>4 Stars - Very Good</option>
                                    <option value={3}>3 Stars - Good</option>
                                    <option value={2}>2 Stars - Fair</option>
                                    <option value={1}>1 Star - Poor</option>
                                </select>
                            </div>
                        </div>

                        {formData.image && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Preview</label>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <img
                                        src={formData.image}
                                        alt="Profile preview"
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold">{formData.name || 'Client Name'}</p>
                                        <p className="text-sm text-gray-600">{formData.role || 'Role/Position'}</p>
                                        <div className="flex gap-1 mt-1">
                                            {Array.from({ length: formData.rating || 0 }).map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="active" className="text-sm font-medium">
                                Active (show on website)
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="submit" className="btn btn-primary">
                                {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
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

            {/* Testimonials List */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="flex gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map(j => (
                                    <div key={j} className="w-5 h-5 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                            <div className="space-y-3 mb-4">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : testimonials.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-gray-500 text-lg mb-4">No testimonials found</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Your First Testimonial
                    </button>
                </div>
            ) : (
                <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                        <StaggeredItem key={testimonial.id}>
                            <div className={`card p-6 ${!testimonial.active ? 'opacity-60' : ''}`}>
                                {/* Rating */}
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                    ))}
                                    {Array.from({ length: 5 - testimonial.rating }).map((_, i) => (
                                        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
                                    ))}
                                </div>

                                {/* Content */}
                                <p className="text-gray-700 mb-4 italic line-clamp-4">
                                    "{testimonial.content}"
                                </p>

                                {/* Client Info */}
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-bold">{testimonial.name}</p>
                                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                {!testimonial.active && (
                                    <div className="mb-4">
                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                            Inactive
                                        </span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleActive(testimonial)}
                                        className={`flex-1 btn ${testimonial.active
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            } flex items-center justify-center gap-2 text-sm`}
                                    >
                                        {testimonial.active ? (
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
                                        onClick={() => handleEdit(testimonial)}
                                        className="btn bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(testimonial.id)}
                                        className="btn bg-red-100 text-red-700 hover:bg-red-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </StaggeredItem>
                    ))}
                </StaggeredList>
            )}

            {/* Info Box */}
            <div className="card p-6 bg-blue-50 border border-blue-100">
                <h3 className="text-lg font-bold mb-3">Testimonial Best Practices</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Keep testimonials authentic and genuine</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Include specific details about the service or property</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Use high-quality profile photos (recommended: 200x200px)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Aim for 2-4 sentences for optimal readability</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
