'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { supabase } from '@/lib/supabase';
import FavoriteButton from '@/components/FavoriteButton';
import Reveal from '@/components/motion/Reveal';
import MarqueeRibbon from '@/components/shell/MarqueeRibbon';
import TrustBand from '@/components/shell/TrustBand';

function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setStatus('sending');
        try {
            const { error } = await supabase.from('newsletter_subscribers').insert([{ email: email.trim() }]);
            if (error) throw error;
            setStatus('success');
            setEmail('');
        } catch (err) {
            console.error('Newsletter signup failed:', err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <p className="text-accent font-medium">Cadastro feito! Em breve você recebe nossas novidades.</p>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                className="field px-6 py-4 sm:w-80"
            />
            <button type="submit" disabled={status === 'sending'} className="btn btn-fill px-8 py-4 text-sm disabled:opacity-60">
                {status === 'sending' ? 'Enviando...' : 'Cadastrar'}
            </button>
            {status === 'error' && (
                <p className="text-xs text-fg-subtle sm:absolute sm:mt-14">
                    Não foi possível cadastrar agora. Tente novamente em instantes.
                </p>
            )}
        </form>
    );
}

export default function HomeView() {
    const { products, loading, homeBanners } = useProducts();
    const activeProducts = products.filter((p) => p.active);
    const featuredProducts = activeProducts.slice(0, 6);
    const sortedBanners = [...homeBanners].sort((a, b) => a.order - b.order);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
                    <p className="font-medium text-fg-muted">Carregando Dona Onça...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative h-[90vh] min-h-[700px] overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/header-bg-v2.png"
                        alt=""
                        fill
                        className="object-cover"
                        style={{ objectPosition: 'center top' }}
                        priority
                        sizes="100vw"
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to bottom,
                rgba(5, 5, 5, 0.1) 0%,
                rgba(5, 5, 5, 0.35) 55%,
                rgba(5, 5, 5, 0.85) 85%,
                rgba(5, 5, 5, 1) 100%)`,
                        }}
                    />
                </div>

                <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-24 sm:px-8">
                    <Reveal as="p" className="mb-4 text-xs uppercase tracking-[0.35em] text-accent">
                        Coleção atual
                    </Reveal>
                    <Reveal delay={120}>
                        <h1 className="font-display max-w-3xl text-5xl italic leading-[0.95] text-fg sm:text-7xl lg:text-8xl">
                            Sensualidade
                            <br />
                            em cada detalhe.
                        </h1>
                    </Reveal>
                    <Reveal delay={280} className="mt-8">
                        <Link href="/produtos" className="btn btn-fill inline-flex px-10 py-4 text-xs sm:text-sm">
                            Explorar coleção
                        </Link>
                    </Reveal>
                </div>
            </section>

            <MarqueeRibbon text="Dona Onça" className="border-y border-border bg-black py-4" />

            {/* Categorias — blocos editoriais numerados, não círculos */}
            <section className="relative py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-8">
                    <Reveal>
                        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-fg-subtle">Explore</p>
                        <h2 className="font-display text-3xl italic text-fg sm:text-4xl">Nossas coleções</h2>
                    </Reveal>

                    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {sortedBanners.map((banner, i) => (
                            <Reveal key={banner.id} delay={i * 100}>
                                <Link href={banner.link} className="group relative block aspect-[4/5] overflow-hidden rounded-onca surface">
                                    {banner.image ? (
                                        <Image
                                            src={banner.image}
                                            alt={banner.name}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-bg-warm">
                                            <Image
                                                src="/logo.png"
                                                alt=""
                                                width={96}
                                                height={96}
                                                className="h-24 w-24 object-contain opacity-30"
                                                aria-hidden
                                            />
                                        </div>
                                    )}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background:
                                                'linear-gradient(to top, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.15) 55%, transparent 100%)',
                                        }}
                                    />
                                    <span className="absolute left-5 top-5 font-display text-sm italic text-accent">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div className="absolute inset-x-5 bottom-5 flex items-center justify-between">
                                        <h3 className="font-display text-2xl italic text-fg">{banner.name}</h3>
                                        <span className="text-fg transition-transform duration-300 group-hover:translate-x-1">
                                            →
                                        </span>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Destaques */}
            <section className="py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-8">
                    <Reveal className="mb-12 flex items-end justify-between">
                        <div>
                            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-fg-subtle">Selecionados</p>
                            <h2 className="font-display text-3xl italic text-fg sm:text-4xl">Destaques</h2>
                        </div>
                        <Link href="/produtos" className="text-sm font-medium text-accent hover:text-fg transition-colors">
                            Ver todos →
                        </Link>
                    </Reveal>

                    {featuredProducts.length === 0 ? (
                        <div className="rounded-onca surface p-12 text-center">
                            <p className="text-fg-subtle">Nenhum produto cadastrado ainda.</p>
                            <Link href="/admin/products/new" className="mt-4 inline-block text-accent hover:underline">
                                Adicionar primeiro produto →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
                            {featuredProducts.map((product, i) => (
                                <Reveal key={product.id} delay={(i % 3) * 90}>
                                    <Link href={`/produto/${product.id}`} className="group block">
                                        <div className="relative aspect-[4/5] overflow-hidden rounded-onca bg-surface">
                                            <Image
                                                src={product.images[0] || '/logo.png'}
                                                alt={product.name}
                                                fill
                                                sizes="(max-width: 768px) 50vw, 33vw"
                                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            />
                                            <span className="absolute left-3 top-3 rounded-full bg-bg/80 px-3 py-1 text-[10px] uppercase tracking-wide text-fg-muted backdrop-blur-sm">
                                                {product.category}
                                            </span>
                                            <div className="absolute right-3 bottom-3 z-10">
                                                <FavoriteButton productId={product.id} />
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <h3 className="text-sm text-fg-muted line-clamp-1 group-hover:text-fg transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="mt-1 text-base font-semibold text-accent">
                                                R$ {product.price.toFixed(2).replace('.', ',')}
                                            </p>
                                        </div>
                                    </Link>
                                </Reveal>
                            ))}
                        </div>
                    )}

                    <TrustBand className="mt-20" />
                </div>
            </section>

            {/* Newsletter */}
            <section className="relative py-24">
                <div className="relative mx-auto max-w-3xl px-4 text-center">
                    <Reveal>
                        <h2 className="font-display text-3xl italic text-fg sm:text-4xl">Receba novidades</h2>
                        <p className="mt-4 mb-8 text-fg-muted">
                            Cadastre-se e seja a primeira a saber das nossas ofertas exclusivas.
                        </p>
                        <NewsletterForm />
                    </Reveal>
                </div>
            </section>
        </div>
    );
}
