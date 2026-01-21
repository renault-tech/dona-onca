'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

function AccountForm() {
    const [isRegistering, setIsRegistering] = useState(false);
    const { signIn, signUp, user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/minha-conta';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && user) {
            router.push(redirectUrl);
        }
    }, [user, loading, router, redirectUrl]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (isRegistering) {
                // Register validation
                if (formData.password !== formData.confirmPassword) {
                    setError('As senhas não coincidem');
                    setIsSubmitting(false);
                    return;
                }

                if (formData.password.length < 6) {
                    setError('A senha deve ter pelo menos 6 caracteres');
                    setIsSubmitting(false);
                    return;
                }

                const { error } = await signUp(formData.email, formData.password, formData.name);
                if (error) throw error;

                // Success - redirect handled by useEffect
            } else {
                // Login
                const { error } = await signIn(formData.email, formData.password);
                if (error) throw error;

                // Success - redirect handled by useEffect
            }
        } catch (err: any) {
            console.error(err);
            if (err.message === 'Invalid login credentials') {
                setError('Email ou senha inválidos');
            } else if (err.message.includes('already registered')) {
                setError('Este email já está cadastrado');
            } else {
                setError(err.message || 'Ocorreu um erro. Tente novamente.');
            }
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
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

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

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
                                    required
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
                                required
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
                                required
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
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent"></span>
                                    Processando...
                                </span>
                            ) : (
                                isRegistering ? 'Criar Conta' : 'Entrar'
                            )}
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
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setError(null);
                                    setFormData({ ...formData, password: '', confirmPassword: '' });
                                }}
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

export default function AccountPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        }>
            <AccountForm />
        </Suspense>
    );
}
