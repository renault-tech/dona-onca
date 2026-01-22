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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Admin check simplificado - apenas is_admin = true
    const isAdmin = profile?.is_admin === true;

    // Fetch user profile - query simples e direta
    const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, full_name, phone, is_admin, created_at')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('Erro ao buscar perfil:', error.message);
                return null;
            }
            return data as UserProfile;
        } catch (err) {
            console.error('Erro em fetchProfile:', err);
            return null;
        }
    };

    // Initialize auth state
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (session?.user) {
                    setSession(session);
                    setUser(session.user);
                    const userProfile = await fetchProfile(session.user.id);
                    if (mounted) setProfile(userProfile);
                }
            } catch (error) {
                console.error('Erro ao inicializar auth:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                const userProfile = await fetchProfile(session.user.id);
                if (mounted) setProfile(userProfile);
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Sign in
    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            return { error: error ? error : null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    // Sign up
    const signUp = async (email: string, password: string, fullName: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } },
            });
            return { error: error ? error : null };
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
        if (!user) return { error: new Error('Não autenticado') };

        try {
            const { error } = await supabase
                .from('profiles')
                .update(data)
                .eq('id', user.id);

            if (error) return { error };

            const updatedProfile = await fetchProfile(user.id);
            setProfile(updatedProfile);
            return { error: null };
        } catch (err) {
            return { error: err as Error };
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
