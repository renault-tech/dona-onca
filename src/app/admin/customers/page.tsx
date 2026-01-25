'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Customer {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    created_at: string;
    ordersCount: number;
    totalSpent: number;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                // Fetch all non-admin profiles
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('is_admin', false)
                    .order('created_at', { ascending: false });

                if (profilesError) throw profilesError;

                if (profiles && profiles.length > 0) {
                    // Fetch orders to calculate totals per customer
                    const { data: orders, error: ordersError } = await supabase
                        .from('orders')
                        .select('user_id, total');

                    if (ordersError) throw ordersError;

                    // Calculate orders count and total spent per user
                    const orderStats = orders?.reduce((acc: Record<string, { count: number; total: number }>, order) => {
                        const userId = order.user_id;
                        if (!acc[userId]) {
                            acc[userId] = { count: 0, total: 0 };
                        }
                        acc[userId].count += 1;
                        acc[userId].total += order.total || 0;
                        return acc;
                    }, {}) || {};

                    const customersData: Customer[] = profiles.map((p: any) => ({
                        id: p.id,
                        email: p.email,
                        full_name: p.full_name,
                        phone: p.phone,
                        city: p.city,
                        state: p.state,
                        created_at: p.created_at,
                        ordersCount: orderStats[p.id]?.count || 0,
                        totalSpent: orderStats[p.id]?.total || 0,
                    }));

                    setCustomers(customersData);
                }
            } catch (error) {
                console.error('Error fetching customers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    // Filter customers
    const filteredCustomers = customers.filter(c =>
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Stats
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.ordersCount > 0).length;
    const totalRevenue = customers.reduce((acc, c) => acc + c.totalSpent, 0);
    const avgOrderValue = totalRevenue / customers.reduce((acc, c) => acc + c.ordersCount, 0) || 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-dark)] pb-12 text-gray-100">
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
                            <h1 className="text-2xl font-bold text-white">Gestão de Clientes</h1>
                            <p className="text-sm text-gray-400">Visualize e gerencie seus clientes</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card-dark p-6">
                        <p className="text-sm text-gray-400">Total de Clientes</p>
                        <p className="text-3xl font-bold text-white">{totalCustomers}</p>
                    </div>
                    <div className="card-dark p-6">
                        <p className="text-sm text-gray-400">Clientes Ativos</p>
                        <p className="text-3xl font-bold text-green-500">{activeCustomers}</p>
                        <p className="text-xs text-gray-500 mt-1">Com pelo menos 1 compra</p>
                    </div>
                    <div className="card-dark p-6">
                        <p className="text-sm text-gray-400">Receita Total</p>
                        <p className="text-3xl font-bold text-brand-400">R$ {totalRevenue.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="card-dark p-6">
                        <p className="text-sm text-gray-400">Ticket Médio</p>
                        <p className="text-3xl font-bold text-blue-500">R$ {avgOrderValue.toFixed(2).replace('.', ',')}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <input
                            type="text"
                            placeholder="Buscar por nome, email, telefone..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 pl-10 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                        />
                        <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Table */}
                <div className="card-dark overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800/50 border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Cliente</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Contato</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Localização</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Pedidos</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Total Gasto</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Cadastro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {paginatedCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-brand-900/30 border border-brand-500/20 flex items-center justify-center">
                                                        <span className="text-brand-400 font-bold">
                                                            {(customer.full_name || customer.email || '?')[0].toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-200">{customer.full_name || 'Sem nome'}</p>
                                                        <p className="text-sm text-gray-500">{customer.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {customer.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {customer.city && customer.state ? `${customer.city}/${customer.state}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full text-sm font-medium ${customer.ordersCount > 0 ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                                                    {customer.ordersCount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-brand-300">
                                                R$ {customer.totalSpent.toFixed(2).replace('.', ',')}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-500">
                                                {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
                            <p className="text-sm text-gray-500">
                                Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} de {filteredCustomers.length}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    ← Anterior
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Próximo →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
