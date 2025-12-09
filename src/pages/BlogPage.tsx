import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { AnimatedSection } from '../components/animated/AnimatedSection';
import { StaggeredList, StaggeredItem } from '../components/animated/StaggeredList';
import { AdSlot } from '../components/AdSlot';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

export const BlogPage = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('status', 'published')
                .order('published_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching blog posts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get all unique tags
    const allTags = Array.from(new Set(posts.flatMap(post => post.tags || [])));

    // Filter posts by selected tag
    const filteredPosts = selectedTag
        ? posts.filter(post => post.tags?.includes(selectedTag))
        : posts;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        const readTime = Math.ceil(wordCount / wordsPerMinute);
        return `${readTime} min read`;
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <AnimatedSection className="section-padding bg-gradient-to-br from-primary-50 via-white to-accent-50">
                <div className="container-custom text-center">
                    <h1 className="text-5xl md:text-6xl font-display font-bold gradient-text mb-6">
                        Our Blog
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Insights, updates, and stories about real estate, property development, and market trends.
                    </p>
                </div>
            </AnimatedSection>

            {/* Tag Filter */}
            {allTags.length > 0 && (
                <AnimatedSection className="py-8 bg-white border-b">
                    <div className="container-custom">
                        <div className="flex flex-wrap gap-2 justify-center">
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTag === null
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All Posts
                            </button>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTag === tag
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>
            )}

            {/* Ad Banner */}
            <section className="py-8 bg-gray-50">
                <div className="container-custom">
                    <AdSlot id="blog-top" className="max-w-4xl mx-auto" />
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="section-padding">
                <div className="container-custom">
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                                    <div className="h-64 bg-gray-200"></div>
                                    <div className="p-6 space-y-4">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-500">
                                {selectedTag ? `No posts found with tag "${selectedTag}"` : 'No blog posts available yet.'}
                            </p>
                        </div>
                    ) : (
                        <StaggeredList key={selectedTag || 'all'} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map((post) => (
                                <StaggeredItem key={post.id}>
                                    <Link
                                        to={`/blog/${post.slug}`}
                                        className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                    >
                                        {/* Featured Image */}
                                        <div className="relative h-64 overflow-hidden">
                                            <img
                                                src={post.featured_image}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                                    {post.tags.slice(0, 2).map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-600 text-xs font-medium rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                                                {post.title}
                                            </h2>

                                            <p className="text-gray-600 mb-4 line-clamp-3">
                                                {post.excerpt}
                                            </p>

                                            {/* Meta Info */}
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(post.published_at || post.created_at)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {calculateReadTime(post.content)}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </StaggeredItem>
                            ))}
                        </StaggeredList>
                    )}
                </div>
            </section>
        </div>
    );
};
