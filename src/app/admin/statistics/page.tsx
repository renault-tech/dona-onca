'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useProducts } from '@/contexts/ProductContext';

type DateFilter = '7d' | '30d' | '90d' | '12m';
type ChartView = 'revenue' | 'orders' | 'customers';
type AnalysisView = 'category' | 'products' | 'customers';

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

// Mock data
const mockData = {
    revenue: {
        '7d': { total: 3250, change: '+12%', data: [420, 380, 520, 480, 550, 420, 480] },
        '30d': { total: 12450, change: '+8%', data: [380, 420, 350, 480, 520, 390, 450, 410, 480, 520, 380, 450, 490, 510, 420, 380, 520, 480, 550, 420, 480, 390, 410, 450, 520, 480, 390, 420, 450, 480] },
        '90d': { total: 38500, change: '+15%', data: [] },
        '12m': { total: 142000, change: '+23%', data: [8500, 9200, 7800, 11500, 13200, 15800, 12450, 9800, 11200, 13500, 14800, 14250] },
    },
    orders: {
        '7d': { total: 42, change: '+5', data: [5, 7, 4, 8, 6, 7, 5] },
        '30d': { total: 156, change: '+12', data: [4, 6, 5, 7, 8, 5, 6, 4, 7, 8, 5, 6, 7, 8, 5, 4, 7, 6, 8, 5, 6, 4, 5, 6, 7, 6, 5, 5, 6, 7] },
        '90d': { total: 450, change: '+45', data: [] },
        '12m': { total: 1850, change: '+320', data: [120, 135, 142, 155, 168, 175, 156, 140, 152, 165, 172, 170] },
    },
    customers: {
        '7d': { total: 12, change: '+3', data: [1, 2, 1, 3, 2, 2, 1] },
        '30d': { total: 89, change: '+15', data: [] },
        '90d': { total: 245, change: '+68', data: [] },
        '12m': { total: 890, change: '+420', data: [55, 62, 68, 75, 82, 90, 89, 72, 78, 85, 92, 92] },
    },
    conversion: { rate: 3.2, change: '+0.5%' },
    avgTicket: { value: 156.80, change: '+8%' },
};

const categoryBreakdown = [
    { name: 'Calcinhas', revenue: 4580, orders: 52, percent: 35 },
    { name: 'Sutiãs', revenue: 3640, orders: 41, percent: 28 },
    { name: 'Conjuntos', revenue: 2860, orders: 28, percent: 22 },
    { name: 'Bodies', revenue: 1300, orders: 13, percent: 10 },
    { name: 'Outros', revenue: 650, orders: 8, percent: 5 },
];

const topSellingProducts = [
    { name: 'Calcinha Renda Luxo', sales: 45, revenue: 4050 },
    { name: 'Conjunto Sexy Night', sales: 32, revenue: 6400 },
    { name: 'Sutiã Push-Up Premium', sales: 28, revenue: 4200 },
    { name: 'Body Elegance', sales: 22, revenue: 4400 },
    { name: 'Camisola Seda', sales: 18, revenue: 2700 },
];

const topCustomers = [
    { name: 'Maria Silva', orders: 12, revenue: 2890 },
    { name: 'Ana Costa', orders: 8, revenue: 1450 },
    { name: 'Carla Mendes', orders: 6, revenue: 980 },
    { name: 'Julia Santos', orders: 5, revenue: 750 },
    { name: 'Paula Lima', orders: 4, revenue: 620 },
];

export default function StatisticsPage() {
    const { products } = useProducts();
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
            if (width >= 2560) {
                setZoom(115);
            } else if (width >= 1920) {
                setZoom(100);
            } else if (width >= 1440) {
                setZoom(95);
            } else {
                setZoom(90);
            }
        };
        adjustForScreen();
        window.addEventListener('resize', adjustForScreen);
        return () => window.removeEventListener('resize', adjustForScreen);
    }, []);

    const currentRevenue = mockData.revenue[dateFilter] || mockData.revenue['30d'];
    const currentOrders = mockData.orders[dateFilter] || mockData.orders['30d'];
    const currentCustomers = mockData.customers[dateFilter] || mockData.customers['30d'];

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
        category: { title: '🏷️ Por Categoria', data: categoryBreakdown },
        products: { title: '🏆 Top Produtos', data: topSellingProducts },
        customers: { title: '👑 Top Clientes', data: topCustomers },
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

    const getCurrentChartData = () => {
        switch (chartView) {
            case 'revenue': return dateFilter === '12m' ? mockData.revenue['12m'].data : mockData.revenue['7d'].data;
            case 'orders': return dateFilter === '12m' ? mockData.orders['12m'].data : mockData.orders['7d'].data;
            case 'customers': return dateFilter === '12m' ? mockData.customers['12m'].data : mockData.customers['7d'].data;
        }
    };

    const chartColors = { revenue: '#c2185b', orders: '#1976d2', customers: '#f57c00' };

    const scaleFactor = zoom / 100;

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

            <div className="min-h-screen bg-gray-50 overflow-x-hidden">
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
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">
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
                    <div className="grid grid-cols-2 gap-6 lg:grid-cols-5 mb-10">
                        <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-5 text-white">
                            <div className="flex items-start justify-between">
                                <p className="text-sm opacity-90">Faturamento</p>
                                <Tooltip text="Total de receita gerada. Monitore para avaliar a saúde financeira do negócio." />
                            </div>
                            <p className="text-2xl font-bold mt-1">R$ {currentRevenue.total.toLocaleString('pt-BR')}</p>
                            <p className="text-xs opacity-80 mt-1">{currentRevenue.change} vs anterior</p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 text-white">
                            <div className="flex items-start justify-between">
                                <p className="text-sm opacity-90">Pedidos</p>
                                <Tooltip text="Quantidade de pedidos. Acompanhe a demanda e prepare seu estoque." />
                            </div>
                            <p className="text-2xl font-bold mt-1">{currentOrders.total}</p>
                            <p className="text-xs opacity-80 mt-1">{currentOrders.change} vs anterior</p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-5 text-white">
                            <div className="flex items-start justify-between">
                                <p className="text-sm opacity-90">Novos Clientes</p>
                                <Tooltip text="Clientes que compraram pela primeira vez. Indica crescimento da base." />
                            </div>
                            <p className="text-2xl font-bold mt-1">{currentCustomers.total}</p>
                            <p className="text-xs opacity-80 mt-1">{currentCustomers.change} vs anterior</p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-5 text-white">
                            <div className="flex items-start justify-between">
                                <p className="text-sm opacity-90">Ticket Médio</p>
                                <Tooltip text="Valor médio por pedido = Faturamento ÷ Pedidos. Quanto maior, melhor!" />
                            </div>
                            <p className="text-2xl font-bold mt-1">R$ {mockData.avgTicket.value.toFixed(2).replace('.', ',')}</p>
                            <p className="text-xs opacity-80 mt-1">{mockData.avgTicket.change} vs anterior</p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-5 text-white">
                            <div className="flex items-start justify-between">
                                <p className="text-sm opacity-90">Taxa Conversão</p>
                                <Tooltip text="% de visitantes que compraram. Acima de 2% é considerado bom para e-commerce." />
                            </div>
                            <p className="text-2xl font-bold mt-1">{mockData.conversion.rate}%</p>
                            <p className="text-xs opacity-80 mt-1">{mockData.conversion.change} vs anterior</p>
                        </div>
                    </div>

                    {/* Chart with Navigation */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 text-lg">{chartLabels[chartView].title}</h3>
                                <Tooltip text={chartLabels[chartView].tip} />
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
                        <div className="h-40 flex items-end gap-1 overflow-x-auto pb-2">
                            {getCurrentChartData()?.map((value, i) => {
                                const data = getCurrentChartData() || [];
                                const maxValue = Math.max(...data);
                                return (
                                    <div key={i} className="flex-1 min-w-[20px] flex flex-col items-center gap-1">
                                        <div
                                            className="w-full rounded-t hover:opacity-80 transition-opacity"
                                            style={{ height: `${(value / maxValue) * 100}%`, minHeight: 4, backgroundColor: chartColors[chartView] }}
                                        />
                                        <span className="text-[10px] text-gray-400">
                                            {dateFilter === '12m' ? ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i] : ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
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
                            <div className="max-h-48 overflow-y-auto space-y-2">
                                {analysisView === 'category' && categoryBreakdown.map((cat, i) => (
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
                                {analysisView === 'products' && topSellingProducts.map((product, i) => (
                                    <Link key={i} href="/admin/products" className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 hover:bg-gray-100">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.sales} vendas</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">R$ {product.revenue.toLocaleString('pt-BR')}</p>
                                    </Link>
                                ))}
                                {analysisView === 'customers' && topCustomers.map((customer, i) => (
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
