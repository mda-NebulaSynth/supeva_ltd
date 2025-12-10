import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, type AdminRole } from '../contexts/AuthContext';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    requiredRole?: AdminRole;
    requireFounder?: boolean;
}

export const ProtectedRoute = ({ children, requiredRole, requireFounder = false }: ProtectedRouteProps) => {
    const { user, profile, loading, isDeveloper, isFounder, isActiveAdmin } = useAuth();
    const navigate = useNavigate();

    console.log('🔐 ProtectedRoute - loading:', loading, 'user:', user?.id, 'profile:', profile?.id, 'isDeveloper:', isDeveloper, 'isFounder:', isFounder, 'isActiveAdmin:', isActiveAdmin);

<<<<<<< HEAD
    // Check for hash invitation at the VERY BEGINNING (before any other logic)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token') && hash.includes('type=invite')) {
        console.log('🔗 Hash invitation detected, redirecting to setup');
        // Convert hash to query params for easier handling
        const params = new URLSearchParams(hash.substring(1));
        const newUrl = `/setup-password?${params.toString()}`;
        
        // Replace URL and redirect
        window.history.replaceState({}, '', newUrl);
        navigate('/setup-password', { replace: true });
        return null;
    }

=======
>>>>>>> 5241935401d2f0b5c2c1e69037a667e4c9d7abc7
    // Check if user just accepted invitation (no password set yet)
    useEffect(() => {
        if (user && !loading && !profile) {
            // Check if this is a new invited user by looking for access token in URL
<<<<<<< HEAD
            const currentHash = window.location.hash;
            const params = new URLSearchParams(window.location.search);

            const hasAccessToken = currentHash.includes('access_token') || params.has('access_token');
=======
            const hash = window.location.hash;
            const params = new URLSearchParams(window.location.search);

            const hasAccessToken = hash.includes('access_token') || params.has('access_token');
>>>>>>> 5241935401d2f0b5c2c1e69037a667e4c9d7abc7
            const hasTypeInvite = params.get('type') === 'invite';

            if (hasAccessToken || hasTypeInvite) {
                console.log('🎯 New invited user detected, redirecting to setup-password');
                // Clear the URL hash/query to prevent infinite redirects
                window.history.replaceState(null, '', '/setup-password');
                navigate('/setup-password', { replace: true });
                return;
            }
        }
    }, [user, loading, profile, navigate]);

    // Developers bypass all restrictions
    if (isDeveloper && profile) {
        console.log('✅ ProtectedRoute - Developer bypass activated!');
        return children ? <>{children}</> : <Outlet />;
    }

    // Show loading state with timeout protection
    if (loading) {
        console.log('⏳ ProtectedRoute - Loading...');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 transition-opacity duration-300">
                <div className="text-center">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                        <div className="absolute inset-0 animate-ping opacity-20">
                            <Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                        </div>
                    </div>
                    <p className="text-gray-600 font-medium">Authenticating...</p>
                    <p className="text-gray-400 text-sm mt-2">Please wait while we verify your access</p>
                </div>
            </div>
        );
    }

    // If we're redirecting to setup-password, show nothing
    if (user && !profile && (window.location.hash.includes('access_token') || new URLSearchParams(window.location.search).has('access_token'))) {
        return null;
    }

    // Not authenticated - redirect to login
    if (!user) {
        console.log('🔒 ProtectedRoute - No user, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    // No admin profile found (and not a new invite) - show error
    if (!profile) {
        console.log('🚫 ProtectedRoute - No profile found');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
                <div className="max-w-md w-full animate-fade-in">
                    <div className="card p-8 text-center shadow-xl border border-red-200">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <AlertTriangle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Your account doesn't have administrator privileges or may have been deactivated.
                            Please contact a system administrator to request access.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-secondary w-full"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => {
                                    supabase.auth.signOut();
                                    window.location.href = '/';
                                }}
                                className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 w-full"
                            >
                                Sign Out
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-6 pt-6 border-t">
                            User ID: {user.id}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Account is inactive (except developers who already bypassed)
    if (!isActiveAdmin) {
        console.log('🚫 ProtectedRoute - Account inactive');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
                <div className="max-w-md w-full animate-fade-in">
                    <div className="card p-8 text-center shadow-xl border border-yellow-200">
                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <AlertTriangle className="w-10 h-10 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Account Suspended</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Your administrator account has been temporarily suspended.
                            This may be due to inactivity or security reasons.
                        </p>
                        <button
                            onClick={() => {
                                supabase.auth.signOut();
                                window.location.href = '/';
                            }}
                            className="btn btn-primary w-full"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Founder-only route check
    if (requireFounder && !isFounder) {
        console.log('🚫 ProtectedRoute - Founder access required');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
                <div className="max-w-md w-full animate-fade-in">
                    <div className="card p-8 text-center shadow-xl border border-orange-200">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <AlertTriangle className="w-10 h-10 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Elevated Access Required</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            This section requires founder-level permissions. You're currently logged in as {profile.role}.
                        </p>
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="btn btn-primary w-full"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Specific role requirement check
    if (requiredRole && profile.role !== requiredRole) {
        console.log(`🚫 ProtectedRoute - Role mismatch: required ${requiredRole}, have ${profile.role}`);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
                <div className="max-w-md w-full animate-fade-in">
                    <div className="card p-8 text-center shadow-xl border border-purple-200">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <AlertTriangle className="w-10 h-10 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Permission Denied</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            You need <span className="font-semibold text-purple-600">{requiredRole}</span> role to access this page.
                            Your current role is <span className="font-semibold text-gray-700">{profile.role}</span>.
                        </p>
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="btn btn-primary w-full"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // All checks passed - render the protected content
    console.log('✅ ProtectedRoute - All checks passed!');
    return children ? <>{children}</> : <Outlet />;
};