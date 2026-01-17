'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useProducts, categories } from '@/contexts/ProductContext';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

export default function ProductsPage() {
    const { products, getProductsByCategory } = useProducts();
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    const filteredProducts = getProductsByCategory(selectedCategory);

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'newest':
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-brand-600 py-12">
                <div className="mx-auto max-w-7xl px-4 text-center">
                    <h1 className="text-3xl font-bold text-white md:text-4xl">
                        {selectedCategory === 'Todos' ? 'Nossa Coleção' : selectedCategory}
                    </h1>
                    <p className="mt-2 text-brand-100">
                        {sortedProducts.length} {sortedProducts.length === 1 ? 'produto' : 'produtos'}
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Filters */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('Todos')}
                            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${selectedCategory === 'Todos'
                                    ? 'border-brand-600 bg-brand-600 text-white'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-brand-500 hover:text-brand-600'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${selectedCategory === cat
                                        ? 'border-brand-600 bg-brand-600 text-white'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-brand-500 hover:text-brand-600'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none"
                    >
                        <option value="newest">Mais recentes</option>
                        <option value="price-low">Menor preço</option>
                        <option value="price-high">Maior preço</option>
                        <option value="name">A-Z</option>
                    </select>
                </div>

                {/* Products Grid */}
                {sortedProducts.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h2 className="mb-2 text-xl font-semibold text-gray-900">Nenhum produto encontrado</h2>
                        <p className="text-gray-500">Tente selecionar outra categoria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                        {sortedProducts.map((product) => (
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
                                        {product.category}
                                    </span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                                            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                        </span>
                                    )}
                                </div>
                                <div className="p-4">
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
                                    <p className="text-xs text-gray-500">
                                        ou 3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
