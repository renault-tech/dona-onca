'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useProducts, categories } from '@/contexts/ProductContext';

const categoryDetails: Record<string, { icon: string; description: string; color: string }> = {
    'Lingerie': {
        icon: '💎',
        description: 'Sutiãs, calcinhas, conjuntos e mais',
        color: 'from-pink-500 to-rose-600',
    },
    'Pijamas': {
        icon: '🌙',
        description: 'Camisolas, pijamas de seda e cetim',
        color: 'from-purple-500 to-violet-600',
    },
    'Praia/Piscina': {
        icon: '🏖️',
        description: 'Biquínis, maiôs e saídas de praia',
        color: 'from-cyan-500 to-blue-600',
    },
    'Sexshop': {
        icon: '🔥',
        description: 'Fantasias, acessórios e cosméticos',
        color: 'from-red-500 to-orange-600',
    },
};

export default function CategoriesPage() {
    const { getProductsByCategory, loading } = useProducts();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-brand-600 py-12">
                <div className="mx-auto max-w-7xl px-4 text-center">
                    <h1 className="text-3xl font-bold text-white md:text-4xl">Categorias</h1>
                    <p className="mt-2 text-brand-100">Encontre o que você procura</p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="grid gap-6 md:grid-cols-2">
                    {categories.map((cat) => {
                        const products = getProductsByCategory(cat);
                        const details = categoryDetails[cat];

                        return (
                            <Link
                                key={cat}
                                href={`/produtos?categoria=${encodeURIComponent(cat)}`}
                                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${details.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                                <div className="relative flex items-center gap-6 p-8">
                                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 text-4xl">
                                        {details.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-brand-600">
                                            {cat}
                                        </h2>
                                        <p className="mt-1 text-gray-500">{details.description}</p>
                                        <p className="mt-2 text-sm font-medium text-brand-600">
                                            {products.length} {products.length === 1 ? 'produto' : 'produtos'}
                                        </p>
                                    </div>
                                    <svg className="h-6 w-6 text-gray-400 group-hover:text-brand-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
