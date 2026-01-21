'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

import Link from 'next/link';
interface Address {
    id: string;
    nickname: string;
    cep: string;
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
    is_default: boolean;
}

export default function AddressesPage() {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchingCep, setSearchingCep] = useState(false);

    const [formData, setFormData] = useState<Partial<Address>>({
        nickname: '',
        cep: '',
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        is_default: false,
    });

    useEffect(() => {
        if (user) fetchAddresses();
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const { data, error } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', user?.id)
                .order('is_default', { ascending: false });

            if (error) throw error;
            setAddresses(data || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCepSearch = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        setSearchingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    street: data.logradouro,
                    district: data.bairro,
                    city: data.localidade,
                    state: data.uf,
                    cep: cleanCep
                }));
            }
        } catch (error) {
            console.error('Error fetching CEP:', error);
        } finally {
            setSearchingCep(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);

        try {
            const payload = { ...formData, user_id: user.id };

            // If it's the first address, force default
            if (addresses.length === 0) payload.is_default = true;

            const { error } = await supabase
                .from('user_addresses')
                .upsert(payload);

            if (error) throw error;

            await fetchAddresses();
            setIsEditing(false);
            setFormData({});
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Erro ao salvar endereço.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este endereço?')) return;

        try {
            const { error } = await supabase
                .from('user_addresses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/minha-conta" className="text-gray-500 hover:text-brand-600">
                        ← Voltar
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Meus Endereços</h1>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => {
                            setFormData({
                                nickname: '',
                                cep: '',
                                street: '',
                                number: '',
                                complement: '',
                                district: '',
                                city: '',
                                state: '',
                                is_default: false
                            });
                            setIsEditing(true);
                        }}
                        className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                    >
                        + Novo Endereço
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        {formData.id ? 'Editar Endereço' : 'Novo Endereço'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Apelido (Ex: Casa, Trabalho)</label>
                            <input
                                type="text"
                                value={formData.nickname || ''}
                                onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
                                placeholder="Minha Casa"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">CEP</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.cep || ''}
                                    onChange={e => {
                                        setFormData({ ...formData, cep: e.target.value });
                                        if (e.target.value.replace(/\D/g, '').length === 8) {
                                            handleCepSearch(e.target.value);
                                        }
                                    }}
                                    maxLength={9}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
                                    placeholder="00000-000"
                                    required
                                />
                                {searchingCep && (
                                    <div className="absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Estado (UF)</label>
                            <input
                                type="text"
                                value={formData.state || ''}
                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-gray-50 focus:border-brand-500 focus:outline-none"
                                readOnly
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Cidade</label>
                            <input
                                type="text"
                                value={formData.city || ''}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-gray-50 focus:border-brand-500 focus:outline-none"
                                readOnly
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Bairro</label>
                            <input
                                type="text"
                                value={formData.district || ''}
                                onChange={e => setFormData({ ...formData, district: e.target.value })}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Logradouro</label>
                            <input
                                type="text"
                                value={formData.street || ''}
                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Número</label>
                            <input
                                type="text"
                                value={formData.number || ''}
                                onChange={e => setFormData({ ...formData, number: e.target.value })}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Complemento</label>
                            <input
                                type="text"
                                value={formData.complement || ''}
                                onChange={e => setFormData({ ...formData, complement: e.target.value })}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
                            />
                        </div>

                        <div className="md:col-span-2 flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                id="default"
                                checked={formData.is_default || false}
                                onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            <label htmlFor="default" className="text-sm text-gray-700">Definir como endereço padrão</label>
                        </div>

                        <div className="md:col-span-2 flex gap-3 mt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-70"
                            >
                                {saving ? 'Salvando...' : 'Salvar Endereço'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {addresses.length === 0 ? (
                        <div className="md:col-span-2 py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-lg mb-2">Você ainda não tem endereços cadastrados.</p>
                            <p className="text-sm">Cadastre um endereço para agilizar suas compras.</p>
                        </div>
                    ) : (
                        addresses.map((addr) => (
                            <div key={addr.id} className={`relative rounded-2xl border p-6 transition-all hover:shadow-md ${addr.is_default ? 'border-brand-500 bg-brand-50/30' : 'border-gray-200 bg-white'}`}>
                                {addr.is_default && (
                                    <span className="absolute right-4 top-4 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                                        Padrão
                                    </span>
                                )}
                                <div className="mb-4">
                                    <h3 className="font-bold text-gray-900">{addr.nickname}</h3>
                                    <p className="text-gray-600 mt-1">
                                        {addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}
                                    </p>
                                    <p className="text-gray-600">
                                        {addr.district}, {addr.city} - {addr.state}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">CEP: {addr.cep}</p>
                                </div>
                                <div className="flex gap-3 border-t border-gray-100 pt-4">
                                    <button
                                        onClick={() => {
                                            setFormData(addr);
                                            setIsEditing(true);
                                        }}
                                        className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(addr.id)}
                                        className="text-sm font-semibold text-red-500 hover:text-red-600"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
