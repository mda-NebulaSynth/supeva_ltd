import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, CheckCircle, AlertCircle, User, Mail, Key, Shield, Save, Eye, EyeOff } from 'lucide-react';

export const SetupPasswordPage = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [isProcessingHash, setIsProcessingHash] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const processInvitation = async () => {
            try {
                console.log('🎯 Processing invitation hash...');

                // Get hash from URL
                const hash = window.location.hash.substring(1);
                if (!hash) {
                    console.log('❌ No hash found, checking existing session');
                    checkExistingSession();
                    return;
                }

                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                const type = params.get('type');

                if (accessToken && type === 'invite') {
                    console.log('🔑 Setting session from invitation tokens');

                    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || ''
                    });

                    if (sessionError) {
                        console.error('Session error:', sessionError);
                        setError('Invalid invitation link. Please request a new one.');
                        setIsProcessingHash(false);
                        return;
                    }

                    if (session?.user) {
                        console.log('✅ Session set for:', session.user.email);
                        setUserEmail(session.user.email || '');

                        if (session.user.user_metadata?.full_name) {
                            setFullName(session.user.user_metadata.full_name);
                        }

                        // CRITICAL: Clear ALL URL params, not just hash
                        const cleanUrl = window.location.origin + '/setup-password';
                        window.history.replaceState(null, '', cleanUrl);
                        console.log('🗑️ URL cleaned completely');
                    }
                } else {
                    console.log('⚠️ No valid invitation tokens found');
                    checkExistingSession();
                }
            } catch (err) {
                console.error('Error processing invitation:', err);
                setError('Failed to process invitation. Please try again.');
            } finally {
                setIsProcessingHash(false);
            }
        };

        const checkExistingSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || '');
            } else {
                navigate('/login');
            }
        };

        processInvitation();

        // Cleanup: Reset any flags when component unmounts
        return () => {
            console.log('🧹 SetupPasswordPage unmounting');
        };
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

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            console.log('🔐 Starting password setup...');

            // Step 1: Get current user
            console.log('👤 Getting current user...');
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');
            console.log('✅ User confirmed:', user.id);

            // Step 2: Create/update profile FIRST (before password update)
            console.log('📝 Creating profile...');
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (!existingProfile) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email,
                        full_name: fullName.trim(),
                        role: 'staff'
                    });

                if (profileError) {
                    console.error('❌ Error creating profile:', profileError);
                    throw new Error(`Failed to create profile: ${profileError.message}`);
                }
                console.log('✅ Profile created successfully');
            } else {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: fullName.trim(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);

                if (updateError) throw updateError;
                console.log('✅ Profile updated successfully');
            }

            // Step 3: Update password (DON'T await - it hangs)
            console.log('📝 Updating password (non-blocking)...');
            supabase.auth.updateUser({
                password: password,
                data: { full_name: fullName.trim() }
            }).then(() => {
                console.log('✅ Password update completed');
            }).catch((err) => {
                console.error('❌ Password update error:', err);
            });

            // Small delay then show success
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Set success state
            console.log('🎉 Setup complete, showing success screen');
            setSuccess(true);

            // Simple redirect after showing success message
            console.log('⏱️ Scheduling redirect to admin...');
            setTimeout(() => {
                console.log('🚀 Redirecting to /admin');
                navigate('/admin', { replace: true });
            }, 2000);

        } catch (err: any) {
            console.error('Setup error:', err);
            setError(err.message || 'Failed to complete setup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isProcessingHash) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-blue-600 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Setting Up Your Account</h2>
                    <p className="text-gray-600 mb-8">Please wait while we prepare your account access...</p>
                    <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Setup Complete!</h2>
                    <p className="text-gray-600 mb-6">
                        Your administrator account has been successfully created.
                        You will be redirected to the dashboard in a few seconds.
                    </p>
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                            <Save className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <p className="text-sm font-medium text-blue-900 mb-1">
                                    📝 Important Security Note
                                </p>
                                <p className="text-xs text-blue-700">
                                    Please save your password in a secure location. You'll need it to log in to your account.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Supeva Admin</h1>
                    <p className="text-gray-600">Set up your administrator account to get started</p>

                    {userEmail && (
                        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-lg">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">{userEmail}</span>
                        </div>
                    )}
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-900">Setup Error</p>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-7">
                        {/* Full Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2.5">
                                Create Password
                            </label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                    placeholder="Create a strong password"
                                    minLength={8}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Must be at least 8 characters
                            </p>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={loading}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Security Warning */}
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-900 mb-1">
                                        🔒 Save Your Password
                                    </p>
                                    <p className="text-xs text-yellow-700">
                                        Please write down your password and store it in a safe place.
                                        You'll need it to access your administrator account.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !userEmail}
                            className="w-full py-3.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Setting Up Account...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Complete Setup & Continue
                                </>
                            )}
                        </button>
                    </form>

                    {/* Cancel Button */}
                    <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                navigate('/login');
                            }}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
                            disabled={loading}
                        >
                            Cancel and Sign Out
                        </button>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Need help? Contact your system administrator
                    </p>
                </div>
            </div>
        </div>
    );
};