'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { sendAdminVerificationEmail } from '@/lib/auth';

export default function VerifyAdminPage() {
    const { user, profile, verifyAdminToken, loading } = useAuth();
    const router = useRouter();
    const [token, setToken] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'error' | 'success'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/conta');
            return;
        }

        // If already verified, go to admin
        if (!loading && profile?.is_admin && profile.admin_verified) {
            router.push('/admin');
            return;
        }

        // If not admin at all, go home
        if (!loading && profile && !profile.is_admin) {
            router.push('/');
            return;
        }
    }, [user, profile, loading, router]);

    const handleSendCode = async () => {
        if (!user || !user.email) return;

        setStatus('sending');
        setMessage('');

        const result = await sendAdminVerificationEmail(user.id, user.email);

        if (result.success) {
            setStatus('sent');
            setMessage('Código enviado para seu e-mail!');
        } else {
            setStatus('error');
            setMessage(result.error || 'Erro ao enviar código');
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (token.length !== 6) return;

        setStatus('verifying');
        setMessage('');

        const result = await verifyAdminToken(token);

        if (result.success) {
            setStatus('success');
            setMessage('Acesso verificado com sucesso! Redirecionando...');
            setTimeout(() => {
                router.push('/admin');
            }, 1500);
        } else {
            setStatus('error');
            setMessage(result.error || 'Código inválido');
        }
    };

    if (loading) return null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>

                <h1 className="mb-2 text-2xl font-bold text-gray-900">Verificação de Segurança</h1>
                <p className="mb-6 text-gray-500">
                    Para acessar a área administrativa, você precisa confirmar sua identidade.
                </p>

                {status === 'idle' && (
                    <button
                        onClick={handleSendCode}
                        className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition-colors hover:bg-brand-700"
                    >
                        Enviar Código por E-mail
                    </button>
                )}

                {(status === 'sent' || status === 'error' || status === 'verifying' || status === 'success') && (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-left text-sm font-medium text-gray-700">Código de 6 dígitos</label>
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-2xl tracking-widest focus:border-brand-500 focus:outline-none"
                                placeholder="000000"
                            />
                        </div>

                        {message && (
                            <p className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={token.length !== 6 || status === 'verifying' || status === 'success'}
                            className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
                        >
                            {status === 'verifying' ? 'Verificando...' : 'Confirmar Acesso'}
                        </button>

                        {status !== 'success' && (
                            <button
                                type="button"
                                onClick={handleSendCode}
                                className="text-sm text-gray-500 hover:text-brand-600 mt-4"
                            >
                                Reenviar código
                            </button>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}
