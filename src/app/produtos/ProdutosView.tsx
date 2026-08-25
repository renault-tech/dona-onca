'use client';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useCallback } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

function ProductsContent() {
    const { products, loading, categories } = useProducts();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryParam = searchParams.get('q')?.trim().toLowerCase() ?? '';

    // A URL é a fonte da verdade dos filtros (categoria, tamanho, cor, ordenar) --
    // permite compartilhar um link já filtrado e o botão "voltar" do navegador
    // funciona naturalmente, sem estado duplicado em useState.
    const selectedCategory = searchParams.get('categoria') || 'Todos';
    const selectedSizes = searchParams.get('tamanho')?.split(',').filter(Boolean) ?? [];
    const selectedColors = searchParams.get('cor')?.split(',').filter(Boolean) ?? [];
    const sortBy = (searchParams.get('ordenar') as SortOption) || 'newest';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const updateParams = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (value) params.set(key, value);
            else params.delete(key);
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, router, pathname]);

    const setSelectedCategory = (cat: string) => updateParams({ categoria: cat === 'Todos' ? null : cat });
    const setSortBy = (sort: SortOption) => updateParams({ ordenar: sort === 'newest' ? null : sort });

    // Extract all available sizes and colors from current products for filters
    const allSizes = Array.from(new Set(products.flatMap(p => p.sizes))).sort();
    const allColors = Array.from(new Set(products.flatMap(p => p.colors))).sort();

    const filteredAndSortedProducts = products
        .filter(p => {
            const isActive = p.active;
            const categoryMatch = selectedCategory === 'Todos' || p.category === selectedCategory;
            const sizeMatch = selectedSizes.length === 0 || p.sizes.some(s => selectedSizes.includes(s));
            const colorMatch = selectedColors.length === 0 || p.colors.some(c => selectedColors.includes(c));
            const queryMatch = !queryParam || p.name.toLowerCase().includes(queryParam) || p.category.toLowerCase().includes(queryParam);
            return isActive && categoryMatch && sizeMatch && colorMatch && queryMatch;
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
        const next = selectedSizes.includes(size) ? selectedSizes.filter(s => s !== size) : [...selectedSizes, size];
        updateParams({ tamanho: next.length ? next.join(',') : null });
    };

    const toggleColor = (color: string) => {
        const next = selectedColors.includes(color) ? selectedColors.filter(c => c !== color) : [...selectedColors, color];
        updateParams({ cor: next.length ? next.join(',') : null });
    };

    const clearFilters = () => {
        updateParams({ categoria: null, tamanho: null, cor: null });
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
                <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
                    <h1 className="font-display text-3xl italic text-fg md:text-5xl">
                        {selectedCategory === 'Todos' ? 'Nossa Coleção' : selectedCategory}
                    </h1>
                    <p className="mt-4 text-fg-muted text-lg">
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
                                <h2 className="font-display mb-4 text-sm uppercase tracking-wider text-fg">
                                    Categorias
                                </h2>
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
                                    <h2 className="font-display mb-4 text-sm uppercase tracking-wider text-fg">
                                        Tamanhos
                                    </h2>
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
                                    <h2 className="font-display mb-4 text-sm uppercase tracking-wider text-fg">
                                        Cores
                                    </h2>
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
                                aria-label="Ordenar produtos"
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
                            <EmptyState message="Nenhum produto encontrado. Tente ajustar seus filtros." />
                        ) : (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-6">
                                {filteredAndSortedProducts.map((product, i) => (
                                    <ProductCard key={product.id} product={product} priority={i < 4} showInstallments />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProdutosView() {
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
