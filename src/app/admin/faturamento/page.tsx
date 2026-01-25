'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Helper for formatting currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Bar Chart Component
const BarChart = ({ data, maxVal, color = '#d6008b' }: { data: { label: string; subLabel: string; value: number }[]; maxVal: number; color?: string }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="w-full h-64 flex items-end gap-2 pt-8">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 border border-gray-700">
                        {formatCurrency(item.value)}
                    </div>

                    <div className="w-full flex-col flex items-center h-full justify-end">
                        {/* Bar */}
                        <div
                            className="w-full max-w-[40px] rounded-t-lg transition-all duration-500 ease-out hover:brightness-110 relative overflow-hidden"
                            style={{
                                height: `${Math.max((item.value / maxVal) * 100, 4)}%`,
                                backgroundColor: color,
                                boxShadow: `0 0 10px ${color}40`
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="mt-2 text-center">
                        <span className="text-xs text-gray-300 font-medium block">{item.label}</span>
                        <span className="text-[10px] text-gray-500">{item.subLabel}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

interface MonthlyData {
    month: string;
    monthNum: number;
    year: number;
    revenue: number;
    orders: number;
    avgTicket: number;
}

interface ProductStats {
    name: string;
    quantity: number;
    revenue: number;
}

export default function FaturamentoPage() {
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [productStats, setProductStats] = useState<ProductStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '12m' | 'all'>('6m');
    const [activemetric, setActiveMetric] = useState<'revenue' | 'orders'>('revenue');

    // Stats summary
    const [stats, setStats] = useState({
        totalRevenue: 0,
        currentMonthRevenue: 0,
        lastMonthRevenue: 0,
        totalOrders: 0,
        avgTicket: 0,
        projectedRevenue: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: orders, error } = await supabase
                    .from('orders')
                    .select('*')
                    .not('status', 'in', '("Cancelado","Devolvido")')
                    .order('created_at', { ascending: true });

                if (error) throw error;

                if (orders && orders.length > 0) {
                    const now = new Date();
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();

                    // Group by month
                    const monthlyMap: Record<string, { revenue: number; orders: number }> = {};
                    const productMap: Record<string, { quantity: number; revenue: number }> = {};

                    let totalRevenue = 0;
                    let currentMonthRev = 0;
                    let lastMonthRev = 0;

                    orders.forEach((order: any) => {
                        const date = new Date(order.created_at);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                        if (!monthlyMap[monthKey]) {
                            monthlyMap[monthKey] = { revenue: 0, orders: 0 };
                        }
                        monthlyMap[monthKey].revenue += order.total || 0;
                        monthlyMap[monthKey].orders += 1;
                        totalRevenue += order.total || 0;

                        // Current month
                        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                            currentMonthRev += order.total || 0;
                        }
                        // Last month
                        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                        if (date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear) {
                            lastMonthRev += order.total || 0;
                        }

                        // Product stats
                        const items = order.items || [];
                        items.forEach((item: any) => {
                            const name = item.productName || 'Produto';
                            if (!productMap[name]) {
                                productMap[name] = { quantity: 0, revenue: 0 };
                            }
                            productMap[name].quantity += item.quantity || 1;
                            productMap[name].revenue += (item.price || 0) * (item.quantity || 1);
                        });
                    });

                    // Convert to array and sort
                    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                    const monthlyArray: MonthlyData[] = Object.entries(monthlyMap)
                        .map(([key, data]) => {
                            const [year, month] = key.split('-').map(Number);
                            return {
                                month: monthNames[month - 1],
                                monthNum: month,
                                year,
                                revenue: data.revenue,
                                orders: data.orders,
                                avgTicket: data.orders > 0 ? data.revenue / data.orders : 0,
                            };
                        })
                        .sort((a, b) => (a.year * 100 + a.monthNum) - (b.year * 100 + b.monthNum));

                    // Product stats
                    const productArray: ProductStats[] = Object.entries(productMap)
                        .map(([name, data]) => ({ name, ...data }))
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 10);

                    // Projection based on trend
                    const avgMonthlyRevenue = totalRevenue / monthlyArray.length || 0;
                    const projectedRevenue = avgMonthlyRevenue * 12;

                    setMonthlyData(monthlyArray);
                    setProductStats(productArray);
                    setStats({
                        totalRevenue,
                        currentMonthRevenue: currentMonthRev,
                        lastMonthRevenue: lastMonthRev,
                        totalOrders: orders.length,
                        avgTicket: totalRevenue / orders.length || 0,
                        projectedRevenue,
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter data by period
    const filteredMonthlyData = (() => {
        if (selectedPeriod === 'all') return monthlyData;
        const months = selectedPeriod === '6m' ? 6 : 12;
        return monthlyData.slice(-months);
    })();

    // Prepare chart data
    const chartData = filteredMonthlyData.map(d => ({
        label: d.month,
        subLabel: d.year.toString(),
        value: activemetric === 'revenue' ? d.revenue : d.orders
    }));

    const maxChartValue = Math.max(...chartData.map(d => d.value), 10);

    // Growth calculation
    const growth = stats.lastMonthRevenue > 0
        ? ((stats.currentMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue * 100)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-dark)] pb-12 text-gray-100">
            {/* Header */}
            <div className="border-b border-gray-800 bg-[var(--bg-dark)] bg-opacity-90 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="flex items-center justify-between">
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
                                <h1 className="text-2xl font-bold text-white">Faturamento</h1>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {(['6m', '12m', 'all'] as const).map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === period
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    {period === '6m' ? '6 Meses' : period === '12m' ? '12 Meses' : 'Tudo'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <button
                        onClick={() => setActiveMetric('revenue')}
                        className={`text-left rounded-2xl p-5 text-white transition-all transform hover:scale-105 ${activemetric === 'revenue'
                            ? 'bg-gradient-to-br from-brand-600 to-brand-800 ring-2 ring-brand-400 shadow-[0_0_20px_rgba(214,0,139,0.3)]'
                            : 'card-dark hover:bg-gray-800'}`}
                    >
                        <p className="text-sm opacity-90">Faturamento Total</p>
                        <p className="text-xl font-bold mt-1 line-clamp-1">{formatCurrency(stats.totalRevenue)}</p>
                    </button>

                    <div className="card-dark p-5">
                        <p className="text-sm text-gray-400">Este Mês</p>
                        <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.currentMonthRevenue)}</p>
                        {growth !== 0 && (
                            <p className={`text-xs mt-1 ${growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {growth > 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}% vs mês ant.
                            </p>
                        )}
                    </div>

                    <div className="card-dark p-5">
                        <p className="text-sm text-gray-400">Mês Anterior</p>
                        <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.lastMonthRevenue)}</p>
                    </div>

                    <button
                        onClick={() => setActiveMetric('orders')}
                        className={`text-left rounded-2xl p-5 transition-all transform hover:scale-105 ${activemetric === 'orders'
                            ? 'bg-gradient-to-br from-blue-600 to-blue-800 ring-2 ring-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                            : 'card-dark hover:bg-gray-800'}`}
                    >
                        <p className={`text-sm ${activemetric === 'orders' ? 'text-white' : 'text-gray-400'}`}>Total Pedidos</p>
                        <p className={`text-2xl font-bold mt-1 ${activemetric === 'orders' ? 'text-white' : 'text-blue-400'}`}>{stats.totalOrders}</p>
                    </button>

                    <div className="card-dark p-5">
                        <p className="text-sm text-gray-400">Ticket Médio</p>
                        <p className="text-2xl font-bold text-purple-400 mt-1">{formatCurrency(stats.avgTicket)}</p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-5 text-white">
                        <p className="text-sm opacity-90 text-gray-400">Projeção Anual</p>
                        <p className="text-2xl font-bold mt-1 text-gray-200">{formatCurrency(stats.projectedRevenue)}</p>
                        <p className="text-xs opacity-50 mt-1">Baseado na média mensal</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 card-dark p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">
                                {activemetric === 'revenue' ? '📈 Evolução do Faturamento' : '📉 Evolução de Pedidos'}
                            </h2>
                            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                {activemetric === 'revenue' ? 'Em Reais (R$)' : 'Quantidade'}
                            </span>
                        </div>

                        {filteredMonthlyData.length === 0 ? (
                            <p className="text-gray-500 text-center py-12">Nenhum dado para exibir</p>
                        ) : (
                            <div>
                                <BarChart
                                    data={chartData}
                                    maxVal={maxChartValue}
                                    color={activemetric === 'revenue' ? '#d6008b' : '#3b82f6'}
                                />

                                {/* Summary row */}
                                <div className="flex justify-between pt-6 mt-4 border-t border-gray-800">
                                    <div>
                                        <p className="text-sm text-gray-500">Média Mensal</p>
                                        <p className="text-lg font-bold text-white">
                                            {activemetric === 'revenue'
                                                ? formatCurrency(stats.totalRevenue / monthlyData.length || 0)
                                                : (stats.totalOrders / monthlyData.length || 0).toFixed(1)
                                            }
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Melhor Mês</p>
                                        <p className="text-lg font-bold text-green-400">
                                            {activemetric === 'revenue'
                                                ? formatCurrency(Math.max(...monthlyData.map(d => d.revenue)))
                                                : Math.max(...monthlyData.map(d => d.orders))
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Top Products */}
                    <div className="card-dark p-6 h-fit">
                        <h2 className="text-lg font-semibold text-white mb-6">🏆 Produtos Mais Vendidos</h2>

                        {productStats.length === 0 ? (
                            <p className="text-gray-500 text-center py-12">Nenhum produto vendido</p>
                        ) : (
                            <div className="space-y-4">
                                {productStats.slice(0, 5).map((product, index) => (
                                    <div key={product.name} className="flex items-center gap-3 group">
                                        <span className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold shadow-lg ${index === 0 ? 'bg-yellow-500 text-black' :
                                            index === 1 ? 'bg-gray-400 text-black' :
                                                index === 2 ? 'bg-orange-500 text-black' :
                                                    'bg-gray-800 text-gray-400'
                                            }`}>
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-200 truncate group-hover:text-white transition-colors">{product.name}</p>
                                            <p className="text-xs text-brand-400">{product.quantity} vendidos</p>
                                        </div>
                                        <p className="font-semibold text-gray-300">{formatCurrency(product.revenue)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Monthly Details Table */}
                <div className="mt-8 card-dark p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">📊 Detalhamento Mensal</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Período</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Faturamento</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Pedidos</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Ticket Médio</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">% do Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredMonthlyData.slice().reverse().map((data, index) => (
                                    <tr key={index} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{data.month} {data.year}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-brand-400 shadow-brand-500/10 hover:shadow-brand-500/30 transition-shadow cursor-default">{formatCurrency(data.revenue)}</td>
                                        <td className="px-4 py-3 text-right text-gray-300">{data.orders}</td>
                                        <td className="px-4 py-3 text-right text-gray-300">{formatCurrency(data.avgTicket)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-brand-500 rounded-full shadow-[0_0_10px_#d6008b]"
                                                        style={{ width: `${(data.revenue / stats.totalRevenue * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 w-10">
                                                    {(data.revenue / stats.totalRevenue * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
