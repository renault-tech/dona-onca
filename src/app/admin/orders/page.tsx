'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { supabase } from '@/lib/supabase';

// Order item type representing each product in an order
interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    customer: string; // Now a string derived from profile or metadata
    date: string;
    total: number;
    status: 'Pendente' | 'Pago' | 'Enviado' | 'Entregue' | 'Cancelado' | 'Devolvido';
    items: OrderItem[];
    stockDeducted: boolean;
    user_id: string;
    created_at: string;
}

type SortField = 'id' | 'customer' | 'date' | 'total' | 'status' | 'items';
type SortDirection = 'asc' | 'desc';
type OrderStatus = Order['status'];

const STATUS_OPTIONS: OrderStatus[] = ['Pendente', 'Pago', 'Enviado', 'Entregue', 'Cancelado', 'Devolvido'];

export default function OrdersAdminPage() {
    const { updateProduct, products } = useProducts();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('created_at' as any);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch orders from Supabase
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Try fetching without the join first (in case of RLS issues with profiles)
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Supabase error:', error.message, error.details, error.hint);
                    throw error;
                }

                if (data) {
                    // Fetch profile names separately
                    const userIds = [...new Set(data.map((o: any) => o.user_id).filter(Boolean))];
                    let profilesMap: Record<string, string> = {};

                    if (userIds.length > 0) {
                        const { data: profiles } = await supabase
                            .from('profiles')
                            .select('id, full_name, email')
                            .in('id', userIds);

                        if (profiles) {
                            profiles.forEach((p: any) => {
                                profilesMap[p.id] = p.full_name || p.email || 'Cliente';
                            });
                        }
                    }

                    const formattedOrders: Order[] = data.map((order: any) => ({
                        id: order.id,
                        customer: profilesMap[order.user_id] || 'Cliente Desconhecido',
                        date: new Date(order.created_at).toLocaleDateString('pt-BR'),
                        total: order.total,
                        status: order.status,
                        items: order.items || [],
                        stockDeducted: order.status === 'Enviado' || order.status === 'Entregue',
                        user_id: order.user_id,
                        created_at: order.created_at
                    }));
                    setOrders(formattedOrders);
                }
            } catch (error: any) {
                console.error('Error fetching orders:', error?.message || error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Handle stock deduction when status changes to "Enviado"
    const deductStock = async (order: Order) => {
        for (const item of order.items) {
            // Find product by matching name mostly, since IDs in old orders might differ.
            // Ideally we should store productId properly. 
            // Here assuming productId is correct from order.items
            const product = products.find(p => p.id === item.productId);
            if (product) {
                await updateProduct(item.productId, {
                    stock: Math.max(0, product.stock - item.quantity)
                });
            }
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        try {
            // Update in Supabase
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            // Determine if we need to adjust stock (simplified logic for real implementation)
            if (newStatus === 'Enviado' && !order.stockDeducted) {
                await deductStock(order);
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus, stockDeducted: true } : o));
            } else {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            }

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erro ao atualizar status do pedido.');
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (confirm(`Deseja realmente cancelar o pedido #${orderId.slice(0, 8)}?`)) {
            await handleStatusChange(orderId, 'Cancelado');
        }
    };

    const filteredAndSortedOrders = useMemo(() => {
        let result = orders.filter(order =>
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.status.toLowerCase().includes(searchTerm.toLowerCase())
        );

        result.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'id':
                    comparison = a.id.localeCompare(b.id);
                    break;
                case 'customer':
                    comparison = a.customer.localeCompare(b.customer);
                    break;
                case 'date':
                    // compare raw dates
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
                case 'total':
                    comparison = a.total - b.total;
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                case 'items':
                    comparison = a.items.length - b.items.length;
                    break;
                default:
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [orders, searchTerm, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
    const paginatedOrders = filteredAndSortedOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pendente': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
            case 'Pago': return 'bg-green-500/10 text-green-500 border border-green-500/20';
            case 'Enviado': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
            case 'Entregue': return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
            case 'Cancelado': return 'bg-red-500/10 text-red-500 border border-red-500/20';
            case 'Devolvido': return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
            default: return 'bg-gray-800 text-gray-400';
        }
    };

    const getItemCount = (order: Order) => order.items.reduce((sum, item) => sum + item.quantity, 0);

    const SortHeader = ({ field, children, className = '' }: { field: SortField; children: React.ReactNode; className?: string }) => (
        <th
            className={`px-6 py-4 text-sm font-semibold text-gray-400 cursor-pointer hover:bg-gray-800/50 hover:text-white transition-colors select-none ${className}`}
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-1">
                {children}
                <span className="text-gray-600 group-hover:text-gray-400">
                    {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
            </div>
        </th>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-dark)] pb-12 text-gray-100">
            <div className="border-b border-gray-800 bg-[var(--bg-dark)] sticky top-0 z-30 bg-opacity-90 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
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
                                <h1 className="text-2xl font-bold text-white">Gestão de Pedidos</h1>
                                <p className="text-sm text-gray-400">Acompanhe e gerencie as vendas da loja</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/admin/orders/shipping"
                                className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Configurar Frete
                            </Link>
                            <Link
                                href="/admin/orders/label"
                                className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors shadow-[0_0_10px_rgba(214,0,139,0.3)]"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Imprimir Etiqueta
                            </Link>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-4 rounded-lg bg-blue-900/20 border border-blue-500/30 p-3 text-sm text-blue-300 flex items-center gap-2">
                        <span className="text-lg">ℹ️</span>
                        <p><strong>Gestão de Estoque:</strong> O estoque é baixado ao marcar como &quot;Enviado&quot;.</p>
                    </div>

                    {/* Search */}
                    <div className="mt-6">
                        <div className="relative max-w-md">
                            <input
                                type="text"
                                placeholder="Buscar por ID, cliente ou status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 pl-10 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                            />
                            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {filteredAndSortedOrders.length === 0 ? (
                    <div className="card-dark p-12 text-center">
                        <p className="text-gray-500">Nenhum pedido encontrado.</p>
                    </div>
                ) : (
                    <div className="card-dark overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-gray-800/50 border-b border-gray-800">
                                    <tr>
                                        <SortHeader field="id">ID</SortHeader>
                                        <SortHeader field="customer">Cliente</SortHeader>
                                        <SortHeader field="date">Data</SortHeader>
                                        <SortHeader field="items" className="text-center">Itens</SortHeader>
                                        <SortHeader field="total">Total</SortHeader>
                                        <SortHeader field="status">Status</SortHeader>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {paginatedOrders.map((order) => (
                                        <>
                                            <tr key={order.id} className="transition-colors hover:bg-gray-800/50 group">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-400 group-hover:text-gray-300">#{order.id.slice(0, 8)}</td>
                                                <td className="px-6 py-4 text-gray-300 font-medium">{order.customer}</td>
                                                <td className="px-6 py-4 text-gray-500 text-sm">{order.date}</td>
                                                <td className="px-6 py-4 text-center text-gray-400">{getItemCount(order)}</td>
                                                <td className="px-6 py-4 font-bold text-brand-400">
                                                    R$ {order.total.toFixed(2).replace('.', ',')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                                        className={`rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer outline-none focus:ring-2 focus:ring-brand-500/50 transition-all appearance-none text-center ${getStatusColor(order.status)} bg-opacity-10`}
                                                    >
                                                        {STATUS_OPTIONS.map(status => (
                                                            <option key={status} value={status} className="bg-gray-900 text-gray-300">{status}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                            className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
                                                        >
                                                            {expandedOrder === order.id ? 'Ocultar' : 'Ver Itens'}
                                                        </button>
                                                        {order.status !== 'Cancelado' && order.status !== 'Entregue' && order.status !== 'Devolvido' && (
                                                            <button
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedOrder === order.id && (
                                                <tr key={`${order.id}-items`} className="bg-gray-800/20">
                                                    <td colSpan={7} className="px-6 py-4">
                                                        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                                                            <div className="font-semibold text-gray-300 mb-3 text-sm">Itens do Pedido:</div>
                                                            <div className="space-y-2">
                                                                {order.items.map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between items-center text-gray-400 text-sm p-2 rounded hover:bg-gray-800/50">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="bg-gray-800 px-2 py-0.5 rounded text-xs font-mono">{item.quantity}x</span>
                                                                            <span>{item.productName}</span>
                                                                        </div>
                                                                        <span className="font-medium text-gray-300">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center">
                                                                <span className="text-xs text-gray-500 flex items-center gap-2">
                                                                    {order.stockDeducted ? '✅ Estoque baixado' : '⏳ Estoque pendente'}
                                                                </span>
                                                                <span className="font-bold text-white">
                                                                    Total: <span className="text-brand-400">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
                                <p className="text-sm text-gray-500">
                                    {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedOrders.length)} de {filteredAndSortedOrders.length}
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
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let page: number;
                                            if (totalPages <= 5) {
                                                page = i + 1;
                                            } else if (currentPage <= 3) {
                                                page = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                page = totalPages - 4 + i;
                                            } else {
                                                page = currentPage - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
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
                )}
            </div>
        </div>
    );
}
