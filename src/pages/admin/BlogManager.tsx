import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { useAuth } from '../../contexts/AuthContext';
import { MediaUpload } from '../../components/MediaUpload';
import { deleteImageFromStorage } from '../../utils/storageCleanup';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];

export const BlogManager = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching blog posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
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
            }

            setShowModal(false);
            setEditingPost(null);
            resetForm();
            fetchPosts();
        } catch (error) {
            console.error('Error saving blog post:', error);
            alert('Failed to save blog post');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;

        try {
            // Find the post to get its image URL before deletion
            const post = posts.find(p => p.id === id);

            // Delete featured image from storage first if it exists
            if (post?.featured_image) {
                await deleteImageFromStorage(post.featured_image);
            }

            // Then delete from database
            const { error } = await supabase
                .from('blog_posts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchPosts();
        } catch (error) {
            console.error('Error deleting blog post:', error);
            alert('Failed to delete blog post');
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
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
                    <p className="text-gray-600 mt-2">Manage your blog content</p>
                </div>
                <button
                    onClick={() => {
                        setEditingPost(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="btn btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    New Post
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                            <div className="p-6 space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                    <p className="text-xl text-gray-500">No blog posts found</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${post.status === 'published'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {post.status}
                                    </span>
                                    {post.tags && post.tags.length > 0 && (
                                        <span className="text-xs text-gray-500">
                                            {post.tags.length} tag{post.tags.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className="flex-1 btn btn-secondary text-sm"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold">
                                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Slug *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Excerpt *
                                </label>
                                <textarea
                                    required
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content *
                                </label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={10}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <MediaUpload
                                    images={formData.featured_image ? [formData.featured_image] : []}
                                    videos={[]}
                                    onImagesChange={(images) => setFormData({ ...formData, featured_image: images[0] || '' })}
                                    onVideosChange={() => { }}
                                    maxMedia={1}
                                    maxFileSizeMB={0.5}
                                    bucketName="blog"
                                    showVideos={false}
                                />
                                {!formData.featured_image && (
                                    <p className="text-xs text-red-500 mt-1">* Featured image is required</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.tags?.join(', ') || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                                    })}
                                    placeholder="Real Estate, Tips, Market Trends"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status *
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SEO Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.seo_title || ''}
                                        onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SEO Description
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.seo_description || ''}
                                        onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingPost(null);
                                        resetForm();
                                    }}
                                    className="flex-1 btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 btn btn-primary">
                                    {editingPost ? 'Update Post' : 'Create Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
