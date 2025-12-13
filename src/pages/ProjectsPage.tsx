import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, ArrowRight, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { AdSlot } from '../components/AdSlot';
import { isNewListing, formatPriceRange } from '../utils/helpers';

interface Project {
    id: string;
    title: string;
    slug: string;
    location: string;
    location_display_name: string;
    price_min: number;
    price_max: number;
    featured_image: string;
    bedrooms: string;
    bathrooms: string;
    area_sqft: number;
    created_at: string;
    status: string;
}

export const ProjectsPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('all');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                let query = supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (filter !== 'all') {
                    query = query.eq('status', filter);
                }

                const { data, error } = await query;

                if (error) throw error;
                setProjects(data || []);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [filter]);

    return (
        <>
            <SEO
                title="Our Projects - Supeva Sandbox"
                description="Explore our premium real estate projects including Furaha, Zuri, and Marble View. Find your perfect home today."
            />

            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-primary-900 to-accent-900 text-white">
                <div className="container-custom">
                    <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 animate-fade-in">
                        Our Projects
                    </h1>
                    <p className="text-xl max-w-2xl animate-slide-up">
                        Discover premium properties in prime locations across Kenya
                    </p>
                </div>
            </section>

            {/* Filter Section */}
            <section className="py-8 bg-white border-b">
                <div className="container-custom">
                    <div className="flex items-center gap-4">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All Projects
                            </button>
                            <button
                                onClick={() => setFilter('active')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'active'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilter('upcoming')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'upcoming'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Upcoming
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ad Banner */}
            <section className="py-8 bg-gray-50">
                <div className="container-custom">
                    <AdSlot id="projects-top" className="max-w-4xl mx-auto" />
                </div>
            </section>

            {/* Projects Grid */}
            <section className="section">
                <div className="container-custom">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="h-64 bg-gray-300"></div>
                                    <div className="p-6 space-y-4">
                                        <div className="h-6 bg-gray-300 rounded"></div>
                                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-600">No projects found</p>
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
                                        {project.featured_image ? (
                                            <img
                                                src={project.featured_image}
                                                alt={project.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-500">No image</span>
                                            </div>
                                        )}
                                        {isNewListing(project.created_at) && (
                                            <div className="absolute top-4 right-4">
                                                <span className="badge badge-new">New Listing</span>
                                            </div>
                                        )}
                                        {project.status === 'upcoming' && (
                                            <div className="absolute top-4 left-4">
                                                <span className="badge bg-blue-600 text-white">Coming Soon</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-primary-600 transition-colors">
                                            {project.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                                            <MapPin className="w-4 h-4" />
                                            <span>{project.location_display_name}</span>
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
                </div>
            </section>
        </>
    );
};
