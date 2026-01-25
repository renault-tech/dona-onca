'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Order {
    id: string;
    customer: string;
    items: { productName: string; quantity: number; price: number }[];
    total: number;
    status: string;
    created_at: string;
    // Customer address fields (to be fetched from profile or order)
    customerAddress?: string;
    customerNumber?: string;
    customerComplement?: string;
    customerNeighborhood?: string;
    customerCity?: string;
    customerState?: string;
    customerCep?: string;
    customerPhone?: string;
    customerCpf?: string;
}

interface ShippingConfig {
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

export default function LabelPrintPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [config, setConfig] = useState<ShippingConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [contentDescription, setContentDescription] = useState('Vestuário Feminino');
    const [contentValue, setContentValue] = useState('');
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load shipping config
        const savedConfig = localStorage.getItem('donaonca_shipping_config');
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        }

        // Fetch orders that are ready to ship (Pago status)
        const fetchOrders = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, profiles(full_name, email, phone, cpf, address, number, complement, neighborhood, city, state, cep)')
                    .in('status', ['Pago', 'Enviado']);

                if (error) throw error;

                if (data) {
                    const formattedOrders: Order[] = data.map((order: any) => ({
                        id: order.id,
                        customer: order.profiles?.full_name || 'Cliente Desconhecido',
                        items: order.items || [],
                        total: order.total,
                        status: order.status,
                        created_at: order.created_at,
                        customerAddress: order.profiles?.address || '',
                        customerNumber: order.profiles?.number || '',
                        customerComplement: order.profiles?.complement || '',
                        customerNeighborhood: order.profiles?.neighborhood || '',
                        customerCity: order.profiles?.city || '',
                        customerState: order.profiles?.state || '',
                        customerCep: order.profiles?.cep || '',
                        customerPhone: order.profiles?.phone || '',
                        customerCpf: order.profiles?.cpf || '',
                    }));
                    setOrders(formattedOrders);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handlePrint = () => {
        if (printRef.current) {
            const printContent = printRef.current.innerHTML;
            const printWindow = window.open('', '', 'width=800,height=600');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                    <head>
                        <title>Etiqueta - Pedido #${selectedOrder?.id.slice(0, 8)}</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: Arial, sans-serif; padding: 10mm; }
                            .label { border: 2px solid #000; padding: 5mm; width: 100mm; max-width: 100%; }
                            .section { margin-bottom: 4mm; padding-bottom: 4mm; border-bottom: 1px dashed #000; }
                            .section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
                            .title { font-weight: bold; font-size: 10pt; text-transform: uppercase; margin-bottom: 2mm; }
                            .data { font-size: 9pt; line-height: 1.4; }
                            .big { font-size: 14pt; font-weight: bold; }
                            .center { text-align: center; }
                            table { width: 100%; font-size: 8pt; border-collapse: collapse; }
                            th, td { border: 1px solid #000; padding: 2mm; text-align: left; }
                            th { background: #eee; }
                            @media print {
                                body { padding: 0; }
                                .label { border-width: 1px; }
                            }
                        </style>
                    </head>
                    <body>${printContent}</body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-6xl px-4 py-8">
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
                            <h1 className="text-2xl font-bold text-gray-900">Imprimir Etiqueta dos Correios</h1>
                            <p className="text-sm text-gray-500">Gere etiquetas com declaração de conteúdo para envio</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Order Selection */}
                    <div className="space-y-6">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Selecione o Pedido</h2>

                            {orders.length === 0 ? (
                                <p className="text-gray-500">Nenhum pedido pronto para envio.</p>
                            ) : (
                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {orders.map((order) => (
                                        <button
                                            key={order.id}
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setContentValue(order.total.toFixed(2));
                                            }}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedOrder?.id === order.id
                                                    ? 'border-brand-600 bg-brand-50'
                                                    : 'border-gray-200 hover:border-brand-300'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-gray-900">#{order.id.slice(0, 8)}</p>
                                                    <p className="text-sm text-gray-600">{order.customer}</p>
                                                    <p className="text-xs text-gray-400">{order.items.length} itens</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-brand-600">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedOrder && (
                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">Declaração de Conteúdo</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Descrição do Conteúdo</label>
                                        <input
                                            type="text"
                                            value={contentDescription}
                                            onChange={(e) => setContentDescription(e.target.value)}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none"
                                            placeholder="Ex: Vestuário Feminino"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Valor Declarado (R$)</label>
                                        <input
                                            type="text"
                                            value={contentValue}
                                            onChange={(e) => setContentValue(e.target.value)}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handlePrint}
                                    className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-4 font-semibold text-white hover:bg-brand-700 transition-colors"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Imprimir Etiqueta
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Label Preview */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Pré-visualização da Etiqueta</h2>

                        {selectedOrder ? (
                            <div ref={printRef} className="bg-white border-2 border-gray-800 p-4 rounded font-mono text-sm">
                                <div className="label">
                                    {/* Sender */}
                                    <div className="section">
                                        <div className="title">REMETENTE</div>
                                        <div className="data">
                                            <strong>{config?.senderName || 'Dona Onça'}</strong><br />
                                            {config?.senderAddress && `${config.senderAddress}, ${config.senderNumber}`}
                                            {config?.senderComplement && ` - ${config.senderComplement}`}<br />
                                            {config?.senderNeighborhood && `${config.senderNeighborhood} - `}
                                            {config?.senderCity && `${config.senderCity}/${config.senderState}`}<br />
                                            {config?.senderCep && `CEP: ${config.senderCep}`}
                                            {config?.senderPhone && ` | Tel: ${config.senderPhone}`}
                                        </div>
                                    </div>

                                    {/* Recipient */}
                                    <div className="section">
                                        <div className="title">DESTINATÁRIO</div>
                                        <div className="data">
                                            <strong className="big">{selectedOrder.customer}</strong><br />
                                            {selectedOrder.customerAddress && `${selectedOrder.customerAddress}, ${selectedOrder.customerNumber}`}
                                            {selectedOrder.customerComplement && ` - ${selectedOrder.customerComplement}`}<br />
                                            {selectedOrder.customerNeighborhood && `${selectedOrder.customerNeighborhood} - `}
                                            {selectedOrder.customerCity && `${selectedOrder.customerCity}/${selectedOrder.customerState}`}<br />
                                            <strong className="big">CEP: {selectedOrder.customerCep || '___________'}</strong>
                                            {selectedOrder.customerPhone && <><br />Tel: {selectedOrder.customerPhone}</>}
                                        </div>
                                    </div>

                                    {/* Content Declaration */}
                                    <div className="section">
                                        <div className="title center">DECLARAÇÃO DE CONTEÚDO</div>
                                        <table style={{ width: '100%', fontSize: '8pt', borderCollapse: 'collapse', marginTop: '2mm' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', background: '#eee' }}>Qtd</th>
                                                    <th style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', background: '#eee' }}>Descrição</th>
                                                    <th style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', background: '#eee' }}>Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ border: '1px solid #000', padding: '2mm' }}>{item.quantity}</td>
                                                        <td style={{ border: '1px solid #000', padding: '2mm' }}>{item.productName}</td>
                                                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right' }}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan={2} style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold' }}>TOTAL</td>
                                                    <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold' }}>R$ {contentValue.replace('.', ',')}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                        <p style={{ fontSize: '7pt', marginTop: '3mm', textAlign: 'center' }}>
                                            Declaro que a remessa está de acordo com a legislação atual.<br />
                                            Não contém objeto proibido pelos Correios.
                                        </p>
                                    </div>

                                    {/* Order Reference */}
                                    <div className="section center" style={{ fontSize: '8pt' }}>
                                        <strong>Pedido: #{selectedOrder.id.slice(0, 8).toUpperCase()}</strong><br />
                                        {new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <svg className="h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p>Selecione um pedido para visualizar a etiqueta</p>
                            </div>
                        )}

                        {!config?.senderAddress && selectedOrder && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <p className="text-sm text-yellow-700">
                                    ⚠️ <strong>Atenção:</strong> Configure os dados do remetente na página de{' '}
                                    <Link href="/admin/orders/shipping" className="text-brand-600 underline">
                                        Configurações de Frete
                                    </Link>
                                    {' '}para preencher automaticamente.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
