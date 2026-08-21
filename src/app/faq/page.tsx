'use client';

import { useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

const faqData = [
    {
        category: 'Entregas',
        icon: '📦',
        questions: [
            {
                q: 'Qual o prazo de entrega?',
                a: 'O prazo de entrega varia de acordo com a sua região. Após a postagem, enviamos um código de rastreamento por e-mail. Em média, as entregas levam de 5 a 15 dias úteis.',
            },
            {
                q: 'Como rastrear meu pedido?',
                a: 'Você receberá um e-mail com o código de rastreamento assim que seu pedido for enviado. Use esse código no site dos Correios ou transportadora para acompanhar a entrega.',
            },
            {
                q: 'Vocês entregam para todo o Brasil?',
                a: 'Sim! Entregamos para todas as regiões do Brasil através dos Correios e transportadoras parceiras.',
            },
        ],
    },
    {
        category: 'Pagamentos',
        icon: '💳',
        questions: [
            {
                q: 'Quais formas de pagamento são aceitas?',
                a: 'Aceitamos cartão de crédito (até 12x), PIX, boleto bancário e carteiras digitais.',
            },
            {
                q: 'O pagamento é seguro?',
                a: 'Sim! Utilizamos criptografia SSL e trabalhamos apenas com gateways de pagamento certificados e seguros.',
            },
            {
                q: 'Posso parcelar minha compra?',
                a: 'Sim, você pode parcelar em até 12x sem juros no cartão de crédito, dependendo do valor da compra.',
            },
        ],
    },
    {
        category: 'Trocas e Devoluções',
        icon: '🔄',
        questions: [
            {
                q: 'Como faço para trocar um produto?',
                a: 'Entre em contato conosco em até 7 dias após o recebimento. O produto deve estar sem uso, com etiquetas e embalagem original.',
            },
            {
                q: 'Qual o prazo para solicitar troca?',
                a: 'Você tem até 7 dias corridos após o recebimento do produto para solicitar a troca ou devolução.',
            },
            {
                q: 'Quem paga o frete da troca?',
                a: 'Se a troca for por defeito ou erro nosso, nós cobrimos o frete. Para trocas por preferência pessoal, o frete fica por conta do cliente.',
            },
        ],
    },
    {
        category: 'Produtos',
        icon: '👙',
        questions: [
            {
                q: 'Como escolher o tamanho certo?',
                a: 'Cada produto tem uma tabela de medidas específica. Confira as medidas na página do produto e compare com suas medidas corporais.',
            },
            {
                q: 'Os produtos possuem garantia?',
                a: 'Sim, todos os produtos possuem garantia contra defeitos de fabricação por 30 dias após a compra.',
            },
            {
                q: 'Os produtos são discretamente enviados?',
                a: 'Absolutamente! Todos os nossos produtos são enviados em embalagens discretas, sem identificação do conteúdo.',
            },
        ],
    },
];

export default function FAQPage() {
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (id: string) => {
        setOpenItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

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
                    >
                        Central de Ajuda
                    </h1>
                    <p className="text-white/60 max-w-xl mx-auto">
                        Encontre respostas para as perguntas mais frequentes sobre nossos produtos e serviços.
                    </p>
                </div>

                {/* FAQ Categories */}
                <div className="space-y-8">
                    {faqData.map((category) => (
                        <div key={category.category} className="rounded-2xl bg-gradient-to-br from-[#1a0510] to-[#0d0308] border border-[#d6008b]/20 overflow-hidden">
                            {/* Category Header */}
                            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                                <span className="text-2xl">{category.icon}</span>
                                <h2 className="text-xl font-semibold text-white">{category.category}</h2>
                            </div>

                            {/* Questions */}
                            <div className="divide-y divide-white/5">
                                {category.questions.map((item, idx) => {
                                    const itemId = `${category.category}-${idx}`;
                                    const isOpen = openItems.includes(itemId);

                                    return (
                                        <div key={idx}>
                                            <button
                                                onClick={() => toggleItem(itemId)}
                                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                                            >
                                                <span className="font-medium text-white pr-4">{item.q}</span>
                                                <svg
                                                    className={`h-5 w-5 text-[#d6008b] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-4 text-white/60 text-sm leading-relaxed">
                                                    {item.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Still need help? */}
                <div className="mt-12 text-center">
                    <div className="rounded-2xl bg-gradient-to-r from-[#d6008b]/20 to-[#d6008b]/10 border border-[#d6008b]/30 p-8">
                        <h3 className="text-xl font-semibold text-white mb-2">Ainda precisa de ajuda?</h3>
                        <p className="text-white/60 mb-6">Nossa equipe está pronta para te ajudar.</p>
                        <Link
                            href="/contato"
                            className="inline-block px-8 py-3 rounded-full text-white font-medium transition-all hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.5) 0%, rgba(214, 0, 139, 0.3) 100%)',
                                border: '1px solid rgba(214, 0, 139, 0.6)',
                            }}
                        >
                            Fale Conosco
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
