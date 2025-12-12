import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
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

    // Derived states for role checks
    const isDeveloper = profile?.role === 'developer';
    const isFounder = profile?.role === 'founder';
    const isStaff = profile?.role === 'staff';
    const isActiveAdmin = Boolean(profile);

    // Define fetchProfile directly inside the component (not useCallback)
    // This prevents dependency array issues in useEffect
    const fetchProfile = async (userId: string, mountedRef?: boolean) => {
        try {
            console.log('🔍 Fetching profile for user:', userId, 'mounted:', mountedRef);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle(); // Use maybeSingle instead of single - returns null if not found

            console.log('📡 Fetch complete - data:', !!data, 'error:', error?.message, 'mounted check:', mountedRef);

            if (error) {
                console.error('❌ Error fetching profile:', error);
                setProfile(null);
                return null;
            }

            if (!data) {
                console.log('⚠️ No profile found for user:', userId);
                setProfile(null);
                return null;
            }

            const profileData = data as AdminProfile;
            console.log('✅ Profile fetched successfully:', profileData);
            console.log('📝 Setting profile state...');
            setProfile(profileData);
            console.log('✔️ Profile state updated');
            return profileData;
        } catch (error) {
            console.error('💥 Exception in fetchProfile:', error);
            setProfile(null);
            return null;
        }
    };

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); // fetchProfile is stable, intentionally not in deps

    useEffect(() => {
        console.log('🎬 AuthProvider useEffect starting');

        // 🚀 FIX #3 — simplified session initialization
        supabase.auth.getSession().then(async ({ data }) => {
            console.log('📋 Initial session:', data.session?.user?.id);

            setSession(data.session);
            setUser(data.session?.user ?? null);

            if (data.session?.user) {
                await fetchProfile(data.session.user.id);
            }

            setLoading(false);
        });

        // Listen for auth changes (remove the initializing guard!)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('👂 Auth state changed:', event, session?.user?.id);

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }

                setLoading(false);
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