'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { supabase } from '@/lib/supabase';

type DateFilter = '7d' | '30d' | '90d' | '12m';
type ChartView = 'revenue' | 'orders' | 'customers';
type AnalysisView = 'category' | 'products' | 'customers';

interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

interface OrderRow {
    id: string;
    user_id: string;
    items: OrderItem[];
    total: number;
    status: string;
    created_at: string;
}

// Pedidos cancelados/devolvidos não contam como receita nem como venda real --
// mesmo critério já usado em /admin/faturamento (.not('status', 'in', ...)).
const CANCELLED_STATUSES = new Set(['Cancelado', 'Devolvido']);

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

function startOfDay(d: Date) {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
}

/** Últimos `days` dias (hoje incluso), somando o total de pedidos válidos por dia. */
function dailySeries(orders: OrderRow[], days: number, valueFn: (os: OrderRow[]) => number) {
    const today = startOfDay(new Date());
    const points: { label: string; value: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        const next = new Date(day);
        next.setDate(next.getDate() + 1);
        const dayOrders = orders.filter(o => {
            const t = new Date(o.created_at);
            return t >= day && t < next;
        });
        points.push({ label: WEEKDAY_LABELS[day.getDay()], value: valueFn(dayOrders) });
    }
    return points;
}

/** Últimos 12 meses (mês atual incluso). */
function monthlySeries(orders: OrderRow[], valueFn: (os: OrderRow[]) => number) {
    const now = new Date();
    const points: { label: string; value: number }[] = [];
    for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthOrders = orders.filter(o => {
            const t = new Date(o.created_at);
            return t >= monthStart && t < monthEnd;
        });
        points.push({ label: MONTH_LABELS[monthStart.getMonth()], value: valueFn(monthOrders) });
    }
    return points;
}

function periodStart(filter: DateFilter): Date {
    const d = new Date();
    if (filter === '7d') d.setDate(d.getDate() - 7);
    else if (filter === '30d') d.setDate(d.getDate() - 30);
    else if (filter === '90d') d.setDate(d.getDate() - 90);
    else d.setMonth(d.getMonth() - 12);
    return d;
}

function formatChange(current: number, previous: number): string {
    if (previous === 0) return current > 0 ? 'novo' : '0%';
    const pct = ((current - previous) / previous) * 100;
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(0)}%`;
}

function toCsvValue(value: string | number): string {
    const s = String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Tooltip Component
function Tooltip({ text }: { text: string }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block">
            <button
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                className="ml-1 w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 text-sm font-bold inline-flex items-center justify-center"
            >
                ?
            </button>
            {show && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg w-64 z-50 shadow-lg">
                    {text}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
            )}
        </div>
    );
}

export default function StatisticsPage() {
    const { products } = useProducts();
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState<DateFilter>('30d');
    const [chartView, setChartView] = useState<ChartView>('revenue');
    const [analysisView, setAnalysisView] = useState<AnalysisView>('category');
    const [zoom, setZoom] = useState(100);

    const dateOptions: { value: DateFilter; label: string }[] = [
        { value: '7d', label: '7 dias' },
        { value: '30d', label: '30 dias' },
        { value: '90d', label: '90 dias' },
        { value: '12m', label: '12 meses' },
    ];

    // Auto-detect screen size and adjust zoom
    useEffect(() => {
        const adjustForScreen = () => {
            const width = window.innerWidth;
            if (width >= 2560) setZoom(115);
            else if (width >= 1920) setZoom(100);
            else if (width >= 1440) setZoom(95);
            else setZoom(90);
        };
        adjustForScreen();
        window.addEventListener('resize', adjustForScreen);
        return () => window.removeEventListener('resize', adjustForScreen);
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (error) throw error;

                const rows = (data || []) as OrderRow[];
                setOrders(rows);

                const userIds = [...new Set(rows.map(o => o.user_id).filter(Boolean))];
                if (userIds.length > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, full_name, email')
                        .in('id', userIds);
                    const map: Record<string, string> = {};
                    (profiles || []).forEach((p) => {
                        map[p.id] = p.full_name || p.email || 'Cliente';
                    });
                    setProfilesMap(map);
                }
            } catch (error) {
                console.error('Error fetching orders for statistics:', error);
            } finally {
                setOrdersLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const validOrders = useMemo(
        () => orders.filter(o => !CANCELLED_STATUSES.has(o.status)),
        [orders]
    );

    const stats = useMemo(() => {
        const start = periodStart(dateFilter);
        const periodLengthMs = Date.now() - start.getTime();
        const prevStart = new Date(start.getTime() - periodLengthMs);

        const inPeriod = validOrders.filter(o => new Date(o.created_at) >= start);
        const inPrevPeriod = validOrders.filter(o => {
            const t = new Date(o.created_at);
            return t >= prevStart && t < start;
        });

        const revenueTotal = inPeriod.reduce((s, o) => s + o.total, 0);
        const revenuePrev = inPrevPeriod.reduce((s, o) => s + o.total, 0);
        const ordersTotal = inPeriod.length;
        const ordersPrev = inPrevPeriod.length;

        // "Novo cliente" = primeira compra (entre todos os pedidos válidos) caiu dentro do período.
        const firstOrderByUser = new Map<string, number>();
        for (const o of validOrders) {
            const t = new Date(o.created_at).getTime();
            const existing = firstOrderByUser.get(o.user_id);
            if (existing === undefined || t < existing) firstOrderByUser.set(o.user_id, t);
        }
        const newCustomers = [...firstOrderByUser.values()].filter(t => t >= start.getTime()).length;
        const newCustomersPrev = [...firstOrderByUser.values()].filter(t => t >= prevStart.getTime() && t < start.getTime()).length;

        const avgTicket = ordersTotal > 0 ? revenueTotal / ordersTotal : 0;
        const avgTicketPrev = ordersPrev > 0 ? revenuePrev / ordersPrev : 0;

        // Categoria: cruza item.productId com o catálogo atual para saber a categoria.
        const categoryMap = new Map<string, { revenue: number; orders: number }>();
        for (const o of inPeriod) {
            for (const item of o.items || []) {
                const product = products.find(p => p.id === item.productId);
                const category = product?.category || 'Outros';
                const entry = categoryMap.get(category) || { revenue: 0, orders: 0 };
                entry.revenue += item.price * item.quantity;
                entry.orders += item.quantity;
                categoryMap.set(category, entry);
            }
        }
        const categoryRevenueTotal = [...categoryMap.values()].reduce((s, c) => s + c.revenue, 0);
        const categoryBreakdown = [...categoryMap.entries()]
            .map(([name, v]) => ({
                name,
                revenue: v.revenue,
                orders: v.orders,
                percent: categoryRevenueTotal > 0 ? Math.round((v.revenue / categoryRevenueTotal) * 100) : 0,
            }))
            .sort((a, b) => b.revenue - a.revenue);

        // Top produtos
        const productMap = new Map<number, { name: string; sales: number; revenue: number }>();
        for (const o of inPeriod) {
            for (const item of o.items || []) {
                const entry = productMap.get(item.productId) || { name: item.productName, sales: 0, revenue: 0 };
                entry.sales += item.quantity;
                entry.revenue += item.price * item.quantity;
                productMap.set(item.productId, entry);
            }
        }
        const topProducts = [...productMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        // Top clientes
        const customerMap = new Map<string, { orders: number; revenue: number }>();
        for (const o of inPeriod) {
            const entry = customerMap.get(o.user_id) || { orders: 0, revenue: 0 };
            entry.orders += 1;
            entry.revenue += o.total;
            customerMap.set(o.user_id, entry);
        }
        const topCustomers = [...customerMap.entries()]
            .map(([userId, v]) => ({ name: profilesMap[userId] || 'Cliente', ...v }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return {
            revenue: { total: revenueTotal, change: formatChange(revenueTotal, revenuePrev) },
            orders: { total: ordersTotal, change: formatChange(ordersTotal, ordersPrev) },
            newCustomers: { total: newCustomers, change: formatChange(newCustomers, newCustomersPrev) },
            avgTicket: { value: avgTicket, change: formatChange(avgTicket, avgTicketPrev) },
            categoryBreakdown,
            topProducts,
            topCustomers,
            inPeriod,
        };
    }, [validOrders, dateFilter, products, profilesMap]);

    const productStats = {
        total: products.length,
        active: products.filter(p => p.active).length,
        lowStock: products.filter(p => p.stock <= (p.lowStockAlert || 5)).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
    };

    const chartLabels = {
        revenue: { title: '💰 Faturamento', tip: 'Total de vendas no período. Um aumento indica crescimento nas vendas.' },
        orders: { title: '📋 Pedidos', tip: 'Quantidade de pedidos realizados. Acompanhe a demanda do seu negócio.' },
        customers: { title: '👥 Novos Clientes', tip: 'Clientes que compraram pela primeira vez. Indica expansão da base.' },
    };

    const analysisLabels = {
        category: { title: '🏷️ Por Categoria', data: stats.categoryBreakdown },
        products: { title: '🏆 Top Produtos', data: stats.topProducts },
        customers: { title: '👑 Top Clientes', data: stats.topCustomers },
    };

    const nextChart = () => {
        const views: ChartView[] = ['revenue', 'orders', 'customers'];
        setChartView(views[(views.indexOf(chartView) + 1) % views.length]);
    };
    const prevChart = () => {
        const views: ChartView[] = ['revenue', 'orders', 'customers'];
        setChartView(views[(views.indexOf(chartView) - 1 + views.length) % views.length]);
    };
    const nextAnalysis = () => {
        const views: AnalysisView[] = ['category', 'products', 'customers'];
        setAnalysisView(views[(views.indexOf(analysisView) + 1) % views.length]);
    };
    const prevAnalysis = () => {
        const views: AnalysisView[] = ['category', 'products', 'customers'];
        setAnalysisView(views[(views.indexOf(analysisView) - 1 + views.length) % views.length]);
    };

    // O gráfico sempre mostra a janela de 7 dias ou 12 meses (nunca 30/90 dias
    // detalhado) -- simplificação que já existia na versão anterior da tela,
    // mantida aqui, só que agora com dados reais.
    const chartData = useMemo(() => {
        const valueFn = (os: OrderRow[]) => {
            switch (chartView) {
                case 'revenue': return os.reduce((s, o) => s + o.total, 0);
                case 'orders': return os.length;
                case 'customers': {
                    const ids = new Set(os.map(o => o.user_id));
                    return ids.size;
                }
            }
        };
        return dateFilter === '12m'
            ? monthlySeries(validOrders, valueFn)
            : dailySeries(validOrders, 7, valueFn);
    }, [validOrders, dateFilter, chartView]);

    const chartColors = { revenue: '#c2185b', orders: '#1976d2', customers: '#f57c00' };
    const maxChartValue = Math.max(1, ...chartData.map(p => p.value));

    const scaleFactor = zoom / 100;

    const handleExportCsv = () => {
        const rows = [
            ['Pedido', 'Cliente', 'Data', 'Total', 'Status'],
            ...stats.inPeriod.map(o => [
                o.id,
                profilesMap[o.user_id] || 'Cliente',
                new Date(o.created_at).toLocaleDateString('pt-BR'),
                o.total.toFixed(2).replace('.', ','),
                o.status,
            ]),
        ];
        const csv = rows.map(r => r.map(toCsvValue).join(',')).join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pedidos-${dateFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (ordersLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <>
            {/* CSS for hover scrollbar */}
            <style jsx global>{`
                .hover-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .hover-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .hover-scrollbar::-webkit-scrollbar-thumb {
                    background: transparent;
                    border-radius: 3px;
                }
                .hover-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.2);
                }
            `}</style>

            <div className="min-h-screen bg-gray-50 overflow-x-hidden text-gray-900">
                {/* Header */}
                <div className="border-b border-gray-200 bg-white">
                    <div className="w-full px-6 xl:px-12 2xl:px-16 py-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/admin" className="flex h-12 w-12 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">📊 Faturamento e Análises</h1>
                                    <p className="text-base text-gray-500">Relatórios completos do seu negócio</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Zoom Controls */}
                                <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-2">
                                    <button onClick={() => setZoom(Math.max(70, zoom - 10))} className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-white rounded-xl transition-colors">A-</button>
                                    <span className="px-4 text-base text-gray-600 w-20 text-center font-bold">{zoom}%</span>
                                    <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="px-4 py-2 text-lg font-bold text-gray-600 hover:bg-white rounded-xl transition-colors">A+</button>
                                </div>

                                {/* Date Filter */}
                                <div className="flex rounded-xl bg-gray-100 p-1">
                                    {dateOptions.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setDateFilter(option.value)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${dateFilter === option.value
                                                ? 'bg-white text-brand-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleExportCsv}
                                    disabled={stats.inPeriod.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Exportar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Scaled */}
                <div
                    className="w-full px-8 py-10 origin-top-left"
                    style={{
                        transform: `scale(${scaleFactor})`,
                        width: `${100 / scaleFactor}%`,
                        minHeight: `${100 / scaleFactor}vh`
                    }}
                >
                    {/* Main KPIs with Tooltips */}
                    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 mb-10">
                        <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-5 text-white">
                            <div className="flex items-start justify-between">
                                <p className="text-sm opacity-90">Faturamento</p>
                                <Tooltip text="Total de receita gerada (exclui pedidos cancelados/devolvidos). Monitore para avaliar a saúde financeira do negócio." />
                            </div>
                            <p className="text-2xl font-bold mt-1">R$ {stats.revenue.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="text-xs opacity-80 mt-1">{stats.revenue.change} vs período anterior</p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 text-white">
                            <div className="flex items-start justify-between">
                                <p className="text-sm opacity-90">Pedidos</p>
                                <Tooltip text="Quantidade de pedidos válidos. Acompanhe a demanda e prepare seu estoque." />
                            </div>
                            <p className="text-2xl font-bold mt-1">{stats.orders.total}</p>
                            <p className="text-xs opacity-80 mt-1">{stats.orders.change} vs período anterior</p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-5 text-white">
                            <div className="flex items-start justify-between">
                                <p className="text-sm opacity-90">Novos Clientes</p>
                                <Tooltip text="Clientes cuja primeira compra caiu neste período. Indica crescimento da base." />
                            </div>
                            <p className="text-2xl font-bold mt-1">{stats.newCustomers.total}</p>
                            <p className="text-xs opacity-80 mt-1">{stats.newCustomers.change} vs período anterior</p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-5 text-white">
                            <div className="flex items-start justify-between">
                                <p className="text-sm opacity-90">Ticket Médio</p>
                                <Tooltip text="Valor médio por pedido = Faturamento ÷ Pedidos. Quanto maior, melhor!" />
                            </div>
                            <p className="text-2xl font-bold mt-1">R$ {stats.avgTicket.value.toFixed(2).replace('.', ',')}</p>
                            <p className="text-xs opacity-80 mt-1">{stats.avgTicket.change} vs período anterior</p>
                        </div>
                    </div>

                    {/* Chart with Navigation */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 text-lg">{chartLabels[chartView].title}</h3>
                                <Tooltip text={chartLabels[chartView].tip} />
                                <span className="text-xs text-gray-400">
                                    ({dateFilter === '12m' ? 'últimos 12 meses' : 'últimos 7 dias'})
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={prevChart} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <span className="text-xs text-gray-400 w-20 text-center">{chartView === 'revenue' ? '1/3' : chartView === 'orders' ? '2/3' : '3/3'}</span>
                                <button onClick={nextChart} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                        {chartData.every(p => p.value === 0) ? (
                            <p className="py-10 text-center text-sm text-gray-400">Nenhum pedido válido nesse intervalo ainda.</p>
                        ) : (
                            <div className="h-40 flex items-end gap-1 overflow-x-auto pb-2">
                                {chartData.map((point, i) => (
                                    <div key={i} className="flex-1 min-w-[20px] flex flex-col items-center gap-1">
                                        <div
                                            className="w-full rounded-t hover:opacity-80 transition-opacity"
                                            style={{ height: `${(point.value / maxChartValue) * 100}%`, minHeight: 4, backgroundColor: chartColors[chartView] }}
                                            title={String(point.value)}
                                        />
                                        <span className="text-[10px] text-gray-400">{point.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Two Column Analysis with Navigation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                        {/* Analysis View */}
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900">{analysisLabels[analysisView].title}</h3>
                                    <Tooltip text="Navegue entre análises por categoria, produtos e clientes para entender seu negócio." />
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={prevAnalysis} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button onClick={nextAnalysis} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                            {analysisLabels[analysisView].data.length === 0 ? (
                                <p className="py-6 text-center text-sm text-gray-400">Sem dados nesse período ainda.</p>
                            ) : (
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {analysisView === 'category' && stats.categoryBreakdown.map((cat, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-20 text-sm text-gray-700 truncate">{cat.name}</div>
                                            <div className="flex-1">
                                                <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full" style={{ width: `${cat.percent}%` }} />
                                                </div>
                                            </div>
                                            <div className="w-12 text-right text-sm font-semibold text-gray-900">{cat.percent}%</div>
                                            <div className="w-20 text-right text-xs text-gray-500">R$ {cat.revenue.toLocaleString('pt-BR')}</div>
                                        </div>
                                    ))}
                                    {analysisView === 'products' && stats.topProducts.map((product, i) => (
                                        <Link key={i} href="/admin/products" className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 hover:bg-gray-100">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">{i + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.sales} vendas</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">R$ {product.revenue.toLocaleString('pt-BR')}</p>
                                        </Link>
                                    ))}
                                    {analysisView === 'customers' && stats.topCustomers.map((customer, i) => (
                                        <Link key={i} href="/admin/customers" className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 hover:bg-gray-100">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">{i + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                                                <p className="text-xs text-gray-500">{customer.orders} pedidos</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">R$ {customer.revenue.toLocaleString('pt-BR')}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Stats */}
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="font-semibold text-gray-900">📦 Resumo de Produtos</h3>
                                <Tooltip text="Visão geral do catálogo. Clique em cada card para ver detalhes." />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <Link href="/admin/products" className="p-3 rounded-xl bg-gray-50 text-center hover:bg-gray-100 transition-colors">
                                    <p className="text-xl font-bold text-gray-900">{productStats.total}</p>
                                    <p className="text-xs text-gray-500">Total</p>
                                </Link>
                                <Link href="/admin/products?filter=active" className="p-3 rounded-xl bg-green-50 text-center hover:bg-green-100 transition-colors">
                                    <p className="text-xl font-bold text-green-600">{productStats.active}</p>
                                    <p className="text-xs text-gray-500">Ativos</p>
                                </Link>
                                <Link href="/admin/products?filter=lowstock" className="p-3 rounded-xl bg-orange-50 text-center hover:bg-orange-100 transition-colors">
                                    <p className="text-xl font-bold text-orange-600">{productStats.lowStock}</p>
                                    <p className="text-xs text-gray-500">Estoque Baixo</p>
                                </Link>
                                <Link href="/admin/products?filter=outofstock" className="p-3 rounded-xl bg-red-50 text-center hover:bg-red-100 transition-colors">
                                    <p className="text-xl font-bold text-red-600">{productStats.outOfStock}</p>
                                    <p className="text-xs text-gray-500">Sem Estoque</p>
                                </Link>
                                <Link href="/admin/products" className="p-3 rounded-xl bg-brand-50 text-center hover:bg-brand-100 transition-colors col-span-2">
                                    <p className="text-xl font-bold text-brand-600">R$ {productStats.totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                                    <p className="text-xs text-gray-500">Valor em Estoque</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
