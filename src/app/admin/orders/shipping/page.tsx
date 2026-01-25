'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface ShippingConfig {
    freeShippingMinValue: number;
    defaultShippingCost: number;
    senderName: string;
    senderCpfCnpj: string;
    senderAddress: string;
    senderNumber: string;
    senderComplement: string;
    senderNeighborhood: string;
    senderCity: string;
    senderState: string;
    senderCep: string;
    senderPhone: string;
}

const defaultConfig: ShippingConfig = {
    freeShippingMinValue: 199,
    defaultShippingCost: 15.90,
    senderName: 'Dona Onça',
    senderCpfCnpj: '',
    senderAddress: '',
    senderNumber: '',
    senderComplement: '',
    senderNeighborhood: '',
    senderCity: '',
    senderState: '',
    senderCep: '',
    senderPhone: '',
};

export default function ShippingConfigPage() {
    const [config, setConfig] = useState<ShippingConfig>(defaultConfig);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load from localStorage
        const savedConfig = localStorage.getItem('donaonca_shipping_config');
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        // Save to localStorage (in production, save to Supabase)
        localStorage.setItem('donaonca_shipping_config', JSON.stringify(config));
        await new Promise(resolve => setTimeout(resolve, 500));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-4xl px-4 py-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/orders"
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Configurações de Frete</h1>
                            <p className="text-sm text-gray-500">Configure valores de frete e dados do remetente</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="space-y-8">
                    {/* Shipping Values */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span className="text-2xl">📦</span>
                            Valores de Frete
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Valor mínimo para Frete Grátis (R$)
                                </label>
                                <input
                                    type="number"
                                    name="freeShippingMinValue"
                                    value={config.freeShippingMinValue}
                                    onChange={handleChange}
                                    className={inputClass}
                                    step="0.01"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Compras acima deste valor terão frete grátis
                                </p>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Custo Padrão do Frete (R$)
                                </label>
                                <input
                                    type="number"
                                    name="defaultShippingCost"
                                    value={config.defaultShippingCost}
                                    onChange={handleChange}
                                    className={inputClass}
                                    step="0.01"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Valor cobrado quando o frete não é grátis
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sender Data */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span className="text-2xl">🏢</span>
                            Dados do Remetente (para Etiquetas)
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Nome / Razão Social</label>
                                <input
                                    type="text"
                                    name="senderName"
                                    value={config.senderName}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Dona Onça"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">CPF / CNPJ</label>
                                <input
                                    type="text"
                                    name="senderCpfCnpj"
                                    value={config.senderCpfCnpj}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="00.000.000/0000-00"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Telefone</label>
                                <input
                                    type="text"
                                    name="senderPhone"
                                    value={config.senderPhone}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">CEP</label>
                                <input
                                    type="text"
                                    name="senderCep"
                                    value={config.senderCep}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="00000-000"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Endereço</label>
                                <input
                                    type="text"
                                    name="senderAddress"
                                    value={config.senderAddress}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Rua, Avenida..."
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Número</label>
                                <input
                                    type="text"
                                    name="senderNumber"
                                    value={config.senderNumber}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Complemento</label>
                                <input
                                    type="text"
                                    name="senderComplement"
                                    value={config.senderComplement}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Bairro</label>
                                <input
                                    type="text"
                                    name="senderNeighborhood"
                                    value={config.senderNeighborhood}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Cidade</label>
                                <input
                                    type="text"
                                    name="senderCity"
                                    value={config.senderCity}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Estado (UF)</label>
                                <input
                                    type="text"
                                    name="senderState"
                                    value={config.senderState}
                                    onChange={handleChange}
                                    className={inputClass}
                                    maxLength={2}
                                    placeholder="SP"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white transition-all hover:bg-brand-700 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Salvando...
                                </>
                            ) : saved ? (
                                <>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Salvo!
                                </>
                            ) : (
                                <>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    Salvar Configurações
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
