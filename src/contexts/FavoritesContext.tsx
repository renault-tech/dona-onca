'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
    favorites: number[]; // Product IDs
    toggleFavorite: (productId: number) => Promise<void>;
    isFavorite: (productId: number) => boolean;
    loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial load with timeout protection
    useEffect(() => {
        let didTimeout = false;
        const timeoutId = setTimeout(() => {
            didTimeout = true;
            console.warn('Favorites timeout - usando localStorage');
            const local = localStorage.getItem('donaonca-favorites');
            if (local) setFavorites(JSON.parse(local));
            setLoading(false);
        }, 15000);

        const loadFavorites = async () => {
            setLoading(true);
            try {
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('favorites')
                        .eq('id', user.id)
                        .single();

                    if (didTimeout) return;
                    if (!error && data?.favorites) {
                        const dbFavorites = Array.isArray(data.favorites) ? data.favorites : [];
                        setFavorites(dbFavorites);
                    }
                } else {
                    const local = localStorage.getItem('donaonca-favorites');
                    if (local) setFavorites(JSON.parse(local));
                }
            } catch (error) {
                console.error('Error loading favorites:', error);
            } finally {
                if (!didTimeout) {
                    clearTimeout(timeoutId);
                    setLoading(false);
                }
            }
        };

        loadFavorites();
    }, [user]);

    // Persist changes
    const toggleFavorite = async (productId: number) => {
        let newFavorites = [];
        if (favorites.includes(productId)) {
            newFavorites = favorites.filter(id => id !== productId);
        } else {
            newFavorites = [...favorites, productId];
        }

        setFavorites(newFavorites);

        // Save logic
        if (user) {
            // Optimistic update done above, now background sync
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ favorites: newFavorites })
                    .eq('id', user.id);

                if (error) console.error('Error syncing favorites to DB:', error);
            } catch (err) {
                console.error('Error sync favorites:', err);
            }
        } else {
            localStorage.setItem('donaonca-favorites', JSON.stringify(newFavorites));
        }
    };

    const isFavorite = (productId: number) => favorites.includes(productId);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
