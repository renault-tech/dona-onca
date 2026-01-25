'use client';

import { useState } from 'react';
import BackButton from '@/components/BackButton';

const sections = [
    {
        title: 'Termos de Uso',
        icon: '📋',
        content: `
            Bem-vindo à Dona Onça. Ao acessar e utilizar nosso site, você concorda com os termos e condições aqui estabelecidos.

            **1. Aceitação dos Termos**
            Ao utilizar nosso site, você declara ter lido e concordado com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não utilize nosso site.

            **2. Uso do Site**
            O site da Dona Onça destina-se exclusivamente para compras online de produtos de lingerie e lifestyle. É proibido o uso para fins ilegais ou não autorizados.

            **3. Conta de Usuário**
            Para realizar compras, é necessário criar uma conta. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.

            **4. Produtos e Preços**
            Os preços podem ser alterados sem aviso prévio. Nos reservamos o direito de corrigir erros de preço. As cores dos produtos podem variar ligeiramente das imagens.

            **5. Direitos Autorais**
            Todo o conteúdo do site, incluindo textos, imagens e logotipos, é protegido por direitos autorais e não pode ser reproduzido sem autorização.
        `,
    },
    {
        title: 'Política de Privacidade',
        icon: '🔒',
        content: `
            A Dona Onça está comprometida em proteger sua privacidade. Esta política descreve como coletamos e utilizamos suas informações.

            **1. Coleta de Dados**
            Coletamos informações que você nos fornece diretamente, como nome, e-mail, endereço e dados de pagamento durante o processo de compra.

            **2. Uso das Informações**
            Utilizamos suas informações para processar pedidos, enviar atualizações sobre entregas, melhorar nossos serviços e, com sua autorização, enviar ofertas promocionais.

            **3. Proteção de Dados**
            Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado, alteração ou destruição.

            **4. Cookies**
            Utilizamos cookies para melhorar sua experiência de navegação, lembrar preferências e analisar o tráfego do site.

            **5. Compartilhamento**
            Não vendemos suas informações pessoais. Compartilhamos dados apenas com parceiros necessários para entrega e processamento de pagamentos.
        `,
    },
    {
        title: 'Política de Trocas e Devoluções',
        icon: '🔄',
        content: `
            Na Dona Onça, queremos que você esteja 100% satisfeita com sua compra. Confira nossa política de trocas.

            **1. Prazo para Solicitação**
            Você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor.

            **2. Condições do Produto**
            O produto deve estar sem uso, com etiquetas originais e na embalagem original para ser aceito na troca.

            **3. Produtos Íntimos**
            Por questões de higiene, lingeries e produtos íntimos só podem ser trocados se estiverem lacrados e sem sinais de uso.

            **4. Frete da Troca**
            Em caso de defeito ou erro nosso, o frete de retorno é por nossa conta. Para trocas por preferência, o cliente assume o frete.

            **5. Reembolso**
            O reembolso é processado em até 10 dias úteis após recebermos o produto, utilizando o mesmo método de pagamento original.
        `,
    },
];

export default function TermosPage() {
    const [activeSection, setActiveSection] = useState(0);

    return (
        <div className="min-h-screen bg-[#050505] pt-32 pb-20">
            <div className="mx-auto max-w-5xl px-4">
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
                        Termos e Políticas
                    </h1>
                    <p className="text-white/60 max-w-xl mx-auto">
                        Informações importantes sobre o uso do nosso site, privacidade e políticas de compra.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-4">
                    {/* Sidebar Navigation */}
                    <div className="md:col-span-1">
                        <nav className="sticky top-32 space-y-2">
                            {sections.map((section, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveSection(idx)}
                                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeSection === idx
                                        ? 'bg-[#d6008b]/20 text-white border border-[#d6008b]/40'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="text-lg">{section.icon}</span>
                                    <span className="text-sm font-medium">{section.title}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-3">
                        <div className="rounded-2xl bg-gradient-to-br from-[#1a0510] to-[#0d0308] border border-[#d6008b]/20 p-8">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                <span className="text-3xl">{sections[activeSection].icon}</span>
                                <h2 className="text-2xl font-semibold text-white">
                                    {sections[activeSection].title}
                                </h2>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                {sections[activeSection].content.split('\n\n').map((paragraph, idx) => {
                                    if (paragraph.trim().startsWith('**')) {
                                        const title = paragraph.replace(/\*\*/g, '');
                                        return (
                                            <h3 key={idx} className="text-lg font-semibold text-white mt-6 mb-2">
                                                {title}
                                            </h3>
                                        );
                                    }
                                    return (
                                        <p key={idx} className="text-white/70 leading-relaxed mb-4">
                                            {paragraph.trim()}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Last Updated */}
                        <p className="mt-6 text-center text-sm text-white/40">
                            Última atualização: Janeiro de 2026
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
