'use client';

import Link from 'next/link';
import { useState } from 'react';

// Mock data for initial implementation
const mockOrders = [
    { id: '1234', customer: 'Maria Silva', date: '17/01/2026', total: 189.90, status: 'Pendente', items: 2 },
    { id: '1235', customer: 'João Oliveira', date: '17/01/2026', total: 450.00, status: 'Pago', items: 4 },
    { id: '1236', customer: 'Ana Costa', date: '16/01/2026', total: 89.90, status: 'Enviado', items: 1 },
    { id: '1237', customer: 'Pedro Santos', date: '16/01/2026', total: 1215.00, status: 'Entregue', items: 8 },
];

export default function OrdersAdminPage() {
    const [orders, setOrders] = useState(mockOrders);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pendente': return 'bg-yellow-100 text-yellow-700';
            case 'Pago': return 'bg-green-100 text-green-700';
            case 'Enviado': return 'bg-blue-100 text-blue-700';
            case 'Entregue': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
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
                            <h1 className="text-2xl font-bold text-gray-900">Gestão de Pedidos</h1>
                            <p className="text-sm text-gray-500">Acompanhe e gerencie as vendas da loja</p>
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
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">ID</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Cliente</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Data</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Itens</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Total</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="transition-colors hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                        <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                                        <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                        <td className="px-6 py-4 text-center text-gray-600">{order.items}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            R$ {order.total.toFixed(2).replace('.', ',')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-sm font-medium text-brand-600 hover:text-brand-700">
                                                Ver Detalhes
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
