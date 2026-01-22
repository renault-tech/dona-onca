'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    description: string;
    category: 'Lingerie' | 'Pijamas' | 'Praia/Piscina' | 'Sexshop';
    sizes: string[];
    colors: string[];
    hasSize: boolean;
    hasColor: boolean;
    images: string[];
    stock: number;
    lowStockAlert: number;
    active: boolean;
    createdAt: Date;
}

export interface AboutContent {
    hero: {
        title: string;
        tagline: string;
        image: string;
        alignment: 'object-center' | 'object-top' | 'object-bottom' | 'object-left' | 'object-right' | 'object-contain';
    };
    story: string;
    values: {
        icon: string;
        image?: string;
        title: string;
        description: string;
    }[];
    team: {
        name: string;
        role: string;
        image: string;
    }[];
    contact: {
        email: string;
        whatsapp: string;
        instagram: string;
    };
}

interface ProductContextType {
    products: Product[];
    loading: boolean;
    addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
    updateProduct: (id: number, updates: Partial<Product>) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    getProductById: (id: number) => Product | undefined;
    getProductsByCategory: (category: string) => Product[];
    sellProduct: (id: number, quantity: number) => Promise<void>;
    restockProduct: (id: number, quantity: number) => Promise<void>;
    categories: string[];
    aboutContent: AboutContent;
    updateAboutContent: (newContent: Partial<AboutContent>) => Promise<void>;
}

export const categories = ['Lingerie', 'Pijamas', 'Praia/Piscina', 'Sexshop'];

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [aboutContent, setAboutContent] = useState<AboutContent>({
        hero: {
            title: 'Sobre a Dona Onça',
            tagline: 'Elegância, sensualidade e empoderamento feminino',
            image: '/logo.png',
            alignment: 'object-center',
        },
        story: 'A Dona Onça nasceu do desejo de criar uma marca que celebra a mulher em toda sua força e feminilidade. Assim como a onça - elegante, poderosa e única - acreditamos que cada mulher carrega dentro de si uma beleza selvagem que merece ser celebrada.\n\nFundada em 2020, começamos como um pequeno ateliê e hoje somos referência em lingerie de alta qualidade. Cada peça é cuidadosamente desenvolvida pensando no conforto, na elegância e na autoestima de nossas clientes.',
        values: [
            { icon: '💎', title: 'Qualidade', description: 'Materiais premium e acabamento impecável em cada peça' },
            { icon: '🌸', title: 'Feminilidade', description: 'Designs que celebram a beleza e força da mulher' },
            { icon: '♻️', title: 'Sustentabilidade', description: 'Compromisso com práticas responsáveis de produção' },
        ],
        team: [
            { name: 'Maria Silva', role: 'Fundadora & CEO', image: '' },
            { name: 'Ana Santos', role: 'Diretora Criativa', image: '' },
            { name: 'Julia Costa', role: 'Gestora de E-commerce', image: '' },
        ],
        contact: {
            email: 'contato@donaonca.com',
            whatsapp: '5500000000000',
            instagram: 'donaonca',
        }
    });

    // Fetch products from Supabase with timeout protection
    const fetchProducts = async () => {
        let didTimeout = false;
        const timeoutId = setTimeout(() => {
            didTimeout = true;
            console.warn('Products fetch timeout after 15s');
            setLoading(false);
        }, 15000);

        try {
            setLoading(true);
            console.log('Fetching products from Supabase...');
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (didTimeout) return;
            if (error) {
                console.error('Supabase products error:', error);
                throw error;
            }
            console.log('Products fetched:', data?.length || 0);

            if (data) {
                // Map snake_case from DB to camelCase for the app
                const formattedProducts: Product[] = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: Number(p.price),
                    originalPrice: p.original_price ? Number(p.original_price) : undefined,
                    description: p.description,
                    category: p.category,
                    sizes: p.sizes || [],
                    colors: p.colors || [],
                    hasSize: p.has_size,
                    hasColor: p.has_color,
                    images: p.images || [],
                    stock: p.stock,
                    lowStockAlert: p.low_stock_alert,
                    active: p.active,
                    createdAt: new Date(p.created_at)
                }));
                setProducts(formattedProducts);
            }
        } catch (error) {
            console.error('Error fetching products from Supabase:', error);
        } finally {
            if (!didTimeout) {
                clearTimeout(timeoutId);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([{
                    name: product.name,
                    price: product.price,
                    original_price: product.originalPrice,
                    description: product.description,
                    category: product.category,
                    sizes: product.sizes,
                    colors: product.colors,
                    has_size: product.hasSize,
                    has_color: product.hasColor,
                    images: product.images,
                    stock: product.stock,
                    low_stock_alert: product.lowStockAlert,
                    active: product.active
                }])
                .select();

            if (error) throw error;
            if (data) {
                await fetchProducts(); // Refresh list after adding
            }
        } catch (error) {
            console.error('Error adding product to Supabase:', error);
        }
    };

    const updateProduct = async (id: number, updates: Partial<Product>) => {
        try {
            // Map camelCase to snake_case for the database
            const dbUpdates: any = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.price !== undefined) dbUpdates.price = updates.price;
            if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
            if (updates.description !== undefined) dbUpdates.description = updates.description;
            if (updates.category !== undefined) dbUpdates.category = updates.category;
            if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes;
            if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
            if (updates.hasSize !== undefined) dbUpdates.has_size = updates.hasSize;
            if (updates.hasColor !== undefined) dbUpdates.has_color = updates.hasColor;
            if (updates.images !== undefined) dbUpdates.images = updates.images;
            if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
            if (updates.lowStockAlert !== undefined) dbUpdates.low_stock_alert = updates.lowStockAlert;
            if (updates.active !== undefined) dbUpdates.active = updates.active;

            const { error } = await supabase
                .from('products')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            // Optimistic UI update
            setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        } catch (error) {
            console.error('Error updating product in Supabase:', error);
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product from Supabase:', error);
        }
    };

    const getProductById = (id: number) => {
        return products.find((p) => p.id === id);
    };

    const getProductsByCategory = (category: string) => {
        if (category === 'Todos' || !category) return products.filter((p) => p.active);
        return products.filter((p) => p.category === category && p.active);
    };

    const sellProduct = async (id: number, quantity: number) => {
        try {
            const product = products.find(p => p.id === id);
            if (!product) return;

            const newStock = Math.max(0, product.stock - quantity);
            await updateProduct(id, { stock: newStock });
        } catch (error) {
            console.error('Error selling product:', error);
        }
    };

    const restockProduct = async (id: number, quantity: number) => {
        try {
            const product = products.find(p => p.id === id);
            if (!product) return;

            const newStock = product.stock + quantity;
            await updateProduct(id, { stock: newStock });
        } catch (error) {
            console.error('Error restocking product:', error);
        }
    };

    const updateAboutContent = async (newContent: Partial<AboutContent>) => {
        const updated = { ...aboutContent, ...newContent };
        setAboutContent(updated);

        try {
            const { error } = await supabase
                .from('site_configs')
                .upsert({ key: 'about_page', content: updated }, { onConflict: 'key' });

            if (error) {
                console.warn('Supabase site_configs table might not exist yet. Using local state only.', error);
                localStorage.setItem('donaonca-about', JSON.stringify(updated));
            }
        } catch (error) {
            console.error('Error saving site content:', error);
            localStorage.setItem('donaonca-about', JSON.stringify(updated));
        }
    };

    useEffect(() => {
        const loadContent = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_configs')
                    .select('content')
                    .eq('key', 'about_page')
                    .maybeSingle();

                if (data && data.content) {
                    setAboutContent(data.content);
                } else {
                    const local = localStorage.getItem('donaonca-about');
                    if (local) setAboutContent(JSON.parse(local));
                }
            } catch (err) {
                console.warn('Using default content - persistence layer not ready');
                const local = localStorage.getItem('donaonca-about');
                if (local) setAboutContent(JSON.parse(local));
            }
        };
        loadContent();
    }, []);

    return (
        <ProductContext.Provider
            value={{
                products,
                loading,
                addProduct,
                updateProduct,
                deleteProduct,
                getProductById,
                getProductsByCategory,
                sellProduct,
                restockProduct,
                categories,
                aboutContent,
                updateAboutContent,
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
