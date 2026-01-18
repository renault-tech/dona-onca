'use client';

import Link from 'next/link';
import { useProducts, categories as availableCategories } from '@/contexts/ProductContext';

export default function CategoriesAdminPage() {
    const { products } = useProducts();

    const getProductCount = (category: string) => {
        return products.filter(p => p.category === category).length;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8">
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
                            <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
                            <p className="text-sm text-gray-500">Organize e gerencie as seções da sua loja</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {availableCategories.map((category) => (
                        <div key={category} className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{category}</h3>
                            <p className="mt-1 text-sm text-gray-500">{getProductCount(category)} produtos vinculados</p>

                            <div className="mt-8 flex gap-3">
                                <button className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
                                    Ver Produtos
                                </button>
                                <button className="rounded-xl bg-gray-100 px-4 py-2.5 text-gray-600 transition-colors hover:bg-gray-200">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add New Category Placeholder */}
                    <button className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-brand-500 hover:bg-brand-50/10 group">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-brand-100 group-hover:text-brand-600">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="font-semibold text-gray-500 group-hover:text-brand-600">Nova Categoria</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
