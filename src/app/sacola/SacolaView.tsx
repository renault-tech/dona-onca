'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';
import { calculateShippingByCep } from '@/lib/shipping';
import EmptyState from '@/components/ui/EmptyState';
import OncaRosette from '@/components/brand/OncaRosette';

export default function SacolaView() {
    const { items, updateQuantity, removeItem, subtotal, shipping } = useCart();
    const { user, loading: authLoading } = useAuth();
    const { generalSettings } = useProducts();
    const [cep, setCep] = useState('');
    const [calculatedShipping, setCalculatedShipping] = useState<number | null>(null);
    const [loadingCep, setLoadingCep] = useState(false);
    const [shippingError, setShippingError] = useState('');

    const handleCalculateShipping = async () => {
        setShippingError('');
        setLoadingCep(true);
        try {
            const { value } = await calculateShippingByCep(cep, subtotal, generalSettings.freeShippingThreshold);
            setCalculatedShipping(value);
        } catch {
            setShippingError('CEP inválido ou não encontrado.');
            setCalculatedShipping(null);
        } finally {
            setLoadingCep(false);
        }
    };

    const displayShipping = calculatedShipping !== null ? calculatedShipping : shipping;
    const displayTotal = subtotal + displayShipping;

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen">
                <div className="mx-auto max-w-7xl px-4 py-16">
                    <h1 className="font-display mb-8 text-3xl italic text-fg">Sua Sacola</h1>
                    <div className="rounded-onca surface flex flex-col items-center gap-4 p-12 text-center">
                        <OncaRosette className="h-10 w-10 text-fg-subtle" aria-hidden />
                        <h2 className="text-lg font-semibold text-fg">Faça login para ver sua sacola</h2>
                        <p className="text-fg-subtle">Entre na sua conta para acessar seu carrinho de compras</p>
                        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                            <Link href="/conta" className="btn btn-fill px-8 py-3 text-sm">
                                Entrar na Conta
                            </Link>
                            <Link href="/produtos" className="btn btn-outline px-8 py-3 text-sm">
                                Ver Produtos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-16">
                <h1 className="font-display mb-8 text-3xl italic text-fg">Sua Sacola</h1>

                {items.length === 0 ? (
                    <EmptyState message="Sua sacola está vazia." actionLabel="Ver produtos" actionHref="/produtos" />
                ) : (
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Itens */}
                        <div className="space-y-4 lg:col-span-2">
                            {items.map((item) => (
                                <div key={item.id} className="surface flex gap-4 p-4">
                                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-bg">
                                        <Image src={item.image || '/logo.png'} alt={item.name} fill sizes="96px" className="object-cover" />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <Link href={`/produto/${item.productId}`} className="font-medium text-fg hover:text-accent transition-colors">
                                                {item.name}
                                            </Link>
                                            <p className="text-sm text-fg-subtle">
                                                {item.color} · Tam. {item.size}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    aria-label="Diminuir quantidade"
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted hover:border-accent hover:text-accent transition-colors"
                                                >
                                                    −
                                                </button>
                                                <span className="w-8 text-center text-fg">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    aria-label="Aumentar quantidade"
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted hover:border-accent hover:text-accent transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="font-semibold text-accent">
                                                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        aria-label={`Remover ${item.name}`}
                                        className="text-fg-subtle hover:text-accent transition-colors"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Resumo */}
                        <div className="surface h-fit p-6">
                            <h2 className="mb-4 text-lg font-semibold text-fg">Resumo</h2>

                            <div className="mb-4 border-b border-border pb-4">
                                <label htmlFor="cep-sacola" className="mb-2 block text-sm font-medium text-fg-muted">
                                    Calcular Frete
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        id="cep-sacola"
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
                                {calculatedShipping !== null && !shippingError && (
                                    <p className="mt-2 text-xs text-emerald-400">
                                        Frete calculado: {calculatedShipping === 0 ? 'Grátis!' : `R$ ${calculatedShipping.toFixed(2).replace('.', ',')}`}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3 border-b border-border pb-4">
                                <div className="flex justify-between text-fg-muted">
                                    <span>Subtotal</span>
                                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-fg-muted">
                                    <span>Frete</span>
                                    <span className={displayShipping === 0 ? 'font-medium text-emerald-400' : ''}>
                                        {displayShipping === 0 ? 'Grátis' : `R$ ${displayShipping.toFixed(2).replace('.', ',')}`}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between py-4 text-lg font-semibold text-fg">
                                <span>Total</span>
                                <span className="text-accent">R$ {displayTotal.toFixed(2).replace('.', ',')}</span>
                            </div>

                            {displayShipping > 0 && subtotal > 0 && subtotal < generalSettings.freeShippingThreshold && (
                                <p className="mb-4 rounded-onca bg-accent/10 p-3 text-center text-sm text-accent">
                                    Faltam <strong>R$ {(generalSettings.freeShippingThreshold - subtotal).toFixed(2).replace('.', ',')}</strong> para frete grátis!
                                </p>
                            )}

                            <Link href="/checkout" className="btn btn-fill block w-full py-4 text-sm">
                                Finalizar Compra
                            </Link>
                            <Link href="/produtos" className="mt-3 block text-center text-sm text-accent hover:underline">
                                Continuar Comprando
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
