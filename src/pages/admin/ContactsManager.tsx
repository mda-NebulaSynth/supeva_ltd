import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, MessageSquare, Trash2, Eye, Filter, Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { StaggeredList, StaggeredItem } from '../../components/animated/StaggeredList';

type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row'];
type ContactSubmissionUpdate = Database['public']['Tables']['contact_submissions']['Update'];
type Project = { id: string; title: string };

export const ContactsManager = () => {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'new' | 'contacted' | 'closed'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const { data: submissionsData, error: submissionsError } = await supabase
                .from('contact_submissions')
                .select('*')
                .order('created_at', { ascending: false });

            if (submissionsError) throw submissionsError;

            const { data: projectsData } = await supabase
                .from('projects')
                .select('id, title');

            setSubmissions(submissionsData || []);
            setProjects(projectsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: 'new' | 'contacted' | 'closed') => {
        try {
            const updateData: ContactSubmissionUpdate = { status };

            const { error } = await supabase
                .from('contact_submissions')
                // @ts-ignore - Supabase type inference issue
                .update(updateData)
                .eq('id', id);

            if (error) throw error;
            fetchData();

            if (selectedSubmission?.id === id) {
                setSelectedSubmission({ ...selectedSubmission, status });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    const deleteSubmission = async (id: string) => {
        if (!confirm('Are you sure you want to delete this submission?')) return;

        try {
            const { error } = await supabase
                .from('contact_submissions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchData();

            if (selectedSubmission?.id === id) {
                setShowDetails(false);
                setSelectedSubmission(null);
            }
        } catch (error) {
            console.error('Error deleting submission:', error);
            alert('Failed to delete submission. Please try again.');
        }
    };

    const getProjectName = (projectId: string | null) => {
        if (!projectId) return 'General Inquiry';
        const project = projects.find(p => p.id === projectId);
        return project ? project.title : 'Unknown Project';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-blue-100 text-blue-700';
            case 'contacted':
                return 'bg-yellow-100 text-yellow-700';
            case 'closed':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'new':
                return '🆕';
            case 'contacted':
                return '📞';
            case 'closed':
                return '✅';
            default:
                return '📝';
        }
    };

    const filteredSubmissions = submissions.filter(submission => {
        const matchesStatus = selectedStatus === 'all' || submission.status === selectedStatus;
        const matchesSearch =
            submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            submission.phone.includes(searchQuery) ||
            submission.message.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const stats = {
        total: submissions.length,
        new: submissions.filter(s => s.status === 'new').length,
        contacted: submissions.filter(s => s.status === 'contacted').length,
        closed: submissions.filter(s => s.status === 'closed').length
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-display font-bold mb-2">Contact Submissions</h1>
                <p className="text-gray-600">Manage and respond to customer inquiries</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Submissions</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="card p-4 border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600 mb-1">New</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
                </div>
                <div className="card p-4 border-l-4 border-yellow-500">
                    <div className="text-sm text-gray-600 mb-1">Contacted</div>
                    <div className="text-3xl font-bold text-yellow-600">{stats.contacted}</div>
                </div>
                <div className="card p-4 border-l-4 border-gray-500">
                    <div className="text-sm text-gray-600 mb-1">Closed</div>
                    <div className="text-3xl font-bold text-gray-600">{stats.closed}</div>
                </div>
            </div>

            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as any)}
                            className="input min-w-[150px]"
                        >
                            <option value="all">All Status</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, phone, or message..."
                            className="input pl-10 w-full"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                                <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            ) : filteredSubmissions.length === 0 ? (
                <div className="card p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                        {searchQuery || selectedStatus !== 'all'
                            ? 'No submissions match your filters'
                            : 'No contact submissions yet'}
                    </p>
                </div>
            ) : (
                <StaggeredList className="grid gap-4">
                    {filteredSubmissions.map((submission) => (
                        <StaggeredItem key={submission.id}>
                            <motion.div
                                className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => {
                                    setSelectedSubmission(submission);
                                    setShowDetails(true);
                                }}
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {submission.name}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                                {getStatusIcon(submission.status)} {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                {submission.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {submission.phone}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(submission.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSubmission(submission);
                                            setShowDetails(true);
                                        }}
                                        className="btn bg-primary-100 text-primary-700 hover:bg-primary-200"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>

                                {submission.project_id && (
                                    <div className="mb-3">
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                            📍 {getProjectName(submission.project_id)}
                                        </span>
                                    </div>
                                )}

                                <p className="text-gray-700 line-clamp-2">
                                    {submission.message}
                                </p>
                            </motion.div>
                        </StaggeredItem>
                    ))}
                </StaggeredList>
            )}

            {showDetails && selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetails(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b sticky top-0 bg-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">{selectedSubmission.name}</h2>
                                    <p className="text-sm text-gray-500">
                                        Submitted on {formatDate(selectedSubmission.created_at)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="font-bold mb-3">Contact Information</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <a href={`mailto:${selectedSubmission.email}`} className="text-primary-600 hover:underline">
                                            {selectedSubmission.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <a href={`tel:${selectedSubmission.phone}`} className="text-primary-600 hover:underline">
                                            {selectedSubmission.phone}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {selectedSubmission.project_id && (
                                <div>
                                    <h3 className="font-bold mb-2">Related Project</h3>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                        {getProjectName(selectedSubmission.project_id)}
                                    </span>
                                </div>
                            )}

                            <div>
                                <h3 className="font-bold mb-2">Message</h3>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                                    {selectedSubmission.message}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold mb-3">Status</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateStatus(selectedSubmission.id, 'new')}
                                        className={`btn ${selectedSubmission.status === 'new' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}
                                    >
                                        🆕 New
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedSubmission.id, 'contacted')}
                                        className={`btn ${selectedSubmission.status === 'contacted' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700'}`}
                                    >
                                        📞 Contacted
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedSubmission.id, 'closed')}
                                        className={`btn ${selectedSubmission.status === 'closed' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                    >
                                        ✅ Closed
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <a
                                    href={`mailto:${selectedSubmission.email}?subject=Re: Your inquiry&body=Hi ${selectedSubmission.name},%0D%0A%0D%0AThank you for contacting Supeva.`}
                                    className="btn btn-primary flex-1"
                                >
                                    <Mail className="w-4 h-4" />
                                    Send Email
                                </a>
                                <a
                                    href={`https://wa.me/${selectedSubmission.phone.replace(/[^0-9]/g, '')}?text=Hi ${selectedSubmission.name}, thank you for contacting Supeva.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn bg-green-600 text-white hover:bg-green-700 flex-1"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    WhatsApp
                                </a>
                                <button
                                    onClick={() => deleteSubmission(selectedSubmission.id)}
                                    className="btn bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
