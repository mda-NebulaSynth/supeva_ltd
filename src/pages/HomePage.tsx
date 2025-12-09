import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, MapPin, Bed, Bath, Maximize, Star, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { AdSlot } from '../components/AdSlot';
import { isNewListing, formatPriceRange } from '../utils/helpers';

interface Project {
    id: string;
    title: string;
    slug: string;
    location: string;
    price_min: number;
    price_max: number;
    featured_image: string;
    bedrooms: string;
    bathrooms: string;
    area_sqft: number;
    created_at: string;
}

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string;
    published_at: string;
}

interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    image: string;
    rating: number;
}

export const HomePage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch featured projects
                const { data: projectsData } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(3);

                // Fetch latest blog posts
                const { data: blogData } = await supabase
                    .from('blog_posts')
                    .select('*')
                    .eq('status', 'published')
                    .order('published_at', { ascending: false })
                    .limit(3);

                // Fetch testimonials
                const { data: testimonialsData } = await supabase
                    .from('testimonials')
                    .select('*')
                    .eq('active', true)
                    .limit(3);

                setProjects(projectsData || []);
                setBlogPosts(blogData || []);
                setTestimonials(testimonialsData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <SEO
                title="Supeva Sandbox - Premium Real Estate in Kenya"
                description="Discover your dream property with Supeva Sandbox. Explore premium real estate projects including Furaha, Zuri, and Marble View."
            />

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900">
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920')] bg-cover bg-center opacity-30"></div>

                <div className="container-custom relative z-10 text-center text-white">
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 animate-fade-in">
                        Find Your Dream Home
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-slide-up animation-delay-200">
                        Discover premium properties in prime locations. Your perfect home awaits.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-400">
                        <Link to="/projects" className="btn btn-primary text-lg px-8 py-4">
                            Explore Projects
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/contact" className="btn btn-secondary text-lg px-8 py-4 bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white/30">
                            Book a Visit
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
                        <div className="w-1 h-3 bg-white/50 rounded-full"></div>
                    </div>
                </div>
            </section>

            {/* Homepage Hero Banner */}
            <section className="py-8 bg-white">
                <div className="container-custom">
                    <AdSlot id="homepage-hero" className="max-w-6xl mx-auto" />
                </div>
            </section>

            {/* Featured Projects */}
            <section className="section bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                            Featured <span className="gradient-text">Projects</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Explore our handpicked selection of premium properties
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="h-64 bg-gray-300"></div>
                                    <div className="p-6 space-y-4">
                                        <div className="h-6 bg-gray-300 rounded"></div>
                                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projects.map((project) => (
                                <Link
                                    key={project.id}
                                    to={`/projects/${project.slug}`}
                                    className="card group"
                                >
                                    <div className="relative overflow-hidden h-64">
                                        <img
                                            src={project.featured_image}
                                            alt={project.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        {isNewListing(project.created_at) && (
                                            <div className="absolute top-4 right-4">
                                                <span className="badge badge-new">New Listing</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-primary-600 transition-colors">
                                            {project.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                                            <MapPin className="w-4 h-4" />
                                            <span>{project.location}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Bed className="w-4 h-4" />
                                                <span>{project.bedrooms}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Bath className="w-4 h-4" />
                                                <span>{project.bathrooms}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Maximize className="w-4 h-4" />
                                                <span>{project.area_sqft} sqft</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-primary-600">
                                                {formatPriceRange(project.price_min, project.price_max)}
                                            </span>
                                            <ArrowRight className="w-5 h-5 text-primary-600 group-hover:translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link to="/projects" className="btn btn-primary">
                            View All Projects
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Ad Slot */}
            <section className="section">
                <div className="container-custom">
                    <AdSlot id="Homepage-Ad-1" className="max-w-4xl mx-auto" />
                </div>
            </section>

            {/* Testimonials */}
            <section className="section bg-gradient-to-br from-primary-50 to-accent-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                            What Our <span className="gradient-text">Clients Say</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Don't just take our word for it
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="card-glass p-8">
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                                <div className="flex items-center gap-4">
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
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Preview */}
            <section className="section">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                            Latest <span className="gradient-text">Insights</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Stay updated with the latest real estate news and tips
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {blogPosts.map((post) => (
                            <Link
                                key={post.id}
                                to={`/blog/${post.slug}`}
                                className="card group"
                            >
                                <div className="relative overflow-hidden h-48">
                                    <img
                                        src={post.featured_image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-display font-bold mb-2 group-hover:text-primary-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                                    <span className="text-primary-600 font-semibold flex items-center gap-2">
                                        Read More
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/blog" className="btn btn-primary">
                            View All Posts
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient-to-r from-primary-600 to-accent-600 text-white">
                <div className="container-custom text-center">
                    <Building2 className="w-16 h-16 mx-auto mb-6" />
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                        Ready to Find Your Dream Home?
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Let our expert team help you find the perfect property that matches your needs and budget.
                    </p>
                    <Link to="/contact" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4">
                        Get Started Today
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </>
    );
};
