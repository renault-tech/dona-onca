'use client';

import { ProductProvider } from '@/contexts/ProductContext';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { ReactNode } from 'react';
import AgeGate from '@/components/shell/AgeGate';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ProductProvider>
                <FavoritesProvider>
                    <CartProvider>
                        <AgeGate />
                        {children}
                    </CartProvider>
                </FavoritesProvider>
            </ProductProvider>
        </AuthProvider>
    );
}
