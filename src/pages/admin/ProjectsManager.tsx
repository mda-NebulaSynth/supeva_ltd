import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, X, Save, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { StaggeredList, StaggeredItem } from '../../components/animated/StaggeredList';
import { fadeInUp } from '../../utils/animations';
import { MediaUpload } from '../../components/MediaUpload';
import type { Database } from '../../lib/database.types';
import { deleteImagesFromStorage } from '../../utils/storageCleanup';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export const ProjectsManager = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [mapPreviewUrl, setMapPreviewUrl] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProjectInsert>({
        title: '',
        slug: '',
        description: '',
        location: '',
        location_display_name: null,
        price_min: 0,
        price_max: 0,
        bedrooms: '',
        bathrooms: '',
        area_sqft: 0,
        status: 'active',
        featured_image: '',
        gallery: [],
        videos: []
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProject) {
                const projectData: ProjectUpdate = {
                    title: formData.title,
                    slug: formData.slug,
                    description: formData.description,
                    location: formData.location,
                    location_display_name: formData.location_display_name,
                    price_min: formData.price_min,
                    price_max: formData.price_max,
                    bedrooms: formData.bedrooms,
                    bathrooms: formData.bathrooms,
                    area_sqft: formData.area_sqft,
                    status: formData.status,
                    featured_image: formData.featured_image,
                    gallery: formData.gallery,
                    videos: formData.videos
                };
                // @ts-ignore - Supabase type inference issue
                const { error } = await supabase.from('projects').update(projectData).eq('id', editingProject.id);
                if (error) throw error;
            } else {
                // @ts-ignore - Supabase type inference issue
                const { error } = await supabase.from('projects').insert([formData]);
                if (error) throw error;
            }
            setShowForm(false);
            setEditingProject(null);
            resetForm();
            fetchProjects();
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            slug: project.slug,
            description: project.description,
            location: project.location,
            location_display_name: project.location_display_name || null,
            price_min: project.price_min,
            price_max: project.price_max,
            bedrooms: project.bedrooms,
            bathrooms: project.bathrooms,
            area_sqft: project.area_sqft,
            status: project.status,
            featured_image: project.featured_image,
            gallery: project.gallery || [],
            videos: project.videos || []
        });
        const mapsUrl = extractGoogleMapsUrl(project.location);
        setMapPreviewUrl(mapsUrl);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this project?')) return;
        try {
            const project = projects.find(p => p.id === id);

            const imagesToDelete: string[] = [];
            if (project?.featured_image) imagesToDelete.push(project.featured_image);
            if (project?.gallery) imagesToDelete.push(...project.gallery);

            if (imagesToDelete.length > 0) {
                await deleteImagesFromStorage(imagesToDelete);
            }

            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) throw error;
            fetchProjects();
        } catch (error) {
            alert('Error deleting project');
        }
    };

    const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const handleTitleChange = (title: string) => {
        setFormData({ ...formData, title, slug: generateSlug(title) });
    };

    const extractGoogleMapsUrl = (input: string): string | null => {
        const iframeMatch = input.match(/src=["']([^"']+)["']/);
        if (iframeMatch && iframeMatch[1].includes('google.com/maps/embed')) {
            return iframeMatch[1];
        }

        const googleMapsPatterns = [
            /maps\.app\.goo\.gl\/[A-Za-z0-9]+/,
            /google\.com\/maps\/embed/,
            /google\.com\/maps/,
            /goo\.gl\/maps/
        ];

        const isGoogleMapsUrl = googleMapsPatterns.some(pattern => pattern.test(input));

        if (isGoogleMapsUrl) {
            if (input.includes('google.com/maps/embed')) {
                return input.startsWith('http') ? input : `https://${input}`;
            }
            if (input.includes('maps.app.goo.gl') || input.includes('goo.gl')) {
                return input.startsWith('http') ? input : `https://${input}`;
            }
            if (input.includes('google.com/maps')) {
                return input;
            }
        }

        return null;
    };

    const handleLocationChange = (value: string) => {
        const mapsUrl = extractGoogleMapsUrl(value);

        if (mapsUrl) {
            setFormData({ ...formData, location: mapsUrl });
            setMapPreviewUrl(mapsUrl);
        } else {
            setFormData({ ...formData, location: value });
            setMapPreviewUrl(null);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            description: '',
            location: '',
            location_display_name: null,
            price_min: 0,
            price_max: 0,
            bedrooms: '',
            bathrooms: '',
            area_sqft: 0,
            status: 'active',
            featured_image: '',
            gallery: [],
            videos: []
        });
        setMapPreviewUrl(null);
    };

    const filteredProjects = searchTerm
        ? projects.filter((p) =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.location_display_name && p.location_display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            p.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : projects;

    return (
        <div className="space-y-6">
            <motion.div className="flex justify-between items-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="text-4xl font-display font-bold mb-2">Projects</h1>
                    <p className="text-gray-600">Manage your real estate projects</p>
                </div>
                <motion.button onClick={() => { setShowForm(true); setEditingProject(null); resetForm(); }} className="btn btn-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Plus className="w-5 h-5" /> Add Project
                </motion.button>
            </motion.div>

            <motion.div className="card p-4" initial="hidden" animate="visible" variants={fadeInUp}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-[52px] pl-12 pr-12 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
            </motion.div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card animate-pulse">
                            <div className="h-48 bg-gray-300"></div>
                            <div className="p-6 space-y-4">
                                <div className="h-6 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <StaggeredItem key={project.id}>
                            <motion.div className="card overflow-hidden" whileHover={{ y: -5 }}>
                                <div className="relative h-48">
                                    {project.featured_image ? (
                                        <img src={project.featured_image} alt={project.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <ImageIcon className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                    <span className={`absolute top-2 right-2 badge ${project.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>{project.status}</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                                    <div className="text-sm text-gray-500 mb-4">
                                        <p>{project.location}</p>
                                        <p>{project.bedrooms} beds • {project.bathrooms} baths</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <motion.button onClick={() => handleEdit(project)} className="flex-1 btn btn-secondary text-sm" whileHover={{ scale: 1.02 }}>
                                            <Edit className="w-4 h-4" /> Edit
                                        </motion.button>
                                        <motion.button onClick={() => handleDelete(project.id)} className="btn bg-red-50 text-red-600 text-sm" whileHover={{ scale: 1.02 }}>
                                            <Trash2 className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </StaggeredItem>
                    ))}
                </StaggeredList>
            )}

            <AnimatePresence>
                {showForm && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowForm(false)}
                            aria-hidden="true"
                        />

                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-title"
                            aria-describedby="modal-description"
                            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="bg-white w-full max-w-4xl max-h-[100dvh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
                                <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-white rounded-t-2xl sm:rounded-t-2xl sticky top-0 z-10">
                                    <h2 id="modal-title" className="text-xl sm:text-2xl font-display font-bold text-gray-900">
                                        {editingProject ? 'Edit' : 'Add'} Project
                                    </h2>
                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                        aria-label="Close modal"
                                        type="button"
                                    >
                                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                                    <p id="modal-description" className="sr-only">
                                        Form to {editingProject ? 'edit existing' : 'create new'} real estate project
                                    </p>

                                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                            <div className="sm:col-span-2">
                                                <label htmlFor="project-title" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Title <span className="text-red-500" aria-label="required">*</span>
                                                </label>
                                                <input
                                                    id="project-title"
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => handleTitleChange(e.target.value)}
                                                    className="input w-full text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    required
                                                    aria-required="true"
                                                    placeholder="Enter project title"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label htmlFor="project-slug" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Slug (Auto-generated)
                                                </label>
                                                <input
                                                    id="project-slug"
                                                    type="text"
                                                    value={formData.slug}
                                                    className="input w-full bg-gray-50 text-base cursor-not-allowed"
                                                    readOnly
                                                    aria-readonly="true"
                                                    tabIndex={-1}
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    id="project-description"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="textarea w-full text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    rows={4}
                                                    placeholder="Enter project description"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label htmlFor="project-location-display" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Location Name <span className="text-red-500" aria-label="required">*</span>
                                                </label>
                                                <input
                                                    id="project-location-display"
                                                    type="text"
                                                    value={formData.location_display_name || ''}
                                                    onChange={(e) => setFormData({ ...formData, location_display_name: e.target.value || null })}
                                                    className="input w-full text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    required
                                                    aria-required="true"
                                                    placeholder="e.g., Kilimani, Nairobi"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Friendly location name to display (e.g., "Kilimani, Nairobi")
                                                </p>
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label htmlFor="project-location" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Embed a Map (optional)
                                                </label>
                                                <input
                                                    id="project-location"
                                                    type="text"
                                                    value={formData.location}
                                                    onChange={(e) => handleLocationChange(e.target.value)}
                                                    className="input w-full text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    placeholder="Paste Google Maps share link or iframe embed code"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Go to Google Maps → Share → Embed a map → Copy HTML, then paste here
                                                </p>

                                                {mapPreviewUrl && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-700">Map Preview</span>
                                                            <a
                                                                href={mapPreviewUrl.replace('/embed', '')}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                                            >
                                                                Open in Google Maps
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                            </a>
                                                        </div>

                                                        {mapPreviewUrl.includes('/maps/embed') ? (
                                                            <div className="w-full h-96 rounded-lg border-2 border-primary-200 overflow-hidden shadow-lg">
                                                                <iframe
                                                                    src={mapPreviewUrl}
                                                                    className="w-full h-full"
                                                                    style={{ border: 0 }}
                                                                    allowFullScreen
                                                                    loading="lazy"
                                                                    referrerPolicy="no-referrer-when-downgrade"
                                                                    title="Google Maps Location Preview"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-64 rounded-lg border-2 border-primary-200 overflow-hidden bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center">
                                                                <a
                                                                    href={mapPreviewUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex flex-col items-center gap-3 p-8 hover:bg-primary-100/50 transition-colors w-full h-full justify-center group"
                                                                >
                                                                    <svg className="w-20 h-20 text-primary-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                                                    </svg>
                                                                    <div className="text-center">
                                                                        <p className="text-base font-semibold text-gray-900 mb-1">Google Maps Location Detected</p>
                                                                        <p className="text-sm text-gray-600 mb-3">Click to view full map</p>
                                                                        <p className="text-xs text-primary-600 font-mono break-all max-w-md px-4">
                                                                            {mapPreviewUrl}
                                                                        </p>
                                                                    </div>
                                                                </a>
                                                            </div>
                                                        )}

                                                        <p className="text-xs text-gray-500 mt-2">
                                                            This Google Maps {mapPreviewUrl.includes('/maps/embed') ? 'embed' : 'link'} will be saved and can be used to show the location on your project page
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="sm:col-span-2 md:col-span-1">
                                                <label htmlFor="project-status" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Status
                                                </label>
                                                <select
                                                    id="project-status"
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'sold_out' | 'upcoming' })}
                                                    className="input w-full text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="sold_out">Sold Out</option>
                                                    <option value="upcoming">Upcoming</option>
                                                </select>
                                            </div>

                                            <div className="sm:col-span-2 md:col-span-1">
                                                <label htmlFor="project-price-min" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Minimum Price (KES)
                                                </label>
                                                <input
                                                    id="project-price-min"
                                                    type="number"
                                                    value={formData.price_min}
                                                    onChange={(e) => setFormData({ ...formData, price_min: +e.target.value })}
                                                    className="input w-full text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    min="0"
                                                    step="1000"
                                                    placeholder="e.g., 5000000"
                                                />
                                            </div>

                                            <div className="sm:col-span-2 md:col-span-1">
                                                <label htmlFor="project-price-max" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Maximum Price (KES)
                                                </label>
                                                <input
                                                    id="project-price-max"
                                                    type="number"
                                                    value={formData.price_max}
                                                    onChange={(e) => setFormData({ ...formData, price_max: +e.target.value })}
                                                    className="input w-full text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    min="0"
                                                    step="1000"
                                                    placeholder="e.g., 15000000"
                                                />
                                            </div>

                                            <div className="sm:col-span-2 md:col-span-1">
                                                <label htmlFor="project-bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Bedrooms
                                                </label>
                                                <input
                                                    id="project-bedrooms"
                                                    type="text"
                                                    value={formData.bedrooms}
                                                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                                                    className="input w-full text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    placeholder="e.g., 2-4"
                                                />
                                            </div>

                                            <div className="sm:col-span-2 md:col-span-1">
                                                <label htmlFor="project-bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Bathrooms
                                                </label>
                                                <input
                                                    id="project-bathrooms"
                                                    type="text"
                                                    value={formData.bathrooms}
                                                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                                                    className="input w-full text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    placeholder="e.g., 2-3"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label htmlFor="project-area" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Area (square feet)
                                                </label>
                                                <input
                                                    id="project-area"
                                                    type="number"
                                                    value={formData.area_sqft}
                                                    onChange={(e) => setFormData({ ...formData, area_sqft: +e.target.value })}
                                                    className="input w-full text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    min="0"
                                                    step="100"
                                                    placeholder="e.g., 1500"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <MediaUpload
                                                    images={formData.gallery || []}
                                                    videos={formData.videos || []}
                                                    onImagesChange={(gallery) => setFormData({ ...formData, gallery })}
                                                    onVideosChange={(videos) => setFormData({ ...formData, videos })}
                                                    maxMedia={5}
                                                    maxFileSizeMB={1}
                                                    bucketName="projects"
                                                    showVideos={true}
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label htmlFor="project-image" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Featured Image URL
                                                </label>
                                                <input
                                                    id="project-image"
                                                    type="url"
                                                    value={formData.featured_image}
                                                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                                                    className="input w-full text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                                {formData.featured_image && (
                                                    <div className="mt-3">
                                                        <img
                                                            src={formData.featured_image}
                                                            alt="Featured image preview"
                                                            className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-200"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 rounded-b-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="flex-1 btn btn-secondary text-base py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 btn btn-primary text-base py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                        >
                                            <Save className="w-5 h-5" />
                                            <span>{editingProject ? 'Update' : 'Create'} Project</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
