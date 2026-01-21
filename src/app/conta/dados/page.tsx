'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyDataPage() {
    const { profile, user, updateProfile } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await updateProfile({
                full_name: formData.full_name,
                phone: formData.phone,
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
            setTimeout(() => router.refresh(), 1000);
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Erro ao atualizar dados.' });
        } finally {
            setSaving(false);
        }
    };

    // Payment Methods Logic
    const [cards, setCards] = useState<any[]>([]);
    const [showCardForm, setShowCardForm] = useState(false);
    const [cardForm, setCardForm] = useState({ holder_name: '', number: '', expiry: '', cvv: '' });

    const fetchCards = async () => {
        if (!user) return;
        const { data } = await supabase.from('user_payment_methods').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setCards(data);
    };

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        const last4 = cardForm.number.slice(-4);
        const [expiry_month, expiry_year] = cardForm.expiry.split('/');
        const brand = cardForm.number.startsWith('4') ? 'visa' : 'mastercard';

        try {
            const { error } = await supabase.from('user_payment_methods').insert({
                user_id: user.id,
                holder_name: cardForm.holder_name,
                brand,
                last4,
                expiry_month,
                expiry_year
            });
            if (error) throw error;
            await fetchCards();
            setShowCardForm(false);
            setCardForm({ holder_name: '', number: '', expiry: '', cvv: '' });
            alert('Cartão adicionado com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao adicionar cartão.');
        }
    };

    const handleDeleteCard = async (id: string) => {
        if (!confirm('Remover este cartão?')) return;
        await supabase.from('user_payment_methods').delete().eq('id', id);
        fetchCards();
    };

    // Load cards on mount
    useState(() => {
        if (user) fetchCards();
    });

    return (
        <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/minha-conta" className="text-gray-500 hover:text-brand-600">
                    ← Voltar
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Meus Dados</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Informações Pessoais</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={profile?.email || ''}
                            disabled
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(00) 00000-0000"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </form>
            </div>

            {/* Payment Methods Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Meus Cartões</h2>
                    <button
                        type="button"
                        onClick={() => setShowCardForm(!showCardForm)}
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                        {showCardForm ? 'Cancelar' : '+ Adicionar Cartão'}
                    </button>
                </div>

                {showCardForm && (
                    <form onSubmit={handleAddCard} className="mb-6 rounded-xl bg-gray-50 p-4 border border-gray-200">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Nome no Cartão</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full rounded-lg border border-gray-300 p-2"
                                    value={cardForm.holder_name}
                                    onChange={e => setCardForm({ ...cardForm, holder_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Número</label>
                                <input
                                    required
                                    type="text"
                                    maxLength={16}
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full rounded-lg border border-gray-300 p-2"
                                    value={cardForm.number}
                                    onChange={e => setCardForm({ ...cardForm, number: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700">Validade</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="MM/AA"
                                        maxLength={5}
                                        className="w-full rounded-lg border border-gray-300 p-2"
                                        value={cardForm.expiry}
                                        onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700">CVV</label>
                                    <input
                                        required
                                        type="text"
                                        maxLength={4}
                                        className="w-full rounded-lg border border-gray-300 p-2"
                                        value={cardForm.cvv}
                                        onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">
                            Salvar Cartão
                        </button>
                    </form>
                )}

                {cards.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">Nenhum cartão salvo.</p>
                ) : (
                    <div className="space-y-3">
                        {cards.map(card => (
                            <div key={card.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-12 items-center justify-center rounded bg-gray-200 text-[10px] font-bold uppercase text-gray-600">
                                        {card.brand}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">•••• {card.last4}</p>
                                        <p className="text-xs text-gray-500">{card.holder_name} • {card.expiry_month}/{card.expiry_year}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                >
                                    Remover
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
