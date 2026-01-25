'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { supabase } from '@/lib/supabase';
import Tooltip from '@/components/ui/Tooltip';
import AnalysisSection from '@/components/admin/AnalysisSection';

// Helper for formatting currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Helper to normalize strings for matching
const normalizeString = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

// Pie Chart Component (Compact & Dark Mode Optimized)
const PieChart = ({ data }: { data: { name: string; value: number; color?: string }[] }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    let currentAngle = 0;

    if (total === 0) return (
        <div className="w-24 h-24 rounded-full border-2 border-gray-700 flex items-center justify-center text-[10px] text-gray-500">
            Sem dados
        </div>
    );

    return (
        <div className="relative w-28 h-28 md:w-32 md:h-32">
            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full drop-shadow-lg">
                {data.map((item, index) => {
                    const angle = (item.value / total) * 360;
                    const safeAngle = Math.max(angle, 1);
                    const x1 = 50 + 40 * Math.cos((Math.PI * currentAngle) / 180);
                    const y1 = 50 + 40 * Math.sin((Math.PI * currentAngle) / 180);
                    const x2 = 50 + 40 * Math.cos((Math.PI * (currentAngle + safeAngle)) / 180);
                    const y2 = 50 + 40 * Math.sin((Math.PI * (currentAngle + safeAngle)) / 180);

                    const largeArc = safeAngle > 180 ? 1 : 0;
                    const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    // Default colors
                    const colors = ['#d6008b', '#00bcd4', '#ff9800', '#9c27b0', '#4caf50'];
                    const fillColor = item.color || colors[index % colors.length];

                    currentAngle += safeAngle;

                    return (
                        <path
                            key={item.name}
                            d={path}
                            fill={fillColor}
                            stroke="rgba(17, 24, 39, 1)" // Dark background stroke
                            strokeWidth="2"
                            className="transition-all duration-300 hover:opacity-90 transform origin-center cursor-pointer hover:scale-105"
                        >
                            <title>{`${item.name}: ${formatCurrency(item.value)}`}</title>
                        </path>
                    );
                })}
                {/* Center hole circle for dark mode */}
                <circle cx="50" cy="50" r="28" fill="rgba(17, 24, 39, 1)" />
            </svg>
        </div>
    );
};

// Simple Sparkline (Line) Chart for Revenue
const Sparkline = ({ data }: { data: number[] }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || (max === 0 ? 1 : max);

    // Scale points to 0-100 coordinates with padding
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const normalized = range === 0 ? 0.5 : (val - min) / range;
        // Map to 80% height (10% padding top/bottom)
        // SUV y=0 is top. 
        const y = 90 - (normalized * 80);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Area fill (optional, maybe just line is cleaner for sparkline) */}
                <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                    className="drop-shadow-sm"
                />
            </svg>
        </div>
    );
};

interface Activity {
    id: string;
    type: 'order' | 'stock' | 'customer' | 'review' | 'event';
    message: string;
    time: string;
    icon: string;
    color: string;
    link?: string;
    pinned?: boolean;
}

// Mock Customers
const MOCK_CUSTOMERS = [
    { id: 'mock-1', full_name: 'Dra. Ana Silva', email: 'ana.silva@email.com', total_spent: 1250.90, created_at: new Date().toISOString() },
    { id: 'mock-2', full_name: 'Mariana Costa', email: 'mari.costa@email.com', total_spent: 890.50, created_at: new Date().toISOString() },
    { id: 'mock-3', full_name: 'Fernanda Oliveira', email: 'fer.oliveira@email.com', total_spent: 650.00, created_at: new Date().toISOString() },
    { id: 'mock-4', full_name: 'Patricia Santos', email: 'patty.santos@email.com', total_spent: 420.20, created_at: new Date().toISOString() },
    { id: 'mock-5', full_name: 'Camila Rodrigues', email: 'camila.rod@email.com', total_spent: 310.80, created_at: new Date().toISOString() },
];

export default function AdminDashboard() {
    const { products, loading: productsLoading } = useProducts();
    const [orders, setOrders] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(100);
    const [salesGoal, setSalesGoal] = useState(50000);

    // Panel States
    const [salesPanelView, setSalesPanelView] = useState<'categories' | 'products' | 'clients'>('categories');
    // Activity State
    const [clearedActivities, setClearedActivities] = useState<string[]>([]);
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    useEffect(() => {
        const storedZoom = localStorage.getItem('admin_zoom_level');
        if (storedZoom) setZoom(Number(storedZoom));
    }, []);

    const updateZoom = (newZoom: number) => {
        const z = Math.max(50, Math.min(newZoom, 150));
        setZoom(z);
        localStorage.setItem('admin_zoom_level', z.toString());
    };

    const handleZoomIn = () => updateZoom(zoom + 5);
    const handleZoomOut = () => updateZoom(zoom - 5);

    // Listen for sales goal changes
    useEffect(() => {
        const loadGoal = () => {
            const stored = localStorage.getItem('dona_onca_sales_goal');
            if (stored) setSalesGoal(Number(stored));
        };
        loadGoal();
        window.addEventListener('storage', loadGoal);
        return () => window.removeEventListener('storage', loadGoal);
    }, []);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
                const { data: profilesData } = await supabase.from('profiles').select('*').eq('is_admin', false).order('created_at', { ascending: false });
                setOrders(ordersData || []);
                setCustomers(profilesData || []);
            } catch (error) { console.error('Error fetching data:', error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    // Add mock customers
    const displayCustomers = useMemo(() => {
        return [...customers, ...MOCK_CUSTOMERS].sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0));
    }, [customers]);

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const monthlyRevenue: number[] = [];

        for (let i = 5; i >= 0; i--) {
            const month = new Date(thisYear, thisMonth - i, 1);
            const monthEnd = new Date(thisYear, thisMonth - i + 1, 0);

            const revenue = orders
                .filter(o => { const d = new Date(o.created_at); return d >= month && d <= monthEnd && o.status !== 'Cancelado'; })
                .reduce((sum, o) => sum + (o.total || 0), 0);
            monthlyRevenue.push(revenue);
        }

        const totalRevenue = orders.filter(o => o.status !== 'Cancelado' && o.status !== 'Devolvido').reduce((sum, o) => sum + (o.total || 0), 0);
        const currentMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1] || 0;
        const pendingOrders = orders.filter(o => o.status === 'Pendente' || o.status === 'Pago').length;
        const lowStockProducts = products.filter(p => p.stock <= 5 && p.active).length;

        return {
            totalRevenue,
            currentMonthRevenue,
            totalOrders: orders.length,
            pendingOrders,
            lowStockProducts,
            monthlyRevenue,
            totalCustomers: customers.length,
            avgTicket: orders.length > 0 ? totalRevenue / orders.filter(o => o.status !== 'Cancelado').length : 0,
        };
    }, [orders, customers, products]);

    // Top products
    const topProducts = useMemo(() => {
        const productSales: Record<string, { quantity: number; revenue: number; realProduct?: any }> = {};
        orders.forEach(order => {
            (order.items || []).forEach((item: any) => {
                const name = item.productName || 'Produto';
                if (!productSales[name]) {
                    const realProd = products.find(p => {
                        const n1 = normalizeString(p.name);
                        const n2 = normalizeString(name);
                        return n1.includes(n2) || n2.includes(n1);
                    });
                    productSales[name] = { quantity: 0, revenue: 0, realProduct: realProd };
                }
                productSales[name].quantity += item.quantity || 1;
                productSales[name].revenue += (item.price || 0) * (item.quantity || 1);
            });
        });
        return Object.entries(productSales)
            .map(([name, data]) => ({
                name, value: data.revenue, sold: data.quantity, stock: data.realProduct?.stock || 0, id: data.realProduct?.id,
                color: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'][Object.keys(productSales).indexOf(name) % 6]
            }))
            .sort((a, b) => b.value - a.value).slice(0, 5);
    }, [orders, products]);

    // Top Clients
    const topClients = useMemo(() => {
        return displayCustomers.slice(0, 5).map((c, i) => ({
            name: c.full_name.split(' ')[0], value: c.total_spent || 0,
            color: ['#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6'][i]
        }));
    }, [displayCustomers]);

    // Sales by category
    const salesByCategory = useMemo(() => {
        const categories: Record<string, number> = { 'Calcinhas': 0, 'Sutiãs': 0, 'Conjuntos': 0, 'Lingerie': 0, 'Outros': 0 };
        const colors: Record<string, string> = { 'Calcinhas': '#d6008b', 'Sutiãs': '#00bcd4', 'Conjuntos': '#ff9800', 'Lingerie': '#9c27b0', 'Outros': '#4caf50' };

        orders.forEach(order => {
            (order.items || []).forEach((item: any) => {
                const name = item.productName || '';
                const n = normalizeString(name);
                const revenue = (item.price || 0) * (item.quantity || 1);

                if (n.includes('calcinha')) categories['Calcinhas'] += revenue;
                else if (n.includes('sutia')) categories['Sutiãs'] += revenue;
                else if (n.includes('conjunto')) categories['Conjuntos'] += revenue;
                else if (n.includes('babydoll') || n.includes('camisola') || n.includes('espartilho')) categories['Lingerie'] += revenue;
                else categories['Outros'] += revenue;
            });
        });

        const total = Object.values(categories).reduce((a, b) => a + b, 0);
        return Object.entries(categories)
            .map(([name, value]) => ({ name, value, percentage: total > 0 ? (value / total) * 100 : 0, color: colors[name] }))
            .filter(c => c.value > 0).sort((a, b) => b.value - a.value);
    }, [orders]);

    // Activity feed
    const activities = useMemo(() => {
        const acts: Activity[] = [];
        acts.push({ id: 'event-promo', type: 'event', message: 'Promoção de Verão ativa!', time: 'Agora', icon: '🔥', color: 'text-red-400', pinned: true });
        products.filter(p => p.active && p.stock <= 5).forEach(p => acts.push({
            id: `stock-${p.id}`, type: 'stock', message: `Estoque baixo: ${p.name}`, time: `${p.stock} un.`, icon: '⚠️', color: 'text-orange-400', link: `/admin/products?highlight=${p.id}`, pinned: true
        }));
        // Recent orders
        orders.slice(0, 10).forEach(o => {
            if (!clearedActivities.includes(`order-${o.id}`) && !dismissedIds.includes(`order-${o.id}`)) acts.push({
                id: `order-${o.id}`, type: 'order', message: `Pedido #${o.id.slice(0, 5)} - ${formatCurrency(o.total)}`, time: 'Novo', icon: '🛒', color: 'text-brand-300', link: `/admin/orders`, pinned: false
            });
        });
        // Filter out dismissed pinned items
        return acts.filter(a => !dismissedIds.includes(a.id)).sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));
    }, [orders, products, clearedActivities, dismissedIds]);

    const handleDismiss = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDismissedIds(prev => [...prev, id]);
    };

    const handleClearAll = () => {
        const normalIds = activities.filter(a => !a.pinned).map(a => a.id);
        setClearedActivities(prev => [...prev, ...normalIds]);
    };

    const activeProducts = products.filter(p => p.active).length;
    const nextSalesView = () => setSalesPanelView(prev => prev === 'categories' ? 'products' : prev === 'products' ? 'clients' : 'categories');

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
            {/* Header - Fixed Dark */}
            <div className="border-b border-gray-800 bg-gray-900 sticky top-0 z-40 bg-opacity-95 backdrop-blur-md">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Image src="/logo.png" alt="Dona Onça" width={38} height={38} />
                            <div>
                                <h1 className="text-lg font-bold text-white leading-tight">Painel Administrativo</h1>
                                <p className="text-xs text-gray-400">Gerencie sua loja Dona Onça</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/admin/team" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors font-medium text-sm shadow-lg shadow-blue-500/20">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 4 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 4 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                                Equipe
                            </Link>

                            <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
                                <button onClick={handleZoomOut} className="px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors text-xs">A-</button>
                                <span className="text-[10px] font-bold px-2 text-gray-500">{zoom}%</span>
                                <button onClick={handleZoomIn} className="px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors text-xs">A+</button>
                            </div>

                            <Link href="/" className="bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-1.5 rounded-lg transition-colors font-medium text-sm flex items-center gap-2">
                                <span>←</span> Loja
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scalable Content Container - MOVED FROM transform:scale to zoom:property TO FIX SCROLL/FOOTER ISSUE */}
            <div className="flex-1 bg-gray-900 pb-12">
                <div
                    className="w-full px-6 py-6"
                    style={{ zoom: zoom / 100 }}
                >
                    {/* 1. TOP: Solid Color Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                        {/* CATEGORIAS - PURPLE */}
                        <Link href="/admin/categories" className="relative group bg-[#A855F7] rounded-xl p-4 text-white shadow-lg h-28 flex flex-col justify-between hover:brightness-110 transition-all cursor-pointer">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Tooltip content="Gerenciar categorias de produtos do catálogo"><span className="text-xs border border-white/30 rounded-full w-4 h-4 flex items-center justify-center">?</span></Tooltip></div>
                            <span className="text-xl opacity-80">🏷️</span>
                            <div><p className="text-xs font-medium opacity-90">Categorias</p><p className="text-2xl font-bold">4</p><p className="text-[10px] opacity-75">ativas</p></div>
                        </Link>
                        {/* CLIENTES - ORANGE */}
                        <Link href="/admin/customers" className="relative group bg-[#F97316] rounded-xl p-4 text-white shadow-lg h-28 flex flex-col justify-between hover:brightness-110 transition-all cursor-pointer">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Tooltip content="Base total de clientes cadastrados na loja"><span className="text-xs border border-white/30 rounded-full w-4 h-4 flex items-center justify-center">?</span></Tooltip></div>
                            <span className="text-xl opacity-80">👥</span>
                            <div><p className="text-xs font-medium opacity-90">Clientes</p><p className="text-2xl font-bold">{stats.totalCustomers}</p><p className="text-[10px] opacity-75">Cadastrados</p></div>
                        </Link>
                        {/* FATURAMENTO - GREEN */}
                        <Link href="/admin/faturamento" className="relative group bg-[#10B981] rounded-xl p-4 text-white shadow-lg h-28 flex flex-col justify-between hover:brightness-110 transition-all cursor-pointer overflow-hidden">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"><Tooltip content="Faturamento total acumulado (Pedidos Pagos)"><span className="text-xs border border-white/30 rounded-full w-4 h-4 flex items-center justify-center">?</span></Tooltip></div>
                            <span className="text-xl opacity-80 relative z-10">💰</span>
                            <div className="relative z-10"><p className="text-xs font-medium opacity-90">Faturamento</p><p className="text-xl font-bold tracking-tight">{formatCurrency(stats.totalRevenue)}</p><p className="text-[10px] opacity-75">Total</p></div>
                            {/* Mini Revenue Chart */}
                            <div className="absolute bottom-0 left-0 right-0 h-16 text-white/40 pointer-events-none p-1">
                                <Sparkline data={stats.monthlyRevenue} />
                            </div>
                        </Link>
                        {/* PEDIDOS - BLUE */}
                        <Link href="/admin/orders" className="relative group bg-[#3B82F6] rounded-xl p-4 text-white shadow-lg h-28 flex flex-col justify-between hover:brightness-110 transition-all cursor-pointer">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Tooltip content="Número total de pedidos recebidos"><span className="text-xs border border-white/30 rounded-full w-4 h-4 flex items-center justify-center">?</span></Tooltip></div>
                            <span className="text-xl opacity-80">📋</span>
                            <div><p className="text-xs font-medium opacity-90">Pedidos</p><p className="text-2xl font-bold">{stats.totalOrders}</p><p className="text-[10px] opacity-75">Total</p></div>
                        </Link>
                        {/* PRODUTOS - RED */}
                        <Link href="/admin/products" className="relative group bg-[#F43F5E] rounded-xl p-4 text-white shadow-lg h-28 flex flex-col justify-between hover:brightness-110 transition-all cursor-pointer">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Tooltip content="Total de produtos cadastrados / ativos"><span className="text-xs border border-white/30 rounded-full w-4 h-4 flex items-center justify-center">?</span></Tooltip></div>
                            <span className="text-xl opacity-80">📦</span>
                            <div><p className="text-xs font-medium opacity-90">Produtos</p><p className="text-2xl font-bold">{products.length}</p><p className="text-[10px] opacity-75">{activeProducts} ativos</p></div>
                        </Link>
                        {/* SOBRE - GREY */}
                        <Link href="/admin/site" className="relative group bg-[#4B5563] rounded-xl p-4 text-white shadow-lg h-28 flex flex-col justify-between hover:brightness-110 transition-all cursor-pointer">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Tooltip content="Editar configurações do site e banners"><span className="text-xs border border-white/30 rounded-full w-4 h-4 flex items-center justify-center">?</span></Tooltip></div>
                            <span className="text-xl opacity-80">ℹ️</span>
                            <div><p className="text-xs font-medium opacity-90">Sobre</p><p className="text-2xl font-bold">...</p><p className="text-[10px] opacity-75 underline">Editar</p></div>
                        </Link>
                    </div>

                    {/* 2. MIDDLE: Panels (Height Increased ~320px) */}
                    <div className="grid lg:grid-cols-3 gap-4 mb-6">
                        {/* Panel A: Analise Sales */}
                        <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 h-[320px] flex flex-col relative overflow-hidden">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <h2 className="font-bold text-gray-200 text-sm">Análise de Vendas</h2>
                                    <Tooltip content="Visualize a distribuição de vendas por Categoria, Produto ou Cliente. Clique no botão ao lado para alternar a visualização.">
                                        <div className="text-gray-500 hover:text-white cursor-help text-[10px] border border-gray-600 rounded-full w-3.5 h-3.5 flex items-center justify-center">?</div>
                                    </Tooltip>
                                </div>
                                <button onClick={nextSalesView} className="text-[10px] font-bold text-brand-400 bg-brand-900/30 border border-brand-500/30 px-2 py-0.5 rounded-full uppercase tracking-wide hover:bg-brand-900/50 transition-colors">
                                    {salesPanelView === 'categories' ? 'Por Categoria' : salesPanelView === 'products' ? 'Por Produto' : 'Por Cliente'} 🔄
                                </button>
                            </div>

                            <div className="flex-1 flex flex-row items-center gap-2 overflow-hidden">
                                {/* CHART LEFT */}
                                <div className="flex-shrink-0 flex items-center justify-center pl-1">
                                    {salesPanelView === 'categories' && <PieChart data={salesByCategory} />}
                                    {salesPanelView === 'products' && <PieChart data={topProducts} />}
                                    {salesPanelView === 'clients' && <PieChart data={topClients} />}
                                </div>

                                {/* LIST RIGHT */}
                                <div className="flex-1 h-full overflow-y-auto custom-scrollbar pr-1 flex flex-col justify-center">
                                    <table className="w-full text-xs">
                                        <tbody>
                                            {(salesPanelView === 'categories' ? salesByCategory : salesPanelView === 'products' ? topProducts : topClients).map((item, i) => (
                                                <tr key={i} className="border-b border-gray-700/50 last:border-0 hover:bg-gray-700/30 group">
                                                    <td className="py-1.5 pl-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: item.color }}></span>
                                                            <span className="text-gray-300 font-medium truncate max-w-[90px] group-hover:text-white transition-colors">{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-1.5 text-right text-gray-200 font-bold tabular-nums">
                                                        {formatCurrency(item.value)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Panel B: Estoque */}
                        <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 h-[320px] flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-bold text-gray-200 text-sm">Saúde do Estoque</h2>
                                <Tooltip content="Relação entre vendas e estoque atual. Barra verde = Saudável, Barra vermelha = Crítico (< 5 un).">
                                    <div className="text-gray-500 hover:text-white cursor-help text-[10px] border border-gray-600 rounded-full w-3.5 h-3.5 flex items-center justify-center">?</div>
                                </Tooltip>
                            </div>
                            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                                <div className="flex gap-2 shrink-0">
                                    <div className="flex-1 bg-gray-900/50 rounded-lg p-2 text-center border border-gray-700">
                                        <p className="text-xl font-bold text-white">{products.length}</p>
                                        <p className="text-[9px] text-gray-500 uppercase font-bold">Total</p>
                                    </div>
                                    <div className="flex-1 bg-red-900/20 rounded-lg p-2 text-center border border-red-500/20">
                                        <p className="text-xl font-bold text-red-500">{stats.lowStockProducts}</p>
                                        <p className="text-[9px] text-red-400 uppercase font-bold">Crítico</p>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-hidden flex flex-col">
                                    <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold mb-1 px-1">
                                        <span>Produto</span>
                                        <span>Vendas / Est.</span>
                                    </div>
                                    <div className="overflow-y-auto flex-1 custom-scrollbar pr-1 space-y-1">
                                        {topProducts.map((p, i) => (
                                            <Link href={p.id ? `/admin/products?highlight=${p.id}` : '#'} key={i} className="flex justify-between items-center p-1.5 hover:bg-gray-700/50 rounded transition-colors cursor-pointer group">
                                                <span className="text-xs text-gray-400 group-hover:text-white truncate max-w-[120px]">{p.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-300">{p.sold}/{p.stock}</span>
                                                    <div className="w-10 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                        <div className={`h-full ${p.stock < 5 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min((p.sold / (p.stock || 1)) * 100, 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Panel C: Feed */}
                        <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 h-[320px] flex flex-col">
                            <div className="flex items-center justify-between mb-3 shrink-0">
                                <div className="flex items-center gap-2">
                                    <h2 className="font-bold text-gray-200 text-sm">Atividades</h2>
                                    <Tooltip content="Feed de eventos em tempo real. Itens amarelos são fixados (promoções/alertas) e podem ser dispensados no X.">
                                        <div className="text-gray-500 hover:text-white cursor-help text-[10px] border border-gray-600 rounded-full w-3.5 h-3.5 flex items-center justify-center">?</div>
                                    </Tooltip>
                                </div>
                                <button onClick={handleClearAll} className="text-[10px] text-gray-500 hover:text-gray-300 uppercase tracking-wide">Limpar</button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                                {activities.map((act, i) => (
                                    <div key={i} className={`flex gap-2 items-start p-2 rounded border transition-all group/item ${act.pinned ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-gray-700/20 border-transparent hover:bg-gray-700/40'}`}>
                                        <span className="text-sm">{act.icon}</span>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-[11px] font-bold leading-tight ${act.pinned ? 'text-yellow-500' : 'text-gray-300'}`}>{act.message}</p>
                                            <p className="text-[9px] text-gray-500">{act.time}</p>
                                        </div>
                                        {act.pinned && (
                                            <button
                                                onClick={(e) => handleDismiss(e, act.id)}
                                                className="opacity-0 group-hover/item:opacity-100 text-gray-500 hover:text-white transition-opacity px-1"
                                                title="Dispensar"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. BOTTOM: Compact Analysis (Dark) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* Goal */}
                        <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Meta Mensal</p>
                                    <h3 className="text-lg font-bold text-white">{formatCurrency(stats.currentMonthRevenue)}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-brand-500 font-bold">{((stats.currentMonthRevenue / salesGoal) * 100).toFixed(0)}%</p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-brand-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(214,0,139,0.5)]" style={{ width: `${Math.min((stats.currentMonthRevenue / salesGoal) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        {/* Geo */}
                        <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-center">
                            <div className="flex items-end justify-center gap-4 h-10 mb-2">
                                <div className="w-4 bg-blue-600 h-full rounded-t relative group"></div>
                                <div className="w-4 bg-blue-500 h-2/3 rounded-t relative group"></div>
                                <div className="w-4 bg-blue-400 h-1/3 rounded-t relative group"></div>
                            </div>
                            <div className="flex justify-center gap-4 text-[10px] font-bold text-gray-500 border-t border-gray-700 pt-1">
                                <span className="w-4 text-center">SP</span>
                                <span className="w-4 text-center">RJ</span>
                                <span className="w-4 text-center">MG</span>
                            </div>
                        </div>

                        {/* KPIs */}
                        <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 grid grid-cols-2 gap-2 relative group">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Tooltip content="Indicadores de Performance: Ticket (Valor médio por venda), Conv. (% de visitantes que compram), Ret. (% de clientes que voltam), Itens (Média de produtos/carrinho).">
                                    <span className="text-xs border border-gray-600 bg-gray-900 text-gray-400 rounded-full w-4 h-4 flex items-center justify-center cursor-help">?</span>
                                </Tooltip>
                            </div>
                            <div className="text-center p-1.5 bg-gray-900/50 rounded border border-gray-700/50">
                                <p className="text-[9px] text-gray-500 uppercase cursor-help" title="Valor médio gasto por pedido">Ticket Médio</p>
                                <p className="text-xs font-bold text-gray-200">{formatCurrency(stats.avgTicket)}</p>
                            </div>
                            <div className="text-center p-1.5 bg-gray-900/50 rounded border border-gray-700/50">
                                <p className="text-[9px] text-gray-500 uppercase cursor-help" title="Porcentagem de visitantes que realizam compra">Conversão</p>
                                <p className="text-xs font-bold text-green-400">2.4%</p>
                            </div>
                            <div className="text-center p-1.5 bg-gray-900/50 rounded border border-gray-700/50">
                                <p className="text-[9px] text-gray-500 uppercase cursor-help" title="Porcentagem de clientes que compram mais de uma vez">Retenção</p>
                                <p className="text-xs font-bold text-blue-400">18%</p>
                            </div>
                            <div className="text-center p-1.5 bg-gray-900/50 rounded border border-gray-700/50">
                                <p className="text-[9px] text-gray-500 uppercase cursor-help" title="Média de itens por pedido">Itens/Ped</p>
                                <p className="text-xs font-bold text-purple-400">3.2</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
