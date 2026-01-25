'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useProducts, categories } from '@/contexts/ProductContext';
import FavoriteButton from '@/components/FavoriteButton';

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
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#d6008b]" />
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
        <div className="min-h-screen">
            {/* Header with background image */}
            <div className="relative py-16 md:py-20 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="/header-bg-v2.png"
                        alt=""
                        fill
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
                <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
                    <h1
                        className="text-3xl font-semibold text-white md:text-5xl tracking-wide"
                        style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                    >
                        {selectedCategory === 'Todos' ? 'Nossa Coleção' : selectedCategory}
                    </h1>
                    <p className="mt-4 text-white/60 text-lg">
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
                                <h3
                                    className="mb-4 text-sm font-bold uppercase tracking-wider text-white"
                                    style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                                >
                                    Categorias
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory('Todos')}
                                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'Todos' ? 'bg-[#d6008b]/20 text-[#d6008b] font-semibold border border-[#d6008b]/30' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        Todos os Produtos
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat ? 'bg-[#d6008b]/20 text-[#d6008b] font-semibold border border-[#d6008b]/30' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sizes */}
                            {allSizes.length > 0 && (
                                <div>
                                    <h3
                                        className="mb-4 text-sm font-bold uppercase tracking-wider text-white"
                                        style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                                    >
                                        Tamanhos
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {allSizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => toggleSize(size)}
                                                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-semibold transition-all ${selectedSizes.includes(size) ? 'border-[#d6008b] bg-[#d6008b] text-white glow-neon' : 'border-white/20 bg-white/5 text-white/70 hover:border-[#d6008b]/50'}`}
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
                                    <h3
                                        className="mb-4 text-sm font-bold uppercase tracking-wider text-white"
                                        style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                                    >
                                        Cores
                                    </h3>
                                    <div className="space-y-2">
                                        {allColors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => toggleColor(color)}
                                                className="flex w-full items-center gap-3 group"
                                            >
                                                <div className={`h-4 w-4 rounded-full border transition-all ${selectedColors.includes(color) ? 'bg-[#d6008b] border-[#d6008b] ring-2 ring-[#d6008b]/30' : 'bg-white/10 border-white/30'}`} />
                                                <span className={`text-sm transition-colors ${selectedColors.includes(color) ? 'text-[#d6008b] font-medium' : 'text-white/70 group-hover:text-white'}`}>{color}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clear All */}
                            {(selectedCategory !== 'Todos' || selectedSizes.length > 0 || selectedColors.length > 0) && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm font-medium text-[#d6008b] hover:text-white transition-colors"
                                >
                                    Limpar todos os filtros
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Mobile Filter Toggle & Sort */}
                        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl glass border border-white/10 p-4">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/80 hover:border-[#d6008b]/50 transition-colors lg:hidden"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                {isSidebarOpen ? 'Fechar Filtros' : 'Filtros'}
                            </button>
                            <div className="hidden text-sm text-white/50 lg:block">
                                Exibindo {filteredAndSortedProducts.length} produtos
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="rounded-xl border border-white/20 bg-black/40 px-4 py-2 text-sm text-white focus:border-[#d6008b] focus:outline-none"
                            >
                                <option value="newest">Mais recentes</option>
                                <option value="price-low">Menor preço</option>
                                <option value="price-high">Maior preço</option>
                                <option value="name">A-Z</option>
                            </select>
                        </div>

                        {/* Products Grid */}
                        {filteredAndSortedProducts.length === 0 ? (
                            <div className="rounded-2xl card-dark p-12 text-center">
                                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/5">
                                    <svg className="h-12 w-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h2
                                    className="mb-2 text-xl font-semibold text-white"
                                    style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                                >
                                    Nenhum produto encontrado
                                </h2>
                                <p className="text-white/50">Tente ajustar seus filtros para encontrar o que procura</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-6">
                                {filteredAndSortedProducts.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/produto/${product.id}`}
                                        className="group card-dark overflow-hidden transition-all hover:-translate-y-1"
                                    >
                                        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#1a0510]/50 to-transparent">
                                            <Image
                                                src={product.images[0] || '/logo.png'}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <span className="absolute left-3 top-3 rounded-full border border-[#d6008b] bg-black/60 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                                                {product.category}
                                            </span>
                                            {product.originalPrice && product.originalPrice > product.price && (
                                                <span className="absolute right-3 top-3 rounded-full bg-[#d6008b] px-2 py-1 text-[10px] font-bold text-white shadow-sm glow-neon">
                                                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                                </span>
                                            )}
                                            {product.stock === 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                                                    <span className="rounded-lg border border-white/20 bg-black/80 px-3 py-1 text-xs font-bold uppercase text-white">
                                                        Esgotado
                                                    </span>
                                                </div>

                                            )}
                                            <div className="absolute right-3 bottom-3 z-10">
                                                <FavoriteButton productId={product.id} />
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="mb-1 text-sm font-medium text-white line-clamp-2 transition-colors group-hover:text-[#d6008b]">
                                                {product.name}
                                            </h3>
                                            <div className="flex flex-wrap items-baseline gap-2">
                                                <p className="text-base font-bold text-[#d6008b]">
                                                    R$ {product.price.toFixed(2).replace('.', ',')}
                                                </p>
                                                {product.originalPrice && product.originalPrice > product.price && (
                                                    <p className="text-xs text-white/40 line-through">
                                                        R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="mt-1 text-[10px] text-white/40 font-medium italic">
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
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d6008b] border-t-transparent"></div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
