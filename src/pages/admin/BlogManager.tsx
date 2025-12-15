import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle, FileText, Link, Tag, Type, Globe, Image as ImageIcon, X, Eye, EyeOff, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { useAuth } from '../../contexts/AuthContext';
import { MediaUpload } from '../../components/MediaUpload';
import MarkdownEditor from '../../components/MarkdownEditor';
import { deleteImageFromStorage } from '../../utils/storageCleanup';
import { useManagerData } from '../../hooks/useManagerData';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];

export const BlogManager = () => {
    const { user } = useAuth();
    const { data: posts, loading, refetch, mountedRef } = useManagerData<BlogPost>(
        async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        'BlogManager'
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState<Partial<BlogPostInsert>>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        author_id: '',
        tags: [],
        status: 'draft',
        seo_title: '',
        seo_description: '',
    });
    const [errors, setErrors] = useState<{
        title?: string;
        slug?: string;
        excerpt?: string;
        content?: string;
        featured_image?: string;
    }>({});


    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!formData.title?.trim()) {
            newErrors.title = 'Blog post title is required';
        }

        if (!formData.slug?.trim()) {
            newErrors.slug = 'URL slug is required';
        } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
        }

        if (!formData.excerpt?.trim()) {
            newErrors.excerpt = 'Short excerpt is required';
        }

        if (!formData.content?.trim()) {
            newErrors.content = 'Blog content is required';
        }

        if (!formData.featured_image?.trim()) {
            newErrors.featured_image = 'Featured image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            console.log('💾 Saving blog post...');

            if (editingPost) {
                const updateData: Database['public']['Tables']['blog_posts']['Update'] = {
                    title: formData.title,
                    slug: formData.slug,
                    excerpt: formData.excerpt,
                    content: formData.content,
                    featured_image: formData.featured_image,
                    author_id: formData.author_id || user?.id || undefined,
                    tags: formData.tags,
                    status: formData.status,
                    seo_title: formData.seo_title || null,
                    seo_description: formData.seo_description || null
                };

                const { error } = await supabase
                    .from('blog_posts')
                    // @ts-ignore - Supabase type inference issue
                    .update(updateData)
                    .eq('id', editingPost.id);

                if (error) throw error;
                console.log('✅ Blog post updated');
            } else {
                const insertData: BlogPostInsert = {
                    title: formData.title || '',
                    slug: formData.slug || '',
                    excerpt: formData.excerpt || '',
                    content: formData.content || '',
                    featured_image: formData.featured_image || '',
                    author_id: formData.author_id || user?.id || '',
                    tags: formData.tags || [],
                    status: formData.status || 'draft',
                    seo_title: formData.seo_title || null,
                    seo_description: formData.seo_description || null
                };

                const { error } = await supabase
                    .from('blog_posts')
                    // @ts-ignore - Supabase type inference issue
                    .insert(insertData);

                if (error) throw error;
                console.log('✅ Blog post created');
            }

            if (!mountedRef.current) return;

            setShowModal(false);
            setEditingPost(null);
            resetForm();
            setErrors({});
            await refetch();
        } catch (error) {
            console.error('❌ Error saving blog post:', error);
            if (mountedRef.current) {
                alert('Failed to save blog post. Please try again.');
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;

        try {
            console.log('🗑️ Deleting blog post...');
            const post = posts.find(p => p.id === id);

            if (post?.featured_image) {
                await deleteImageFromStorage(post.featured_image);
            }

            const { error } = await supabase
                .from('blog_posts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            console.log('✅ Blog post deleted');

            if (!mountedRef.current) return;
            await refetch();
        } catch (error) {
            console.error('❌ Error deleting blog post:', error);
            if (mountedRef.current) {
                alert('Failed to delete blog post. Please try again.');
            }
        }
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            featured_image: post.featured_image,
            author_id: post.author_id,
            tags: post.tags,
            status: post.status,
            seo_title: post.seo_title,
            seo_description: post.seo_description,
        });
        setErrors({});
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            featured_image: '',
            author_id: '',
            tags: [],
            status: 'draft',
            seo_title: '',
            seo_description: '',
        });
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: generateSlug(title),
        });
        if (errors.title) setErrors({ ...errors, title: undefined });
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Blog Posts</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage your blog content</p>
                </div>
                <button
                    onClick={() => {
                        setEditingPost(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    New Post
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search posts by title, excerpt, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow border border-gray-200 animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                            <div className="p-4 sm:p-6 space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded mt-4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 sm:p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-6" />
                    <p className="text-lg font-medium text-gray-900 mb-3">No blog posts found</p>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        {searchQuery ? 'No posts match your search' : 'Create your first blog post to get started'}
                    </p>
                    {searchQuery ? (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
                        >
                            Clear Search
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setEditingPost(null);
                                resetForm();
                                setShowModal(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Post
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="bg-white rounded-xl shadow border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
                            {/* Image */}
                            <div className="relative h-48 bg-gray-100">
                                {post.featured_image ? (
                                    <img
                                        src={post.featured_image}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                                        <ImageIcon className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${post.status === 'published'
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                        }`}>
                                        {post.status === 'published' ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 sm:p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </span>
                                    {post.tags && post.tags.length > 0 && (
                                        <span className="ml-auto text-xs text-gray-500 flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            {post.tags.length}
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className="flex-1 px-3 py-2.5 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 text-sm active:scale-95"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors active:scale-95"
                                        title="Delete post"
                                        aria-label="Delete post"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-4xl w-full my-4 sm:my-8 shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Fill in all required fields marked with *
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingPost(null);
                                    resetForm();
                                    setErrors({});
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Title & Slug */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => handleTitleChange(e.target.value)}
                                            className={`w-full pl-12 pr-4 py-3.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                                            placeholder="Enter blog post title"
                                        />
                                    </div>
                                    {errors.title && (
                                        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            <span>{errors.title}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        URL Slug <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.slug}
                                            onChange={(e) => {
                                                setFormData({ ...formData, slug: e.target.value });
                                                if (errors.slug) setErrors({ ...errors, slug: undefined });
                                            }}
                                            className={`w-full pl-12 pr-4 py-3.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.slug ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                                            placeholder="url-friendly-slug"
                                        />
                                    </div>
                                    {errors.slug && (
                                        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            <span>{errors.slug}</span>
                                        </div>
                                    )}
                                    <p className="mt-2 text-xs text-gray-500">
                                        Used in the URL: /blog/<span className="font-mono">{formData.slug || 'your-slug'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Short Excerpt <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                    <textarea
                                        required
                                        value={formData.excerpt}
                                        onChange={(e) => {
                                            setFormData({ ...formData, excerpt: e.target.value });
                                            if (errors.excerpt) setErrors({ ...errors, excerpt: undefined });
                                        }}
                                        rows={3}
                                        className={`w-full pl-12 pr-4 py-3.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${errors.excerpt ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                                        placeholder="Write a brief summary of your blog post"
                                    />
                                </div>
                                {errors.excerpt && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{errors.excerpt}</span>
                                    </div>
                                )}
                                <p className="mt-2 text-xs text-gray-500">
                                    A short preview text shown in blog listings (150-200 characters recommended)
                                </p>
                            </div>

                            {/* Content */}
                            <div>
                                <MarkdownEditor
                                    label={
                                        <span>
                                            Content <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    value={formData.content || ''} // Add fallback to empty string
                                    onChange={(value) => {
                                        setFormData({ ...formData, content: value });
                                        if (errors.content) setErrors({ ...errors, content: undefined });
                                    }}
                                    placeholder="Write your blog post content here...&#10;&#10;Example:&#10;## Introduction&#10;Welcome to our blog! This post covers...&#10;&#10;## Key Points&#10;- Point one&#10;- Point two&#10;- Point three&#10;&#10;[Learn more](https://example.com)"
                                    minHeight="400px"
                                />
                                {errors.content && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{errors.content}</span>
                                    </div>
                                )}
                            </div>

                            {/* Featured Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Featured Image <span className="text-red-500">*</span>
                                </label>
                                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <ImageIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                Recommended Size
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Upload a high-quality image (1200 × 630px for optimal display)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <MediaUpload
                                    images={formData.featured_image ? [formData.featured_image] : []}
                                    videos={[]}
                                    onImagesChange={(images) => {
                                        setFormData({ ...formData, featured_image: images[0] || '' });
                                        if (errors.featured_image) setErrors({ ...errors, featured_image: undefined });
                                    }}
                                    onVideosChange={() => { }}
                                    maxMedia={1}
                                    maxFileSizeMB={0.5}
                                    bucketName="blog"
                                    showVideos={false}
                                />
                                {errors.featured_image && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{errors.featured_image}</span>
                                    </div>
                                )}
                            </div>

                            {/* Tags & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tags
                                    </label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.tags?.join(', ') || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                                            })}
                                            placeholder="Real Estate, Tips, Market Trends"
                                            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Separate tags with commas
                                    </p>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        {formData.status === 'published' ? (
                                            <Eye className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        ) : (
                                            <EyeOff className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        )}
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                                            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        {formData.status === 'published' ? 'Post will be visible to all visitors' : 'Post is saved but not visible'}
                                    </p>
                                </div>
                            </div>

                            {/* SEO Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* SEO Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SEO Title
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.seo_title || ''}
                                            onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Optimized title for search engines"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Leave empty to use blog post title
                                    </p>
                                </div>

                                {/* SEO Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SEO Description
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.seo_description || ''}
                                            onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Description for search engine results"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Leave empty to use excerpt
                                    </p>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingPost(null);
                                        resetForm();
                                        setErrors({});
                                    }}
                                    className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:flex-1 px-6 py-3.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <Plus className="w-5 h-5" />
                                    {editingPost ? 'Update Blog Post' : 'Create Blog Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};