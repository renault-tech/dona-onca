'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * Página para onde o link de "Esqueci minha senha" (enviado por e-mail via
 * supabase.auth.resetPasswordForEmail) redireciona. O supabase-js processa o
 * token da URL sozinho ao carregar a página e dispara o evento
 * PASSWORD_RECOVERY quando a sessão de recuperação fica pronta -- só então
 * é seguro mostrar o formulário de nova senha.
 */
export default function RedefinirSenhaPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setStatus('ready');
            }
        });

        // Se a sessão de recuperação já foi processada antes deste efeito montar
        // (corrida rara, mas possível), o evento PASSWORD_RECOVERY já passou --
        // confere se já existe uma sessão válida.
        const checkTimeout = setTimeout(async () => {
            const { data } = await supabase.auth.getSession();
            setStatus((current) => (current === 'checking' ? (data.session ? 'ready' : 'invalid') : current));
        }, 2500);

        return () => {
            subscription.unsubscribe();
            clearTimeout(checkTimeout);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setDone(true);
            setTimeout(() => router.push('/minha-conta'), 2000);
        } catch (err) {
            console.error(err);
            setError('Não foi possível atualizar sua senha. Tente pedir um novo link.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white p-8 shadow-sm">
                    {status === 'checking' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-brand-600"></div>
                            <p className="text-gray-500">Verificando seu link...</p>
                        </div>
                    )}

                    {status === 'invalid' && (
                        <>
                            <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Link inválido ou expirado</h1>
                            <p className="mb-8 text-center text-gray-500">
                                Peça um novo link de recuperação de senha.
                            </p>
                            <Link href="/conta" className="block w-full rounded-xl bg-brand-600 py-3 text-center font-semibold text-white hover:bg-brand-700">
                                Voltar para o login
                            </Link>
                        </>
                    )}

                    {status === 'ready' && !done && (
                        <>
                            <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Criar nova senha</h1>
                            <p className="mb-8 text-center text-gray-500">Escolha uma senha nova para sua conta.</p>

                            {error && (
                                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Nova senha</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Confirmar nova senha</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
                                </button>
                            </form>
                        </>
                    )}

                    {done && (
                        <>
                            <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Senha atualizada!</h1>
                            <p className="text-center text-gray-500">Redirecionando para sua conta...</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
