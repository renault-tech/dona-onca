'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AccountPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggedIn(true);
    };

    if (isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-4xl px-4 py-8">
                    <h1 className="mb-8 text-3xl font-bold text-gray-900">Minha Conta</h1>

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
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
                        <div className="space-y-4">
                            {[
                                { id: '#1234', date: '15/01/2026', status: 'Enviado', total: 'R$ 319,80' },
                                { id: '#1233', date: '10/01/2026', status: 'Entregue', total: 'R$ 189,90' },
                            ].map((order) => (
                                <div key={order.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                                    <div>
                                        <p className="font-medium text-gray-900">Pedido {order.id}</p>
                                        <p className="text-sm text-gray-500">{order.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${order.status === 'Entregue' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <p className="mt-1 font-medium text-gray-900">{order.total}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsLoggedIn(false)}
                        className="mt-8 text-sm text-gray-500 hover:text-brand-600"
                    >
                        Sair da Conta
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white p-8 shadow-sm">
                    <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
                        {isRegistering ? 'Criar Conta' : 'Entrar'}
                    </h1>
                    <p className="mb-8 text-center text-gray-500">
                        {isRegistering ? 'Crie sua conta Dona Onça' : 'Bem-vinda de volta!'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegistering && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                    placeholder="Seu nome"
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Senha</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        {isRegistering && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Confirmar Senha</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition-colors hover:bg-brand-700"
                        >
                            {isRegistering ? 'Criar Conta' : 'Entrar'}
                        </button>
                    </form>

                    {!isRegistering && (
                        <p className="mt-4 text-center text-sm text-brand-600 hover:underline cursor-pointer">
                            Esqueci minha senha
                        </p>
                    )}

                    <div className="mt-6 border-t border-gray-100 pt-6 text-center">
                        <p className="text-sm text-gray-500">
                            {isRegistering ? 'Já tem uma conta?' : 'Não tem conta?'}
                            <button
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="ml-1 font-medium text-brand-600 hover:underline"
                            >
                                {isRegistering ? 'Entrar' : 'Criar conta'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
