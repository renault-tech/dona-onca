'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Order {
    id: string;
    total: number;
    status: string;
    created_at: string;
    items: any[];
}

export default function OrdersPage() {
    const { user, loading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!user) {
            setFetching(false);
            return;
        }

        let didTimeout = false;
        const timeoutId = setTimeout(() => {
            didTimeout = true;
            console.warn('Orders fetch timeout');
            setFetching(false);
        }, 5000);

        const fetchOrders = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (didTimeout) return;

                if (error) {
                    console.error('Error fetching orders:', error);
                } else {
                    setOrders(data || []);
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                if (!didTimeout) {
                    clearTimeout(timeoutId);
                    setFetching(false);
                }
            }
        };

        fetchOrders();
    }, [user]);

    if (loading || fetching) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/minha-conta" className="text-gray-500 hover:text-brand-600">
                    ← Voltar
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 mb-4">Você ainda não fez nenhum pedido.</p>
                    <Link href="/produtos" className="inline-block bg-brand-600 text-white px-6 py-2 rounded-full font-medium hover:bg-brand-700 transition-colors">
                        Começar a Comprar
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-semibold text-gray-900">Pedido #{order.id.slice(0, 8)}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                    ${order.status === 'Entregue' ? 'bg-green-100 text-green-700' :
                                        order.status === 'Cancelado' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="flex justify-between items-center border-t pt-4">
                                <p className="text-sm text-gray-600">
                                    {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'itens'}
                                </p>
                                <p className="font-bold text-gray-900">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
