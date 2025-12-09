import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, UserPlus, Mail, UserX, CheckCircle, XCircle,
    Crown, Briefcase, Calendar, MoreVertical,
    Send, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { StaggeredList, StaggeredItem } from '../../components/animated/StaggeredList';

type AdminProfile = {
    id: string;
    email: string;
    full_name: string;
    role: 'developer' | 'founder' | 'staff';
    avatar_url: string | null;
    is_active: boolean;
    invited_by: string | null;
    invited_at: string | null;
    accepted_at: string | null;
    created_at: string;
    updated_at: string;
    is_developer: boolean;
};

export const TeamManagement = () => {
    const [adminProfiles, setAdminProfiles] = useState<AdminProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Invite form state - simplified to just email
    const [inviteForm, setInviteForm] = useState({
        email: '',
        full_name: '',
        role: 'staff' as 'founder' | 'staff',
    });
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        fetchAdminProfiles();
    }, []);

    const fetchAdminProfiles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('admin_profiles')
                .select('*')
                .eq('is_developer', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAdminProfiles(data || []);
        } catch (error) {
            console.error('Error fetching admin profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);

        try {
            // Simple email sending - this would connect to your backend
            // For now, we'll just show success and log to console
            console.log('Sending invite request to support@nebulasynth.com:', {
                email: inviteForm.email,
                role: inviteForm.role,
                timestamp: new Date().toISOString()
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Show success animation
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setShowInviteModal(false);
                setInviteForm({ email: '', full_name: '', role: 'staff' });
            }, 2000);

        } catch (error: any) {
            console.error('Error sending invite:', error);
            alert('Failed to send invite. Please try again.');
        } finally {
            setInviting(false);
        }
    };

    const toggleActiveStatus = async (adminId: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this team member?`)) {
            return;
        }

        try {
            const updateData = {
                is_active: !currentStatus,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('admin_profiles')
                .update(updateData)
                .eq('id', adminId);

            if (error) throw error;

            // Update local state immediately for smooth UI
            setAdminProfiles(prev => prev.map(admin =>
                admin.id === adminId ? { ...admin, ...updateData } : admin
            ));
        } catch (error) {
            console.error('Error toggling admin status:', error);
            alert('Failed to update team member status');
        }
    };

    const deleteAdmin = async (adminId: string, adminEmail: string) => {
        if (!confirm(`Are you sure you want to remove ${adminEmail} from the team?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('admin_profiles')
                .delete()
                .eq('id', adminId);

            if (error) throw error;

            // Remove from local state immediately
            setAdminProfiles(prev => prev.filter(admin => admin.id !== adminId));
        } catch (error: any) {
            console.error('Error deleting admin:', error);
            alert('Failed to remove team member');
        }
    };



    return (
        <div className="space-y-8">
            {/* Header with animation */}
            <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                            Team Management
                        </h1>
                    </div>
                    <p className="text-gray-600">Manage and invite team members to join your organization</p>
                </div>
            </motion.div>


            {/* Team Members List */}
            {loading ? (
                <motion.div
                    className="grid md:grid-cols-2 gap-6"
                >
                    {[1, 2, 3, 4].map((i) => (
                        <motion.div key={i} className="card p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 animate-pulse"></div>
                                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 animate-pulse"></div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : adminProfiles.length === 0 ? (
                <motion.div
                    className="card p-12 text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No team members found</p>
                    <p className="text-gray-400 text-sm mb-6">Start by inviting your first team member</p>
                    <motion.button
                        onClick={() => setShowInviteModal(true)}
                        className="btn btn-primary mx-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Invite Your First Member
                    </motion.button>
                </motion.div>
            ) : (
                <StaggeredList className="grid md:grid-cols-2 gap-6">
                    {adminProfiles.map((admin) => (
                        <StaggeredItem key={admin.id}>
                            <motion.div
                                className="card p-6 hover:shadow-lg transition-all duration-300 hover:border-primary-300"
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <motion.div
                                            className="relative"
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                {admin.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            {admin.is_active && (
                                                <motion.div
                                                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                </motion.div>
                                            )}
                                        </motion.div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg">{admin.full_name}</h3>
                                                <motion.div
                                                    className="relative group"
                                                    whileHover={{ scale: 1.2 }}
                                                >
                                                    {admin.role === 'founder' ? (
                                                        <Crown className="w-4 h-4 text-yellow-500" />
                                                    ) : (
                                                        <Briefcase className="w-4 h-4 text-blue-500" />
                                                    )}
                                                </motion.div>
                                            </div>
                                            <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                                                <Mail className="w-3 h-3" />
                                                {admin.email}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <motion.span
                                                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${admin.is_active
                                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                                                        : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200'
                                                        }`}
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    {admin.is_active ? 'Active' : 'Inactive'}
                                                </motion.span>
                                                <motion.span
                                                    className="px-2 py-0.5 text-xs rounded-full font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200 capitalize"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    {admin.role}
                                                </motion.span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <motion.button
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            whileHover={{ rotate: 90 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <MoreVertical className="w-5 h-5 text-gray-600" />
                                        </motion.button>
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-all z-10 pointer-events-none group-hover:pointer-events-auto">
                                            <motion.button
                                                onClick={() => toggleActiveStatus(admin.id, admin.is_active)}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 first:rounded-t-lg transition-colors"
                                                whileHover={{ x: 5 }}
                                            >
                                                {admin.is_active ? (
                                                    <>
                                                        <UserX className="w-4 h-4" />
                                                        Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-4 h-4" />
                                                        Activate
                                                    </>
                                                )}
                                            </motion.button>
                                            <motion.button
                                                onClick={() => deleteAdmin(admin.id, admin.email)}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 last:rounded-b-lg transition-colors"
                                                whileHover={{ x: 5 }}
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Remove
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(admin.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </motion.div>
                        </StaggeredItem>
                    ))}
                </StaggeredList>
            )}

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowInviteModal(false)}
                            aria-hidden="true"
                        />

                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-title"
                            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                                <div className="p-6 border-b bg-gradient-to-r from-primary-50 to-accent-50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg">
                                            <UserPlus className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 id="modal-title" className="text-2xl font-display font-bold text-gray-900">
                                            Invite Team Member
                                        </h2>
                                    </div>
                                    <p className="text-gray-600">Send an invitation to join your team</p>
                                </div>

                                <form onSubmit={handleSendInvite} className="p-6 space-y-6">
                                    <AnimatePresence>
                                        {showSuccess ? (
                                            <motion.div
                                                key="success"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="text-center py-8"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                    className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
                                                >
                                                    <CheckCircle className="w-8 h-8 text-white" />
                                                </motion.div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">Invite Sent!</h3>
                                                <p className="text-gray-600">
                                                    We'll send the invitation to <strong>support@nebulasynth.com</strong>
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="form"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="space-y-4"
                                            >
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Email Address *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={inviteForm.email}
                                                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                                        className="input w-full focus:ring-2 focus:ring-primary-500"
                                                        placeholder="team.member@example.com"
                                                        required
                                                        disabled={inviting}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Team Role
                                                    </label>
                                                    <select
                                                        value={inviteForm.role}
                                                        onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as 'founder' | 'staff' })}
                                                        className="input w-full focus:ring-2 focus:ring-primary-500"
                                                        disabled={inviting}
                                                    >
                                                        <option value="staff">Staff Member</option>
                                                        <option value="founder">Founder/Admin</option>
                                                    </select>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        An invitation request will be sent to support for processing.
                                                    </p>
                                                </div>

                                                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-200">
                                                    <p className="font-medium mb-1">How it works:</p>
                                                    <p>1. Enter the team member's email</p>
                                                    <p>2. We'll send a request to support@nebulasynth.com</p>
                                                    <p>3. Support will process the invitation and notify them</p>
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <motion.button
                                                        type="submit"
                                                        className="flex-1 btn btn-primary"
                                                        disabled={inviting}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        {inviting ? (
                                                            <>
                                                                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send className="w-5 h-5 mr-2" />
                                                                Send Invite Request
                                                            </>
                                                        )}
                                                    </motion.button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowInviteModal(false)}
                                                        className="btn bg-gray-100 hover:bg-gray-200 text-gray-800"
                                                        disabled={inviting}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};