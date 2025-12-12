import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Calendar, Image as ImageIcon, Video, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { StaggeredList, StaggeredItem } from '../../components/animated/StaggeredList';
import { MediaUpload } from '../../components/MediaUpload';
import { deleteImagesFromStorage } from '../../utils/storageCleanup';
import { useAuth } from '../../contexts/AuthContext';
import { useManagerData } from '../../hooks/useManagerData';

type ProjectUpdate = Database['public']['Tables']['project_updates']['Row'];
type ProjectUpdateInsert = Database['public']['Tables']['project_updates']['Insert'];
type ProjectUpdateUpdate = Database['public']['Tables']['project_updates']['Update'];
type Project = { id: string; title: string };

export const ProjectUpdatesManager = () => {
    const { user } = useAuth();
    const { data: updates, loading, refetch, mountedRef } = useManagerData<ProjectUpdate>(
        async () => {
            const { data, error } = await supabase
                .from('project_updates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        'ProjectUpdatesManager'
    );

    const [projects, setProjects] = useState<Project[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState<ProjectUpdate | null>(null);
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [formData, setFormData] = useState<ProjectUpdateInsert>({
        project_id: '',
        title: '',
        description: '',
        images: [],
        video_url: null,
        author_id: null
    });

    // Fetch projects separately (not part of the main data hook)
    useEffect(() => {
        const fetchProjects = async () => {
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select('id, title')
                .order('title');

            if (projectsError) {
                console.error('Error fetching projects:', projectsError);
                return;
            }

            setProjects(projectsData || []);
        };
        fetchProjects();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            console.log('💾 Saving project update...');

            if (editingUpdate) {
                const updateData: ProjectUpdateUpdate = {
                    project_id: formData.project_id,
                    title: formData.title,
                    description: formData.description,
                    images: formData.images,
                    video_url: formData.video_url,
                    author_id: formData.author_id || user?.id || null,
                };

                const { error } = await supabase
                    .from('project_updates')
                    // @ts-ignore - Supabase type inference issue
                    .update(updateData)
                    .eq('id', editingUpdate.id);

                if (error) throw error;
                console.log('✅ Project update updated');
            } else {
                const insertData: ProjectUpdateInsert = {
                    ...formData,
                    author_id: formData.author_id || user?.id || null
                };

                const { error } = await supabase
                    .from('project_updates')
                    // @ts-ignore - Supabase type inference issue
                    .insert([insertData]);

                if (error) throw error;
                console.log('✅ Project update created');
            }

            if (!mountedRef.current) return;

            resetForm();
            await refetch();
        } catch (error) {
            console.error('❌ Error saving update:', error);
            if (mountedRef.current) {
                alert('Failed to save update. Please try again.');
            }
        }
    };

    const handleEdit = (update: ProjectUpdate) => {
        setEditingUpdate(update);
        setFormData({
            project_id: update.project_id,
            title: update.title,
            description: update.description,
            images: update.images,
            video_url: update.video_url,
            author_id: update.author_id
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this update?')) return;

        try {
            console.log('🗑️ Deleting project update...');
            const update = updates.find(u => u.id === id);

            if (update?.images && update.images.length > 0) {
                await deleteImagesFromStorage(update.images);
            }

            const { error } = await supabase
                .from('project_updates')
                .delete()
                .eq('id', id);

            if (error) throw error;
            console.log('✅ Project update deleted');

            if (!mountedRef.current) return;
            await refetch();
        } catch (error) {
            console.error('❌ Error deleting update:', error);
            if (mountedRef.current) {
                alert('Failed to delete update. Please try again.');
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingUpdate(null);
        setFormData({
            project_id: '',
            title: '',
            description: '',
            images: [],
            video_url: null,
            author_id: null
        });
    };

    const getProjectName = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.title : 'Unknown Project';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredUpdates = selectedProject === 'all'
        ? updates
        : updates.filter(update => update.project_id === selectedProject);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-display font-bold mb-2">Project Updates</h1>
                    <p className="text-gray-600">Manage progress updates for all projects</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Update
                </button>
            </div>

            <div className="card p-4">
                <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="input flex-1"
                    >
                        <option value="all">All Projects ({updates.length} updates)</option>
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.title} ({updates.filter(u => u.project_id === project.id).length})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6"
                >
                    <h2 className="text-2xl font-bold mb-6">
                        {editingUpdate ? 'Edit Update' : 'Create New Update'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Project *
                            </label>
                            <select
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                className="input"
                                required
                            >
                                <option value="">Select a project</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Update Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Foundation Complete, 50% Construction Progress"
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the progress or milestone achieved..."
                                className="input min-h-[120px]"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.description.length} characters
                            </p>
                        </div>

                        <div>
                            <MediaUpload
                                images={formData.images || []}
                                videos={formData.video_url ? [formData.video_url] : []}
                                onImagesChange={(images) => setFormData({ ...formData, images })}
                                onVideosChange={(videos) => setFormData({ ...formData, video_url: videos[0] || null })}
                                maxMedia={5}
                                maxFileSizeMB={1}
                                bucketName="projects"
                                showVideos={true}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="submit" className="btn btn-primary">
                                {editingUpdate ? 'Update' : 'Create'} Project Update
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="btn bg-gray-200 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    ))}
                </div>
            ) : filteredUpdates.length === 0 ? (
                <div className="card p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-4">
                        {selectedProject === 'all'
                            ? 'No project updates yet'
                            : 'No updates for this project'}
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Your First Update
                    </button>
                </div>
            ) : (
                <StaggeredList className="grid md:grid-cols-2 gap-6">
                    {filteredUpdates.map((update) => {
                        const updateImages = update.images as string[] || [];
                        return (
                            <StaggeredItem key={update.id}>
                                <div className="card p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Calendar className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-1">{update.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                                <span className="text-gray-500">
                                                    {formatDate(update.created_at)}
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                    {getProjectName(update.project_id)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 mb-4 line-clamp-3">
                                        {update.description}
                                    </p>

                                    <div className="space-y-3">
                                        {updateImages.length > 0 && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <ImageIcon className="w-4 h-4" />
                                                {updateImages.length} {updateImages.length === 1 ? 'image' : 'images'}
                                            </div>
                                        )}
                                        {update.video_url && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Video className="w-4 h-4" />
                                                Video attached
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-4 pt-4 border-t">
                                        <button
                                            onClick={() => handleEdit(update)}
                                            className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 flex-1"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(update.id)}
                                            className="btn bg-red-100 text-red-700 hover:bg-red-200"
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

            <div className="card p-6 bg-blue-50 border border-blue-100">
                <h3 className="text-lg font-bold mb-3">Update Best Practices</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Post regular updates to keep clients informed of progress</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Include high-quality photos showing construction progress</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Video className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Add video walkthroughs for major milestones</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Be specific about completion percentages and timelines</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
