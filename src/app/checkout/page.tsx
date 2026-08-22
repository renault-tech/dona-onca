'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/contexts/ProductContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

interface Address {
    id: string;
    label: string;
    cep: string;
    address: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    isDefault: boolean;
}

type PaymentMethod = 'pix' | 'boleto';

export default function CheckoutPage() {
    const { items, subtotal, shipping, total, clearCart } = useCart();
    const { sellProduct } = useProducts();
    const { user, profile, loading: authLoading, signIn, signUp, updateProfile } = useAuth();

    const [step, setStep] = useState(1); // 1=Login/Register, 2=Personal, 3=Address, 4=Payment
    const [isProcessing, setIsProcessing] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [loadingCep, setLoadingCep] = useState(false);
    const [authError, setAuthError] = useState('');
    const [orderError, setOrderError] = useState('');
    const [completedOrder, setCompletedOrder] = useState<{ id: string; total: number } | null>(null);

    // Auth form
    const [authForm, setAuthForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
    });

    // Personal/Address form
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        cpf: '',
        phone: '',
        cep: '',
        address: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        paymentMethod: 'pix' as PaymentMethod,
        saveAddress: true,
        setAsDefaultAddress: true,
    });

    // Saved addresses (por navegador -- endereço de entrega usado no pedido vem do
    // profile, atualizado no envio do checkout)
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);

    // Determine starting step based on auth status
    useEffect(() => {
        if (!authLoading) {
            if (user && profile) {
                // User is logged in, start at personal data
                setStep(2);
                // Pre-fill data from profile
                setFormData(prev => ({
                    ...prev,
                    email: user.email || '',
                    name: profile.full_name || '',
                    phone: profile.phone || '',
                    cpf: profile.cpf || '',
                    cep: profile.cep || '',
                    address: profile.address || '',
                    number: profile.number || '',
                    complement: profile.complement || '',
                    neighborhood: profile.neighborhood || '',
                    city: profile.city || '',
                    state: profile.state || '',
                }));

                // Load saved addresses from localStorage
                const savedAddrKey = `donaonca-addresses-${user.id}`;
                const savedAddr = localStorage.getItem(savedAddrKey);
                if (savedAddr) {
                    const addresses = JSON.parse(savedAddr);
                    setSavedAddresses(addresses);
                    const defaultAddr = addresses.find((a: Address) => a.isDefault);
                    if (defaultAddr) setSelectedAddressId(defaultAddr.id);
                } else if (profile.address) {
                    // Create default address from profile
                    const defaultAddress: Address = {
                        id: 'profile-default',
                        label: 'Endereço Principal',
                        cep: profile.cep || '',
                        address: profile.address || '',
                        number: profile.number || '',
                        complement: profile.complement || '',
                        neighborhood: profile.neighborhood || '',
                        city: profile.city || '',
                        state: profile.state || '',
                        isDefault: true,
                    };
                    setSavedAddresses([defaultAddress]);
                    setSelectedAddressId('profile-default');
                }
            } else {
                // Not logged in, start at login
                setStep(1);
            }
        }
    }, [authLoading, user, profile]);

    // Ao escolher um endereço salvo, sincroniza formData com ele -- antes, selecionar
    // um endereço diferente do padrão não tinha efeito nenhum no que era salvo/usado.
    useEffect(() => {
        if (!selectedAddressId || showNewAddressForm) return;
        const selected = savedAddresses.find(a => a.id === selectedAddressId);
        if (selected) {
            setFormData(prev => ({
                ...prev,
                cep: selected.cep,
                address: selected.address,
                number: selected.number,
                complement: selected.complement,
                neighborhood: selected.neighborhood,
                city: selected.city,
                state: selected.state,
            }));
        }
    }, [selectedAddressId, showNewAddressForm, savedAddresses]);

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setIsProcessing(true);

        try {
            if (authMode === 'register') {
                if (authForm.password !== authForm.confirmPassword) {
                    setAuthError('As senhas não coincidem');
                    setIsProcessing(false);
                    return;
                }
                const { error } = await signUp(authForm.email, authForm.password, authForm.fullName);
                if (error) {
                    setAuthError(error.message);
                } else {
                    // Success - move to next step
                    setStep(2);
                }
            } else {
                const { error } = await signIn(authForm.email, authForm.password);
                if (error) {
                    setAuthError('E-mail ou senha incorretos');
                } else {
                    setStep(2);
                }
            }
        } catch {
            setAuthError('Erro ao processar. Tente novamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Auto-complete address when CEP is filled
        if (name === 'cep' && value.replace(/\D/g, '').length === 8) {
            fetchAddressByCep(value.replace(/\D/g, ''));
        }
    };

    const fetchAddressByCep = async (cep: string) => {
        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    address: data.logradouro || prev.address,
                    neighborhood: data.bairro || prev.neighborhood,
                    city: data.localidade || prev.city,
                    state: data.uf || prev.state,
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        } finally {
            setLoadingCep(false);
        }
    };

    const handleSaveNewAddress = () => {
        if (!user) return;

        const newAddress: Address = {
            id: `addr-${Date.now()}`,
            label: savedAddresses.length === 0 ? 'Endereço Principal' : `Endereço ${savedAddresses.length + 1}`,
            cep: formData.cep,
            address: formData.address,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            isDefault: formData.setAsDefaultAddress || savedAddresses.length === 0,
        };

        // Update other addresses if this is default
        let updatedAddresses = savedAddresses;
        if (newAddress.isDefault) {
            updatedAddresses = savedAddresses.map(a => ({ ...a, isDefault: false }));
        }
        updatedAddresses = [...updatedAddresses, newAddress];

        setSavedAddresses(updatedAddresses);
        setSelectedAddressId(newAddress.id);
        setShowNewAddressForm(false);

        // Save to localStorage
        localStorage.setItem(`donaonca-addresses-${user.id}`, JSON.stringify(updatedAddresses));
    };

    const handleCompleteOrder = async () => {
        if (!user) return;
        setOrderError('');
        setIsProcessing(true);

        try {
            // 1. Persiste os dados pessoais e o endereço de entrega no perfil -- é de lá
            // que o admin lê o endereço na hora de gerar a etiqueta de envio.
            const { error: profileError } = await updateProfile({
                full_name: formData.name,
                cpf: formData.cpf,
                phone: formData.phone,
                cep: formData.cep,
                address: formData.address,
                number: formData.number,
                complement: formData.complement,
                neighborhood: formData.neighborhood,
                city: formData.city,
                state: formData.state,
            });
            if (profileError) throw profileError;

            // 2. Grava o pedido de verdade.
            const orderItems = items.map(item => ({
                productId: item.productId,
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
            }));

            const { data: order, error: insertError } = await supabase
                .from('orders')
                .insert([{
                    user_id: user.id,
                    items: orderItems,
                    total,
                    status: 'Pendente',
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            // 3. Só baixa estoque depois do pedido gravado com sucesso.
            items.forEach(item => {
                sellProduct(item.productId, item.quantity);
            });

            clearCart();
            setCompletedOrder({ id: order.id, total });
        } catch (err) {
            console.error('Erro ao finalizar pedido:', err);
            setOrderError('Não foi possível concluir seu pedido agora. Tente novamente em instantes.');
        } finally {
            setIsProcessing(false);
        }
    };

    const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
            </div>
        );
    }

    // Confirmação de pedido concluído
    if (completedOrder) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">Pedido recebido!</h1>
                    <p className="mb-1 text-sm text-gray-500">Pedido #{completedOrder.id.slice(0, 8)}</p>
                    <p className="mb-6 text-gray-600">
                        Total de <strong>R$ {completedOrder.total.toFixed(2).replace('.', ',')}</strong>.
                        {formData.paymentMethod === 'pix'
                            ? ' Vamos te enviar o código Pix por e-mail para confirmar o pagamento.'
                            : ' O boleto será enviado por e-mail em instantes.'}
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link href="/conta/pedidos" className="rounded-xl bg-brand-600 py-3 font-medium text-white hover:bg-brand-700">
                            Ver meus pedidos
                        </Link>
                        <Link href="/produtos" className="rounded-xl border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50">
                            Continuar comprando
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Redirect if cart is empty
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Seu carrinho está vazio</h1>
                    <Link href="/produtos" className="text-brand-600 hover:underline">Ver produtos</Link>
                </div>
            </div>
        );
    }

    const stepLabels = user ? ['Dados', 'Entrega', 'Pagamento'] : ['Login', 'Dados', 'Entrega', 'Pagamento'];
    const adjustedStep = user ? step - 1 : step;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-6xl px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Dona Onça" width={40} height={40} />
                        <span className="text-xl font-bold text-brand-600">Dona Onça</span>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Ambiente Seguro
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 flex items-center justify-center gap-4">
                    {stepLabels.map((label, index) => (
                        <div key={index} className="flex items-center">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${adjustedStep >= index + 1 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                            >
                                {index + 1}
                            </div>
                            <span className={`ml-2 text-sm ${adjustedStep >= index + 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                                {label}
                            </span>
                            {index < stepLabels.length - 1 && <div className="mx-4 h-px w-12 bg-gray-200" />}
                        </div>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            {/* Step 1: Login/Register (only if not logged in) */}
                            {step === 1 && !user && (
                                <>
                                    <div className="mb-6 flex gap-4">
                                        <button
                                            onClick={() => setAuthMode('login')}
                                            className={`flex-1 rounded-xl border-2 p-4 text-center transition-all ${authMode === 'login' ? 'border-brand-600 bg-brand-50' : 'border-gray-200'}`}
                                        >
                                            <span className="font-medium text-gray-900">Já tenho conta</span>
                                        </button>
                                        <button
                                            onClick={() => setAuthMode('register')}
                                            className={`flex-1 rounded-xl border-2 p-4 text-center transition-all ${authMode === 'register' ? 'border-brand-600 bg-brand-50' : 'border-gray-200'}`}
                                        >
                                            <span className="font-medium text-gray-900">Criar conta</span>
                                        </button>
                                    </div>

                                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                                        {authMode === 'register' && (
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Nome Completo</label>
                                                <input
                                                    type="text"
                                                    value={authForm.fullName}
                                                    onChange={(e) => setAuthForm(prev => ({ ...prev, fullName: e.target.value }))}
                                                    className={inputClass}
                                                    required
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">E-mail</label>
                                            <input
                                                type="email"
                                                value={authForm.email}
                                                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                                                className={inputClass}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Senha</label>
                                            <input
                                                type="password"
                                                value={authForm.password}
                                                onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                                                className={inputClass}
                                                required
                                            />
                                        </div>
                                        {authMode === 'register' && (
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Confirmar Senha</label>
                                                <input
                                                    type="password"
                                                    value={authForm.confirmPassword}
                                                    onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                    className={inputClass}
                                                    required
                                                />
                                            </div>
                                        )}

                                        {authError && (
                                            <p className="text-sm text-red-500">{authError}</p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isProcessing}
                                            className="w-full rounded-xl bg-brand-600 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Processando...' : authMode === 'login' ? 'Entrar' : 'Criar Conta'}
                                        </button>
                                    </form>
                                </>
                            )}

                            {/* Step 2: Personal Data */}
                            {step === 2 && (
                                <>
                                    <h2 className="mb-6 text-xl font-bold text-gray-900">Seus Dados</h2>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-gray-700">E-mail</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`${inputClass} bg-gray-50`}
                                                readOnly
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Nome Completo</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">CPF</label>
                                            <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} className={inputClass} placeholder="000.000.000-00" />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Telefone</label>
                                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="(00) 00000-0000" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 3: Address */}
                            {step === 3 && (
                                <>
                                    <h2 className="mb-6 text-xl font-bold text-gray-900">Endereço de Entrega</h2>

                                    {/* Saved Addresses */}
                                    {savedAddresses.length > 0 && !showNewAddressForm && (
                                        <div className="mb-6 space-y-3">
                                            {savedAddresses.map((addr) => (
                                                <label
                                                    key={addr.id}
                                                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="selectedAddress"
                                                        checked={selectedAddressId === addr.id}
                                                        onChange={() => setSelectedAddressId(addr.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-gray-900">{addr.label}</span>
                                                            {addr.isDefault && (
                                                                <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">Padrão</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {addr.address}, {addr.number} {addr.complement && `- ${addr.complement}`}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {addr.neighborhood} - {addr.city}/{addr.state} - CEP: {addr.cep}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}

                                            <button
                                                onClick={() => setShowNewAddressForm(true)}
                                                className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors"
                                            >
                                                + Adicionar novo endereço
                                            </button>
                                        </div>
                                    )}

                                    {/* New Address Form */}
                                    {(savedAddresses.length === 0 || showNewAddressForm) && (
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    CEP {loadingCep && <span className="text-xs text-brand-600">Buscando...</span>}
                                                </label>
                                                <input type="text" name="cep" value={formData.cep} onChange={handleChange} className={inputClass} placeholder="00000-000" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Endereço</label>
                                                <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Número</label>
                                                <input type="text" name="number" value={formData.number} onChange={handleChange} className={inputClass} />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Complemento</label>
                                                <input type="text" name="complement" value={formData.complement} onChange={handleChange} className={inputClass} placeholder="Apto, Bloco..." />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Bairro</label>
                                                <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Cidade</label>
                                                <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
                                                <input type="text" name="state" value={formData.state} onChange={handleChange} className={inputClass} maxLength={2} />
                                            </div>

                                            <div className="md:col-span-3 pt-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="setAsDefaultAddress"
                                                        checked={formData.setAsDefaultAddress}
                                                        onChange={handleChange}
                                                        className="rounded border-gray-300 text-brand-600"
                                                    />
                                                    <span className="text-sm text-gray-600">Definir como endereço padrão</span>
                                                </label>
                                            </div>

                                            {showNewAddressForm && (
                                                <div className="md:col-span-3 flex gap-3">
                                                    <button
                                                        onClick={handleSaveNewAddress}
                                                        className="rounded-xl bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700"
                                                    >
                                                        Salvar Endereço
                                                    </button>
                                                    <button
                                                        onClick={() => setShowNewAddressForm(false)}
                                                        className="rounded-xl border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Step 4: Payment */}
                            {step === 4 && (
                                <>
                                    <h2 className="mb-6 text-xl font-bold text-gray-900">Pagamento</h2>

                                    {/* Payment Methods */}
                                    <div className="mb-6 flex gap-4">
                                        <button
                                            disabled
                                            title="Em breve"
                                            className="flex-1 rounded-xl border-2 border-gray-200 p-4 text-center opacity-50 cursor-not-allowed"
                                        >
                                            <span className="block font-medium text-gray-500">Cartão</span>
                                            <span className="text-xs text-gray-400">Em breve</span>
                                        </button>
                                        {(['pix', 'boleto'] as PaymentMethod[]).map((method) => (
                                            <button
                                                key={method}
                                                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                                                className={`flex-1 rounded-xl border-2 p-4 text-center transition-all ${formData.paymentMethod === method ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`}
                                            >
                                                <span className="block font-medium text-gray-900">
                                                    {method === 'pix' ? 'Pix' : 'Boleto'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {formData.paymentMethod === 'pix' && (
                                        <div className="rounded-xl bg-gray-50 p-6 text-center">
                                            <p className="text-gray-600">
                                                O código Pix é gerado após a confirmação do pedido e enviado por e-mail.
                                            </p>
                                        </div>
                                    )}

                                    {formData.paymentMethod === 'boleto' && (
                                        <div className="rounded-xl bg-gray-50 p-6 text-center">
                                            <p className="text-gray-600">
                                                O boleto será gerado após a confirmação do pedido e enviado por e-mail.
                                                <br /><span className="text-sm">Vencimento: 3 dias úteis</span>
                                            </p>
                                        </div>
                                    )}

                                    {orderError && (
                                        <p className="mt-4 text-sm text-red-500">{orderError}</p>
                                    )}
                                </>
                            )}

                            {/* Navigation Buttons */}
                            <div className="mt-8 flex justify-between">
                                {step > 1 && (step > 2 || !user) ? (
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Voltar
                                    </button>
                                ) : step === 1 && !user ? (
                                    <Link href="/sacola" className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50">
                                        Voltar à Sacola
                                    </Link>
                                ) : step === 2 && user ? (
                                    <Link href="/sacola" className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50">
                                        Voltar à Sacola
                                    </Link>
                                ) : null}

                                {step < 4 ? (
                                    <button
                                        onClick={() => setStep(step + 1)}
                                        className="rounded-xl bg-brand-600 px-8 py-3 font-medium text-white hover:bg-brand-700"
                                    >
                                        Continuar
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCompleteOrder}
                                        disabled={isProcessing}
                                        className="flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Processando...' : 'Finalizar Pedido'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Seu Pedido</h2>

                        <div className="space-y-3 border-b border-gray-100 pb-4">
                            {items.map((item, index) => (
                                <div key={`${item.productId}-${index}`} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.quantity}x {item.name}</span>
                                    <span className="font-medium text-gray-900">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 border-b border-gray-100 py-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Frete</span>
                                <span className={shipping === 0 ? 'text-green-600' : ''}>
                                    {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between py-4 text-lg font-bold">
                            <span className="text-gray-900">Total</span>
                            <span className="text-brand-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
