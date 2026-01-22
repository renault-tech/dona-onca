'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { supabase } from '@/lib/supabase';

// Helper for formatting currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function AdminDashboard() {
    const { products, loading: productsLoading } = useProducts();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        recentOrders: [] as any[],
        recentActivity: [] as any[],
        ordersByStatus: [] as any[],
    });
    const [loading, setLoading] = useState(true);

    const [zoom, setZoom] = useState(100);

    // Auto-detect screen size and adjust zoom
    useEffect(() => {
        const adjustForScreen = () => {
            const width = window.innerWidth;
            if (width >= 2560) {
                setZoom(140);
            } else if (width >= 1920) {
                setZoom(110);
            } else if (width >= 1440) {
                setZoom(100);
            } else {
                setZoom(90);
            }
        };

        adjustForScreen();
        window.addEventListener('resize', adjustForScreen);
        return () => window.removeEventListener('resize', adjustForScreen);
    }, []);

    // Calculate real stats
    useEffect(() => {
        let didTimeout = false;
        const timeoutId = setTimeout(() => {
            didTimeout = true;
            console.warn('Dashboard stats timeout');
            setLoading(false);
        }, 5000);

        const fetchStats = async () => {
            try {
                // 1. Fetch Orders for Revenue and Counts
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (didTimeout) return;
                if (ordersError) throw ordersError;

                // 2. Fetch Customers (Profiles)
                const { count: customersCount, error: customersError } = await supabase
                    .from('profiles')
                    .select('id', { count: 'exact' })
                    .eq('is_admin', false);

                if (didTimeout) return;
                if (customersError) throw customersError;

                // Calculate Totals
                const totalRevenue = ordersData?.reduce((acc, order) => acc + (order.total || 0), 0) || 0;
                const totalOrders = ordersData?.length || 0;

                // Calculate Orders by Status
                const statusCounts = ordersData?.reduce((acc: any, order) => {
                    const status = order.status || 'Pendente';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {});

                const chartData = Object.entries(statusCounts || {}).map(([status, count]) => ({
                    name: status,
                    value: count as number,
                    color: status === 'Entregue' ? '#2e7d32' :
                        status === 'Cancelado' ? '#c62828' :
                            status === 'Pago' ? '#1565c0' : '#fbc02d'
                }));

                // Recent Activity (Merged)
                const recentOrders = ordersData?.slice(0, 5) || [];
                const activity = recentOrders.map((o: any) => ({
                    action: `Novo pedido #${o.id.slice(0, 8)}`,
                    time: new Date(o.created_at).toLocaleDateString('pt-BR'),
                    icon: '📋',
                    href: '/admin/orders'
                }));

                setStats({
                    totalRevenue,
                    totalOrders,
                    totalCustomers: customersCount || 0,
                    recentOrders,
                    recentActivity: activity,
                    ordersByStatus: chartData
                });

            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                if (!didTimeout) {
                    clearTimeout(timeoutId);
                    setLoading(false);
                }
            }
        };

        fetchStats();
    }, []);

    // Product Stats
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.active).length;

    // Scale factor for global scaling
    const scale = zoom / 100;

    const adminCards = [
        { title: 'Categorias', stat: '4', subtext: 'ativas', href: '/admin/categories', icon: '🏷️', color: 'from-purple-500 to-violet-600' },
        { title: 'Clientes', stat: stats.totalCustomers.toString(), subtext: 'Cadastrados', href: '/admin/customers', icon: '👥', color: 'from-orange-500 to-amber-600' },
        { title: 'Faturamento', stat: formatCurrency(stats.totalRevenue), subtext: 'Total', href: '/admin/orders', icon: '💰', color: 'from-green-500 to-emerald-600' },
        { title: 'Pedidos', stat: stats.totalOrders.toString(), subtext: 'Total', href: '/admin/orders', icon: '📋', color: 'from-blue-500 to-indigo-600' },
        { title: 'Produtos', stat: totalProducts.toString(), subtext: `${activeProducts} ativos`, href: '/admin/products', icon: '📦', color: 'from-pink-500 to-rose-600' },
        { title: 'Sobre', stat: '—', subtext: 'Editar', href: '/admin/about', icon: 'ℹ️', color: 'from-slate-500 to-gray-600' },
    ];

    if (loading || productsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 overflow-x-hidden">
                {/* Header- Fixed, not scaled */}
                <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
                    <div className="w-full px-8 py-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <Image src="/logo.png" alt="Dona Onça" width={56} height={56} className="w-14 h-14" />
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
                                    <p className="text-lg text-gray-500">Gerencie sua loja Dona Onça</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5">
                                {/* Team Button - Moved here */}
                                <Link
                                    href="/admin/team"
                                    className="flex items-center gap-2 px-4 h-[52px] rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
                                    title="Gestão de Equipe"
                                >
                                    <span className="text-2xl">🛡️</span>
                                    <span className="font-semibold text-lg hidden sm:inline">Equipe</span>
                                </Link>

                                <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-2">
                                    <button
                                        onClick={() => setZoom(Math.max(70, zoom - 10))}
                                        className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-white rounded-xl transition-colors"
                                    >
                                        A-
                                    </button>
                                    <span className="px-4 text-base text-gray-600 w-20 text-center font-bold">{zoom}%</span>
                                    <button
                                        onClick={() => setZoom(Math.min(200, zoom + 10))}
                                        className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-white rounded-xl transition-colors"
                                    >
                                        A+
                                    </button>
                                </div>
                                <Link href="/" className="rounded-2xl border-2 border-gray-300 px-6 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                    ← Loja
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Scaled */}
                <div
                    className="w-full px-8 py-10 origin-top-left"
                    style={{
                        transform: `scale(${scale})`,
                        width: `${100 / scale}%`,
                        minHeight: `${100 / scale}vh`
                    }}
                >
                    {/* Cards */}
                    <div className="mb-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
                        {adminCards.map((card) => (
                            <Link
                                key={card.title}
                                href={card.href}
                                className={`block group rounded-3xl bg-gradient-to-br ${card.color} p-6 text-white shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1`}
                            >
                                <div className="text-4xl">{card.icon}</div>
                                <p className="text-base font-semibold opacity-90 mt-2">{card.title}</p>
                                <p className="text-3xl font-bold mt-1">{card.stat}</p>
                                <p className="text-sm opacity-80 mt-1">{card.subtext}</p>
                            </Link>
                        ))}
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Recent Activity */}
                        <div className="rounded-3xl bg-white p-8 shadow-lg">
                            <div className="flex items-center mb-6">
                                <h2 className="font-bold text-gray-900 text-xl">📌 Atividade Recente</h2>
                            </div>
                            {stats.recentActivity.length === 0 ? (
                                <p className="text-gray-500 py-4 text-center">Nenhuma atividade recente encontrada.</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {stats.recentActivity.map((item: any, i: number) => (
                                        <Link key={i} href={item.href} className="flex items-center gap-4 rounded-2xl bg-gray-50 p-5 hover:bg-gray-100 transition-colors">
                                            <span className="text-2xl">{item.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-lg font-semibold text-gray-900 truncate">{item.action}</p>
                                                <p className="text-base text-gray-500">{item.time}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status Distribution */}
                        <div className="rounded-3xl bg-white p-8 shadow-lg">
                            <h2 className="font-bold text-gray-900 text-xl mb-6">📊 Status dos Pedidos</h2>

                            {stats.ordersByStatus.length === 0 ? (
                                <p className="text-gray-500 py-4 text-center">Nenhum pedido para gerar gráfico.</p>
                            ) : (
                                <div className="space-y-4">
                                    {stats.ordersByStatus.map((item: any) => (
                                        <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="font-medium text-gray-700">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
