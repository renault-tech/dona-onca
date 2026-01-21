'use client';

import Link from 'next/link';

export default function FavoritesPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/minha-conta" className="text-gray-500 hover:text-brand-600">
                    ← Voltar
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Meus Favoritos</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Lista de Desejos</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Mantenha a Dona Onça por perto! Em breve você poderá salvar seus looks favoritos aqui.
                </p>
                <Link href="/produtos" className="inline-block bg-brand-600 text-white px-6 py-2 rounded-full font-medium hover:bg-brand-700 transition-colors">
                    Ver Coleção Atual
                </Link>
            </div>
        </div>
    );
}
