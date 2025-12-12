import { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, type AdminRole } from '../contexts/AuthContext';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    requiredRole?: AdminRole;
    requireFounder?: boolean;
}

export const ProtectedRoute = ({ children, requiredRole, requireFounder = false }: ProtectedRouteProps) => {
    const { user, profile, loading, isDeveloper, isFounder, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [retryCount, setRetryCount] = useState(0);
    const [hasAttemptedRetry, setHasAttemptedRetry] = useState(false);

    console.log('🔐 ProtectedRoute - loading:', loading, 'user:', user?.id, 'profile:', profile?.id, 'path:', location.pathname);

    // Handle new user invitations - run only once
    useEffect(() => {
        const hash = window.location.hash;
        const params = new URLSearchParams(window.location.search);
        const isInvitation =
            (hash && hash.includes('access_token') && hash.includes('type=invite')) ||
            (params.has('access_token') && params.get('type') === 'invite');

        if (isInvitation && !location.pathname.includes('/setup-password')) {
            console.log('🔗 Redirecting new user to setup');
            window.history.replaceState({}, '', '/setup-password');
            navigate('/setup-password', { replace: true });
        }
    }, []); // Empty dependency - run only once

    // Try to fetch profile ONCE if we have user but no profile
    useEffect(() => {
        if (user && !loading && !profile && !hasAttemptedRetry && retryCount === 0) {
            setHasAttemptedRetry(true);

            const retryProfileFetch = async () => {
                console.log('🔄 Retrying profile fetch...');
                await refreshProfile();
                setRetryCount(1);
            };

            const timer = setTimeout(retryProfileFetch, 1000);
            return () => clearTimeout(timer);
        }
    }, [user, loading, profile, hasAttemptedRetry, retryCount, refreshProfile]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        console.log('🔒 No user, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!profile) {
        // Show error after retry attempt
        if (retryCount >= 1) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200">
                            <div className="flex flex-col items-center text-center">
                                <AlertTriangle className="w-16 h-16 text-red-600 mb-6" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">Account Setup Required</h2>
                                <p className="text-gray-600 mb-6">
                                    Your account needs to be set up. Please contact your administrator.
                                </p>
                                <div className="space-y-3 w-full">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={async () => {
                                            await supabase.auth.signOut();
                                            navigate('/login');
                                        }}
                                        className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Still retrying
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading your profile...</p>
                    <p className="text-gray-400 text-sm mt-2">Please wait</p>
                </div>
            </div>
        );
    }

    // Role checks
    if (requireFounder && !isFounder && !isDeveloper) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-200">
                        <div className="flex flex-col items-center text-center">
                            <AlertTriangle className="w-16 h-16 text-orange-600 mb-6" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Founder Access Required</h2>
                            <button
                                onClick={() => navigate('/admin')}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (requiredRole && profile.role !== requiredRole && !isDeveloper) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-200">
                        <div className="flex flex-col items-center text-center">
                            <AlertTriangle className="w-16 h-16 text-purple-600 mb-6" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Permission Required</h2>
                            <p className="text-gray-600 mb-6">
                                You need <span className="font-semibold text-purple-600">{requiredRole}</span> role
                                to access this page.
                            </p>
                            <button
                                onClick={() => navigate('/admin')}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    console.log('✅ ProtectedRoute - All checks passed');
    return children ? <>{children}</> : <Outlet />;
};