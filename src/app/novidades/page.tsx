'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useProducts } from '@/contexts/ProductContext';
import FavoriteButton from '@/components/FavoriteButton';

export default function NovidadesPage() {
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
                        className="object-cover"
                        style={{ objectPosition: 'center top' }}
                    />
                    {/* Gradient Overlay - fade to dark */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to bottom, 
                                rgba(13, 3, 8, 0.3) 0%, 
                                rgba(13, 3, 8, 0.6) 50%, 
                                rgba(5, 5, 5, 1) 100%)`
                        }}
                    />
                    {/* Reduce pink glow */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(ellipse at 0% 0%, rgba(5, 5, 5, 0.5) 0%, transparent 40%)`
                        }}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
                    <span
                        className="mb-4 inline-block rounded-full px-6 py-2 text-sm font-medium text-white"
                        style={{
                            background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.4) 0%, rgba(214, 0, 139, 0.2) 100%)',
                            border: '1px solid rgba(214, 0, 139, 0.5)',
                        }}
                    >
                        ✨ Novidades
                    </span>
                    <h1
                        className="text-4xl font-bold text-white md:text-5xl tracking-wide"
                        style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                    >
                        Acabou de Chegar
                    </h1>
                    <p className="mt-4 text-white/60 text-lg">
                        Os lançamentos mais recentes da Dona Onça
                    </p>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-4">
                    {newestProducts.length === 0 ? (
                        <div className="rounded-2xl card-dark p-12 text-center">
                            <p className="text-white/50">Nenhuma novidade no momento.</p>
                            <Link href="/produtos" className="mt-4 inline-block text-[#d6008b] hover:underline">
                                Ver todos os produtos →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                            {newestProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/produto/${product.id}`}
                                    className="group card-dark overflow-hidden"
                                >
                                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#1a0510]/50 to-transparent">
                                        <Image
                                            src={product.images[0] || '/logo.png'}
                                            alt={product.name}
                                            fill
                                            className="object-contain p-6 transition-transform duration-300 group-hover:scale-110"
                                        />
                                        <span
                                            className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium text-white"
                                            style={{
                                                background: 'linear-gradient(135deg, #d6008b 0%, #b80073 100%)',
                                                boxShadow: '0 0 10px rgba(214, 0, 139, 0.5)',
                                            }}
                                        >
                                            Novo
                                        </span>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                                                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                            </span>
                                        )}
                                        <div className="absolute right-3 bottom-3 z-10">
                                            <FavoriteButton productId={product.id} />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="mb-1 text-xs text-[#d6008b]">{product.category}</p>
                                        <h3 className="mb-1 font-medium text-white line-clamp-2 group-hover:text-[#d6008b] transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-lg font-bold text-[#d6008b]">
                                                R$ {product.price.toFixed(2).replace('.', ',')}
                                            </p>
                                            {product.originalPrice && product.originalPrice > product.price && (
                                                <p className="text-sm text-white/40 line-through">
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
            </section>
        </div>
    );
}
