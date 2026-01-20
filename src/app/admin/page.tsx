import Link from 'next/link';
import Image from 'next/image';

const adminCards = [
    {
        title: 'Produtos',
        description: 'Gerenciar catálogo, estoque e novos produtos',
        href: '/admin/products',
        icon: (
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
        color: 'bg-brand-600',
    },
    {
        title: 'Pedidos',
        description: 'Gerenciar pedidos e entregas',
        href: '/admin/orders',
        icon: (
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
        color: 'bg-blue-600',
    },
    {
        title: 'Categorias',
        description: 'Organizar categorias de produtos',
        href: '/admin/categories',
        icon: (
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
        ),
        color: 'bg-green-600',
    },
    {
        title: 'Clientes',
        description: 'Visualizar dados de clientes',
        href: '/admin/customers',
        icon: (
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        color: 'bg-orange-600',
    },
    {
        title: 'Página Sobre',
        description: 'Editar história, valores e equipe',
        href: '/admin/about',
        icon: (
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        color: 'bg-indigo-600',
    },
];

const stats = [
    { label: 'Produtos', value: '24', change: '+3 esta semana' },
    { label: 'Pedidos', value: '156', change: '+12 hoje' },
    { label: 'Clientes', value: '89', change: '+5 esta semana' },
    { label: 'Faturamento', value: 'R$ 12.450', change: '+8% vs mês anterior' },
];

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Image src="/logo.png" alt="Dona Onça" width={40} height={40} />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Painel Administrativo
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Gerencie sua loja Dona Onça
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/"
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            ← Voltar à Loja
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Stats */}
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl bg-white p-6 shadow-sm"
                        >
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {stat.value}
                            </p>
                            <p className="mt-1 text-xs text-green-600">{stat.change}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Ações Rápidas
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {adminCards.map((card) => (
                        <Link
                            key={card.title}
                            href={card.href}
                            className="group flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                        >
                            <div
                                className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white ${card.color}`}
                            >
                                {card.icon}
                            </div>
                            <h3 className="font-semibold text-gray-900">{card.title}</h3>
                            <p className="mt-1 text-xs text-gray-500">{card.description}</p>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity Placeholder */}
                <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                        Atividade Recente
                    </h2>
                    <div className="space-y-4">
                        {[
                            { action: 'Novo pedido #1234', time: 'Há 5 minutos', type: 'order' },
                            { action: 'Produto "Conjunto Luxo" atualizado', time: 'Há 1 hora', type: 'product' },
                            { action: 'Nova cliente: Maria Silva', time: 'Há 2 horas', type: 'customer' },
                            { action: 'Pedido #1233 enviado', time: 'Há 3 horas', type: 'shipping' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.action}</p>
                                    <p className="text-sm text-gray-500">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
