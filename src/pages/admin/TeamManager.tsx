import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { MediaUpload } from '../../components/MediaUpload';
import { deleteImageFromStorage } from '../../utils/storageCleanup';
import { useManagerData } from '../../hooks/useManagerData';

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];
type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update'];

export const TeamManager = () => {
    const { data: members, loading, refetch, mountedRef } = useManagerData<TeamMember>(
        async () => {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        'TeamManager'
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    const [formData, setFormData] = useState<TeamMemberInsert>({
        name: '',
        role: '',
        bio: '',
        image: '',
        email: '',
        phone: '',
        managed_by: null
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            console.log('💾 Saving team member...');

            if (editingMember) {
                const payload: TeamMemberUpdate = {
                    ...formData,
                };

                // Use type assertion to fix TypeScript error
                const { error } = await (supabase
                    .from('team_members') as any)
                    .update(payload)
                    .eq('id', editingMember.id);

                if (error) throw error;
                console.log('✅ Team member updated');
            } else {
                const payload: TeamMemberInsert = {
                    ...formData,
                };

                const { error } = await (supabase
                    .from('team_members') as any)
                    .insert([payload]);

                if (error) throw error;
                console.log('✅ Team member created');
            }

            if (!mountedRef.current) return;

            setShowModal(false);
            setEditingMember(null);
            resetForm();
            await refetch();
        } catch (error) {
            console.error('❌ Error saving team member:', error);
            if (mountedRef.current) {
                alert('Failed to save team member');
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team member?')) return;

        try {
            console.log('🗑️ Deleting team member...');
            const member = members.find(m => m.id === id);

            if (member?.image) {
                await deleteImageFromStorage(member.image);
            }

            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('id', id);

            if (error) throw error;
            console.log('✅ Team member deleted');

            if (!mountedRef.current) return;
            await refetch();
        } catch (error) {
            console.error('❌ Error deleting team member:', error);
            if (mountedRef.current) {
                alert('Failed to delete team member');
            }
        }
    };

    const handleEdit = (member: TeamMember) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            role: member.role,
            bio: member.bio,
            image: member.image,
            email: member.email,
            phone: member.phone,
            managed_by: member.managed_by
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            role: '',
            bio: '',
            image: '',
            email: '',
            phone: '',
            managed_by: null
        });
    };

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
                    <p className="text-gray-600 mt-2">Manage your team members</p>
                </div>
                <button
                    onClick={() => {
                        setEditingMember(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="btn btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    Add Team Member
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search team members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Team Members Grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                            <div className="h-64 bg-gray-200 rounded-t-xl"></div>
                            <div className="p-6 space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                    <p className="text-xl text-gray-500">No team members found</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map((member) => (
                        <div key={member.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-64 object-cover"
                            />
                            <div className="p-6">
                                <div className="mb-3">
                                    <span className="text-sm text-gray-500">
                                        Added: {new Date(member.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {member.name}
                                </h3>
                                <p className="text-primary-600 text-sm font-medium mb-3">
                                    {member.role}
                                </p>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {member.bio}
                                </p>
                                <div className="text-xs text-gray-500 mb-4 space-y-1">
                                    <div className="truncate">{member.email}</div>
                                    <div>{member.phone}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(member)}
                                        className="flex-1 btn btn-secondary text-sm"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member.id)}
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
                    <div className="bg-white rounded-2xl max-w-2xl w-full my-8">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold">
                                {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        placeholder="e.g., CEO, Sales Manager"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bio *
                                </label>
                                <textarea
                                    required
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <MediaUpload
                                    images={formData.image ? [formData.image] : []}
                                    videos={[]}
                                    onImagesChange={(images) => setFormData({ ...formData, image: images[0] || '' })}
                                    onVideosChange={() => { }}
                                    maxMedia={1}
                                    maxFileSizeMB={0.3}
                                    bucketName="team"
                                    showVideos={false}
                                />
                                {!formData.image && (
                                    <p className="text-xs text-red-500 mt-1">* Profile photo is required</p>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingMember(null);
                                        resetForm();
                                    }}
                                    className="flex-1 btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 btn btn-primary">
                                    {editingMember ? 'Update Member' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};