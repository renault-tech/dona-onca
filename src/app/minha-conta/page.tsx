'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function UserDashboard() {
    const { user, profile, loading, signOut } = useAuth();
    const router = useRouter();
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/conta');
            return;
        }

        if (user) {
            let didTimeout = false;
            const timeoutId = setTimeout(() => {
                didTimeout = true;
                console.warn('Recent orders fetch timeout');
            }, 5000);

            const fetchRecentOrders = async () => {
                try {
                    const { data } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(2);

                    if (!didTimeout && data) {
                        setRecentOrders(data);
                    }
                } catch (err) {
                    console.error('Error fetching recent orders:', err);
                } finally {
                    if (!didTimeout) clearTimeout(timeoutId);
                }
            };
            fetchRecentOrders();
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-4xl px-4 py-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Olá, {profile?.full_name || 'Cliente'}!</h1>
                <p className="mb-8 text-gray-600">Bem-vindo(a) à sua área exclusiva.</p>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Menu Cards */}
                    {[
                        { title: 'Meus Pedidos', desc: 'Acompanhe seus pedidos', icon: '📦', href: '/conta/pedidos' },
                        { title: 'Meus Dados', desc: 'Altere seus dados pessoais', icon: '👤', href: '/conta/dados' },
                        { title: 'Endereços', desc: 'Gerencie seus endereços', icon: '📍', href: '/conta/enderecos' },
                        { title: 'Favoritos', desc: 'Produtos que você salvou', icon: '❤️', href: '/conta/favoritos' },
                    ].map((item) => (
                        <Link
                            key={item.title}
                            href={item.href}
                            className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                        >
                            <span className="text-3xl">{item.icon}</span>
                            <div>
                                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent Orders */}
                <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
                        <Link href="/conta/pedidos" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                            Ver todos
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="text-gray-500 text-sm">Nenhum pedido recente.</p>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                                    <div>
                                        <p className="font-medium text-gray-900">Pedido #{order.id.slice(0, 8)}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium 
                                            ${order.status === 'Entregue' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Cancelado' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'}`}>
                                            {order.status}
                                        </span>
                                        <p className="mt-1 font-medium text-gray-900">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex gap-4">
                    <button
                        onClick={async () => {
                            await signOut();
                            router.push('/');
                        }}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                        Sair da Conta
                    </button>

                    {profile?.is_admin && (
                        <Link
                            href="/admin"
                            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                        >
                            Acessar Painel Administrativo
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
