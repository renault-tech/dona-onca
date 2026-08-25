'use client';

import Link from 'next/link';
import { useProducts } from '@/contexts/ProductContext';
import OncaMark from '@/components/brand/OncaMark';
import Reveal from '@/components/motion/Reveal';

const categoryDescriptions: Record<string, string> = {
    Lingerie: 'Sutiãs, calcinhas, conjuntos e mais',
    Pijamas: 'Camisolas, pijamas de seda e cetim',
    'Praia/Piscina': 'Biquínis, maiôs e saídas de praia',
    Sexshop: 'Fantasias, acessórios e cosméticos',
};

export default function CategoriasView() {
    const { getProductsByCategory, loading, categories } = useProducts();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="border-b border-border py-16 text-center">
                <p className="mb-2 text-xs uppercase tracking-[0.3em] text-fg-subtle">Navegue</p>
                <h1 className="font-display text-4xl italic text-fg md:text-5xl">Categorias</h1>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-16">
                <div className="grid gap-6 md:grid-cols-2">
                    {categories.map((cat, i) => {
                        const products = getProductsByCategory(cat);
                        return (
                            <Reveal key={cat} delay={i * 80}>
                                <Link
                                    href={`/produtos?categoria=${encodeURIComponent(cat)}`}
                                    className="group surface relative flex items-center gap-6 overflow-hidden p-8"
                                >
                                    <OncaMark className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 text-accent opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.14]" />
                                    <span className="font-display text-lg italic text-accent">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div className="relative flex-1">
                                        <h2 className="font-display text-2xl italic text-fg">{cat}</h2>
                                        <p className="mt-1 text-sm text-fg-subtle">{categoryDescriptions[cat]}</p>
                                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-accent">
                                            {products.length} {products.length === 1 ? 'produto' : 'produtos'}
                                        </p>
                                    </div>
                                    <span className="relative text-fg-subtle transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">
                                        →
                                    </span>
                                </Link>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
