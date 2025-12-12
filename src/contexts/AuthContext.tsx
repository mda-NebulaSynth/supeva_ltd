import { createContext, useContext, useEffect, useState, useRef, type ReactNode, useCallback } from 'react';
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
    const fetchingRef = useRef(false);
    const skipNextFetchRef = useRef(false);

    // Derived states for role checks
    const isDeveloper = profile?.role === 'developer';
    const isFounder = profile?.role === 'founder';
    const isStaff = profile?.role === 'staff';
    const isActiveAdmin = Boolean(profile);

    // Define fetchProfile directly inside the component (not useCallback)
    // This prevents dependency array issues in useEffect
    const fetchProfile = async (userId: string, mountedRef?: boolean) => {
        // Check if we should skip this fetch
        if (skipNextFetchRef.current) {
            console.log('⏭️ Skipping profile fetch as requested');
            skipNextFetchRef.current = false;
            return null;
        }

        // Prevent concurrent fetches
        if (fetchingRef.current) {
            console.log('⏸️ Profile fetch already in progress, skipping...');
            return null;
        }

        fetchingRef.current = true;

        try {
            console.log('🔍 Fetching profile for user:', userId, 'mounted:', mountedRef);

            // Add timeout to prevent hanging indefinitely
            const fetchPromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
            );

            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

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
        } finally {
            fetchingRef.current = false;
        }
    };

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); // fetchProfile is stable, intentionally not in deps

    useEffect(() => {
        let mounted = true;
        let initializing = true;

        console.log('🎬 AuthProvider useEffect starting');

        // Get initial session
        const initializeAuth = async () => {
            try {
                console.log('🔄 Initializing auth... (mounted:', mounted, ')');

                const { data: { session }, error } = await supabase.auth.getSession();

                console.log('📦 getSession response:', { hasSession: !!session, error: error?.message, stillMounted: mounted });

                if (error) {
                    console.error('❌ Error getting session:', error);
                    if (mounted) setLoading(false);
                    initializing = false;
                    return;
                }

                console.log('📋 Session retrieved:', session?.user?.id);

                if (!mounted) {
                    console.log('⚠️ Component unmounted before session processing');
                    initializing = false;
                    return;
                }

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    console.log('🎯 About to fetch profile, mounted:', mounted);
                    const result = await fetchProfile(session.user.id, mounted);
                    console.log('📥 fetchProfile returned:', !!result, 'stillMounted:', mounted);
                }
            } catch (error) {
                console.error('💥 Exception during auth initialization:', error);
            } finally {
                console.log('🏁 Initial auth load complete (mounted:', mounted, ')');
                if (mounted) {
                    setLoading(false);
                    initializing = false;
                }
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                // CRITICAL: Skip auth state changes during initial load
                // This prevents duplicate profile fetches
                if (initializing) {
                    console.log('⏭️ Skipping auth state change during initialization:', _event);
                    return;
                }

                if (!mounted) {
                    console.log('⚠️ Auth state change but component unmounted');
                    return;
                }

                console.log('👂 Auth state changed:', _event, session?.user?.id, 'mounted:', mounted);

                // Check if user actually changed - if not, skip profile refetch
                const userChanged = user?.id !== session?.user?.id;
                const profileMatchesUser = profile?.id === session?.user?.id;

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    // Only fetch profile if user changed OR if we don't have a matching profile
                    if (userChanged || !profileMatchesUser) {
                        console.log('🎯 Fetching profile from auth state change (user changed or profile mismatch), mounted:', mounted);
                        await fetchProfile(session.user.id, mounted);
                    } else {
                        console.log('✅ User unchanged and profile matches, skipping fetch');
                    }
                } else {
                    setProfile(null);
                }
            }
        );

        return () => {
            mounted = false;
            console.log('🧹 Cleaning up auth subscription');
            subscription.unsubscribe();
        };
    }, []); // Empty array - run only once on mount

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