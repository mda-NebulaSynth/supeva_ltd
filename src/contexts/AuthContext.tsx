import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type AdminRole = 'developer' | 'founder' | 'staff';

export interface AdminProfile {
    id: string;
    email: string;
    full_name: string;
    role: AdminRole;
    is_active?: boolean;
    is_developer?: boolean;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: AdminProfile | null;
    loading: boolean;
    isDeveloper: boolean;
    isFounder: boolean;
    isStaff: boolean;
    isActiveAdmin: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: any }>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [stabilizedLoading, setStabilizedLoading] = useState(true); // New: stabilized loading state
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    useEffect(() => {
        let timeoutId: number; // Change from NodeJS.Timeout to number

        if (loading) {
            setStabilizedLoading(true);
        } else {
            // Keep loading visible for at least 300ms to prevent flicker
            timeoutId = window.setTimeout(() => { // Use window.setTimeout
                setStabilizedLoading(false);
            }, 300);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [loading]);

    // Derived states for role checks
    const isDeveloper = profile?.role === 'developer';
    const isFounder = profile?.role === 'founder';
    const isStaff = profile?.role === 'staff';
    const isActiveAdmin = Boolean(profile);

    const fetchProfile = async (userId: string) => {
        try {
            console.log('🔍 Fetching profile for user:', userId);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            console.log('📦 Supabase response - data:', data, 'error:', error);

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('🆕 No profile found for user:', userId);
                } else {
                    console.error('❌ Error fetching profile:', error);
                }
                setProfile(null);
                return;
            }

            if (!data) {
                console.log('⚠️ No profile found for user:', userId);
                setProfile(null);
                return;
            }

            const profileData = data as AdminProfile;
            console.log('✅ Profile fetched successfully:', profileData);

            console.log('🎉 Setting profile state:', profileData);
            setProfile(profileData);
        } catch (error) {
            console.error('💥 Exception in fetchProfile:', error);
            setProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    // Get initial session
    const initializeAuth = async () => {
        try {
            console.log('🔄 Initializing auth...');
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('❌ Error getting session:', error);
            } else {
                console.log('📋 Session retrieved:', session?.user?.id);
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    // Check if this is a new invited user
                    const hash = window.location.hash;
                    const params = new URLSearchParams(window.location.search);
                    const isNewInvitedUser =
                        (hash.includes('access_token') && hash.includes('type=invite')) ||
                        (params.has('access_token') && params.get('type') === 'invite');

                    if (isNewInvitedUser) {
                        console.log('🎯 New invited user - skipping profile check');
                        setProfile(null);
                    } else {
                        await fetchProfile(session.user.id);
                    }
                }
            }
        } catch (error) {
            console.error('💥 Exception during auth initialization:', error);
        } finally {
            console.log('🏁 Initial auth load complete');
            setLoading(false);
            setInitialLoadComplete(true);
        }
    };

    useEffect(() => {
        // Initialize auth
        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                console.log('👂 Auth state changed:', _event, session?.user?.id);

                // Skip if we're on the setup-password page
                if (window.location.pathname.includes('/setup-password')) {
                    console.log('⏭️ Skipping auth update on setup-password page');
                    return;
                }

                // Update session and user state
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }

                // Only set loading false after initial load
                if (!initialLoadComplete) {
                    setLoading(false);
                    setInitialLoadComplete(true);
                }
            }
        );

        return () => {
            console.log('🧹 Cleaning up auth subscription');
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        session,
        profile,
        loading: stabilizedLoading, // Use stabilized loading instead
        isDeveloper,
        isFounder,
        isStaff,
        isActiveAdmin,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};