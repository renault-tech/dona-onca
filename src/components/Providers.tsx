'use client';

import { ProductProvider } from '@/contexts/ProductContext';
import { CartProvider } from '@/contexts/CartContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <ProductProvider>
            <CartProvider>{children}</CartProvider>
        </ProductProvider>
    );
}
