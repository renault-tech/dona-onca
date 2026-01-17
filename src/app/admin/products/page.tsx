'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useProducts, categories } from '@/contexts/ProductContext';

export default function ProductsPage() {
    const { products, updateProduct, deleteProduct } = useProducts();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    const handlePriceClick = (id: number, currentPrice: number) => {
        setEditingId(id);
        setEditValue(currentPrice.toFixed(2));
    };

    const handlePriceSave = (id: number) => {
        const newPrice = parseFloat(editValue);
        if (!isNaN(newPrice) && newPrice > 0) {
            updateProduct(id, { price: newPrice });
        }
        setEditingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
        if (e.key === 'Enter') handlePriceSave(id);
        if (e.key === 'Escape') setEditingId(null);
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Deseja realmente excluir "${name}"?`)) {
            deleteProduct(id);
        }
    };

    const handleToggleActive = (id: number, currentActive: boolean) => {
        updateProduct(id, { active: !currentActive });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin"
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
                                <p className="text-sm text-gray-500">{products.length} produtos cadastrados</p>
                            </div>
                        </div>
                        <Link
                            href="/admin/products/new"
                            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-medium text-white transition-colors hover:bg-brand-700"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Novo Produto
                        </Link>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="mx-auto max-w-7xl px-4 py-8">
                {products.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h2 className="mb-2 text-xl font-semibold text-gray-900">Nenhum produto cadastrado</h2>
                        <p className="mb-6 text-gray-500">Comece adicionando seu primeiro produto</p>
                        <Link
                            href="/admin/products/new"
                            className="inline-block rounded-xl bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
                        >
                            Adicionar Produto
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Produto</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoria</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Preço</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estoque</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                                                        <Image
                                                            src={product.images[0] || '/logo.png'}
                                                            alt=""
                                                            fill
                                                            className="object-contain p-1"
                                                        />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingId === product.id ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={() => handlePriceSave(product.id)}
                                                        onKeyDown={(e) => handleKeyDown(e, product.id)}
                                                        className="w-24 rounded-lg border border-brand-500 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                                        autoFocus
                                                        step="0.01"
                                                    />
                                                ) : (
                                                    <button
                                                        onClick={() => handlePriceClick(product.id, product.price)}
                                                        className="rounded-lg px-2 py-1 text-left font-medium text-gray-900 hover:bg-brand-50 hover:text-brand-600"
                                                        title="Clique para editar"
                                                    >
                                                        R$ {product.price.toFixed(2).replace('.', ',')}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-medium ${product.stock < 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                                                    {product.stock} un
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleActive(product.id, product.active)}
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium transition-colors ${product.active
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {product.active ? 'Ativo' : 'Inativo'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="rounded-lg p-2 text-brand-600 hover:bg-brand-50"
                                                        title="Editar"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </Link>
                                                    <Link
                                                        href={`/produto/${product.id}`}
                                                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                                                        title="Ver"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                        title="Excluir"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <p className="mt-4 text-center text-sm text-gray-500">
                    💡 Dica: Clique no preço para editar diretamente | Clique no status para ativar/desativar
                </p>
            </div>
        </div>
    );
}
