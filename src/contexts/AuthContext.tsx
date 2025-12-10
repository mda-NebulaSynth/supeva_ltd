import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type AdminRole = 'developer' | 'founder' | 'staff';

export interface AdminProfile {
    id: string;
    email: string;
    full_name: string;
    role: AdminRole;
    avatar_url: string | null;
    is_active: boolean;
    is_developer: boolean;
    invited_by: string | null;
    invited_at: string | null;
    accepted_at: string | null;
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
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Derived states for role checks
    const isDeveloper = profile?.role === 'developer' && profile?.is_developer === true;
    const isFounder = profile?.role === 'founder' && profile?.is_active === true;
    const isStaff = profile?.role === 'staff' && profile?.is_active === true;
    const isActiveAdmin = profile?.is_active === true || isDeveloper;

    const fetchProfile = async (userId: string) => {
    try {
        console.log('🔍 Fetching profile for user:', userId);

        // Search by user_id (direct foreign key)
        const { data, error } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        console.log('📦 Supabase response - data:', data, 'error:', error);

        if (error) {
            if (error.code === 'PGRST116') {
                console.log('🆕 No admin profile found for user:', userId);
            } else {
                console.error('❌ Error fetching admin profile:', error);
            }
            setProfile(null);
            return;
        }

        if (!data) {
            console.log('⚠️ No admin profile found for user:', userId);
            setProfile(null);
            return;
        }

        const profileData = data as AdminProfile;
        console.log('✅ Profile fetched successfully:', profileData);

        // Allow developers to bypass is_active check
        if (profileData.role !== 'developer' && !profileData.is_active) {
            console.warn('⚠️ Admin account is inactive');
            setProfile(null);
            return;
        }

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

    // Get initial session WITHOUT async/await to avoid hanging
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
                    const isNewInvitedUser = hash.includes('access_token') && hash.includes('type=invite');

                    if (isNewInvitedUser) {
                        console.log('🎯 New invited user - skipping profile check');
                        // Don't fetch profile yet - it doesn't exist
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

        // Listen for auth changes - FIXED: Use proper event handling
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                console.log('👂 Auth state changed:', _event, session?.user?.id);

                // CRITICAL: Skip if we're on the setup-password page
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
    }, []); // Empty dependency array - we only run this once

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
        loading,
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