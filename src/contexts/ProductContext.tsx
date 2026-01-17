'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    description: string;
    category: 'Lingerie' | 'Pijamas' | 'Praia/Piscina' | 'Sexshop';
    sizes: string[];
    colors: string[];
    hasSize: boolean;  // Whether size selection is required
    hasColor: boolean; // Whether color selection is required
    images: string[];
    stock: number;
    active: boolean;
    createdAt: Date;
}

interface ProductContextType {
    products: Product[];
    addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
    updateProduct: (id: number, updates: Partial<Product>) => void;
    deleteProduct: (id: number) => void;
    getProductById: (id: number) => Product | undefined;
    getProductsByCategory: (category: string) => Product[];
    categories: string[];
}

const defaultProducts: Product[] = [
    {
        id: 1,
        name: 'Conjunto Rendado Luxo',
        price: 189.90,
        originalPrice: 249.90,
        description: 'Conjunto de lingerie em renda francesa importada, com detalhes em cetim.',
        category: 'Lingerie',
        sizes: ['P', 'M', 'G', 'GG'],
        colors: ['Preto', 'Vermelho', 'Nude'],
        hasSize: true,
        hasColor: true,
        images: ['/logo.png'],
        stock: 15,
        active: true,
        createdAt: new Date(),
    },
    {
        id: 2,
        name: 'Body Sensual Noir',
        price: 129.90,
        description: 'Body em renda com recortes estratégicos.',
        category: 'Lingerie',
        sizes: ['P', 'M', 'G'],
        colors: ['Preto', 'Vermelho'],
        hasSize: true,
        hasColor: true,
        images: ['/logo.png'],
        stock: 8,
        active: true,
        createdAt: new Date(),
    },
    {
        id: 3,
        name: 'Pijama Seda Luxo',
        price: 249.90,
        description: 'Pijama em seda com renda nas bordas.',
        category: 'Pijamas',
        sizes: ['P', 'M', 'G', 'GG'],
        colors: ['Rosa', 'Champagne', 'Preto'],
        hasSize: true,
        hasColor: true,
        images: ['/logo.png'],
        stock: 12,
        active: true,
        createdAt: new Date(),
    },
    {
        id: 4,
        name: 'Camisola Cetim',
        price: 159.90,
        description: 'Camisola curta em cetim com detalhes em renda.',
        category: 'Pijamas',
        sizes: ['P', 'M', 'G'],
        colors: ['Nude', 'Vinho', 'Preto'],
        hasSize: true,
        hasColor: true,
        images: ['/logo.png'],
        stock: 10,
        active: true,
        createdAt: new Date(),
    },
    {
        id: 5,
        name: 'Biquíni Asa Delta',
        price: 149.90,
        description: 'Biquíni com alças removíveis e ajustáveis.',
        category: 'Praia/Piscina',
        sizes: ['P', 'M', 'G'],
        colors: ['Pink', 'Laranja', 'Verde'],
        hasSize: true,
        hasColor: true,
        images: ['/logo.png'],
        stock: 20,
        active: true,
        createdAt: new Date(),
    },
    {
        id: 6,
        name: 'Maiô Decote Profundo',
        price: 199.90,
        description: 'Maiô elegante com decote profundo e costas abertas.',
        category: 'Praia/Piscina',
        sizes: ['P', 'M', 'G', 'GG'],
        colors: ['Preto', 'Branco', 'Dourado'],
        hasSize: true,
        hasColor: true,
        images: ['/logo.png'],
        stock: 8,
        active: true,
        createdAt: new Date(),
    },
    {
        id: 7,
        name: 'Fantasia Coelhinha',
        price: 179.90,
        description: 'Fantasia sensual com tiara e rabinho.',
        category: 'Sexshop',
        sizes: [],
        colors: ['Preto', 'Vermelho', 'Branco'],
        hasSize: false,
        hasColor: true,
        images: ['/logo.png'],
        stock: 6,
        active: true,
        createdAt: new Date(),
    },
    {
        id: 8,
        name: 'Kit Massagem Sensual',
        price: 89.90,
        description: 'Kit com vela massageadora e óleo corporal.',
        category: 'Sexshop',
        sizes: [],
        colors: [],
        hasSize: false,
        hasColor: false,
        images: ['/logo.png'],
        stock: 25,
        active: true,
        createdAt: new Date(),
    },
];

export const categories = ['Lingerie', 'Pijamas', 'Praia/Piscina', 'Sexshop'];

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>(defaultProducts);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('donaonca-products');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setProducts(parsed.map((p: Product) => ({ ...p, createdAt: new Date(p.createdAt) })));
            } catch (e) {
                console.error('Error loading products', e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('donaonca-products', JSON.stringify(products));
    }, [products]);

    const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
        const newProduct: Product = {
            ...product,
            id: Date.now(),
            createdAt: new Date(),
        };
        setProducts((prev) => [...prev, newProduct]);
    };

    const updateProduct = (id: number, updates: Partial<Product>) => {
        setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
    };

    const deleteProduct = (id: number) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
    };

    const getProductById = (id: number) => {
        return products.find((p) => p.id === id);
    };

    const getProductsByCategory = (category: string) => {
        if (category === 'Todos' || !category) return products.filter((p) => p.active);
        return products.filter((p) => p.category === category && p.active);
    };

    return (
        <ProductContext.Provider
            value={{
                products,
                addProduct,
                updateProduct,
                deleteProduct,
                getProductById,
                getProductsByCategory,
                categories,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
}
