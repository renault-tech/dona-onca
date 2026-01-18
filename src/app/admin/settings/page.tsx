'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SettingsAdminPage() {
    const [shopName, setShopName] = useState('Dona Onça');
    const [email, setEmail] = useState('contato@donaonca.com.br');
    const [freeShipping, setFreeShipping] = useState(199.90);

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
                            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
                            <p className="text-sm text-gray-500">Ajuste os parâmetros gerais da sua loja</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* General Settings */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
                            <h2 className="mb-6 text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">Geral</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Nome da Loja</label>
                                    <input
                                        type="text"
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">E-mail de Contato</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Frete Grátis acima de (R$)</label>
                                    <input
                                        type="number"
                                        value={freeShipping}
                                        onChange={(e) => setFreeShipping(parseFloat(e.target.value))}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button className="rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-brand-700">
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Info */}
                    <div className="space-y-6">
                        <div className="rounded-2xl bg-brand-600 p-8 text-white">
                            <h3 className="mb-2 text-lg font-bold">Dica Dona Onça</h3>
                            <p className="text-sm text-brand-100 opacity-90 leading-relaxed">
                                Manter os dados de contato atualizados garante que seus clientes recebam as notificações de pedido corretamente.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
                            <h3 className="mb-4 font-semibold text-gray-900">Versão do Sistema</h3>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Core Engine</span>
                                <span className="font-mono text-gray-900 text-xs">v1.4.2-beta</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-sm border-t border-gray-50 pt-2">
                                <span className="text-gray-500">Última Atualização</span>
                                <span className="text-gray-900 text-xs">17 Jan 2026</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
