import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Building2, Users, BookOpen, Phone, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
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
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const navLinks = [
        { to: '/', label: 'Home', icon: Home },
        { to: '/projects', label: 'Projects', icon: Building2 },
        { to: '/about', label: 'About Us', icon: Users },
        { to: '/blog', label: 'Blog', icon: BookOpen },
        { to: '/contact', label: 'Contact', icon: Phone },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-white/95 backdrop-blur-lg shadow-lg'
                    : 'bg-transparent'
                }`}
        >
            <nav className="container-custom">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-display font-bold gradient-text">
                            Supeva
                        </span>
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
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
                                            ? 'bg-primary-600 text-white'
                                            : isScrolled
                                                ? 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                                                : 'text-gray-900 hover:bg-white/20'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                        {user ? (
                            <>
                                <Link
                                    to="/admin"
                                    className="ml-4 btn btn-secondary"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="btn btn-primary"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="ml-4 btn btn-primary"
                            >
                                <LogIn className="w-4 h-4" />
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-primary-50 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? (
                            <X className="w-6 h-6 text-gray-900" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-900" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-4 animate-slide-down">
                        <div className="flex flex-col space-y-2">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = location.pathname === link.to;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive
                                                ? 'bg-primary-600 text-white'
                                                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                            {user ? (
                                <>
                                    <Link
                                        to="/admin"
                                        className="btn btn-secondary mt-4"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="btn btn-primary"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="btn btn-primary mt-4"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};
