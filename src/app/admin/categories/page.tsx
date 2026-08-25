'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useProducts } from '@/contexts/ProductContext';

export default function CategoriesPage() {
    const { categories, products, addCategory, renameCategory, deleteCategory } = useProducts();
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const countFor = (cat: string) => products.filter(p => p.category === cat).length;

    const startEdit = (cat: string) => {
        setError(null);
        setEditingCategory(cat);
        setEditValue(cat);
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        setEditValue('');
        setError(null);
    };

    const saveEdit = async () => {
        if (!editingCategory) return;
        setSaving(true);
        const result = await renameCategory(editingCategory, editValue);
        setSaving(false);
        if (result.error) {
            setError(result.error);
            return;
        }
        setEditingCategory(null);
        setEditValue('');
    };

    const saveNewCategory = async () => {
        setSaving(true);
        const result = await addCategory(newCategoryName);
        setSaving(false);
        if (result.error) {
            setError(result.error);
            return;
        }
        setIsAdding(false);
        setNewCategoryName('');
        setError(null);
    };

    const handleDelete = async (cat: string) => {
        if (!confirm(`Excluir a categoria "${cat}"?`)) return;
        const result = await deleteCategory(cat);
        if (result.error) {
            setError(result.error);
        }
    };

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
                        <button
                            onClick={() => { setIsAdding(true); setError(null); setNewCategoryName(''); }}
                            className="ml-auto px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-brand-900/50"
                        >
                            + Nova Categoria
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {error && (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="card-dark overflow-hidden p-0">
                    <table className="w-full">
                        <thead className="bg-gray-800/50 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Produtos</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {isAdding && (
                                <tr className="bg-gray-800/30">
                                    <td className="px-6 py-4" colSpan={2}>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveNewCategory();
                                                if (e.key === 'Escape') setIsAdding(false);
                                            }}
                                            placeholder="Nome da nova categoria"
                                            className="w-full max-w-xs rounded-lg border border-brand-500 bg-gray-900 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={saveNewCategory} disabled={saving} className="text-brand-400 hover:text-brand-300 font-medium text-sm mr-4 disabled:opacity-50">
                                            Salvar
                                        </button>
                                        <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-300 font-medium text-sm">
                                            Cancelar
                                        </button>
                                    </td>
                                </tr>
                            )}
                            {categories.map((cat) => (
                                <tr key={cat} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        {editingCategory === cat ? (
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEdit();
                                                    if (e.key === 'Escape') cancelEdit();
                                                }}
                                                className="w-full max-w-xs rounded-lg border border-brand-500 bg-gray-900 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-lg">🏷️</span>
                                                <span className="font-medium text-white">{cat}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-400">
                                        {countFor(cat)} itens
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {editingCategory === cat ? (
                                            <>
                                                <button onClick={saveEdit} disabled={saving} className="text-brand-400 hover:text-brand-300 font-medium text-sm mr-4 disabled:opacity-50">
                                                    Salvar
                                                </button>
                                                <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-300 font-medium text-sm">
                                                    Cancelar
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEdit(cat)} className="text-brand-400 hover:text-brand-300 font-medium text-sm mr-4">
                                                    Editar
                                                </button>
                                                <button onClick={() => handleDelete(cat)} className="text-gray-500 hover:text-red-400 font-medium text-sm">
                                                    Excluir
                                                </button>
                                            </>
                                        )}
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
