import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, CheckCircle, AlertCircle, User, Mail } from 'lucide-react';

export const SetupPasswordPage = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                console.log('🔗 Initializing auth from URL...');

                // Get the current URL
                const currentUrl = window.location.href;
                console.log('Current URL:', currentUrl);

                // Parse the hash from the URL
                const hashIndex = currentUrl.indexOf('#');
                let accessToken: string | null = null;
                let refreshToken: string | null = null;
                let tokenType: string | null = null;

                if (hashIndex !== -1) {
                    const hash = currentUrl.substring(hashIndex + 1);
                    console.log('Hash found:', hash.substring(0, 50) + '...');

                    // Parse hash parameters
                    const params = new URLSearchParams(hash);
                    accessToken = params.get('access_token');
                    refreshToken = params.get('refresh_token');
                    tokenType = params.get('type');

                    console.log('Access token present:', !!accessToken);
                    console.log('Token type:', tokenType);
                }

                // If we have an access token, set the session
                if (accessToken && refreshToken) {
                    console.log('🔄 Setting session with tokens...');
                    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });

                    if (sessionError) {
                        console.error('Session error:', sessionError);
                        setError('Invalid invitation link. Please request a new one.');
                        return;
                    }

                    if (session?.user) {
                        console.log('✅ Session set, user:', session.user.email);
                        setUserEmail(session.user.email || '');

                        // Pre-fill name from user metadata if available
                        if (session.user.user_metadata?.full_name) {
                            setFullName(session.user.user_metadata.full_name);
                        }

                        // Clean the URL - remove the hash
                        window.history.replaceState(null, '', '/setup-password');
                        console.log('🗑️ URL cleaned');
                    }
                } else {
                    // No tokens in URL, check if user is already logged in
                    console.log('🔍 No tokens in URL, checking existing session...');
                    const { data: { user } } = await supabase.auth.getUser();

                    if (user) {
                        console.log('✅ User already logged in:', user.email);
                        setUserEmail(user.email || '');
                    } else {
                        console.log('❌ No user found, redirecting to login');
                        navigate('/login');
                        return;
                    }
                }
            } catch (error) {
                console.error('Initialization error:', error);
                setError('Failed to initialize. Please try again.');
            } finally {
                setInitializing(false);
            }
        };

        initializeAuth();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!fullName.trim()) {
            setError('Please enter your full name');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            console.log('🔄 Starting password setup...');

            // 1. Update user password
            const { error: passwordError } = await supabase.auth.updateUser({
                password: password,
                data: { full_name: fullName.trim() }
            });

            if (passwordError) {
                console.error('Password update error:', passwordError);
                throw passwordError;
            }

            console.log('✅ Password updated');

            // 2. Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User not found after password update');
            }

            console.log('👤 User:', user.email);

            // 3. Check if profile already exists
            const { data: existingProfile } = await supabase
                .from('admin_profiles')
                .select('*')
                .eq('email', user.email)
                .single();

            console.log('📊 Existing profile:', existingProfile ? 'Yes' : 'No');

            if (!existingProfile) {
                // 4. Create admin profile for this user
                console.log('➕ Creating new admin profile...');
                const { error: profileError } = await supabase
                    .from('admin_profiles')
                    .insert({
                        user_id: user.id,
                        email: user.email,
                        full_name: fullName.trim(),
                        role: 'staff',
                        is_active: true,
                        is_developer: false,
                        invited_at: new Date().toISOString(),
                        accepted_at: new Date().toISOString(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                    // Check if it's a duplicate error
                    if (!profileError.message.includes('duplicate key')) {
                        throw profileError;
                    }
                    console.log('⚠️ Duplicate profile, continuing...');
                } else {
                    console.log('✅ Admin profile created');
                }
            } else {
                // Profile exists, update it with the name
                console.log('✏️ Updating existing profile...');
                const { error: updateError } = await supabase
                    .from('admin_profiles')
                    .update({
                        full_name: fullName.trim(),
                        accepted_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingProfile.id);

                if (updateError) {
                    console.error('Profile update error:', updateError);
                } else {
                    console.log('✅ Profile updated');
                }
            }

            // 5. Success!
            console.log('🎉 Setup complete!');
            setSuccess(true);

            // 6. Redirect to admin after 2 seconds
            setTimeout(() => {
                navigate('/admin');
            }, 2000);

        } catch (err: any) {
            console.error('Setup error:', err);
            setError(err.message || 'Failed to complete setup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
                <div className="max-w-md w-full card-glass p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Initializing...</h2>
                    <p className="text-gray-600 mb-6">Setting up your invitation...</p>
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-primary-50">
                <div className="max-w-md w-full card-glass p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Setup Complete!</h2>
                    <p className="text-gray-600 mb-2">Your account has been successfully configured.</p>
                    <p className="text-gray-500 text-sm mb-6">Redirecting to admin dashboard...</p>
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 p-4">
            <div className="max-w-md w-full card-glass p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Complete Your Setup</h2>
                    <p className="text-gray-600">Finish setting up your administrator account</p>

                    {userEmail && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-800">{userEmail}</span>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="input pl-11"
                                placeholder="Enter your full name"
                                autoComplete="name"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input pl-11"
                                placeholder="Minimum 6 characters"
                                minLength={6}
                                autoComplete="new-password"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input pl-11"
                                placeholder="Re-enter your password"
                                autoComplete="new-password"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-2">
                        <p className="font-medium">Requirements:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>At least 6 characters</li>
                            <li>Make it memorable but secure</li>
                            <li>Your name will be displayed in the admin panel</li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !userEmail}
                        className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Completing Setup...
                            </>
                        ) : (
                            'Complete Setup & Continue'
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            navigate('/login');
                        }}
                        className="text-sm text-gray-600 hover:text-primary-600"
                        disabled={loading}
                    >
                        Cancel and Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};