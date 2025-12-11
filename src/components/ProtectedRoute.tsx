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
    const [checkingProfile, setCheckingProfile] = useState(false);
    const [hasCheckedForNewUser, setHasCheckedForNewUser] = useState(false);

    console.log('🔐 ProtectedRoute - loading:', loading, 'user:', user?.id, 'profile:', profile?.id, 'path:', location.pathname);

    // 1. Handle invitation redirects (only once)
    useEffect(() => {
        if (hasCheckedForNewUser) return;

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

        setHasCheckedForNewUser(true);
    }, [navigate, location.pathname, hasCheckedForNewUser]);

    // 2. Special handling for users who just completed setup
    useEffect(() => {
        if (user && !loading && !profile && !checkingProfile) {
            // If user exists but no profile, check if they just completed setup
            const checkForNewProfile = async () => {
                setCheckingProfile(true);
                console.log('🔄 Checking for newly created profile...');

                // First, force refresh the profile in AuthContext
                await refreshProfile();

                // Wait a moment for state to update
                await new Promise(resolve => setTimeout(resolve, 500));

                // If still no profile, do a direct check
                if (!profile) {
                    const { data: directProfile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (directProfile) {
                        console.log('✅ Found new profile, refreshing page');
                        window.location.reload(); // Force full refresh to update all state
                        return;
                    }
                }

                setCheckingProfile(false);
            };

            checkForNewProfile();
        }
    }, [user, loading, profile, checkingProfile, refreshProfile]);

    // 3. Combined loading state
    if (loading || checkingProfile) {
        console.log('⏳ ProtectedRoute - Showing loading state');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    </div>
                    <p className="text-gray-600 font-medium">Loading your account...</p>
                    <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
                </div>
            </div>
        );
    }

    // 4. No user = redirect to login
    if (!user) {
        console.log('🔒 No user, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 5. User exists but no profile (after all checks)
    if (!profile) {
        console.log('🚫 No profile found after all checks');

        // Don't show error immediately - give it one more chance
        const giveProfileAnotherChance = async () => {
            const { data: finalCheck } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (finalCheck) {
                console.log('✅ Found profile on final check, reloading');
                window.location.reload();
                return null;
            }

            // Only show error after all checks fail
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                    Account Setup Required
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Your account needs to be set up by an administrator.
                                    Please contact your system administrator.
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
        };

        // This will trigger the async check and potentially reload
        const result = giveProfileAnotherChance();
        if (result) return result;

        return null; // Return null while async check runs
    }

    // 6. Role-based access checks
    if (requireFounder && !isFounder && !isDeveloper) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                                <AlertTriangle className="w-8 h-8 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Founder Access Required
                            </h2>
                            <p className="text-gray-600 mb-6">
                                This section requires founder-level permissions.
                            </p>
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
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                                <AlertTriangle className="w-8 h-8 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Permission Required
                            </h2>
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

    // 7. All checks passed
    console.log('✅ ProtectedRoute - All checks passed');
    return children ? <>{children}</> : <Outlet />;
};