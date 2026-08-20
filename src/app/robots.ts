import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dona-onca.vercel.app';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/checkout', '/conta', '/minha-conta', '/sacola'],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
