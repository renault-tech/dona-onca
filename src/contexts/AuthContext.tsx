'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    is_admin: boolean;
    admin_verified: boolean;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
    verifyAdminToken: (token: string) => Promise<{ success: boolean; error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user is verified admin
    const isAdmin = profile?.is_admin === true && profile?.admin_verified === true;

    // Fetch user profile from database
    const fetchProfile = async (userId: string) => {
        try {
            // Tentativa 1: Via RPC Seguro (Bypass RLS)
            const { data: rpcData, error: rpcError } = await supabase
                .rpc('get_my_profile_securely');

            if (!rpcError && rpcData && rpcData.length > 0) {
                return rpcData[0] as UserProfile;
            }

            // Tentativa 2: Select direto (Fallback)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.warn('Profile not found (PGRST116)');
                    return null;
                }
                console.error('Error fetching profile (Select):', error);
                return null;
            }
            return data as UserProfile;
        } catch (err) {
            console.error('Error in fetchProfile:', err);
            return null;
        }
    };

    // Create profile for new user
    const createProfile = async (userId: string, email: string, fullName: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email,
                    full_name: fullName,
                    is_admin: false,
                    admin_verified: false,
                });

            if (error) {
                console.error('Error creating profile:', error);
                return { error };
            }
            return { error: null };
        } catch (err) {
            console.error('Error in createProfile:', err);
            return { error: err as Error };
        }
    };

    // Initialize auth state with timeout protection
    useEffect(() => {
        let didTimeout = false;
        const timeoutId = setTimeout(() => {
            didTimeout = true;
            console.warn('Auth timeout - continuando sem auth');
            setLoading(false);
        }, 15000);

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (didTimeout) return;

                if (session?.user) {
                    setSession(session);
                    setUser(session.user);
                    const userProfile = await fetchProfile(session.user.id);
                    if (didTimeout) return;
                    setProfile(userProfile);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                if (!didTimeout) {
                    clearTimeout(timeoutId);
                    setLoading(false);
                }
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                const userProfile = await fetchProfile(session.user.id);
                setProfile(userProfile);
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Sign in
    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { error };
            }

            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    // Sign up
    const signUp = async (email: string, password: string, fullName: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) {
                return { error };
            }

            // Wait a bit for trigger to create profile
            if (data.user) {
                // Short delay to allow trigger to run
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Fetch profile to see if it exists
                const profile = await fetchProfile(data.user.id);

                // If trigger failed for some reason, try manual creation
                if (!profile) {
                    await createProfile(data.user.id, email, fullName);
                }
            }

            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    // Sign out
    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    // Update profile
    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!user) {
            return { error: new Error('Not authenticated') };
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update(data)
                .eq('id', user.id);

            if (error) {
                return { error };
            }

            // Refresh profile
            const updatedProfile = await fetchProfile(user.id);
            setProfile(updatedProfile);

            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    // Verify admin token (called when user confirms admin access via email link)
    const verifyAdminToken = async (token: string) => {
        if (!user) {
            return { success: false, error: 'Não autenticado' };
        }

        try {
            // Verify token exists and is valid
            const { data, error } = await supabase
                .from('admin_2fa_tokens')
                .select('*')
                .eq('user_id', user.id)
                .eq('token', token)
                .eq('used', false)
                .gt('expires_at', new Date().toISOString())
                .single();

            if (error || !data) {
                return { success: false, error: 'Token inválido ou expirado' };
            }

            // Mark token as used
            await supabase
                .from('admin_2fa_tokens')
                .update({ used: true })
                .eq('id', data.id);

            // Set admin_verified to true
            await supabase
                .from('profiles')
                .update({ admin_verified: true })
                .eq('id', user.id);

            // Refresh profile
            const updatedProfile = await fetchProfile(user.id);
            setProfile(updatedProfile);

            return { success: true, error: null };
        } catch (err) {
            console.error('Error verifying admin token:', err);
            return { success: false, error: 'Erro ao verificar token' };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            session,
            loading,
            isAdmin,
            signIn,
            signUp,
            signOut,
            updateProfile,
            verifyAdminToken,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
