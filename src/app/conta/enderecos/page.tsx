'use client';

import Link from 'next/link';

export default function AddressesPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/minha-conta" className="text-gray-500 hover:text-brand-600">
                    ← Voltar
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Meus Endereços</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Gerenciamento de Endereços</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Em breve você poderá salvar múltiplos endereços de entrega aqui para agilizar suas compras.
                </p>
                <div className="text-sm text-brand-600 font-medium bg-brand-50 inline-block px-4 py-2 rounded-full">
                    Atualmente o endereço é informado no Checkout
                </div>
            </div>
        </div>
    );
}
