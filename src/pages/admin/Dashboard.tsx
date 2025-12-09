import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, FileText, Users, MessageSquare, TrendingUp, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { StaggeredList, StaggeredItem } from '../../components/animated/StaggeredList';
import { fadeInUp } from '../../utils/animations';

interface DashboardStats {
    totalProjects: number;
    totalBlogPosts: number;
    totalTeamMembers: number;
    totalContacts: number;
}

export const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalProjects: 0,
        totalBlogPosts: 0,
        totalTeamMembers: 0,
        totalContacts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [projects, posts, team, contacts] = await Promise.all([
                    supabase.from('projects').select('*', { count: 'exact', head: true }),
                    supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
                    supabase.from('team_members').select('*', { count: 'exact', head: true }),
                    supabase.from('contact_submissions').select('*', { count: 'exact', head: true })
                ]);

                setStats({
                    totalProjects: projects.count || 0,
                    totalBlogPosts: posts.count || 0,
                    totalTeamMembers: team.count || 0,
                    totalContacts: contacts.count || 0
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            label: 'Total Projects',
            value: stats.totalProjects,
            icon: Building2,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'Blog Posts',
            value: stats.totalBlogPosts,
            icon: FileText,
            color: 'bg-green-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Team Members',
            value: stats.totalTeamMembers,
            icon: Users,
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            label: 'Contact Submissions',
            value: stats.totalContacts,
            icon: MessageSquare,
            color: 'bg-amber-500',
            textColor: 'text-amber-600',
            bgColor: 'bg-amber-50'
        }
    ];

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl font-display font-bold mb-2">Dashboard</h1>
                <p className="text-gray-600">Welcome to your admin dashboard</p>
            </motion.div>

            <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <StaggeredItem key={stat.label}>
                            <motion.div
                                className="card p-6"
                                whileHover={{ y: -5, boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)' }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                                <div className="text-3xl font-bold mb-1">
                                    {loading ? '...' : stat.value}
                                </div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                            </motion.div>
                        </StaggeredItem>
                    );
                })}
            </StaggeredList>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="card p-6"
            >
                <h2 className="text-2xl font-display font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.a
                        href="/admin/projects"
                        className="flex items-center gap-3 p-4 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Building2 className="w-6 h-6 text-primary-600" />
                        <div>
                            <div className="font-semibold">Manage Projects</div>
                            <div className="text-sm text-gray-600">Add or edit properties</div>
                        </div>
                    </motion.a>

                    <motion.a
                        href="/admin/blog"
                        className="flex items-center gap-3 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FileText className="w-6 h-6 text-green-600" />
                        <div>
                            <div className="font-semibold">Create Blog Post</div>
                            <div className="text-sm text-gray-600">Write a new article</div>
                        </div>
                    </motion.a>

                    <motion.a
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Eye className="w-6 h-6 text-purple-600" />
                        <div>
                            <div className="font-semibold">View Website</div>
                            <div className="text-sm text-gray-600">See live site</div>
                        </div>
                    </motion.a>
                </div>
            </motion.div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="card p-6"
            >
                <h2 className="text-2xl font-display font-bold mb-6">Recent Activity</h2>
                <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Activity tracking coming soon</p>
                </div>
            </motion.div>
        </div>
    );
};
