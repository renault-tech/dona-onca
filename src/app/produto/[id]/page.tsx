import type { Metadata } from 'next';
import ProductDetailView from './ProductDetailView';
import JsonLd from '@/components/seo/JsonLd';
import { getProductByIdServer } from '@/lib/products-server';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductByIdServer(Number(id));

    if (!product) {
        return { title: 'Produto' };
    }

    const description = product.description
        ? product.description.slice(0, 155)
        : `${product.name} — Dona Onça.`;
    const image = product.images[0];

    return {
        title: product.name,
        description,
        alternates: { canonical: `/produto/${product.id}` },
        openGraph: {
            title: product.name,
            description,
            url: `/produto/${product.id}`,
            images: image ? [image] : undefined,
        },
    };
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    const product = await getProductByIdServer(Number(id));

    return (
        <>
            {product && (
                <JsonLd
                    data={{
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: product.name,
                        description: product.description,
                        image: product.images,
                        offers: {
                            '@type': 'Offer',
                            priceCurrency: 'BRL',
                            price: product.price,
                            availability:
                                product.stock > 0
                                    ? 'https://schema.org/InStock'
                                    : 'https://schema.org/OutOfStock',
                        },
                    }}
                />
            )}
            {product && (
                <JsonLd
                    data={{
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Produtos', item: '/produtos' },
                            {
                                '@type': 'ListItem',
                                position: 2,
                                name: product.category,
                                item: `/produtos?categoria=${encodeURIComponent(product.category)}`,
                            },
                            { '@type': 'ListItem', position: 3, name: product.name },
                        ],
                    }}
                />
            )}
            <ProductDetailView initialProduct={product} />
        </>
    );
}
