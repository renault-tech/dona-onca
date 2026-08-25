'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProducts, type Product } from '@/contexts/ProductContext';
import { useCart } from '@/contexts/CartContext';
import FavoriteButton from '@/components/FavoriteButton';
import BackButton from '@/components/BackButton';
import SizeGuideDrawer from '@/components/product/SizeGuideDrawer';
import OncaRosette from '@/components/brand/OncaRosette';
import { calculateShippingByCep } from '@/lib/shipping';

interface ProductDetailViewProps {
    /** Produto já resolvido no servidor (para generateMetadata). Evita o
     * flash de loading enquanto o ProductContext busca no cliente. */
    initialProduct?: Product | null;
}

export default function ProductDetailView({ initialProduct }: ProductDetailViewProps) {
    const params = useParams();
    const router = useRouter();
    const { getProductById, generalSettings } = useProducts();
    const { addItem } = useCart();
    const product = initialProduct ?? getProductById(Number(params.id));

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [currentImage, setCurrentImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showDescription, setShowDescription] = useState(true);
    const [addedToCart, setAddedToCart] = useState(false);
    const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
    const [selectionError, setSelectionError] = useState('');

    const [cep, setCep] = useState('');
    const [shippingResult, setShippingResult] = useState<{ value: number; uf: string } | null>(null);
    const [shippingError, setShippingError] = useState('');
    const [loadingCep, setLoadingCep] = useState(false);

    if (!product) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="font-display mb-4 text-2xl italic text-fg">Produto não encontrado</h1>
                    <Link href="/produtos" className="text-accent hover:underline">
                        ← Voltar aos produtos
                    </Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (product.hasSize && !selectedSize) {
            setSelectionError('Selecione um tamanho para continuar.');
            return;
        }
        if (product.hasColor && !selectedColor) {
            setSelectionError('Selecione uma cor para continuar.');
            return;
        }
        setSelectionError('');

        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            size: selectedSize || 'Único',
            color: selectedColor || 'Único',
            quantity,
            image: product.images[0] || '/logo.png',
        });

        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        if (product.hasSize && !selectedSize) {
            setSelectionError('Selecione um tamanho para continuar.');
            return;
        }
        if (product.hasColor && !selectedColor) {
            setSelectionError('Selecione uma cor para continuar.');
            return;
        }
        handleAddToCart();
        router.push('/checkout');
    };

    const handleCalculateShipping = async () => {
        setShippingError('');
        setShippingResult(null);
        setLoadingCep(true);
        try {
            const result = await calculateShippingByCep(cep, product.price * quantity, generalSettings.freeShippingThreshold);
            setShippingResult(result);
        } catch {
            setShippingError('CEP inválido ou não encontrado.');
        } finally {
            setLoadingCep(false);
        }
    };

    const images = product.images.length > 0 ? product.images : ['/logo.png'];
    const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;

    return (
        <div className="min-h-screen pb-28 lg:pb-0">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
                <div className="mb-4">
                    <BackButton label="Voltar" fallbackHref="/produtos" />
                </div>

                <nav className="mb-8 text-xs uppercase tracking-wide text-fg-subtle">
                    <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/produtos" className="hover:text-accent transition-colors">Produtos</Link>
                    <span className="mx-2">/</span>
                    <Link href={`/produtos?categoria=${encodeURIComponent(product.category)}`} className="hover:text-accent transition-colors">
                        {product.category}
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-fg-muted">{product.name}</span>
                </nav>

                <div className="grid gap-10 lg:grid-cols-2">
                    {/* Galeria */}
                    <div className="space-y-3">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-onca bg-surface">
                            <Image
                                src={images[currentImage]}
                                alt={product.name}
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-contain p-8"
                            />
                            {hasDiscount && (
                                <span className="absolute left-4 top-4 rounded-full bg-fg px-3 py-1 text-xs font-semibold uppercase tracking-wide text-bg">
                                    -{Math.round((1 - product.price / product.originalPrice!) * 100)}%
                                </span>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentImage(i)}
                                        aria-label={`Ver imagem ${i + 1}`}
                                        className={`relative aspect-square overflow-hidden rounded-lg bg-surface transition-all ${currentImage === i ? 'ring-2 ring-accent' : 'opacity-70 hover:opacity-100'}`}
                                    >
                                        <Image src={img} alt="" fill sizes="120px" className="object-contain p-2" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Informações */}
                    <div className="flex flex-col">
                        <span className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">{product.category}</span>
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <h1 className="font-display text-3xl italic text-fg">{product.name}</h1>
                            <FavoriteButton productId={product.id} iconSize={7} />
                        </div>

                        <div className="mb-1 flex items-baseline gap-3">
                            <span className="text-3xl font-semibold text-accent">
                                R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                            {hasDiscount && (
                                <span className="text-lg text-fg-subtle line-through">
                                    R$ {product.originalPrice!.toFixed(2).replace('.', ',')}
                                </span>
                            )}
                        </div>
                        <p className="mb-6 text-sm text-fg-subtle">
                            ou 3x de <strong className="text-fg-muted">R$ {(product.price / 3).toFixed(2).replace('.', ',')}</strong> sem juros
                        </p>

                        {product.hasColor && product.colors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="mb-3 text-sm font-medium text-fg">
                                    Cor: <span className="text-fg-muted">{selectedColor || 'Selecione'}</span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => { setSelectedColor(color); setSelectionError(''); }}
                                            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${selectedColor === color ? 'border-accent bg-accent/15 text-accent' : 'border-border text-fg-muted hover:border-accent/50'}`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.hasSize && product.sizes.length > 0 && (
                            <div className="mb-6">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-fg">
                                        Tamanho: <span className="text-fg-muted">{selectedSize || 'Selecione'}</span>
                                    </h3>
                                    <button
                                        onClick={() => setSizeGuideOpen(true)}
                                        className="text-xs text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent transition-colors"
                                    >
                                        Guia de tamanhos
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => { setSelectedSize(size); setSelectionError(''); }}
                                            className={`flex h-12 min-w-12 items-center justify-center rounded-xl border px-3 font-medium transition-all ${selectedSize === size ? 'border-accent bg-accent text-white' : 'border-border text-fg-muted hover:border-accent/50'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="mb-3 text-sm font-medium text-fg">Quantidade</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    aria-label="Diminuir quantidade"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-fg-muted hover:border-accent hover:text-accent transition-colors"
                                >
                                    −
                                </button>
                                <span className="w-8 text-center font-medium text-fg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    aria-label="Aumentar quantidade"
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-fg-muted hover:border-accent hover:text-accent transition-colors"
                                >
                                    +
                                </button>
                                <span className="text-sm text-fg-subtle">({product.stock} disponíveis)</span>
                            </div>
                        </div>

                        {selectionError && (
                            <p className="mb-4 text-sm text-accent" role="alert">{selectionError}</p>
                        )}

                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`mb-3 flex items-center justify-center gap-2 rounded-onca py-4 text-base font-semibold transition-all ${product.stock === 0
                                ? 'cursor-not-allowed bg-surface text-fg-subtle'
                                : addedToCart
                                    ? 'bg-emerald-600 text-white'
                                    : 'btn-fill'
                                }`}
                        >
                            {product.stock === 0 ? (
                                'Esgotado'
                            ) : addedToCart ? (
                                <>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Adicionado à Sacola
                                </>
                            ) : (
                                <>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Adicionar à Sacola
                                </>
                            )}
                        </button>

                        {product.stock > 0 && (
                            <button onClick={handleBuyNow} className="mb-6 rounded-onca border border-accent py-4 text-base font-semibold text-fg transition-colors hover:bg-accent/10">
                                Comprar Agora
                            </button>
                        )}

                        {/* Frete */}
                        <div className="mb-6 rounded-onca surface p-4">
                            <label htmlFor="cep-pdp" className="mb-2 block text-xs font-medium uppercase tracking-wide text-fg-subtle">
                                Calcular frete e prazo
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="cep-pdp"
                                    type="text"
                                    value={cep}
                                    onChange={(e) => setCep(e.target.value)}
                                    placeholder="00000-000"
                                    maxLength={9}
                                    className="field flex-1 px-4 py-2.5 text-sm"
                                />
                                <button
                                    onClick={handleCalculateShipping}
                                    disabled={loadingCep}
                                    className="rounded-onca border border-border px-4 py-2.5 text-sm font-medium text-fg-muted hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                                >
                                    {loadingCep ? '...' : 'Calcular'}
                                </button>
                            </div>
                            {shippingError && <p className="mt-2 text-xs text-accent">{shippingError}</p>}
                            {shippingResult && !shippingError && (
                                <p className="mt-2 text-xs text-emerald-400">
                                    Frete para {shippingResult.uf}: {shippingResult.value === 0 ? 'Grátis!' : `R$ ${shippingResult.value.toFixed(2).replace('.', ',')}`}
                                </p>
                            )}
                        </div>

                        {/* Confiança */}
                        <div className="mb-6 space-y-2.5 rounded-onca surface p-4">
                            {[
                                `Frete grátis para compras acima de R$ ${generalSettings.freeShippingThreshold.toFixed(2).replace('.', ',')}`,
                                'Troca e devolução em até 30 dias',
                                'Embalagem discreta, sem identificação do conteúdo',
                            ].map((line) => (
                                <div key={line} className="flex items-center gap-3 text-sm text-fg-muted">
                                    <OncaRosette className="h-4 w-4 flex-shrink-0 text-accent" aria-hidden />
                                    <span>{line}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-border pt-6">
                            <button
                                onClick={() => setShowDescription(!showDescription)}
                                className="flex w-full items-center justify-between py-2 text-left text-sm font-medium text-fg"
                            >
                                Descrição do Produto
                                <svg
                                    className={`h-5 w-5 transition-transform ${showDescription ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {showDescription && (
                                <div className="whitespace-pre-line py-4 text-sm text-fg-muted">
                                    {product.description || 'Sem descrição disponível.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra fixa mobile */}
            {product.stock > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-bg/95 backdrop-blur-sm p-4 lg:hidden">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-xs text-fg-subtle">Total</p>
                            <p className="text-lg font-semibold text-accent">
                                R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className={`flex-1 rounded-onca py-3 font-semibold text-white transition-colors ${addedToCart ? 'bg-emerald-600' : 'bg-accent'}`}
                        >
                            {addedToCart ? 'Adicionado!' : 'Adicionar'}
                        </button>
                    </div>
                </div>
            )}

            <SizeGuideDrawer open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
        </div>
    );
}
