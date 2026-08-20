// Tipos e utilitários de catálogo compartilhados entre client (ProductContext)
// e server (products-server, sitemap, generateMetadata). Este arquivo NÃO tem
// 'use client' de propósito: precisa poder ser importado de código de servidor
// sem arrastar Supabase browser client, React context, etc.

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

export interface HomeBanner {
    id: string;
    name: string;
    image: string;
    link: string;
    order: number;
}

export const categories = ['Lingerie', 'Pijamas', 'Praia/Piscina', 'Sexshop'];

export const defaultHomeBanners: HomeBanner[] = [
    { id: '1', name: 'Lingerie', image: '', link: '/produtos?categoria=Lingerie', order: 1 },
    { id: '2', name: 'Toys', image: '', link: '/produtos?categoria=Sexshop', order: 2 },
    { id: '3', name: 'Kits & Óleos', image: '', link: '/produtos?categoria=Sexshop', order: 3 },
];

/**
 * Mapeia uma linha crua da tabela `products` (snake_case, do Postgres) para
 * o formato `Product` (camelCase) usado no app. Compartilhado entre o
 * fetch client-side (ProductContext) e o fetch server-side (products-server),
 * para que os dois nunca divirjam.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRowToProduct(p: any): Product {
    return {
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
        createdAt: new Date(p.created_at),
    };
}
