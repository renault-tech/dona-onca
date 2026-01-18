'use client';

import Link from 'next/link';
import { useState } from 'react';

const mockCustomers = [
    { id: 1, name: 'Maria Silva', email: 'maria@email.com', phone: '(11) 98765-4321', totalSpent: 1250.80, lastOrder: '15/01/2026' },
    { id: 2, name: 'João Oliveira', email: 'joao@email.com', phone: '(21) 99888-7766', totalSpent: 450.00, lastOrder: '17/01/2026' },
    { id: 3, name: 'Ana Costa', email: 'ana@email.com', phone: '(31) 97766-5544', totalSpent: 2890.50, lastOrder: '10/01/2026' },
    { id: 4, name: 'Pedro Santos', email: 'pedro@email.com', phone: '(41) 96655-4433', totalSpent: 89.90, lastOrder: '16/01/2026' },
];

export default function CustomersAdminPage() {
    const [customers] = useState(mockCustomers);

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
                            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                            <p className="text-sm text-gray-500">Visualize e entre em contato com seus clientes</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Nome</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Contato</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Último Pedido</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Total Gasto</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="transition-colors hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-600">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="text-gray-900">{customer.email}</div>
                                            <div className="text-gray-500">{customer.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                                            {customer.lastOrder}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                            R$ {customer.totalSpent.toFixed(2).replace('.', ',')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
