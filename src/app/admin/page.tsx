'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { useProducts } from '@/contexts/ProductContext';

// Mock historical data for each metric
const mockHistoricalData = {
    products: {
        '7d': [3, 4, 4, 5, 4, 6, 4],
        '30d': [2, 3, 4, 3, 5, 4, 3, 6, 4, 5, 3, 4, 5, 4, 6, 3, 4, 5, 4, 3, 5, 6, 4, 3, 5, 4, 3, 5, 4, 4],
        '60d': Array.from({ length: 60 }, () => Math.floor(Math.random() * 5) + 2),
    },
    orders: {
        '7d': [12, 15, 18, 14, 22, 19, 25],
        '30d': [10, 12, 15, 18, 14, 22, 19, 25, 16, 20, 18, 24, 15, 19, 22, 17, 21, 23, 18, 20, 16, 24, 19, 22, 17, 21, 23, 18, 20, 25],
        '60d': Array.from({ length: 60 }, () => Math.floor(Math.random() * 20) + 10),
    },
    customers: {
        '7d': [8, 10, 7, 12, 9, 15, 12],
        '30d': [5, 8, 10, 7, 12, 9, 15, 12, 8, 11, 9, 14, 10, 8, 13, 11, 9, 12, 10, 8, 14, 11, 9, 13, 10, 8, 12, 11, 15, 12],
        '60d': Array.from({ length: 60 }, () => Math.floor(Math.random() * 10) + 5),
    },
    revenue: {
        '7d': [2100, 2450, 1980, 3200, 2800, 3500, 2890],
        '30d': [1800, 2100, 2450, 1980, 3200, 2800, 3500, 2890, 2200, 2600, 2400, 3100, 2500, 2300, 2900, 2700, 2500, 3000, 2600, 2400, 3200, 2800, 2600, 3100, 2700, 2500, 2900, 2700, 3500, 2890],
        '60d': Array.from({ length: 60 }, () => Math.floor(Math.random() * 2000) + 1500),
    },
    categories: {
        '7d': [5, 5, 5, 5, 5, 5, 5],
        '30d': Array(30).fill(5),
        '60d': Array(60).fill(5),
    },
};

const mockCategoryData = [
    { name: 'Calcinhas', value: 35, color: '#c2185b' },
    { name: 'Sutiãs', value: 28, color: '#7b1fa2' },
    { name: 'Conjuntos', value: 22, color: '#1976d2' },
    { name: 'Bodies', value: 10, color: '#388e3c' },
    { name: 'Outros', value: 5, color: '#f57c00' },
];

const mockRevenueByMonth = [
    { label: 'Jul', value: 8500 },
    { label: 'Ago', value: 9200 },
    { label: 'Set', value: 7800 },
    { label: 'Out', value: 11500 },
    { label: 'Nov', value: 13200 },
    { label: 'Dez', value: 15800 },
    { label: 'Jan', value: 12450 },
];

const mockOrdersByStatus = [
    { name: 'Pendente', value: 15, color: '#fbc02d' },
    { name: 'Pago', value: 45, color: '#388e3c' },
    { name: 'Enviado', value: 30, color: '#1976d2' },
    { name: 'Entregue', value: 10, color: '#757575' },
];

type ChartType = 'category' | 'revenue' | 'orderStatus';
type TopType = 'products' | 'customers' | 'categories';
type PeriodFilter = '7d' | '30d' | '60d';

// Line Chart Component for expanded view - Fixed
function LineChart({ data, color = '#c2185b' }: { data: number[]; color?: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    // Use percentage-based coordinates with wider viewBox
    const padding = 3;
    const chartWidth = 100 - padding * 2;
    const chartHeight = 50 - padding * 2;

    const points = data.map((value, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = padding + (1 - (value - min) / range) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    // Calculate average line
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const avgY = padding + (1 - (avg - min) / range) * chartHeight;

    // Create area fill points
    const areaPoints = `${padding},${padding + chartHeight} ${points} ${padding + chartWidth},${padding + chartHeight}`;

    return (
        <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Grid background */}
            <rect x={padding} y={padding} width={chartWidth} height={chartHeight} fill="#f9fafb" rx="1" />

            {/* Average line */}
            <line x1={padding} y1={avgY} x2={padding + chartWidth} y2={avgY} stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1,1" />

            {/* Area fill */}
            <polygon points={areaPoints} fill={`${color}20`} />

            {/* Line */}
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Data points - only show for smaller datasets */}
            {data.length <= 15 && data.map((value, i) => {
                const x = padding + (i / (data.length - 1)) * chartWidth;
                const y = padding + (1 - (value - min) / range) * chartHeight;
                return (
                    <circle key={i} cx={x} cy={y} r="1" fill={color} />
                );
            })}
        </svg>
    );
}

// Sparkline Component for Cards
function Sparkline({ data, color = 'rgba(255,255,255,0.8)', height = 30 }: { data: number[]; color?: string; height?: number }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;

    const points = data.map((value, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * (height - 4);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="mt-2">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Expanded Chart Modal
function ChartModal({
    isOpen,
    onClose,
    title,
    data,
    color,
    format = 'number'
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: { [key: string]: number[] };
    color: string;
    format?: 'number' | 'currency';
}) {
    const [period, setPeriod] = useState<PeriodFilter>('7d');

    if (!isOpen) return null;

    const currentData = data[period] || data['7d'];
    const total = currentData.reduce((a, b) => a + b, 0);
    const avg = total / currentData.length;
    const max = Math.max(...currentData);
    const min = Math.min(...currentData);

    const formatValue = (val: number) => {
        if (format === 'currency') {
            return `R$ ${val.toLocaleString('pt-BR')}`;
        }
        return val.toLocaleString('pt-BR');
    };

    const periodLabels = {
        '7d': 'Últimos 7 dias',
        '30d': 'Últimos 30 dias',
        '60d': 'Últimos 60 dias',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-2xl mx-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Period Filter */}
                <div className="flex gap-2 mb-6">
                    {Object.entries(periodLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setPeriod(key as PeriodFilter)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${period === key
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Chart - Full Width */}
                <div className="h-56 mb-6 w-full">
                    <LineChart data={currentData} color={color} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl text-center">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-bold text-gray-900">{formatValue(total)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl text-center">
                        <p className="text-sm text-gray-500">Média/dia</p>
                        <p className="text-lg font-bold text-gray-900">{formatValue(Math.round(avg))}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-2xl text-center">
                        <p className="text-sm text-gray-500">Máximo</p>
                        <p className="text-lg font-bold text-green-600">{formatValue(max)}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-2xl text-center">
                        <p className="text-sm text-gray-500">Mínimo</p>
                        <p className="text-lg font-bold text-orange-600">{formatValue(min)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Tooltip Component
function Tooltip({ text }: { text: string }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block">
            <button
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                className="ml-2 w-7 h-7 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 text-base font-bold inline-flex items-center justify-center"
            >
                ?
            </button>
            {show && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-base rounded-xl w-72 z-50 shadow-lg">
                    {text}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
            )}
        </div>
    );
}

// Donut Chart Component
function DonutChart({ data, size = 120 }: { data: { name: string; value: number; color: string }[]; size?: number }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90;

    const createArc = (startAngle: number, endAngle: number, color: string) => {
        const start = (startAngle * Math.PI) / 180;
        const end = (endAngle * Math.PI) / 180;
        const radius = size / 2 - 10;
        const centerX = size / 2;
        const centerY = size / 2;

        const x1 = centerX + radius * Math.cos(start);
        const y1 = centerY + radius * Math.sin(start);
        const x2 = centerX + radius * Math.cos(end);
        const y2 = centerY + radius * Math.sin(end);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return (
            <path
                d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={color}
                className="hover:opacity-80 transition-opacity"
            />
        );
    };

    return (
        <svg width={size} height={size}>
            {data.map((item, i) => {
                const angle = (item.value / total) * 360;
                const arc = createArc(currentAngle, currentAngle + angle, item.color);
                currentAngle += angle;
                return <g key={i}>{arc}</g>;
            })}
            <circle cx={size / 2} cy={size / 2} r={size / 4} fill="white" />
        </svg>
    );
}

// Bar Chart Component
function BarChart({ data, height = 120, color = '#c2185b' }: { data: { label: string; value: number }[]; height?: number; color?: string }) {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="flex items-end gap-2 h-full" style={{ height }}>
            {data.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                        className="w-full rounded-t transition-all hover:opacity-80"
                        style={{
                            height: `${(item.value / maxValue) * 100}%`,
                            backgroundColor: color,
                            minHeight: 4
                        }}
                    />
                    <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                </div>
            ))}
        </div>
    );
}

export default function AdminDashboard() {
    const { products } = useProducts();
    const [chartType, setChartType] = useState<ChartType>('category');
    const [topType, setTopType] = useState<TopType>('products');
    const [newOrderAlert, setNewOrderAlert] = useState(false);
    const [lastOrderId, setLastOrderId] = useState('1238');
    const [zoom, setZoom] = useState(100);
    const [activeModal, setActiveModal] = useState<string | null>(null);

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

    // Mock occurrences
    const [occurrences, setOccurrences] = useState([
        { id: 1, type: 'order', message: 'Novo pedido #1238', time: 'Agora', read: false },
        { id: 2, type: 'stock', message: 'Estoque baixo: Calcinha Renda', time: '10 min', read: false },
        { id: 3, type: 'order', message: 'Pedido #1237 pago', time: '25 min', read: true },
        { id: 4, type: 'customer', message: 'Nova cliente: Ana Costa', time: '1h', read: true },
    ]);

    // Simulate new order notification
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.97) {
                const newId = (parseInt(lastOrderId) + 1).toString();
                setNewOrderAlert(true);
                setLastOrderId(newId);
                setOccurrences(prev => [{
                    id: Date.now(),
                    type: 'order',
                    message: `Novo pedido #${newId}`,
                    time: 'Agora',
                    read: false
                }, ...prev.slice(0, 9)]);
                setTimeout(() => setNewOrderAlert(false), 5000);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [lastOrderId]);

    const realStats = useMemo(() => {
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.active).length;
        const lowStockProducts = products.filter(p => p.stock <= (p.lowStockAlert || 5)).length;
        return { totalProducts, activeProducts, lowStockProducts };
    }, [products]);

    const chartData = {
        category: { data: mockCategoryData, title: 'Vendas por Categoria' },
        revenue: { data: mockRevenueByMonth, title: 'Faturamento Mensal' },
        orderStatus: { data: mockOrdersByStatus, title: 'Pedidos por Status' },
    };

    const topData = {
        products: { title: 'Top Produtos', items: products.slice(0, 5) },
        customers: { title: 'Top Clientes', items: [{ name: 'Maria Silva', value: 'R$ 2.890' }, { name: 'Ana Costa', value: 'R$ 1.450' }, { name: 'Carla Mendes', value: 'R$ 980' }] },
        categories: { title: 'Top Categorias', items: mockCategoryData.slice(0, 4) },
    };

    const nextChart = () => {
        const types: ChartType[] = ['category', 'revenue', 'orderStatus'];
        setChartType(types[(types.indexOf(chartType) + 1) % types.length]);
    };
    const prevChart = () => {
        const types: ChartType[] = ['category', 'revenue', 'orderStatus'];
        setChartType(types[(types.indexOf(chartType) - 1 + types.length) % types.length]);
    };
    const nextTop = () => {
        const types: TopType[] = ['products', 'customers', 'categories'];
        setTopType(types[(types.indexOf(topType) + 1) % types.length]);
    };
    const prevTop = () => {
        const types: TopType[] = ['products', 'customers', 'categories'];
        setTopType(types[(types.indexOf(topType) - 1 + types.length) % types.length]);
    };

    const adminCards = [
        { id: 'products', title: 'Produtos', stat: realStats.totalProducts.toString(), subtext: `${realStats.activeProducts} ativos`, href: '/admin/products', icon: '📦', color: 'from-pink-500 to-rose-600', chartColor: '#c2185b', trend: mockHistoricalData.products['7d'], format: 'number' as const },
        { id: 'orders', title: 'Pedidos', stat: '156', subtext: '+12 hoje', href: '/admin/orders', icon: '📋', color: 'from-blue-500 to-indigo-600', chartColor: '#1976d2', hasAlert: newOrderAlert, trend: mockHistoricalData.orders['7d'], format: 'number' as const },
        { id: 'customers', title: 'Clientes', stat: '89', subtext: '+5 semana', href: '/admin/customers', icon: '👥', color: 'from-orange-500 to-amber-600', chartColor: '#f57c00', trend: mockHistoricalData.customers['7d'], format: 'number' as const },
        { id: 'revenue', title: 'Faturamento', stat: 'R$ 12.450', subtext: '+8% vs mês', href: '/admin/statistics', icon: '💰', color: 'from-green-500 to-emerald-600', chartColor: '#388e3c', trend: mockHistoricalData.revenue['7d'], format: 'currency' as const },
        { id: 'categories', title: 'Categorias', stat: '5', subtext: 'ativas', href: '/admin/categories', icon: '🏷️', color: 'from-purple-500 to-violet-600', chartColor: '#7b1fa2' },
        { id: 'about', title: 'Sobre', stat: '—', subtext: 'Editar', href: '/admin/about', icon: 'ℹ️', color: 'from-slate-500 to-gray-600', chartColor: '#64748b' },
    ];

    const getOccurrenceIcon = (type: string) => {
        switch (type) {
            case 'order': return '📋';
            case 'stock': return '⚠️';
            case 'customer': return '👤';
            default: return '📌';
        }
    };

    // Scale factor for global scaling
    const scale = zoom / 100;

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

            {/* Chart Modals */}
            {adminCards.map(card => card.id !== 'about' && card.id !== 'categories' && (
                <ChartModal
                    key={card.id}
                    isOpen={activeModal === card.id}
                    onClose={() => setActiveModal(null)}
                    title={`Evolução: ${card.title}`}
                    data={mockHistoricalData[card.id as keyof typeof mockHistoricalData]}
                    color={card.chartColor}
                    format={card.format}
                />
            ))}

            <div className="min-h-screen bg-gray-50 overflow-x-hidden">
                {/* New Order Alert Banner */}
                {newOrderAlert && (
                    <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white py-4 px-6 text-center animate-pulse text-lg font-medium">
                        <span className="font-bold">🛒 Novo Pedido!</span> #{lastOrderId} acabou de chegar!
                        <Link href="/admin/orders" className="ml-4 underline font-bold">Ver →</Link>
                    </div>
                )}

                {/* Header - Fixed, not scaled */}
                <div className={`border-b border-gray-200 bg-white sticky top-0 z-40 ${newOrderAlert ? 'mt-14' : ''}`}>
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
                                {/* Zoom Controls */}
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
                    {/* Cards with Sparklines and Chart Button */}
                    <div className="mb-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
                        {adminCards.map((card) => (
                            <div key={card.title} className="relative">
                                <Link
                                    href={card.href}
                                    className={`block group rounded-3xl bg-gradient-to-br ${card.color} p-6 text-white shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1`}
                                >
                                    {card.hasAlert && (
                                        <span className="absolute top-4 right-4 flex h-5 w-5">
                                            <span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-75"></span>
                                            <span className="relative rounded-full h-5 w-5 bg-white"></span>
                                        </span>
                                    )}
                                    <div className="text-4xl">{card.icon}</div>
                                    <p className="text-base font-semibold opacity-90 mt-2">{card.title}</p>
                                    <p className="text-3xl font-bold mt-1">{card.stat}</p>
                                    <p className="text-sm opacity-80 mt-1">{card.subtext}</p>
                                    {card.trend && <Sparkline data={card.trend} />}
                                </Link>

                                {/* Chart expand button */}
                                {card.id !== 'about' && card.id !== 'categories' && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveModal(card.id);
                                        }}
                                        className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                                        title="Ver evolução detalhada"
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Chart Section */}
                        <div className="rounded-3xl bg-white p-8 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <h3 className="font-bold text-gray-900 text-xl">{chartData[chartType].title}</h3>
                                    <Tooltip text="Visualize a distribuição de vendas. Use as setas para ver outros gráficos." />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={prevChart} className="p-3 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button onClick={nextChart} className="p-3 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>

                            {chartType === 'revenue' ? (
                                <BarChart data={mockRevenueByMonth} height={140} color="#c2185b" />
                            ) : (
                                <div className="flex items-center gap-6">
                                    <DonutChart data={chartType === 'category' ? mockCategoryData : mockOrdersByStatus} size={140} />
                                    <div className="flex-1 max-h-44 overflow-y-auto hover-scrollbar space-y-3">
                                        {(chartType === 'category' ? mockCategoryData : mockOrdersByStatus).map((item, i) => (
                                            <div key={i} className="flex items-center justify-between text-base">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                                    <span className="text-gray-700 font-medium">{item.name}</span>
                                                </div>
                                                <span className="font-bold text-gray-900 text-lg">{item.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Top Section */}
                        <div className="rounded-3xl bg-white p-8 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <h3 className="font-bold text-gray-900 text-xl">🏆 {topData[topType].title}</h3>
                                    <Tooltip text="Ranking dos melhores desempenhos. Navegue entre produtos, clientes e categorias." />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={prevTop} className="p-3 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button onClick={nextTop} className="p-3 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto hover-scrollbar space-y-3">
                                {topType === 'products' && products.slice(0, 5).map((product, i) => (
                                    <Link key={product.id} href={`/admin/products/${product.id}/edit`} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-base font-bold text-brand-600">{i + 1}</span>
                                        <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                            <Image src={product.images[0] || '/logo.png'} alt="" width={48} height={48} className="object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-semibold text-gray-900 truncate">{product.name}</p>
                                        </div>
                                        <span className="text-base text-gray-600 font-bold">R$ {product.price.toFixed(0)}</span>
                                    </Link>
                                ))}
                                {topType === 'customers' && topData.customers.items.map((item: any, i) => (
                                    <Link key={i} href="/admin/customers" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-base font-bold text-orange-600">{i + 1}</span>
                                        <p className="flex-1 text-base font-semibold text-gray-900">{item.name}</p>
                                        <span className="text-base text-gray-600 font-bold">{item.value}</span>
                                    </Link>
                                ))}
                                {topType === 'categories' && topData.categories.items.map((item: any, i) => (
                                    <Link key={i} href="/admin/categories" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full text-base font-bold text-white" style={{ backgroundColor: item.color }}>{i + 1}</span>
                                        <p className="flex-1 text-base font-semibold text-gray-900">{item.name}</p>
                                        <span className="text-base text-gray-600 font-bold">{item.value}%</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Occurrences */}
                        <div className="rounded-3xl bg-white p-8 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <h3 className="font-bold text-gray-900 text-xl">🔔 Ocorrências</h3>
                                    <Tooltip text="Notificações em tempo real: novos pedidos, alertas de estoque e mais." />
                                </div>
                                <span className="text-base text-gray-500 font-bold">{occurrences.filter(o => !o.read).length} novas</span>
                            </div>
                            <div className="max-h-48 overflow-y-auto hover-scrollbar space-y-3">
                                {occurrences.map((occ) => (
                                    <Link
                                        key={occ.id}
                                        href={occ.type === 'order' ? '/admin/orders' : occ.type === 'stock' ? '/admin/products' : '/admin/customers'}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-colors cursor-pointer ${occ.read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 hover:bg-blue-100'}`}
                                    >
                                        <span className="text-2xl">{getOccurrenceIcon(occ.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-base truncate ${occ.read ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>{occ.message}</p>
                                        </div>
                                        <span className="text-sm text-gray-400 font-medium">{occ.time}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
                        <div className="flex items-center mb-6">
                            <h2 className="font-bold text-gray-900 text-xl">📌 Atividade Recente</h2>
                            <Tooltip text="Histórico das últimas ações na loja. Clique para ver detalhes." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {[
                                { action: 'Novo pedido #1234', time: 'Há 5 min', icon: '📋', href: '/admin/orders' },
                                { action: 'Produto atualizado', time: 'Há 1h', icon: '📦', href: '/admin/products' },
                                { action: 'Nova cliente', time: 'Há 2h', icon: '👤', href: '/admin/customers' },
                                { action: 'Pedido enviado', time: 'Há 3h', icon: '🚚', href: '/admin/orders' },
                            ].map((item, i) => (
                                <Link key={i} href={item.href} className="flex items-center gap-4 rounded-2xl bg-gray-50 p-5 hover:bg-gray-100 transition-colors">
                                    <span className="text-3xl">{item.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-semibold text-gray-900 truncate">{item.action}</p>
                                        <p className="text-base text-gray-500">{item.time}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
