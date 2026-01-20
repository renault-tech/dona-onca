'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';

const mockCustomers = [
    { id: 1, name: 'Maria Silva', email: 'maria@email.com', phone: '(11) 98765-4321', totalSpent: 1250.80, lastOrder: '15/01/2026', orderCount: 5 },
    { id: 2, name: 'João Oliveira', email: 'joao@email.com', phone: '(21) 99888-7766', totalSpent: 450.00, lastOrder: '17/01/2026', orderCount: 2 },
    { id: 3, name: 'Ana Costa', email: 'ana@email.com', phone: '(31) 97766-5544', totalSpent: 2890.50, lastOrder: '10/01/2026', orderCount: 12 },
    { id: 4, name: 'Pedro Santos', email: 'pedro@email.com', phone: '(41) 96655-4433', totalSpent: 89.90, lastOrder: '16/01/2026', orderCount: 1 },
    { id: 5, name: 'Carla Mendes', email: 'carla@email.com', phone: '(51) 95544-3322', totalSpent: 3500.00, lastOrder: '14/01/2026', orderCount: 8 },
];

type SortField = 'name' | 'email' | 'lastOrder' | 'totalSpent' | 'orderCount';
type SortDirection = 'asc' | 'desc';

export default function CustomersAdminPage() {
    const [customers] = useState(mockCustomers);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredAndSortedCustomers = useMemo(() => {
        let result = customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm)
        );

        result.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'email':
                    comparison = a.email.localeCompare(b.email);
                    break;
                case 'lastOrder':
                    comparison = a.lastOrder.localeCompare(b.lastOrder);
                    break;
                case 'totalSpent':
                    comparison = a.totalSpent - b.totalSpent;
                    break;
                case 'orderCount':
                    comparison = a.orderCount - b.orderCount;
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [customers, searchTerm, sortField, sortDirection]);

    const SortHeader = ({ field, children, className = '' }: { field: SortField; children: React.ReactNode; className?: string }) => (
        <th
            className={`px-6 py-4 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors select-none ${className}`}
            onClick={() => handleSort(field)}
        >
            <div className={`flex items-center gap-1 ${className.includes('text-right') ? 'justify-end' : className.includes('text-center') ? 'justify-center' : ''}`}>
                {children}
                <span className="text-gray-400">
                    {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
            </div>
        </th>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
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
                                <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                                <p className="text-sm text-gray-500">Visualize e entre em contato com seus clientes</p>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mt-6">
                        <div className="relative max-w-md">
                            <input
                                type="text"
                                placeholder="Buscar por nome, email ou telefone..."
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
                {filteredAndSortedCustomers.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <p className="text-gray-500">Nenhum cliente encontrado.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <SortHeader field="name">Nome</SortHeader>
                                        <SortHeader field="email">Contato</SortHeader>
                                        <SortHeader field="orderCount" className="text-center">Pedidos</SortHeader>
                                        <SortHeader field="lastOrder" className="text-center">Último Pedido</SortHeader>
                                        <SortHeader field="totalSpent" className="text-right">Total Gasto</SortHeader>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAndSortedCustomers.map((customer) => (
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
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-medium text-brand-700">
                                                    {customer.orderCount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-600">
                                                {customer.lastOrder}
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                R$ {customer.totalSpent.toFixed(2).replace('.', ',')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <a
                                                        href={`mailto:${customer.email}`}
                                                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                                                        title="Enviar Email"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </a>
                                                    <a
                                                        href={`https://wa.me/55${customer.phone.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                                                        title="WhatsApp"
                                                    >
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                        </svg>
                                                    </a>
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
