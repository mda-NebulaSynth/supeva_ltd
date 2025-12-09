import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Bed, Bath, Maximize, MapPin, ArrowLeft, Mail, Phone, MessageCircle,
    Play, X, ChevronLeft, ChevronRight,
    Share2, Home, TreePine, Dumbbell, Car, Wifi, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { AdSlot } from '../components/AdSlot';
import { formatPriceRange } from '../utils/helpers';
import { StaggeredList, StaggeredItem } from '../components/animated/StaggeredList';
import { ProjectTimeline } from '../components/ProjectTimeline';
import type { Database } from '../lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectUpdate = Database['public']['Tables']['project_updates']['Row'];

const amenityIcons: Record<string, any> = {
    'Swimming Pool': Wifi,
    'Gym': Dumbbell,
    'Parking': Car,
    'Garden': TreePine,
    'Security': Shield,
    'default': Home
};

export const ProjectDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'updates' | 'location'>('overview');

    useEffect(() => {
        const fetchProjectData = async () => {
            if (!slug) return;

            setLoading(true);

            // Fetch project
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .eq('slug', slug)
                .single();

            if (projectError || !projectData) {
                console.error('Error fetching project:', projectError);
                setLoading(false);
                return;
            }

            setProject(projectData);

            // Fetch project updates
            // Use type assertion to avoid "never" inference issue if Supabase types fail to narrow correctly
            const currentProject = projectData as Project;

            const { data: updatesData } = await supabase
                .from('project_updates')
                .select('*')
                .eq('project_id', currentProject.id)
                .order('created_at', { ascending: false });

            if (updatesData) {
                setProjectUpdates(updatesData);
            }

            setLoading(false);
        };

        fetchProjectData();
    }, [slug]);

    const handleShare = async () => {
        if (navigator.share && project) {
            try {
                await navigator.share({
                    title: project.title,
                    text: project.description,
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

    const nextImage = () => {
        if (!project) return;
        const images = [project.featured_image, ...(project.gallery as string[] || [])];
        const videos = (project.videos as string[] || []);
        const totalMedia = images.length + videos.length;
        setActiveImage((prev) => (prev + 1) % totalMedia);
    };

    const prevImage = () => {
        if (!project) return;
        const images = [project.featured_image, ...(project.gallery as string[] || [])];
        const videos = (project.videos as string[] || []);
        const totalMedia = images.length + videos.length;
        setActiveImage((prev) => (prev - 1 + totalMedia) % totalMedia);
    };

    if (loading) {
        return (
            <div className="section container-custom">
                <div className="text-center py-20">
                    <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="section container-custom">
                <div className="text-center py-20">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Project Not Found</h1>
                    <p className="text-gray-600 mb-8">The project you're looking for doesn't exist.</p>
                    <Link to="/projects" className="btn btn-primary">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    // Prepare media gallery (images + videos)
    const images = [
        project.featured_image,
        ...(project.gallery as string[] || [])
    ].filter(url => url && typeof url === 'string' && url.trim() !== '');

    const videos = (project.videos as string[] || []).filter(url => url && url.trim() !== '');
    const allMedia = [...images, ...videos];
    const amenities = project.amenities as string[] || [];

    // Determine if current item is a video
    const isVideo = (index: number) => index >= images.length;
    const getVideoUrl = (index: number) => videos[index - images.length];

    return (
        <>
            <SEO
                title={project.seo_title || `${project.title} - Supeva Real Estate`}
                description={project.seo_description || project.description}
                ogImage={project.featured_image}
            />

            {/* Back Button */}
            <section className="bg-gray-50 py-3 sm:py-4 border-b">
                <div className="container-custom flex items-center justify-between">
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Back to Projects</span>
                        <span className="xs:hidden">Back</span>
                    </Link>
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-gray-600 hover:text-primary-600 transition-colors"
                    >
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Share</span>
                    </button>
                </div>
            </section>

            {/* Project Detail Top Banner */}
            <section className="py-8 bg-white border-b">
                <div className="container-custom">
                    <AdSlot id="project-detail-top" className="max-w-6xl mx-auto" />
                </div>
            </section>

            {/* Premium Hero Section - Luxury Real Estate Showcase */}
            <section className="bg-gray-50 py-6 md:py-8 lg:py-12">
                <div className="container-custom">
                    {/* Card Container with Smooth Rounded Edges */}
                    <div className="relative h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden rounded-2xl md:rounded-3xl lg:rounded-[2rem] shadow-2xl group">
                        <AnimatePresence mode="wait">
                            {isVideo(activeImage) ? (
                                /* Video Player */
                                <motion.div
                                    key={`video-${activeImage}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="w-full h-full bg-black"
                                >
                                    <iframe
                                        src={`${getVideoUrl(activeImage)}?rel=0&modestbranding=1&playsinline=1`}
                                        className="w-full h-full"
                                        title={`${project.title} Video Tour`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </motion.div>
                            ) : (
                                /* Image Display with Parallax Effect */
                                <motion.img
                                    key={`img-${activeImage}`}
                                    src={allMedia[activeImage]}
                                    alt={`${project.title}`}
                                    className="w-full h-full object-cover scale-105"
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1.05 }}
                                    exit={{ opacity: 0, scale: 1 }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Sophisticated Gradient Overlay - Adjusted for text visibility */}
                        {!isVideo(activeImage) && (
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none"></div>
                        )}

                        {/* Minimalist Navigation - Positioned higher to avoid text overlap */}
                        {allMedia.length > 1 && (
                            <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-between px-4 md:px-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30" style={{ marginBottom: '25%' }}>
                                <button
                                    onClick={prevImage}
                                    className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-xl hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-110 shadow-xl"
                                    aria-label="Previous"
                                >
                                    <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-xl hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-auto hover:scale-110 shadow-xl"
                                    aria-label="Next"
                                >
                                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </button>
                            </div>
                        )}

                        {/* Elegant Project Information - Higher z-index */}
                        <div className="absolute bottom-0 left-0 right-0 pb-8 md:pb-12 lg:pb-16 px-6 md:px-10 lg:px-12 text-white z-40 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                            >
                                {/* Status Badge */}
                                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-white/15 backdrop-blur-xl border border-white/25 rounded-full mb-3 sm:mb-4 md:mb-6 shadow-lg">
                                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-primary-400 animate-pulse"></div>
                                    <span className="text-[10px] xs:text-xs sm:text-sm font-medium tracking-wider uppercase">
                                        {project.status === 'active' ? 'Now Available' : project.status === 'upcoming' ? 'Coming Soon' : 'Sold Out'}
                                    </span>
                                </div>

                                {/* Property Title */}
                                <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-light mb-3 sm:mb-4 md:mb-6 tracking-tight leading-tight drop-shadow-2xl">
                                    {project.title}
                                </h1>

                                {/* Location & Price Row */}
                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4 md:gap-8 max-w-5xl">
                                    {/* Location */}
                                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-300 flex-shrink-0" />
                                        <span className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-light tracking-wide drop-shadow-lg">
                                            {project.location}
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight drop-shadow-2xl">
                                        {formatPriceRange(project.price_min, project.price_max)}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Minimal Media Counter - Top Right, above video controls */}
                        {allMedia.length > 1 && (
                            <div className="absolute top-4 md:top-6 right-4 md:right-6 z-50 flex items-center gap-3 pointer-events-auto">
                                {/* Counter Dots */}
                                <div className="flex items-center gap-1.5 px-3 py-2 bg-black/40 backdrop-blur-xl rounded-full shadow-lg">
                                    {allMedia.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImage(index)}
                                            className={`transition-all duration-300 ${index === activeImage
                                                ? 'w-7 h-1.5 bg-white'
                                                : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                                                } rounded-full`}
                                            aria-label={`Go to media ${index + 1}`}
                                        />
                                    ))}
                                </div>

                                {/* Video Badge */}
                                {isVideo(activeImage) && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex items-center gap-2 px-3 py-2 bg-red-600/90 backdrop-blur-xl rounded-full shadow-lg"
                                    >
                                        <Play className="w-3 h-3 text-white fill-current" />
                                        <span className="text-xs font-medium uppercase tracking-wider text-white">Video</span>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Quick Stats Bar */}
            <section className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <div className="container-custom py-2 xs:py-3 sm:py-4 md:py-5 lg:py-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-6">
                        <div className="text-center">
                            <Bed className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto mb-0.5 xs:mb-1 sm:mb-2 text-primary-600" />
                            <div className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{project.bedrooms}</div>
                            <div className="text-[10px] xs:text-xs sm:text-sm text-gray-600">Bedrooms</div>
                        </div>
                        <div className="text-center">
                            <Bath className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto mb-0.5 xs:mb-1 sm:mb-2 text-primary-600" />
                            <div className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{project.bathrooms}</div>
                            <div className="text-[10px] xs:text-xs sm:text-sm text-gray-600">Bathrooms</div>
                        </div>
                        <div className="text-center">
                            <Maximize className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto mb-0.5 xs:mb-1 sm:mb-2 text-primary-600" />
                            <div className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{project.area_sqft.toLocaleString()}</div>
                            <div className="text-[10px] xs:text-xs sm:text-sm text-gray-600">sq ft</div>
                        </div>
                        <div className="text-center">
                            <Home className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto mb-0.5 xs:mb-1 sm:mb-2 text-primary-600" />
                            <div className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 capitalize">{project.status.replace('_', ' ')}</div>
                            <div className="text-[10px] xs:text-xs sm:text-sm text-gray-600">Status</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tab Navigation */}
            <section className="bg-gray-50 border-b">
                <div className="container-custom">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'amenities', label: 'Amenities' },
                            { id: 'updates', label: 'Updates', badge: projectUpdates.length },
                            { id: 'location', label: 'Location' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${activeTab === tab.id
                                    ? 'text-primary-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab.label}
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                                        {tab.badge}
                                    </span>
                                )}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tab Content */}
            <section className="section">
                <div className="container-custom">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl"
                            >
                                <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4 sm:mb-6">Property Description</h2>
                                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6 sm:mb-8">
                                    {project.description}
                                </p>

                                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="card p-4 sm:p-6">
                                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Property Details</h3>
                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="flex justify-between text-sm sm:text-base">
                                                <span className="text-gray-600">Bedrooms</span>
                                                <span className="font-semibold">{project.bedrooms}</span>
                                            </div>
                                            <div className="flex justify-between text-sm sm:text-base">
                                                <span className="text-gray-600">Bathrooms</span>
                                                <span className="font-semibold">{project.bathrooms}</span>
                                            </div>
                                            <div className="flex justify-between text-sm sm:text-base">
                                                <span className="text-gray-600">Area</span>
                                                <span className="font-semibold">{project.area_sqft.toLocaleString()} sq ft</span>
                                            </div>
                                            <div className="flex justify-between text-sm sm:text-base">
                                                <span className="text-gray-600">Status</span>
                                                <span className="font-semibold capitalize">{project.status.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card p-4 sm:p-6">
                                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Pricing</h3>
                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="flex justify-between text-sm sm:text-base">
                                                <span className="text-gray-600">Starting Price</span>
                                                <span className="font-semibold">KSh {project.price_min.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm sm:text-base">
                                                <span className="text-gray-600">Maximum Price</span>
                                                <span className="font-semibold">KSh {project.price_max.toLocaleString()}</span>
                                            </div>
                                            <div className="pt-2 sm:pt-3 border-t">
                                                <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Price Range</div>
                                                <div className="text-xl sm:text-2xl font-bold text-primary-600">
                                                    {formatPriceRange(project.price_min, project.price_max)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'amenities' && (
                            <motion.div
                                key="amenities"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4 sm:mb-6">Amenities & Features</h2>
                                {amenities.length > 0 ? (
                                    <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                        {amenities.map((amenity, index) => {
                                            const Icon = amenityIcons[amenity] || amenityIcons.default;
                                            return (
                                                <StaggeredItem key={index}>
                                                    <div className="card p-4 sm:p-6 hover:shadow-lg transition-shadow">
                                                        <div className="flex items-center gap-3 sm:gap-4">
                                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                                                            </div>
                                                            <span className="font-medium text-sm sm:text-base md:text-lg">{amenity}</span>
                                                        </div>
                                                    </div>
                                                </StaggeredItem>
                                            );
                                        })}
                                    </StaggeredList>
                                ) : (
                                    <p className="text-sm sm:text-base text-gray-500">No amenities listed for this property.</p>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'updates' && (
                            <motion.div
                                key="updates"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <h2 className="text-2xl sm:text-3xl font-display font-bold mb-6 sm:mb-8">Project Timeline</h2>
                                <ProjectTimeline updates={projectUpdates} />
                            </motion.div>
                        )}

                        {activeTab === 'location' && (
                            <motion.div
                                key="location"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4 sm:mb-6">Location</h2>
                                <div className="card p-4 sm:p-6">
                                    <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mt-1 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                                                {project.location.includes('google.com/maps') ? 'View on Map' : project.location}
                                            </h3>
                                            <p className="text-sm sm:text-base text-gray-600">
                                                Conveniently located with easy access to major amenities and transportation.
                                            </p>
                                            {project.location.includes('google.com/maps') && (
                                                <a
                                                    href={project.location.replace('/embed', '')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 mt-2 text-sm text-primary-600 hover:text-primary-700"
                                                >
                                                    Open in Google Maps
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Google Maps Embed or Placeholder */}
                                    {project.location.includes('google.com/maps/embed') ? (
                                        <div className="aspect-video rounded-lg overflow-hidden shadow-lg border-2 border-gray-200">
                                            <iframe
                                                src={project.location}
                                                className="w-full h-full"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                title="Project Location"
                                            />
                                        </div>
                                    ) : project.location.includes('maps.app.goo.gl') || project.location.includes('goo.gl/maps') ? (
                                        <a
                                            href={project.location}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block aspect-video bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg border-2 border-primary-200 hover:border-primary-300 transition-colors overflow-hidden"
                                        >
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
                                                <svg className="w-24 h-24 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                                </svg>
                                                <div className="text-center">
                                                    <p className="text-lg font-semibold text-gray-900 mb-2">View Location on Google Maps</p>
                                                    <p className="text-sm text-gray-600 mb-3">Click to open interactive map</p>
                                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                                        Open Google Maps
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                                            <div className="text-center p-8">
                                                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <p className="text-lg font-medium text-gray-700 mb-2">{project.location}</p>
                                                <p className="text-sm text-gray-500">Interactive map not available</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Contact CTA Section */}
            <section className="section">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <div className="card p-6 sm:p-8 md:p-12 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4 text-center">
                                Interested in this Property?
                            </h2>
                            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-center text-white/90">
                                Get in touch with our team to schedule a viewing or request more information.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                                <a
                                    href="tel:+254700000000"
                                    className="btn bg-white text-primary-600 hover:bg-gray-100 flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Call Us Now
                                </a>
                                <a
                                    href={`https://wa.me/254700000000?text=Hi, I'm interested in ${project.title}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    WhatsApp Chat
                                </a>
                                <Link
                                    to="/contact"
                                    className="btn bg-transparent border-2 border-white text-white hover:bg-white/10 flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Send Inquiry
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {showLightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 sm:p-4"
                        onClick={() => setShowLightbox(false)}
                    >
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-2 right-2 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </button>

                        <div className="max-w-7xl w-full" onClick={(e) => e.stopPropagation()}>
                            <img
                                src={images[activeImage]}
                                alt={`${project.title} - Image ${activeImage + 1}`}
                                className="w-full h-auto max-h-[70vh] sm:max-h-[80vh] object-contain rounded-lg"
                            />

                            <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 overflow-x-auto pb-2 sm:pb-4">
                                {images.map((image: string, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(index)}
                                        className={`w-14 h-10 sm:w-20 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all ${index === activeImage
                                            ? 'ring-2 ring-white opacity-100'
                                            : 'opacity-50 hover:opacity-75'
                                            }`}
                                    >
                                        <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
