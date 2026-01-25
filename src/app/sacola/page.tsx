'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CartPage() {
    const { items, updateQuantity, removeItem, subtotal, shipping, total } = useCart();
    const { user, loading: authLoading } = useAuth();
    const [cep, setCep] = useState('');
    const [calculatedShipping, setCalculatedShipping] = useState<number | null>(null);
    const [loadingCep, setLoadingCep] = useState(false);
    const [shippingError, setShippingError] = useState('');

    const handleCalculateShipping = async () => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) {
            setShippingError('CEP inválido');
            return;
        }

        setLoadingCep(true);
        setShippingError('');

        try {
            // Validate CEP using ViaCEP
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (data.erro) {
                setShippingError('CEP não encontrado');
                setCalculatedShipping(null);
            } else {
                // Simulate shipping calculation based on region
                // São Paulo: free for orders >= 199, else 15.90
                // Other capitals: 19.90
                // Interior: 25.90
                let shippingValue = 19.90;

                if (data.uf === 'SP') {
                    shippingValue = subtotal >= 199 ? 0 : 15.90;
                } else if (['RJ', 'MG', 'ES'].includes(data.uf)) {
                    shippingValue = subtotal >= 199 ? 0 : 19.90;
                } else if (['RS', 'SC', 'PR'].includes(data.uf)) {
                    shippingValue = subtotal >= 199 ? 0 : 22.90;
                } else {
                    shippingValue = subtotal >= 199 ? 0 : 29.90;
                }

                setCalculatedShipping(shippingValue);
            }
        } catch (error) {
            setShippingError('Erro ao calcular frete');
        } finally {
            setLoadingCep(false);
        }
    };

    const displayShipping = calculatedShipping !== null ? calculatedShipping : shipping;
    const displayTotal = subtotal + displayShipping;

    // If still loading auth, show spinner
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
            </div>
        );
    }

    // If not logged in, show login prompt
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <h1 className="mb-8 text-3xl font-bold text-gray-900">Sua Sacola</h1>
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand-50">
                            <svg className="h-12 w-12 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="mb-2 text-xl font-semibold text-gray-900">Faça login para ver sua sacola</h2>
                        <p className="mb-6 text-gray-500">Entre na sua conta para acessar seu carrinho de compras</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/conta"
                                className="inline-block rounded-xl bg-brand-600 px-8 py-3 font-medium text-white hover:bg-brand-700"
                            >
                                Entrar na Conta
                            </Link>
                            <Link
                                href="/produtos"
                                className="inline-block rounded-xl border border-gray-300 px-8 py-3 font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Ver Produtos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <h1 className="mb-8 text-3xl font-bold text-gray-900">Sua Sacola</h1>

                {items.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="mb-2 text-xl font-semibold text-gray-900">Sua sacola está vazia</h2>
                        <p className="mb-6 text-gray-500">Adicione produtos para continuar comprando</p>
                        <Link
                            href="/produtos"
                            className="inline-block rounded-xl bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
                        >
                            Ver Produtos
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
                                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                        <Image src={item.image || '/logo.png'} alt={item.name} fill className="object-contain p-2" />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <Link href={`/produto/${item.productId}`} className="font-medium text-gray-900 hover:text-brand-600">
                                                {item.name}
                                            </Link>
                                            <p className="text-sm text-gray-500">
                                                {item.color} • Tam. {item.size}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border text-gray-600 hover:bg-gray-50"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border text-gray-600 hover:bg-gray-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="font-bold text-brand-600">
                                                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Resumo</h2>

                            {/* CEP Calculator */}
                            <div className="mb-4 pb-4 border-b border-gray-100">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Calcular Frete</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={cep}
                                        onChange={(e) => setCep(e.target.value)}
                                        placeholder="00000-000"
                                        maxLength={9}
                                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none"
                                    />
                                    <button
                                        onClick={handleCalculateShipping}
                                        disabled={loadingCep}
                                        className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        {loadingCep ? '...' : 'Calcular'}
                                    </button>
                                </div>
                                {shippingError && (
                                    <p className="mt-2 text-xs text-red-500">{shippingError}</p>
                                )}
                                {calculatedShipping !== null && !shippingError && (
                                    <p className="mt-2 text-xs text-green-600">
                                        ✓ Frete calculado: {calculatedShipping === 0 ? 'Grátis!' : `R$ ${calculatedShipping.toFixed(2).replace('.', ',')}`}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3 border-b border-gray-100 pb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Frete</span>
                                    <span className={displayShipping === 0 ? 'text-green-600 font-medium' : ''}>
                                        {displayShipping === 0 ? 'Grátis' : `R$ ${displayShipping.toFixed(2).replace('.', ',')}`}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between py-4 text-lg font-bold text-gray-900">
                                <span>Total</span>
                                <span className="text-brand-600">R$ {displayTotal.toFixed(2).replace('.', ',')}</span>
                            </div>

                            {displayShipping > 0 && subtotal > 0 && subtotal < 199 && (
                                <p className="mb-4 rounded-lg bg-brand-50 p-3 text-center text-sm text-brand-700">
                                    🚚 Faltam <strong>R$ {(199 - subtotal).toFixed(2).replace('.', ',')}</strong> para frete grátis!
                                </p>
                            )}

                            <Link
                                href="/checkout"
                                className="block w-full rounded-xl bg-brand-600 py-4 text-center font-semibold text-white hover:bg-brand-700"
                            >
                                Finalizar Compra
                            </Link>

                            <Link
                                href="/produtos"
                                className="mt-3 block w-full text-center text-sm text-brand-600 hover:underline"
                            >
                                Continuar Comprando
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
