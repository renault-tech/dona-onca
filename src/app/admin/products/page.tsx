'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useProducts, categories } from '@/contexts/ProductContext';

type Tab = 'geral' | 'estoque';

export default function ProductsPage() {
    const { products, updateProduct, deleteProduct, restockProduct } = useProducts();
    const [activeTab, setActiveTab] = useState<Tab>('geral');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Deseja realmente excluir "${name}"?`)) {
            await deleteProduct(id);
        }
    };

    const handleToggleActive = async (id: number, currentActive: boolean) => {
        await updateProduct(id, { active: !currentActive });
    };

    const handleRestock = async (id: number) => {
        const amount = window.prompt('Quantidade para adicionar ao estoque:');
        if (amount && !isNaN(parseInt(amount))) {
            await restockProduct(id, parseInt(amount));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
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
                                <h1 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h1>
                                <p className="text-sm text-gray-500">Catálogo, estoque e novos cadastros</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin/products/new"
                                className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-medium text-white transition-colors hover:bg-brand-700"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Novo Produto
                            </Link>
                        </div>
                    </div>

                    {/* Tabs & Search Unified */}
                    <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-gray-100 pt-6">
                        <div className="flex gap-2 rounded-xl bg-gray-100 p-1">
                            <button
                                onClick={() => setActiveTab('geral')}
                                className={`rounded-lg px-6 py-2 text-sm font-medium transition-all ${activeTab === 'geral'
                                    ? 'bg-white text-brand-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Geral
                            </button>
                            <button
                                onClick={() => setActiveTab('estoque')}
                                className={`rounded-lg px-6 py-2 text-sm font-medium transition-all ${activeTab === 'estoque'
                                    ? 'bg-white text-brand-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Estoque
                            </button>
                        </div>
                        <div className="relative flex-1 md:max-w-md">
                            <input
                                type="text"
                                placeholder="Buscar produto ou categoria..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pl-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {filteredProducts.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h2 className="mb-1 text-xl font-semibold text-gray-900">Nenhum resultado encontrado</h2>
                        <p className="text-gray-500">Tente ajustar sua busca ou adicione um novo produto</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">Produto</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900">Categoria</th>
                                        {activeTab === 'geral' ? (
                                            <>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Preço</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Nível</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Aviso em</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                                            </>
                                        )}
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="transition-colors hover:bg-gray-50/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                        <Image
                                                            src={product.images[0] || '/logo.png'}
                                                            alt=""
                                                            fill
                                                            className="object-contain p-1"
                                                        />
                                                    </div>
                                                    <span className="font-medium text-gray-900 whitespace-nowrap">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                                    {product.category}
                                                </span>
                                            </td>

                                            {activeTab === 'geral' ? (
                                                <>
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
                                                            >
                                                                R$ {product.price.toFixed(2).replace('.', ',')}
                                                            </button>
                                                        )}
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
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-lg font-bold ${product.stock <= 0 ? 'text-red-600' :
                                                            product.stock <= product.lowStockAlert ? 'text-orange-500' :
                                                                'text-gray-900'
                                                            }`}>
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {editingId === product.id ? (
                                                            <input
                                                                type="number"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onBlur={() => {
                                                                    const val = parseInt(editValue);
                                                                    if (!isNaN(val)) updateProduct(product.id, { lowStockAlert: val });
                                                                    setEditingId(null);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const val = parseInt(editValue);
                                                                        if (!isNaN(val)) updateProduct(product.id, { lowStockAlert: val });
                                                                        setEditingId(null);
                                                                    }
                                                                    if (e.key === 'Escape') setEditingId(null);
                                                                }}
                                                                className="w-16 rounded-lg border border-brand-500 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-center"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(product.id);
                                                                    setEditValue(product.lowStockAlert?.toString() || '5');
                                                                }}
                                                                className="rounded-lg px-2 py-1 font-medium text-gray-600 hover:bg-gray-100 underline decoration-dotted underline-offset-4"
                                                                title="Clique para definir o nível de aviso"
                                                            >
                                                                {product.lowStockAlert || 5} un
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {product.stock <= 0 ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-red-600">
                                                                Esgotado
                                                            </span>
                                                        ) : product.stock <= product.lowStockAlert ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-orange-500">
                                                                Baixo
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-green-600">
                                                                Em Dia
                                                            </span>
                                                        )}
                                                    </td>
                                                </>
                                            )}

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    {activeTab === 'estoque' && (
                                                        <button
                                                            onClick={() => handleRestock(product.id)}
                                                            className="rounded-lg p-2 text-brand-600 hover:bg-brand-50"
                                                            title="Repor Estoque"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                                                        title="Editar"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
            </div>
        </div>
    );
}
