'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    type Product,
    type AboutContent,
    type HomeBanner,
    categories as defaultCategories,
    defaultHomeBanners,
    mapRowToProduct,
} from '@/lib/catalog';

// Re-exportados para não quebrar os ~20 arquivos que importam tipos e
// constantes de catálogo a partir deste context. A fonte da verdade
// agora é @/lib/catalog (server-safe); este arquivo cuida só do estado.
export type { Product, AboutContent, HomeBanner };

export interface GeneralSettings {
    shopName: string;
    freeShippingThreshold: number;
}

const defaultGeneralSettings: GeneralSettings = {
    shopName: 'Dona Onça',
    freeShippingThreshold: 199,
};

interface CategoryMutationResult {
    error: string | null;
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
    addCategory: (name: string) => Promise<CategoryMutationResult>;
    renameCategory: (oldName: string, newName: string) => Promise<CategoryMutationResult>;
    deleteCategory: (name: string) => Promise<CategoryMutationResult>;
    aboutContent: AboutContent;
    updateAboutContent: (newContent: Partial<AboutContent>) => Promise<void>;
    homeBanners: HomeBanner[];
    updateHomeBanners: (banners: HomeBanner[]) => Promise<void>;
    generalSettings: GeneralSettings;
    updateGeneralSettings: (settings: Partial<GeneralSettings>) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [homeBanners, setHomeBanners] = useState<HomeBanner[]>(defaultHomeBanners);
    const [categories, setCategories] = useState<string[]>(defaultCategories);
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(defaultGeneralSettings);
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

    // Fetch products from Supabase - non-blocking
    const fetchProducts = async () => {
        try {
            console.log('Fetching products...');
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Products error:', error);
                return;
            }

            if (data) {
                const formattedProducts: Product[] = data.map(mapRowToProduct);
                setProducts(formattedProducts);
                console.log('Products loaded:', formattedProducts.length);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Loading termina em 500ms max, produtos carregam em background
        const quickLoad = setTimeout(() => setLoading(false), 500);
        fetchProducts().finally(() => clearTimeout(quickLoad));
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

    const updateHomeBanners = async (banners: HomeBanner[]) => {
        setHomeBanners(banners);

        try {
            const { error } = await supabase
                .from('site_configs')
                .upsert({ key: 'home_banners', content: banners }, { onConflict: 'key' });

            if (error) {
                console.warn('Supabase site_configs table might not exist yet. Using local state only.', error);
                localStorage.setItem('donaonca-banners', JSON.stringify(banners));
            }
        } catch (error) {
            console.error('Error saving banners:', error);
            localStorage.setItem('donaonca-banners', JSON.stringify(banners));
        }
    };

    const updateCategories = async (next: string[]) => {
        setCategories(next);
        try {
            const { error } = await supabase
                .from('site_configs')
                .upsert({ key: 'categories', content: next }, { onConflict: 'key' });
            if (error) {
                console.warn('Supabase site_configs table might not exist yet. Using local state only.', error);
                localStorage.setItem('donaonca-categories', JSON.stringify(next));
            }
        } catch (error) {
            console.error('Error saving categories:', error);
            localStorage.setItem('donaonca-categories', JSON.stringify(next));
        }
    };

    const addCategory = async (name: string): Promise<CategoryMutationResult> => {
        const trimmed = name.trim();
        if (!trimmed) return { error: 'Nome não pode ser vazio.' };
        if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
            return { error: 'Já existe uma categoria com esse nome.' };
        }
        await updateCategories([...categories, trimmed]);
        return { error: null };
    };

    const renameCategory = async (oldName: string, newName: string): Promise<CategoryMutationResult> => {
        const trimmed = newName.trim();
        if (!trimmed) return { error: 'Nome não pode ser vazio.' };
        if (trimmed === oldName) return { error: null };
        if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
            return { error: 'Já existe uma categoria com esse nome.' };
        }
        try {
            const { error } = await supabase
                .from('products')
                .update({ category: trimmed })
                .eq('category', oldName);
            if (error) throw error;
        } catch (error) {
            console.error('Error renaming category on products:', error);
            return { error: 'Não foi possível atualizar os produtos dessa categoria.' };
        }
        await updateCategories(categories.map(c => c === oldName ? trimmed : c));
        setProducts(prev => prev.map(p => p.category === oldName ? { ...p, category: trimmed } : p));
        return { error: null };
    };

    const deleteCategory = async (name: string): Promise<CategoryMutationResult> => {
        const inUse = products.some(p => p.category === name);
        if (inUse) {
            return { error: 'Existem produtos nessa categoria. Mova-os para outra categoria antes de excluir.' };
        }
        await updateCategories(categories.filter(c => c !== name));
        return { error: null };
    };

    const updateGeneralSettings = async (settings: Partial<GeneralSettings>) => {
        const updated = { ...generalSettings, ...settings };
        setGeneralSettings(updated);
        try {
            const { error } = await supabase
                .from('site_configs')
                .upsert({ key: 'general_settings', content: updated }, { onConflict: 'key' });
            if (error) {
                console.warn('Supabase site_configs table might not exist yet. Using local state only.', error);
                localStorage.setItem('donaonca-general-settings', JSON.stringify(updated));
            }
        } catch (error) {
            console.error('Error saving general settings:', error);
            localStorage.setItem('donaonca-general-settings', JSON.stringify(updated));
        }
    };

    useEffect(() => {
        const loadContent = async () => {
            try {
                // Load about content
                const { data: aboutData } = await supabase
                    .from('site_configs')
                    .select('content')
                    .eq('key', 'about_page')
                    .maybeSingle();

                if (aboutData && aboutData.content) {
                    setAboutContent(aboutData.content);
                } else {
                    const local = localStorage.getItem('donaonca-about');
                    if (local) setAboutContent(JSON.parse(local));
                }

                // Load home banners
                const { data: bannersData } = await supabase
                    .from('site_configs')
                    .select('content')
                    .eq('key', 'home_banners')
                    .maybeSingle();

                if (bannersData && bannersData.content) {
                    setHomeBanners(bannersData.content);
                } else {
                    const localBanners = localStorage.getItem('donaonca-banners');
                    if (localBanners) setHomeBanners(JSON.parse(localBanners));
                }

                // Load categories
                const { data: categoriesData } = await supabase
                    .from('site_configs')
                    .select('content')
                    .eq('key', 'categories')
                    .maybeSingle();

                if (categoriesData && categoriesData.content) {
                    setCategories(categoriesData.content);
                } else {
                    const localCategories = localStorage.getItem('donaonca-categories');
                    if (localCategories) setCategories(JSON.parse(localCategories));
                }

                // Load general settings
                const { data: settingsData } = await supabase
                    .from('site_configs')
                    .select('content')
                    .eq('key', 'general_settings')
                    .maybeSingle();

                if (settingsData && settingsData.content) {
                    setGeneralSettings({ ...defaultGeneralSettings, ...settingsData.content });
                } else {
                    const localSettings = localStorage.getItem('donaonca-general-settings');
                    if (localSettings) setGeneralSettings({ ...defaultGeneralSettings, ...JSON.parse(localSettings) });
                }
            } catch (err) {
                console.warn('Using default content - persistence layer not ready');
                const local = localStorage.getItem('donaonca-about');
                if (local) setAboutContent(JSON.parse(local));
                const localBanners = localStorage.getItem('donaonca-banners');
                if (localBanners) setHomeBanners(JSON.parse(localBanners));
                const localCategories = localStorage.getItem('donaonca-categories');
                if (localCategories) setCategories(JSON.parse(localCategories));
                const localSettings = localStorage.getItem('donaonca-general-settings');
                if (localSettings) setGeneralSettings({ ...defaultGeneralSettings, ...JSON.parse(localSettings) });
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
                addCategory,
                renameCategory,
                deleteCategory,
                aboutContent,
                updateAboutContent,
                homeBanners,
                updateHomeBanners,
                generalSettings,
                updateGeneralSettings,
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
