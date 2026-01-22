'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface CustomerProfile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    is_admin: boolean;
    created_at: string;
}

interface Order {
    id: number;
    created_at: string;
    status: string;
    total: number;
    items: any[];
}

export default function CustomerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const customerId = params.id as string;

    const [customer, setCustomer] = useState<CustomerProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (customerId) {
            fetchCustomerData();
        }
    }, [customerId]);

    const fetchCustomerData = async () => {
        try {
            // Fetch customer profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', customerId)
                .single();

            if (profileError) throw profileError;
            setCustomer(profile);

            // Fetch customer orders
            const { data: customerOrders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', customerId)
                .order('created_at', { ascending: false });

            if (!ordersError && customerOrders) {
                setOrders(customerOrders);
            }
        } catch (error) {
            console.error('Error fetching customer:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'confirmed': return 'Confirmado';
            case 'shipped': return 'Enviado';
            case 'delivered': return 'Entregue';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'delivered').length;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
                <p className="text-gray-500 mb-4">Cliente não encontrado</p>
                <Link href="/admin/customers" className="text-brand-600 hover:underline">
                    Voltar para lista de clientes
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-5xl px-4 py-8">
                    <div className="flex items-start gap-6">
                        <Link
                            href="/admin/customers"
                            className="mt-2 flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-600">
                                    {(customer.full_name || customer.email).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {customer.full_name || 'Sem nome'}
                                    </h1>
                                    <p className="text-gray-500">{customer.email}</p>
                                    {customer.is_admin && (
                                        <span className="inline-block mt-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                            Administrador
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Total de Pedidos</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{orders.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Pedidos Entregues</p>
                        <p className="mt-1 text-3xl font-bold text-green-600">{completedOrders}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Total Gasto</p>
                        <p className="mt-1 text-3xl font-bold text-brand-600">{formatCurrency(totalSpent)}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Cliente desde</p>
                        <p className="mt-1 text-lg font-bold text-gray-900">
                            {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Informações de Contato</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">E-mail</p>
                            <p className="text-gray-900 font-medium">{customer.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Telefone</p>
                            <p className="text-gray-900 font-medium">{customer.phone || 'Não informado'}</p>
                        </div>
                    </div>
                </div>

                {/* Orders History */}
                <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Histórico de Pedidos</h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-400">Nenhum pedido encontrado</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-gray-900">Pedido #{order.id}</span>
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
                                    </div>

                                    {order.items && order.items.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-sm text-gray-600">
                                                {order.items.map((item: any) => `${item.name} (${item.quantity}x)`).join(', ')}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400">
                                            {order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0} itens
                                        </span>
                                        <span className="text-lg font-bold text-brand-600">
                                            {formatCurrency(order.total || 0)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
