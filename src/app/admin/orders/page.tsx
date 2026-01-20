'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useProducts } from '@/contexts/ProductContext';

// Order item type representing each product in an order
interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    customer: string;
    date: string;
    total: number;
    status: 'Pendente' | 'Pago' | 'Enviado' | 'Entregue' | 'Cancelado' | 'Devolvido';
    items: OrderItem[];
    stockDeducted: boolean; // Track if stock was already deducted
}

// Mock orders with actual product items
const initialMockOrders: Order[] = [
    {
        id: '1234',
        customer: 'Maria Silva',
        date: '17/01/2026',
        total: 189.90,
        status: 'Pendente',
        stockDeducted: false,
        items: [{ productId: 1, productName: 'Calcinha Renda Luxo', quantity: 2, price: 94.95 }]
    },
    {
        id: '1235',
        customer: 'João Oliveira',
        date: '17/01/2026',
        total: 450.00,
        status: 'Pago',
        stockDeducted: false,
        items: [
            { productId: 2, productName: 'Sutiã Push-Up', quantity: 2, price: 149.90 },
            { productId: 3, productName: 'Conjunto Sexy', quantity: 2, price: 75.05 }
        ]
    },
    {
        id: '1236',
        customer: 'Ana Costa',
        date: '16/01/2026',
        total: 89.90,
        status: 'Enviado',
        stockDeducted: true,
        items: [{ productId: 1, productName: 'Calcinha Renda Luxo', quantity: 1, price: 89.90 }]
    },
    {
        id: '1237',
        customer: 'Pedro Santos',
        date: '16/01/2026',
        total: 1215.00,
        status: 'Entregue',
        stockDeducted: true,
        items: [
            { productId: 4, productName: 'Body Elegance', quantity: 4, price: 199.90 },
            { productId: 5, productName: 'Camisola Seda', quantity: 4, price: 103.85 }
        ]
    },
    {
        id: '1238',
        customer: 'Carla Mendes',
        date: '15/01/2026',
        total: 320.00,
        status: 'Cancelado',
        stockDeducted: false,
        items: [{ productId: 2, productName: 'Sutiã Push-Up', quantity: 3, price: 106.67 }]
    },
];

type SortField = 'id' | 'customer' | 'date' | 'total' | 'status' | 'items';
type SortDirection = 'asc' | 'desc';
type OrderStatus = Order['status'];

const STATUS_OPTIONS: OrderStatus[] = ['Pendente', 'Pago', 'Enviado', 'Entregue', 'Cancelado', 'Devolvido'];

export default function OrdersAdminPage() {
    const { updateProduct, products } = useProducts();
    const [orders, setOrders] = useState<Order[]>(initialMockOrders);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('id');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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
            const product = products.find(p => p.id === item.productId);
            if (product) {
                await updateProduct(item.productId, {
                    stock: Math.max(0, product.stock - item.quantity)
                });
            }
        }
    };

    // Handle stock restoration when order is cancelled or returned
    const restoreStock = async (order: Order) => {
        for (const item of order.items) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                await updateProduct(item.productId, {
                    stock: product.stock + item.quantity
                });
            }
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const oldStatus = order.status;

        // Determine if we need to adjust stock
        if (newStatus === 'Enviado' && !order.stockDeducted) {
            // Deduct stock when shipping
            await deductStock(order);
            setOrders(orders.map(o =>
                o.id === orderId
                    ? { ...o, status: newStatus, stockDeducted: true }
                    : o
            ));
            alert(`Pedido #${orderId} marcado como Enviado. Estoque atualizado!`);
        } else if ((newStatus === 'Cancelado' || newStatus === 'Devolvido') && order.stockDeducted) {
            // Restore stock when cancelled or returned (only if stock was deducted)
            await restoreStock(order);
            setOrders(orders.map(o =>
                o.id === orderId
                    ? { ...o, status: newStatus, stockDeducted: false }
                    : o
            ));
            alert(`Pedido #${orderId} ${newStatus === 'Cancelado' ? 'cancelado' : 'devolvido'}. Estoque restaurado!`);
        } else if (newStatus === 'Cancelado' && !order.stockDeducted) {
            // Cancelled before shipping - no stock change needed
            setOrders(orders.map(o =>
                o.id === orderId ? { ...o, status: newStatus } : o
            ));
            alert(`Pedido #${orderId} cancelado.`);
        } else {
            // Normal status change (no stock impact)
            setOrders(orders.map(o =>
                o.id === orderId ? { ...o, status: newStatus } : o
            ));
        }
    };

    const handleCancelOrder = (orderId: string) => {
        if (confirm(`Deseja realmente cancelar o pedido #${orderId}?`)) {
            handleStatusChange(orderId, 'Cancelado');
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
                    comparison = a.date.localeCompare(b.date);
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
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [orders, searchTerm, sortField, sortDirection]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pendente': return 'bg-yellow-100 text-yellow-700';
            case 'Pago': return 'bg-green-100 text-green-700';
            case 'Enviado': return 'bg-blue-100 text-blue-700';
            case 'Entregue': return 'bg-gray-100 text-gray-700';
            case 'Cancelado': return 'bg-red-100 text-red-700';
            case 'Devolvido': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getItemCount = (order: Order) => order.items.reduce((sum, item) => sum + item.quantity, 0);

    const SortHeader = ({ field, children, className = '' }: { field: SortField; children: React.ReactNode; className?: string }) => (
        <th
            className={`px-6 py-4 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors select-none ${className}`}
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-1">
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
                                <h1 className="text-2xl font-bold text-gray-900">Gestão de Pedidos</h1>
                                <p className="text-sm text-gray-500">Acompanhe e gerencie as vendas da loja</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
                        <strong>ℹ️ Gestão de Estoque:</strong> O estoque é baixado ao marcar como &quot;Enviado&quot; e restaurado em caso de &quot;Cancelado&quot; ou &quot;Devolvido&quot;.
                    </div>

                    {/* Search */}
                    <div className="mt-6">
                        <div className="relative max-w-md">
                            <input
                                type="text"
                                placeholder="Buscar por ID, cliente ou status..."
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
                {filteredAndSortedOrders.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <p className="text-gray-500">Nenhum pedido encontrado.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <SortHeader field="id">ID</SortHeader>
                                        <SortHeader field="customer">Cliente</SortHeader>
                                        <SortHeader field="date">Data</SortHeader>
                                        <SortHeader field="items" className="text-center">Itens</SortHeader>
                                        <SortHeader field="total">Total</SortHeader>
                                        <SortHeader field="status">Status</SortHeader>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAndSortedOrders.map((order) => (
                                        <>
                                            <tr key={order.id} className="transition-colors hover:bg-gray-50/50">
                                                <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                                <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                                                <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                                <td className="px-6 py-4 text-center text-gray-600">{getItemCount(order)}</td>
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    R$ {order.total.toFixed(2).replace('.', ',')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                                        className={`rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer ${getStatusColor(order.status)}`}
                                                    >
                                                        {STATUS_OPTIONS.map(status => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                            className="text-sm font-medium text-brand-600 hover:text-brand-700"
                                                        >
                                                            {expandedOrder === order.id ? 'Ocultar' : 'Ver Itens'}
                                                        </button>
                                                        {order.status !== 'Cancelado' && order.status !== 'Entregue' && order.status !== 'Devolvido' && (
                                                            <button
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                className="text-sm font-medium text-red-600 hover:text-red-700"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedOrder === order.id && (
                                                <tr key={`${order.id}-items`} className="bg-gray-50">
                                                    <td colSpan={7} className="px-6 py-4">
                                                        <div className="text-sm">
                                                            <div className="font-semibold text-gray-700 mb-2">Itens do Pedido:</div>
                                                            <div className="space-y-1">
                                                                {order.items.map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between text-gray-600">
                                                                        <span>{item.quantity}x {item.productName}</span>
                                                                        <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                                                                <span className="text-xs text-gray-500">
                                                                    {order.stockDeducted ? '✅ Estoque já baixado' : '⏳ Estoque será baixado ao enviar'}
                                                                </span>
                                                                <span className="font-bold text-gray-900">
                                                                    Total: R$ {order.total.toFixed(2).replace('.', ',')}
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
                    </div>
                )}
            </div>
        </div>
    );
}
