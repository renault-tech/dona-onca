'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import OncaRosette from '@/components/brand/OncaRosette';

/**
 * Drawer lateral que abre automaticamente ao adicionar um item ao carrinho
 * (ver CartContext.addItem). Antes disso, adicionar ao carrinho não dava
 * nenhum feedback visível -- o ícone da sacola só levava para /sacola.
 */
export default function MiniCartDrawer() {
    const { items, itemCount, subtotal, updateQuantity, removeItem, isDrawerOpen, closeDrawer } = useCart();

    useEffect(() => {
        if (!isDrawerOpen) return;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isDrawerOpen]);

    useEffect(() => {
        if (!isDrawerOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeDrawer();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isDrawerOpen, closeDrawer]);

    return (
        <div
            aria-hidden={!isDrawerOpen}
            className={`fixed inset-0 z-[70] transition-[visibility] ${isDrawerOpen ? 'visible' : 'invisible delay-300'}`}
        >
            <button
                aria-label="Fechar sacola"
                onClick={closeDrawer}
                className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Sua sacola"
                className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-bg transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between border-b border-border px-6 py-5">
                    <h2 className="font-display text-xl text-fg">
                        Sacola <span className="text-fg-subtle text-base">({itemCount})</span>
                    </h2>
                    <button
                        onClick={closeDrawer}
                        aria-label="Fechar"
                        className="rounded-full p-2 text-fg-muted hover:text-accent hover:bg-surface transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                        <OncaRosette className="h-10 w-10 text-fg-subtle" />
                        <p className="text-fg-muted">Sua sacola está vazia.</p>
                        <Link
                            href="/produtos"
                            onClick={closeDrawer}
                            className="btn btn-outline px-6 py-2.5 text-xs"
                        >
                            Explorar coleção
                        </Link>
                    </div>
                ) : (
                    <>
                        <ul className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
                            {items.map((item) => (
                                <li key={item.id} className="flex gap-4 border-b border-border py-4 last:border-0">
                                    <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
                                        <Image
                                            src={item.image || '/logo.png'}
                                            alt={item.name}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-fg leading-snug">{item.name}</p>
                                            <p className="mt-1 text-xs text-fg-subtle">
                                                {item.size !== 'Único' && `Tam. ${item.size}`}
                                                {item.size !== 'Único' && item.color !== 'Único' && ' · '}
                                                {item.color !== 'Único' && item.color}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    aria-label="Diminuir quantidade"
                                                    className="h-6 w-6 rounded-full border border-border text-fg-muted hover:border-accent hover:text-accent"
                                                >
                                                    −
                                                </button>
                                                <span className="w-4 text-center text-sm text-fg">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    aria-label="Aumentar quantidade"
                                                    className="h-6 w-6 rounded-full border border-border text-fg-muted hover:border-accent hover:text-accent"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="text-sm font-semibold text-accent">
                                                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        aria-label={`Remover ${item.name}`}
                                        className="self-start text-fg-subtle hover:text-accent transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className="border-t border-border px-6 py-5">
                            <div className="mb-4 flex items-center justify-between text-sm text-fg-muted">
                                <span>Subtotal</span>
                                <span className="text-lg font-semibold text-fg">
                                    R$ {subtotal.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                            <Link
                                href="/checkout"
                                onClick={closeDrawer}
                                className="btn btn-fill w-full py-3.5 text-sm"
                            >
                                Finalizar compra
                            </Link>
                            <Link
                                href="/sacola"
                                onClick={closeDrawer}
                                className="mt-3 block text-center text-xs text-fg-subtle hover:text-accent transition-colors"
                            >
                                Ver sacola completa
                            </Link>
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
}
