'use client';

import Link from 'next/link';
import { useState } from 'react';

const CATEGORIES = [
    { id: 1, name: 'Calcinhas', active: true, products: 12 },
    { id: 2, name: 'Sutiãs', active: true, products: 8 },
    { id: 3, name: 'Conjuntos', active: true, products: 15 },
    { id: 4, name: 'Lingerie', active: true, products: 6 },
];

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-dark)] text-gray-100">
            {/* Header */}
            <div className="border-b border-gray-800 bg-[var(--bg-dark)] sticky top-0 z-30 bg-opacity-90 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Categorias</h1>
                            <p className="text-sm text-gray-400">Gerencie as categorias da loja</p>
                        </div>
                        <button className="ml-auto px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-brand-900/50">
                            + Nova Categoria
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="card-dark overflow-hidden p-0">
                    <table className="w-full">
                        <thead className="bg-gray-800/50 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Produtos</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {CATEGORIES.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-lg">🏷️</span>
                                            <span className="font-medium text-white">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-400">
                                        {cat.products} itens
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/20">
                                            Ativo
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-brand-400 hover:text-brand-300 font-medium text-sm">Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
