import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { SEO } from '../components/SEO';
import { AnimatedSection } from '../components/animated/AnimatedSection';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
// Use a simple type for Profile since it's not in your Database
type Profile = {
    id: string;
    full_name: string;
    avatar_url?: string | null;
};

export const BlogPostPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [author, setAuthor] = useState<Profile | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetchPost();
        }
    }, [slug]);

    const fetchPost = async () => {
        try {
            if (!slug) return;
            setLoading(true);

            // FIX: Type assertion for blog_posts query
            const { data: postData, error: postError } = await (supabase
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'published')
                .single() as any);

            if (postError) throw postError;
            if (!postData) throw new Error('Post not found');

            const typedPost = postData as BlogPost;
            setPost(typedPost);



            // Fetch author - Use admin_profiles instead of profiles
            if (typedPost.author_id) {
                try {
                    const { data: authorData } = await (supabase
                        .from('admin_profiles')
                        .select('id, full_name, avatar_url')
                        .eq('id', typedPost.author_id)
                        .single() as any);

                    if (authorData) {
                        setAuthor({
                            id: authorData.id,
                            full_name: authorData.full_name,
                            avatar_url: authorData.avatar_url
                        });
                    }
                } catch (error) {
                    console.debug('Error fetching author:', error);
                    // Fallback to a generic author
                    setAuthor({
                        id: typedPost.author_id,
                        full_name: 'Admin',
                        avatar_url: null
                    });
                }
            }

            // Fetch related posts
            if (typedPost.tags && typedPost.tags.length > 0) {
                const { data: relatedData } = await (supabase
                    .from('blog_posts')
                    .select('*')
                    .eq('status', 'published')
                    .neq('id', typedPost.id)
                    .overlaps('tags', typedPost.tags)
                    .limit(3) as any);

                if (relatedData) {
                    setRelatedPosts(relatedData as BlogPost[]);
                }
            }
        } catch (error) {
            console.error('Error fetching blog post:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Not published';
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

    const handleShare = async () => {
        if (navigator.share && post) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.excerpt,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen section-padding">
                <div className="container-custom max-w-4xl">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-96 bg-gray-200 rounded-2xl"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen section-padding">
                <div className="container-custom text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
                    <p className="text-xl text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
                    <Link to="/blog" className="btn btn-primary">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO
                title={post.seo_title || post.title}
                description={post.seo_description || post.excerpt}
                ogImage={post.featured_image}
            />

            <article className="min-h-screen">
                {/* Back Button */}
                <div className="section-padding bg-gray-50">
                    <div className="container-custom max-w-4xl">
                        <Link
                            to="/blog"
                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Blog
                        </Link>
                    </div>
                </div>

                {/* Article Header */}
                <AnimatedSection className="section-padding bg-gray-50">
                    <div className="container-custom max-w-4xl">
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {post.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                            {post.title}
                        </h1>

                        {/* Excerpt */}
                        <p className="text-xl text-gray-600 mb-8">
                            {post.excerpt}
                        </p>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-6 text-gray-600">
                            {author && (
                                <div className="flex items-center gap-2">
                                    {author.avatar_url ? (
                                        <img
                                            src={author.avatar_url}
                                            alt={author.full_name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {author.full_name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="font-medium">{author.full_name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {formatDate(post.published_at)}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {calculateReadTime(post.content)}
                            </div>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 ml-auto hover:text-primary-600 transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Featured Image */}
                <AnimatedSection className="container-custom max-w-3xl mb-12 px-4">
                    <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
                        <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-auto max-h-[400px] object-cover"
                        />
                    </div>
                </AnimatedSection>

                {/* Article Content */}
                <AnimatedSection className="container-custom max-w-4xl mb-16">
                    <div className="prose prose-lg max-w-none">
                        <ReactMarkdown
                            components={{
                                h1: ({ children }) => (
                                    <h1 className="text-3xl md:text-4xl font-bold mb-6 mt-8 text-gray-900">{children}</h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-8 text-gray-900">{children}</h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-xl md:text-2xl font-bold mb-3 mt-6 text-gray-900">{children}</h3>
                                ),
                                p: ({ children }) => <p className="mb-6 text-gray-700 leading-relaxed">{children}</p>,
                                ul: ({ children }) => (
                                    <ul className="list-disc list-inside mb-6 space-y-2 text-gray-700">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal list-inside mb-6 space-y-2 text-gray-700">{children}</ol>
                                ),
                                li: ({ children }) => <li className="mb-2">{children}</li>,
                                a: ({ children, href }) => (
                                    <a
                                        href={href}
                                        className="text-primary-600 hover:text-primary-700 underline font-medium"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {children}
                                    </a>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-primary-300 pl-6 py-2 italic text-gray-600 mb-6 bg-gray-50">
                                        {children}
                                    </blockquote>
                                ),
                                code: ({ children }) => (
                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-600">
                                        {children}
                                    </code>
                                ),
                                pre: ({ children }) => (
                                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
                                        {children}
                                    </pre>
                                ),
                                table: ({ children }) => (
                                    <div className="overflow-x-auto mb-6">
                                        <table className="min-w-full border-collapse border border-gray-300">
                                            {children}
                                        </table>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead className="bg-gray-100">{children}</thead>
                                ),
                                tbody: ({ children }) => <tbody>{children}</tbody>,
                                tr: ({ children }) => <tr className="border-b border-gray-300">{children}</tr>,
                                th: ({ children }) => (
                                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td className="border border-gray-300 px-4 py-2">{children}</td>
                                ),
                                img: ({ src, alt }) => (
                                    <img
                                        src={src}
                                        alt={alt || ''}
                                        className="w-full rounded-lg shadow-lg my-8"
                                        loading="lazy"
                                    />
                                ),
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>
                </AnimatedSection>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <AnimatedSection className="section-padding bg-gray-50">
                        <div className="container-custom max-w-6xl">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {relatedPosts.map(relatedPost => (
                                    <Link
                                        key={relatedPost.id}
                                        to={`/blog/${relatedPost.slug}`}
                                        className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                                    >
                                        <img
                                            src={relatedPost.featured_image}
                                            alt={relatedPost.title}
                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                                                {relatedPost.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {relatedPost.excerpt}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </AnimatedSection>
                )}
            </article>
        </>
    );
};