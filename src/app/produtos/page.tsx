'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useProducts, categories } from '@/contexts/ProductContext';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

function ProductsContent() {
    const { products, loading } = useProducts();
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('categoria');

    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        } else {
            setSelectedCategory('Todos');
        }
    }, [categoryParam]);

    // Extract all available sizes and colors from current products for filters
    const allSizes = Array.from(new Set(products.flatMap(p => p.sizes))).sort();
    const allColors = Array.from(new Set(products.flatMap(p => p.colors))).sort();

    const filteredAndSortedProducts = products
        .filter(p => {
            const isActive = p.active;
            const categoryMatch = selectedCategory === 'Todos' || p.category === selectedCategory;
            const sizeMatch = selectedSizes.length === 0 || p.sizes.some(s => selectedSizes.includes(s));
            const colorMatch = selectedColors.length === 0 || p.colors.some(c => selectedColors.includes(c));
            return isActive && categoryMatch && sizeMatch && colorMatch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low': return a.price - b.price;
                case 'price-high': return b.price - a.price;
                case 'name': return a.name.localeCompare(b.name);
                case 'newest':
                default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            </div>
        );
    }

    const toggleSize = (size: string) => {
        setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
    };

    const toggleColor = (color: string) => {
        setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
    };

    const clearFilters = () => {
        setSelectedSizes([]);
        setSelectedColors([]);
        setSelectedCategory('Todos');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-brand-600 py-10 md:py-16">
                <div className="mx-auto max-w-7xl px-4 text-center">
                    <h1 className="text-3xl font-bold text-white md:text-5xl">
                        {selectedCategory === 'Todos' ? 'Nossa Coleção' : selectedCategory}
                    </h1>
                    <p className="mt-3 text-brand-100/80 text-lg">
                        Encontre as peças perfeitas para realçar sua beleza.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Sidebar / Mobile Toggle */}
                    <aside className={`lg:w-64 flex-shrink-0 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
                        <div className="sticky top-24 space-y-8">
                            {/* Categories */}
                            <div>
                                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900">Categorias</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory('Todos')}
                                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'Todos' ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        Todos os Produtos
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sizes */}
                            {allSizes.length > 0 && (
                                <div>
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900">Tamanhos</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {allSizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => toggleSize(size)}
                                                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-semibold transition-all ${selectedSizes.includes(size) ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-brand-600'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Colors */}
                            {allColors.length > 0 && (
                                <div>
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900">Cores</h3>
                                    <div className="space-y-2">
                                        {allColors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => toggleColor(color)}
                                                className="flex w-full items-center gap-3 group"
                                            >
                                                <div className={`h-4 w-4 rounded-full border border-gray-300 transition-all ${selectedColors.includes(color) ? 'bg-brand-600 border-brand-600 ring-2 ring-brand-100' : 'bg-white'}`} />
                                                <span className={`text-sm transition-colors ${selectedColors.includes(color) ? 'text-brand-600 font-medium' : 'text-gray-600 group-hover:text-brand-500'}`}>{color}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clear All */}
                            {(selectedCategory !== 'Todos' || selectedSizes.length > 0 || selectedColors.length > 0) && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                                >
                                    Limpar todos os filtros
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Mobile Filter Toggle & Sort */}
                        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 lg:hidden"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                {isSidebarOpen ? 'Fechar Filtros' : 'Filtros'}
                            </button>
                            <div className="hidden text-sm text-gray-500 lg:block">
                                Exibindo {filteredAndSortedProducts.length} produtos
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
                        {filteredAndSortedProducts.length === 0 ? (
                            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h2 className="mb-2 text-xl font-semibold text-gray-900">Nenhum produto encontrado</h2>
                                <p className="text-gray-500">Tente ajustar seus filtros para encontrar o que procura</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-6">
                                {filteredAndSortedProducts.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/produto/${product.id}`}
                                        className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                                    >
                                        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                                            <Image
                                                src={product.images[0] || '/logo.png'}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <span className="absolute left-3 top-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-600 shadow-sm">
                                                {product.category}
                                            </span>
                                            {product.originalPrice && product.originalPrice > product.price && (
                                                <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                                                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                                </span>
                                            )}
                                            {product.stock === 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                                    <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold uppercase text-gray-900 shadow-xl">
                                                        Esgotado
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="mb-1 text-sm font-medium text-gray-900 line-clamp-2 transition-colors group-hover:text-brand-600">
                                                {product.name}
                                            </h3>
                                            <div className="flex flex-wrap items-baseline gap-2">
                                                <p className="text-base font-bold text-brand-600">
                                                    R$ {product.price.toFixed(2).replace('.', ',')}
                                                </p>
                                                {product.originalPrice && product.originalPrice > product.price && (
                                                    <p className="text-xs text-gray-400 line-through">
                                                        R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="mt-1 text-[10px] text-gray-400 font-medium italic">
                                                ou 3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
