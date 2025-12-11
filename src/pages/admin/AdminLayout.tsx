import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    ChevronRight,
    Home,
    User,
    Mail,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, user, profile, isDeveloper, isFounder, isStaff } = useAuth();

    // Detect mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-close sidebar on mobile when route changes
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (sidebarOpen && isMobile && !target.closest('aside') && !target.closest('button[aria-label="Toggle sidebar"]')) {
                setSidebarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sidebarOpen, isMobile]);

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
        if (isDeveloper) return { color: 'bg-purple-100 text-purple-800 border-purple-200', text: 'Developer', icon: Shield };
        if (isFounder) return { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Founder', icon: Shield };
        if (isStaff) return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Staff', icon: Users };
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Unknown', icon: Users };
    };

    const roleBadge = getRoleBadge();
    const RoleIcon = roleBadge.icon;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header - Fixed */}
            <motion.header
                className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-200"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="h-full px-4 sm:px-6 flex items-center justify-between">
                    {/* Left: Menu Button & Logo */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={`p-2 rounded-lg transition-colors ${sidebarOpen && isMobile ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
                            aria-label="Toggle sidebar"
                            aria-expanded={sidebarOpen}
                        >
                            {sidebarOpen && isMobile ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>
                        <Link to="/" className="flex items-center gap-2 group" aria-label="Go to homepage">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
                                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg sm:text-xl font-bold font-display text-gray-900 leading-tight">Supeva</span>
                                <span className="text-xs text-gray-500 -mt-1 hidden sm:block">Admin Panel</span>
                            </div>
                        </Link>
                    </div>

                    {/* Right: User Info & Sign Out */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Desktop User Info */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                                    {profile?.full_name || user?.email?.split('@')[0]}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[180px]">{user?.email}</div>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${roleBadge.color} text-xs font-medium border`}>
                                <RoleIcon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{roleBadge.text}</span>
                            </div>
                        </div>

                        {/* Mobile User Info Dropdown */}
                        <div className="md:hidden relative">
                            <button
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200"
                                aria-label="User menu"
                                onClick={() => {
                                    // Show mobile user info or open dropdown
                                    const userInfo = document.getElementById('mobile-user-info');
                                    if (userInfo) {
                                        userInfo.classList.toggle('hidden');
                                    }
                                }}
                            >
                                <User className="w-4 h-4 text-blue-600" />
                            </button>
                            <div id="mobile-user-info" className="hidden absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-medium text-sm">
                                            {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {profile?.full_name || user?.email}
                                        </p>
                                        <p className="text-xs text-gray-500">Administrator</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${roleBadge.color} text-xs font-medium border mb-3 justify-center`}>
                                    <RoleIcon className="w-3.5 h-3.5" />
                                    {roleBadge.text} Role
                                </div>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <motion.button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 active:scale-95"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            aria-label="Sign out"
                        >
                            <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* Sidebar */}
            <AnimatePresence>
                {(sidebarOpen || !isMobile) && (
                    <>
                        {/* Mobile Backdrop */}
                        {isMobile && (
                            <motion.div
                                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSidebarOpen(false)}
                            />
                        )}

                        {/* Sidebar Panel */}
                        <motion.aside
                            className={`fixed left-0 top-16 bottom-0 w-64 bg-white shadow-xl z-40 border-r border-gray-200 lg:translate-x-0 lg:z-30 ${isMobile ? 'overflow-y-auto' : ''}`}
                            initial={isMobile ? { x: '-100%' } : false}
                            animate={{ x: 0 }}
                            exit={isMobile ? { x: '-100%' } : undefined}
                            transition={{ duration: 0.3, type: 'tween' }}
                        >
                            {/* User Info for Mobile */}
                            <div className="md:hidden p-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-medium text-sm">
                                            {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {profile?.full_name || user?.email}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="w-3 h-3 text-gray-400" />
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full ${roleBadge.color} text-xs font-medium border justify-center`}>
                                    <RoleIcon className="w-3.5 h-3.5" />
                                    {roleBadge.text} Role
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="p-4 space-y-1">
                                {visibleNavItems.map((item, index) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path || 
                                                    (item.path !== '/admin' && location.pathname.startsWith(item.path));

                                    return (
                                        <motion.div
                                            key={item.path}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                to={item.path}
                                                className={`flex items-center justify-between px-3 py-3 rounded-lg transition-all ${isActive
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                                    }`}
                                                onClick={() => isMobile && setSidebarOpen(false)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                                                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                                                    </div>
                                                    <span className="font-medium text-sm">{item.label}</span>
                                                </div>
                                                {isActive ? (
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                )}
                                            </Link>
                                        </motion.div>
                                    );
                                })}

                                {/* Home Link */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: visibleNavItems.length * 0.05 }}
                                >
                                    <Link
                                        to="/"
                                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all mt-4 border-t border-gray-200 pt-4"
                                        onClick={() => isMobile && setSidebarOpen(false)}
                                    >
                                        <Home className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-sm">Back to Website</span>
                                    </Link>
                                </motion.div>
                            </nav>

                            {/* Version/Footer */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500 text-center">
                                    Admin v1.0 • {new Date().getFullYear()}
                                </p>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className={`pt-16 min-h-screen transition-all duration-300 ${!isMobile && sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
                <div className="p-4 sm:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};