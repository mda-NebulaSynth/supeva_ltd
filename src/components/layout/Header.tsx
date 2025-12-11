import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Building2, Users, BookOpen, Phone, LogIn, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isOpen && !target.closest('nav') && !target.closest('button[aria-label="Toggle menu"]')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const navLinks = [
        { to: '/', label: 'Home', icon: Home },
        { to: '/projects', label: 'Projects', icon: Building2 },
        { to: '/about', label: 'About Us', icon: Users },
        { to: '/blog', label: 'Blog', icon: BookOpen },
        { to: '/contact', label: 'Contact', icon: Phone },
    ];

    return (
        <>
            {/* Header Container */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                        ? 'bg-white/95 backdrop-blur-lg shadow-md border-b border-gray-200'
                        : 'bg-white md:bg-transparent'
                    }`}
            >
                <nav className="container-custom">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo - Mobile Optimized */}
                        <Link 
                            to="/" 
                            className="flex items-center space-x-2.5 group active:scale-95 transition-transform"
                            aria-label="Supeva Home"
                        >
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-sm">
                                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl md:text-2xl font-bold font-display text-gray-900">
                                    Supeva
                                </span>
                                <span className="text-xs text-gray-500 font-medium -mt-1 hidden md:block">
                                    Real Estate
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = location.pathname === link.to;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${isActive
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : isScrolled
                                                    ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                                                    : 'text-gray-900 hover:bg-white/80 hover:text-blue-700'
                                            }`}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{link.label}</span>
                                    </Link>
                                );
                            })}
                            {user ? (
                                <>
                                    <Link
                                        to="/admin"
                                        className="ml-4 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span className="text-sm font-medium">Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="ml-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                        aria-label="Sign out"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm font-medium">Logout</span>
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="ml-4 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                    aria-label="Login"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span className="text-sm font-medium">Login</span>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`md:hidden p-2.5 rounded-lg transition-all duration-200 ${isOpen
                                    ? 'bg-blue-600 text-white'
                                    : isScrolled
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            aria-label={isOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isOpen}
                        >
                            {isOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Navigation Overlay */}
                    {isOpen && (
                        <>
                            {/* Backdrop */}
                            <div 
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                                onClick={() => setIsOpen(false)}
                                aria-hidden="true"
                            />
                            
                            {/* Menu Panel */}
                            <div className="fixed top-16 right-0 left-0 z-50 md:hidden animate-slide-down">
                                <div className="bg-white rounded-b-2xl shadow-xl mx-4 border border-gray-200 overflow-hidden">
                                    <div className="p-4 space-y-1">
                                        {/* User Info (if logged in) */}
                                        {user && (
                                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-medium text-sm">
                                                                {user.email?.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {user.email}
                                                            </p>
                                                            <p className="text-xs text-gray-500">Administrator</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Navigation Links */}
                                        {navLinks.map((link) => {
                                            const Icon = link.icon;
                                            const isActive = location.pathname === link.to;
                                            return (
                                                <Link
                                                    key={link.to}
                                                    to={link.to}
                                                    className={`flex items-center justify-between px-4 py-3.5 rounded-lg transition-all duration-200 ${isActive
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    aria-current={isActive ? 'page' : undefined}
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                                                        </div>
                                                        <span className="font-medium">{link.label}</span>
                                                    </div>
                                                    {isActive ? (
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </Link>
                                            );
                                        })}

                                        {/* Auth Buttons */}
                                        <div className="pt-4 border-t border-gray-200 space-y-2">
                                            {user ? (
                                                <>
                                                    <Link
                                                        to="/admin"
                                                        className="flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors active:scale-95"
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        <LayoutDashboard className="w-5 h-5" />
                                                        <span>Admin Dashboard</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            handleSignOut();
                                                            setIsOpen(false);
                                                        }}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors active:scale-95"
                                                        aria-label="Sign out"
                                                    >
                                                        <LogOut className="w-5 h-5" />
                                                        <span>Sign Out</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <Link
                                                    to="/login"
                                                    className="flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors active:scale-95"
                                                    onClick={() => setIsOpen(false)}
                                                    aria-label="Login"
                                                >
                                                    <LogIn className="w-5 h-5" />
                                                    <span>Admin Login</span>
                                                </Link>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="pt-4 text-center">
                                            <p className="text-xs text-gray-500">
                                                © {new Date().getFullYear()} Supeva Real Estate
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </nav>
            </header>

            {/* Spacer for fixed header - ONLY on mobile */}
            <div className="h-16 md:hidden"></div>
        </>
    );
};