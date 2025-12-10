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
    const [isProcessingHash, setIsProcessingHash] = useState(true);

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

                    // IMPORTANT: Set session WITHOUT waiting for AuthContext
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

                        // Pre-fill name if available
                        if (session.user.user_metadata?.full_name) {
                            setFullName(session.user.user_metadata.full_name);
                        }

                        // CRITICAL: Clean the URL IMMEDIATELY
                        window.history.replaceState(null, '', '/setup-password');
                        console.log('🗑️ URL cleaned');
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
                // No user found, redirect to login
                navigate('/login');
            }
        };

        processInvitation();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation (keep existing)
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
            const { data: existingProfile, error: profileCheckError } = await supabase
                .from('profiles') // ✅ Use 'profiles'
                .select('*')
                .eq('id', user.id) // ✅ Use 'id' column
                .maybeSingle();

            if (profileCheckError && profileCheckError.code !== 'PGRST116') {
                console.error('Profile check error:', profileCheckError);
            }

            console.log('📊 Existing profile:', existingProfile ? 'Yes' : 'No');

            if (!existingProfile) {
                // 4. Create profile for this user
                console.log('➕ Creating new profile...');
                const { error: profileError } = await supabase
                    .from('profiles') // ✅ Use 'profiles'
                    .upsert({
                        id: user.id,           // ✅ Use 'id' which references auth.users.id
                        email: user.email,
                        full_name: fullName.trim(),
                        role: 'staff',
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'id',      // ✅ Conflict on 'id'
                        ignoreDuplicates: false
                    });

                if (profileError) {
                    console.error('Profile creation error:', profileError);

                    // Try with insert instead of upsert
                    const { error: insertError } = await supabase
                        .from('profiles')
                        .insert({
                            id: user.id,
                            email: user.email,
                            full_name: fullName.trim(),
                            role: 'staff'
                        });

                    if (insertError) {
                        console.error('Insert also failed:', insertError);
                        console.log('⚠️ Profile creation failed, but password was set');
                    } else {
                        console.log('✅ Profile created with insert');
                    }
                } else {
                    console.log('✅ Profile created');
                }
            } else {
                // Profile exists, update it
                console.log('✏️ Updating existing profile...');
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: fullName.trim(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id);

                if (updateError) {
                    console.error('Profile update error:', updateError);
                } else {
                    console.log('✅ Profile updated');
                }
            }

            // 5. Verify profile
            console.log('⏳ Verifying profile creation...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            const { data: verifiedProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (verifiedProfile) {
                console.log('✅ Profile verified successfully:', verifiedProfile);
            } else {
                console.log('⚠️ Profile not found after creation attempt');
                // Additional debug: try to fetch all profiles (temporarily)
                const { data: allProfiles } = await supabase
                    .from('profiles')
                    .select('*');
                console.log('📋 All profiles in table:', allProfiles);
            }

            // 6. Success!
            console.log('🎉 Setup complete!');
            setSuccess(true);

            // 7. Redirect to admin
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

    if (isProcessingHash) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
                <div className="max-w-md w-full card-glass p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Processing Invitation...</h2>
                    <p className="text-gray-600 mb-6">Setting up your account access</p>
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