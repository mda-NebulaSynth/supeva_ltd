import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { SEO } from '../components/SEO';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // const [rememberMe, setRememberMe] = useState(false);

    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await signIn(email, password);
            if (error) {
                setError(error.message);
            } else {
                navigate('/admin');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SEO title="Login - Supeva Sandbox" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                <LogIn className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Supeva Admin</h1>
                        <p className="text-gray-600">Enter your credentials to access the dashboard</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        {error && (
                            <div className="mb-7 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-red-900">Login Failed</p>
                                        <p className="text-sm text-red-700 mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    {/* <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        Forgot password?
                                    </Link> */}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={loading}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me Checkbox */}
                            {/* <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled={loading}
                                />
                                <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700">
                                    Remember this device for 30 days
                                </label>
                            </div> */}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        Sign In to Dashboard
                                    </>
                                )}
                            </button>

                            {/* Security Note */}
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-blue-700 text-center">
                                    🔐 For security, please log out when using shared devices
                                </p>
                            </div>
                        </form>

                        {/* Back to Home Link */}
                        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors px-4 py-2.5 rounded-lg hover:bg-gray-100"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Homepage
                            </Link>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-500">
                            Having trouble logging in? Contact your administrator
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            © {new Date().getFullYear()} Supeva Admin. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};