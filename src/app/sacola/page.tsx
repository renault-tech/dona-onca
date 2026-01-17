'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
    const { items, updateQuantity, removeItem, subtotal, shipping, total } = useCart();

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
                                                <span className="w-8 text-center">{item.quantity}</span>
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

                            <div className="space-y-3 border-b border-gray-100 pb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Frete</span>
                                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                                        {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between py-4 text-lg font-bold text-gray-900">
                                <span>Total</span>
                                <span className="text-brand-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                            </div>

                            {shipping > 0 && subtotal > 0 && (
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
