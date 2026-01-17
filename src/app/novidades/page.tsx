'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useProducts } from '@/contexts/ProductContext';

export default function NovidadesPage() {
    const { products } = useProducts();

    // Get newest products (last 30 days simulation - using most recent)
    const newestProducts = [...products]
        .filter(p => p.active)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 12);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-brand-700 to-brand-500 py-12">
                <div className="mx-auto max-w-7xl px-4 text-center">
                    <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium text-white">
                        ✨ Novidades
                    </span>
                    <h1 className="text-3xl font-bold text-white md:text-4xl">
                        Acabou de Chegar
                    </h1>
                    <p className="mt-2 text-brand-100">
                        Os lançamentos mais recentes da Dona Onça
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-12">
                {newestProducts.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <p className="text-gray-500">Nenhuma novidade no momento.</p>
                        <Link href="/produtos" className="mt-4 inline-block text-brand-600 hover:underline">
                            Ver todos os produtos →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                        {newestProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={`/produto/${product.id}`}
                                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    <Image
                                        src={product.images[0] || '/logo.png'}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-6 transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white">
                                        Novo
                                    </span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                                            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                        </span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <p className="mb-1 text-xs text-brand-600">{product.category}</p>
                                    <h3 className="mb-1 font-medium text-gray-900 line-clamp-2 group-hover:text-brand-600">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-lg font-bold text-brand-600">
                                            R$ {product.price.toFixed(2).replace('.', ',')}
                                        </p>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <p className="text-sm text-gray-400 line-through">
                                                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
