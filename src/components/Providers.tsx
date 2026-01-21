'use client';

import { ProductProvider } from '@/contexts/ProductContext';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ProductProvider>
                <CartProvider>{children}</CartProvider>
            </ProductProvider>
        </AuthProvider>
    );
}
