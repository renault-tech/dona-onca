'use client';

import Image from 'next/image';
import { useProducts } from '@/contexts/ProductContext';
import BackButton from '@/components/BackButton';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';

export default function NovidadesView() {
    const { products } = useProducts();

    // Get newest products (last 30 days simulation - using most recent)
    const newestProducts = [...products]
        .filter(p => p.active)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 12);

    return (
        <div className="min-h-screen">
            {/* Hero Header */}
            <section className="relative py-20 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="/header-bg-v2.png"
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover"
                        style={{ objectPosition: 'center top', filter: 'brightness(1.1)' }}
                    />
                    {/* Gradient Overlay - lighter at top to show image */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to bottom, 
                                rgba(13, 3, 8, 0) 0%, 
                                rgba(13, 3, 8, 0.1) 40%, 
                                rgba(13, 3, 8, 0.3) 70%, 
                                rgba(5, 5, 5, 0.95) 100%)`
                        }}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4">
                    {/* Back Button */}
                    <div className="mb-8">
                        <BackButton fallbackHref="/" />
                    </div>

                    <div className="text-center">
                        <span className="mb-4 inline-block rounded-full bg-accent px-6 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                            Novidades
                        </span>
                        <h1 className="font-display text-4xl italic text-fg md:text-5xl">
                            Acabou de Chegar
                        </h1>
                        <p className="mt-4 text-fg-muted text-lg">
                            Os lançamentos mais recentes da Dona Onça
                        </p>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-4">
                    {newestProducts.length === 0 ? (
                        <EmptyState message="Nenhuma novidade no momento." actionLabel="Ver todos os produtos" actionHref="/produtos" />
                    ) : (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                            {newestProducts.map((product, i) => (
                                <ProductCard key={product.id} product={product} priority={i < 4} badge="Novo" />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
