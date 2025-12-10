import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Building2,
    FileText,
    Users,
    Image,
    MessageSquare,
    Star,
    LogOut,
    Menu,
    X,
    Clock,
    Shield,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fadeInLeft } from '../../utils/animations';
import type { Database } from '../../lib/database.types';

type AdminRole = Database['public']['Tables']['admin_profiles']['Row']['role'];

interface NavItem {
    path: string;
    label: string;
    icon: any;
    requiredRole?: AdminRole | 'founder_only' | 'developer_only';
}

const navItems: NavItem[] = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/projects', label: 'Projects', icon: Building2 },
    { path: '/admin/project-updates', label: 'Project Updates', icon: Clock },
    { path: '/admin/blog', label: 'Blog Posts', icon: FileText },
    { path: '/admin/team', label: 'Public Team', icon: Users },
    { path: '/admin/ads', label: 'Ad Banners', icon: Image },
    { path: '/admin/testimonials', label: 'Testimonials', icon: Star },
    { path: '/admin/contacts', label: 'Contact Submissions', icon: MessageSquare }
];

export const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, user, profile, isDeveloper, isFounder, isStaff } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const visibleNavItems = navItems.filter(item => {
        if (!item.requiredRole) return true;
        if (isDeveloper) return true;
        if (item.requiredRole === 'founder_only') return isFounder;
        if (item.requiredRole === 'developer_only') return isDeveloper;
        return profile?.role === item.requiredRole;
    });

    const getRoleBadge = () => {
        if (isDeveloper) return { color: 'bg-purple-100 text-purple-800', text: 'Developer', icon: Shield };
        if (isFounder) return { color: 'bg-blue-100 text-blue-800', text: 'Founder', icon: Shield };
        if (isStaff) return { color: 'bg-green-100 text-green-800', text: 'Staff', icon: Users };
        return { color: 'bg-gray-100 text-gray-800', text: 'Unknown', icon: Users };
    };

    const roleBadge = getRoleBadge();
    const RoleIcon = roleBadge.icon;

    return (
        <div className="min-h-screen bg-gray-100">
            <motion.header
                className="bg-white shadow-sm fixed top-0 left-0 right-0 z-40 h-16"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="h-full px-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                        >
                            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <Link to="/" className="flex items-center gap-2">
                            <Building2 className="w-8 h-8 text-primary-600" />
                            <span className="text-xl font-display font-bold">Supeva Admin</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">{profile?.full_name || user?.email}</div>
                                <div className="text-xs text-gray-500">{user?.email}</div>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${roleBadge.color} text-xs font-medium`}>
                                <RoleIcon className="w-3.5 h-3.5" />
                                {roleBadge.text}
                            </div>
                        </div>
                        <motion.button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden md:inline">Sign Out</span>
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            <motion.aside
                className={`fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
                initial="hidden"
                animate="visible"
                variants={fadeInLeft}
            >
                <nav className="p-4 space-y-2">
                    {visibleNavItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <motion.div
                                key={item.path}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-primary-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                    {item.requiredRole === 'founder_only' && (
                                        <Shield className="w-4 h-4 ml-auto opacity-50" />
                                    )}
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>
            </motion.aside>

            <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
                <div className="p-6">
                    <Outlet />
                </div>
            </main>

            {sidebarOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};
