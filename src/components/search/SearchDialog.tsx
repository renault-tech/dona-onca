'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/contexts/ProductContext';

interface SearchDialogProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Overlay de busca. Filtra o catálogo já carregado em memória pelo
 * ProductContext -- sem query nova ao Supabase. Antes desta tela, o ícone de
 * lupa da navbar era só um link para /produtos; não existia busca nenhuma.
 */
export default function SearchDialog({ open, onClose }: SearchDialogProps) {
    const { products } = useProducts();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setQuery('');
            document.body.style.overflow = 'hidden';
            const t = setTimeout(() => inputRef.current?.focus(), 50);
            return () => {
                document.body.style.overflow = '';
                clearTimeout(t);
            };
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return products
            .filter(
                (p) =>
                    p.active &&
                    (p.name.toLowerCase().includes(q) ||
                        p.category.toLowerCase().includes(q) ||
                        p.description?.toLowerCase().includes(q))
            )
            .slice(0, 6);
    }, [products, query]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(`/produtos?q=${encodeURIComponent(query.trim())}`);
        onClose();
    };

    if (!open) return null;

    return (
        <div role="dialog" aria-modal="true" aria-label="Buscar produtos" className="fixed inset-0 z-[80]">
            <button aria-label="Fechar busca" onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            <div className="relative z-10 mx-auto mt-24 max-w-2xl px-4">
                <form onSubmit={submit} className="surface flex items-center gap-3 px-5 py-4">
                    <svg className="h-5 w-5 flex-shrink-0 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar por peça, categoria..."
                        className="flex-1 bg-transparent text-fg placeholder:text-fg-subtle outline-none"
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="rounded-full p-1 text-fg-subtle hover:text-accent transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </form>

                {results.length > 0 && (
                    <ul className="surface mt-3 divide-y divide-border overflow-hidden">
                        {results.map((p) => (
                            <li key={p.id}>
                                <Link
                                    href={`/produto/${p.id}`}
                                    onClick={onClose}
                                    className="flex items-center gap-4 px-5 py-3 hover:bg-surface-raised transition-colors"
                                >
                                    <div className="relative h-14 w-12 flex-shrink-0 overflow-hidden rounded-md bg-surface">
                                        <Image src={p.images[0] || '/logo.png'} alt={p.name} fill sizes="48px" className="object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm text-fg">{p.name}</p>
                                        <p className="text-xs text-fg-subtle">{p.category}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-accent">
                                        R$ {p.price.toFixed(2).replace('.', ',')}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                {query.trim() && results.length === 0 && (
                    <p className="surface mt-3 px-5 py-6 text-center text-sm text-fg-subtle">
                        Nenhum produto encontrado para &quot;{query}&quot;.
                    </p>
                )}
            </div>
        </div>
    );
}
