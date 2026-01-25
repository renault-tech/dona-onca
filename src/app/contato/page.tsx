'use client';

import { useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default function ContatoPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        // Simular envio (integrar com backend/email service depois)
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSent(true);
        setSending(false);
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-[#050505] pt-32 pb-20">
                <div className="mx-auto max-w-2xl px-4 text-center">
                    <div className="rounded-2xl bg-gradient-to-br from-[#1a0510] to-[#0d0308] p-12 border border-[#d6008b]/30">
                        <div className="text-6xl mb-6">✉️</div>
                        <h1 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel)' }}>
                            Mensagem Enviada!
                        </h1>
                        <p className="text-white/60 mb-8">
                            Obrigada pelo seu contato. Responderemos o mais breve possível.
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-8 py-3 rounded-full text-white font-medium"
                            style={{
                                background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.5) 0%, rgba(214, 0, 139, 0.3) 100%)',
                                border: '1px solid rgba(214, 0, 139, 0.6)',
                            }}
                        >
                            Voltar à Loja
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] pt-32 pb-20">
            <div className="mx-auto max-w-4xl px-4">
                {/* Back Button */}
                <div className="mb-8">
                    <BackButton fallbackHref="/" />
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1
                        className="text-4xl font-bold text-white mb-4"
                        style={{ fontFamily: 'var(--font-cinzel)' }}
                    >
                        Fale Conosco
                    </h1>
                    <p className="text-white/60 max-w-xl mx-auto">
                        Tem alguma dúvida, sugestão ou precisa de ajuda? Entre em contato conosco.
                        Responderemos o mais rápido possível.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="rounded-2xl bg-gradient-to-br from-[#1a0510] to-[#0d0308] p-6 border border-[#d6008b]/20">
                            <div className="text-2xl mb-3">📧</div>
                            <h3 className="text-lg font-semibold text-white mb-1">E-mail</h3>
                            <p className="text-white/60 text-sm">contato@donaonca.com.br</p>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-br from-[#1a0510] to-[#0d0308] p-6 border border-[#d6008b]/20">
                            <div className="text-2xl mb-3">💬</div>
                            <h3 className="text-lg font-semibold text-white mb-1">WhatsApp</h3>
                            <p className="text-white/60 text-sm">(11) 99999-9999</p>
                        </div>

                        <div className="rounded-2xl bg-gradient-to-br from-[#1a0510] to-[#0d0308] p-6 border border-[#d6008b]/20">
                            <div className="text-2xl mb-3">🕐</div>
                            <h3 className="text-lg font-semibold text-white mb-1">Horário</h3>
                            <p className="text-white/60 text-sm">Seg a Sex: 9h às 18h</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="rounded-2xl bg-gradient-to-br from-[#1a0510] to-[#0d0308] p-8 border border-[#d6008b]/20">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Seu Nome
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:border-[#d6008b] focus:outline-none"
                                        placeholder="Maria Silva"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Seu E-mail
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:border-[#d6008b] focus:outline-none"
                                        placeholder="maria@email.com"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Assunto
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:border-[#d6008b] focus:outline-none"
                                    placeholder="Dúvida sobre pedido"
                                />
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Mensagem
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:border-[#d6008b] focus:outline-none resize-none"
                                    placeholder="Escreva sua mensagem aqui..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="mt-8 w-full rounded-xl py-4 text-white font-semibold transition-all disabled:opacity-50"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.6) 0%, rgba(214, 0, 139, 0.4) 100%)',
                                    border: '1px solid rgba(214, 0, 139, 0.6)',
                                }}
                            >
                                {sending ? 'Enviando...' : 'Enviar Mensagem'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
