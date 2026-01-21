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

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/minha-conta" className="text-gray-500 hover:text-brand-600">
                    ← Voltar
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Meus Dados</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
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
        </div>
    );
}
