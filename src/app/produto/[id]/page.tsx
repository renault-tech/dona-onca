'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProducts } from '@/contexts/ProductContext';
import { useCart } from '@/contexts/CartContext';
import FavoriteButton from '@/components/FavoriteButton';

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const { getProductById } = useProducts();
    const { addItem } = useCart();
    const product = getProductById(Number(params.id));

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [currentImage, setCurrentImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showDescription, setShowDescription] = useState(true);
    const [addedToCart, setAddedToCart] = useState(false);

    if (!product) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-bold text-gray-900">Produto não encontrado</h1>
                    <Link href="/produtos" className="text-brand-600 hover:underline">
                        ← Voltar aos produtos
                    </Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (product.hasSize && !selectedSize) {
            alert('Por favor, selecione um tamanho');
            return;
        }
        if (product.hasColor && !selectedColor) {
            alert('Por favor, selecione uma cor');
            return;
        }

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
        handleAddToCart();
        router.push('/checkout');
    };

    const images = product.images.length > 0 ? product.images : ['/logo.png'];

    return (
        <div className="min-h-screen bg-white pb-24 lg:pb-0">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Breadcrumb */}
                <nav className="mb-8 text-sm text-gray-500">
                    <Link href="/" className="hover:text-brand-600">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/produtos" className="hover:text-brand-600">Produtos</Link>
                    <span className="mx-2">/</span>
                    <Link href={`/produtos?categoria=${encodeURIComponent(product.category)}`} className="hover:text-brand-600">
                        {product.category}
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">{product.name}</span>
                </nav>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                            <Image
                                src={images[currentImage]}
                                alt={product.name}
                                fill
                                className="object-contain p-8"
                                priority
                            />
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                </span>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentImage(i)}
                                        className={`relative aspect-square overflow-hidden rounded-xl bg-gray-100 ${currentImage === i ? 'ring-2 ring-brand-600' : ''
                                            }`}
                                    >
                                        <Image src={img} alt="" fill className="object-contain p-2" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <span className="mb-2 text-sm font-medium text-brand-600">
                            {product.category}
                        </span>
                        <div className="mb-4 flex items-start justify-between">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {product.name}
                            </h1>
                            <FavoriteButton productId={product.id} className="bg-gray-50" iconSize={8} />
                        </div>

                        {/* Price */}
                        <div className="mb-6 flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-brand-600">
                                R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-lg text-gray-400 line-through">
                                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                                </span>
                            )}
                        </div>

                        {/* Installments */}
                        <p className="mb-6 text-sm text-gray-500">
                            ou 3x de <strong>R$ {(product.price / 3).toFixed(2).replace('.', ',')}</strong> sem juros
                        </p>

                        {/* Color Selection */}
                        {product.hasColor && product.colors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="mb-3 font-medium text-gray-900">
                                    Cor: <span className="text-gray-600">{selectedColor || 'Selecione'}</span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all ${selectedColor === color
                                                ? 'border-brand-600 bg-brand-50 text-brand-600'
                                                : 'border-gray-200 text-gray-700 hover:border-brand-300'
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selection */}
                        {product.hasSize && product.sizes.length > 0 && (
                            <div className="mb-6">
                                <h3 className="mb-3 font-medium text-gray-900">
                                    Tamanho: <span className="text-gray-600">{selectedSize || 'Selecione'}</span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`flex h-12 min-w-12 items-center justify-center rounded-xl border-2 px-3 font-medium transition-all ${selectedSize === size
                                                ? 'border-brand-600 bg-brand-600 text-white'
                                                : 'border-gray-200 text-gray-700 hover:border-brand-300'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="mb-6">
                            <h3 className="mb-3 font-medium text-gray-900">Quantidade</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                                >
                                    +
                                </button>
                                <span className="text-sm text-gray-500">
                                    ({product.stock} disponíveis)
                                </span>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`mb-4 flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-semibold transition-all ${product.stock === 0
                                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                                : addedToCart
                                    ? 'bg-green-500 text-white'
                                    : 'bg-brand-600 text-white hover:bg-brand-700'
                                }`}
                        >
                            {product.stock === 0 ? (
                                'Esgotado'
                            ) : addedToCart ? (
                                <>
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Adicionado à Sacola!
                                </>
                            ) : (
                                <>
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Adicionar à Sacola
                                </>
                            )}
                        </button>

                        {/* Buy Now */}
                        {product.stock > 0 && (
                            <button
                                onClick={handleBuyNow}
                                className="mb-6 flex items-center justify-center rounded-2xl border-2 border-brand-600 py-4 text-lg font-semibold text-brand-600 transition-all hover:bg-brand-50"
                            >
                                Comprar Agora
                            </button>
                        )}

                        {/* Shipping Info */}
                        <div className="mb-6 rounded-2xl bg-gray-50 p-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Frete grátis para compras acima de R$ 199</span>
                            </div>
                            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Troca e devolução em até 30 dias</span>
                            </div>
                        </div>

                        {/* Description Accordion */}
                        <div className="border-t border-gray-200 pt-6">
                            <button
                                onClick={() => setShowDescription(!showDescription)}
                                className="flex w-full items-center justify-between py-2 text-left font-medium text-gray-900"
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
                                <div className="py-4 text-gray-600 whitespace-pre-line">
                                    {product.description || 'Sem descrição disponível.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Buy Button */}
            {product.stock > 0 && (
                <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 lg:hidden">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-xl font-bold text-brand-600">
                                R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className={`flex-1 rounded-xl py-3 font-semibold text-white ${addedToCart ? 'bg-green-500' : 'bg-brand-600'
                                }`}
                        >
                            {addedToCart ? '✓ Adicionado!' : 'Adicionar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
