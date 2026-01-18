'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/contexts/ProductContext';
import { useState } from 'react';

export default function CheckoutPage() {
    const { items, subtotal, total, clearCart } = useCart();
    const { sellProduct } = useProducts();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCompleteOrder = async () => {
        setIsProcessing(true);

        // Deduct stock for each item
        items.forEach(item => {
            sellProduct(item.productId, item.quantity);
        });

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        clearCart();
        alert('Pedido realizado com sucesso! O estoque foi atualizado.');
        router.push('/');
        setIsProcessing(false);
    };
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
        paymentMethod: 'credit',
        cardNumber: '',
        cardName: '',
        cardExpiry: '',
        cardCvv: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const shipping = 0;

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
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step >= s ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {s}
                            </div>
                            <span className={`ml-2 text-sm ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                                {s === 1 ? 'Dados' : s === 2 ? 'Entrega' : 'Pagamento'}
                            </span>
                            {s < 3 && <div className="mx-4 h-px w-12 bg-gray-200" />}
                        </div>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            {step === 1 && (
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
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                                placeholder="seu@email.com"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Nome Completo</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">CPF</label>
                                            <input
                                                type="text"
                                                name="cpf"
                                                value={formData.cpf}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                                placeholder="000.000.000-00"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Telefone</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2 className="mb-6 text-xl font-bold text-gray-900">Endereço de Entrega</h2>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">CEP</label>
                                            <input
                                                type="text"
                                                name="cep"
                                                value={formData.cep}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                                placeholder="00000-000"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Endereço</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Número</label>
                                            <input
                                                type="text"
                                                name="number"
                                                value={formData.number}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Complemento</label>
                                            <input
                                                type="text"
                                                name="complement"
                                                value={formData.complement}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                                placeholder="Apto, Bloco, etc"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Bairro</label>
                                            <input
                                                type="text"
                                                name="neighborhood"
                                                value={formData.neighborhood}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Cidade</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2 className="mb-6 text-xl font-bold text-gray-900">Pagamento</h2>

                                    {/* Payment Methods */}
                                    <div className="mb-6 flex gap-4">
                                        {['credit', 'pix', 'boleto'].map((method) => (
                                            <button
                                                key={method}
                                                onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                                className={`flex-1 rounded-xl border-2 p-4 text-center transition-all ${formData.paymentMethod === method
                                                    ? 'border-brand-600 bg-brand-50'
                                                    : 'border-gray-200 hover:border-brand-300'
                                                    }`}
                                            >
                                                <span className="block font-medium text-gray-900">
                                                    {method === 'credit' ? '💳 Cartão' : method === 'pix' ? '📱 Pix' : '📄 Boleto'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {formData.paymentMethod === 'credit' && (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="md:col-span-2">
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Número do Cartão</label>
                                                <input
                                                    type="text"
                                                    name="cardNumber"
                                                    value={formData.cardNumber}
                                                    onChange={handleChange}
                                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                                    placeholder="0000 0000 0000 0000"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Nome no Cartão</label>
                                                <input
                                                    type="text"
                                                    name="cardName"
                                                    value={formData.cardName}
                                                    onChange={handleChange}
                                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">Validade</label>
                                                <input
                                                    type="text"
                                                    name="cardExpiry"
                                                    value={formData.cardExpiry}
                                                    onChange={handleChange}
                                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                                    placeholder="MM/AA"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">CVV</label>
                                                <input
                                                    type="text"
                                                    name="cardCvv"
                                                    value={formData.cardCvv}
                                                    onChange={handleChange}
                                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                                                    placeholder="000"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {formData.paymentMethod === 'pix' && (
                                        <div className="rounded-xl bg-gray-50 p-6 text-center">
                                            <div className="mx-auto mb-4 h-48 w-48 rounded-xl bg-white p-4">
                                                <div className="flex h-full items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                                                    <span className="text-gray-400">QR Code Pix</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Escaneie o QR Code ou copie o código Pix
                                            </p>
                                        </div>
                                    )}

                                    {formData.paymentMethod === 'boleto' && (
                                        <div className="rounded-xl bg-gray-50 p-6 text-center">
                                            <p className="text-gray-600">
                                                O boleto será gerado após a confirmação do pedido.
                                                <br />
                                                <span className="text-sm">Vencimento: 3 dias úteis</span>
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Navigation Buttons */}
                            <div className="mt-8 flex justify-between">
                                {step > 1 ? (
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Voltar
                                    </button>
                                ) : (
                                    <Link
                                        href="/sacola"
                                        className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Voltar à Sacola
                                    </Link>
                                )}

                                {step < 3 ? (
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
                                        {isProcessing ? (
                                            <>
                                                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Processando...
                                            </>
                                        ) : (
                                            'Finalizar Pedido'
                                        )}
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
                                    <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
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
                                <span className="text-green-600">Grátis</span>
                            </div>
                        </div>

                        <div className="flex justify-between py-4 text-lg font-bold">
                            <span>Total</span>
                            <span className="text-brand-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
