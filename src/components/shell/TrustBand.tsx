import OncaRosette from '@/components/brand/OncaRosette';

const items = [
    {
        title: 'Embalagem 100% discreta',
        description: 'Sem logo, sem identificação do conteúdo por fora.',
    },
    {
        title: 'Fatura com nome neutro',
        description: 'Sua compra não aparece descrita no extrato.',
    },
    {
        title: 'Compra sigilosa',
        description: 'Seus dados nunca são compartilhados ou divulgados.',
    },
];

/**
 * Faixa de confiança -- discrição na entrega é o principal fator de conversão
 * neste segmento, mais do que qualquer selo genérico de "compra segura".
 */
export default function TrustBand({ className = '' }: { className?: string }) {
    return (
        <div className={`grid grid-cols-1 gap-8 border-y border-border py-10 sm:grid-cols-3 ${className}`}>
            {items.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                    <OncaRosette className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" aria-hidden />
                    <div>
                        <p className="text-sm font-medium text-fg">{item.title}</p>
                        <p className="mt-1 text-xs text-fg-subtle">{item.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
