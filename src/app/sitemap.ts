import type { MetadataRoute } from 'next';
import { categories } from '@/lib/catalog';
import { getActiveProductsServer } from '@/lib/products-server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dona-onca.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1 },
        { url: `${siteUrl}/produtos`, changeFrequency: 'daily', priority: 0.9 },
        { url: `${siteUrl}/novidades`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${siteUrl}/categorias`, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${siteUrl}/sobre`, changeFrequency: 'monthly', priority: 0.4 },
        { url: `${siteUrl}/contato`, changeFrequency: 'monthly', priority: 0.3 },
        { url: `${siteUrl}/faq`, changeFrequency: 'monthly', priority: 0.3 },
        { url: `${siteUrl}/termos`, changeFrequency: 'yearly', priority: 0.1 },
    ];

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
        url: `${siteUrl}/produtos?categoria=${encodeURIComponent(cat)}`,
        changeFrequency: 'daily',
        priority: 0.7,
    }));

    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        const products = await getActiveProductsServer();
        productRoutes = products.map((p) => ({
            url: `${siteUrl}/produto/${p.id}`,
            lastModified: p.createdAt,
            changeFrequency: 'weekly',
            priority: 0.7,
        }));
    } catch {
        // Se o Supabase estiver indisponível no momento do build/revalidate,
        // publica o sitemap só com as rotas estáticas em vez de falhar.
    }

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
