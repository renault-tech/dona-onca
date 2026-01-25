'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface CartItem {
    id: number;
    productId: number;
    name: string;
    price: number;
    size: string;
    color: string;
    quantity: number;
    image: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    updateQuantity: (id: number, quantity: number) => void;
    removeItem: (id: number) => void;
    clearCart: () => void;
    itemCount: number;
    subtotal: number;
    shipping: number;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const { user } = useAuth();

    // Generate storage key based on user ID
    const getStorageKey = useCallback(() => {
        return user ? `donaonca-cart-${user.id}` : 'donaonca-cart-guest';
    }, [user]);

    // Load from localStorage based on user
    useEffect(() => {
        const storageKey = getStorageKey();
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading cart', e);
                setItems([]);
            }
        } else {
            setItems([]);
        }
    }, [getStorageKey]);

    // Save to localStorage
    useEffect(() => {
        const storageKey = getStorageKey();
        if (items.length > 0 || localStorage.getItem(storageKey)) {
            localStorage.setItem(storageKey, JSON.stringify(items));
        }
    }, [items, getStorageKey]);

    const addItem = (item: Omit<CartItem, 'id'>) => {
        setItems((prev) => {
            // Check if item already exists with same product, size, and color
            const existing = prev.find(
                (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
            );
            if (existing) {
                return prev.map((i) =>
                    i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
                );
            }
            return [...prev, { ...item, id: Date.now() }];
        });
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity < 1) {
            removeItem(id);
            return;
        }
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
    };

    const removeItem = (id: number) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const clearCart = () => {
        setItems([]);
    };

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 199 ? 0 : subtotal > 0 ? 19.90 : 0;
    const total = subtotal + shipping;

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                updateQuantity,
                removeItem,
                clearCart,
                itemCount,
                subtotal,
                shipping,
                total,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
