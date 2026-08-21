'use client';

import { useEffect } from 'react';

interface SizeGuideDrawerProps {
    open: boolean;
    onClose: () => void;
}

const rows = [
    { size: 'PP', busto: '78-82', cintura: '58-62', quadril: '84-88' },
    { size: 'P', busto: '83-87', cintura: '63-67', quadril: '89-93' },
    { size: 'M', busto: '88-92', cintura: '68-72', quadril: '94-98' },
    { size: 'G', busto: '93-98', cintura: '73-78', quadril: '99-104' },
    { size: 'GG', busto: '99-105', cintura: '79-85', quadril: '105-111' },
];

/**
 * Guia de medidas em drawer -- em lingerie, tamanho errado é a principal causa
 * de troca e de abandono de carrinho, e o site não tinha nenhuma referência
 * de medidas antes desta tela.
 */
export default function SizeGuideDrawer({ open, onClose }: SizeGuideDrawerProps) {
    useEffect(() => {
        if (!open) return;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[80]">
            <button aria-label="Fechar guia de tamanhos" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Guia de tamanhos"
                className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-border bg-bg p-6"
            >
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-display text-xl italic text-fg">Guia de tamanhos</h2>
                    <button onClick={onClose} aria-label="Fechar" className="rounded-full p-2 text-fg-muted hover:text-accent hover:bg-surface transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="mb-6 text-sm text-fg-muted">
                    Medidas em centímetros. Em caso de dúvida entre dois tamanhos, prefira o maior.
                </p>

                <div className="overflow-x-auto rounded-onca border border-border">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-fg-subtle">
                                <th className="px-4 py-3 font-medium">Tam.</th>
                                <th className="px-4 py-3 font-medium">Busto</th>
                                <th className="px-4 py-3 font-medium">Cintura</th>
                                <th className="px-4 py-3 font-medium">Quadril</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.size} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3 font-semibold text-accent">{row.size}</td>
                                    <td className="px-4 py-3 text-fg-muted">{row.busto}</td>
                                    <td className="px-4 py-3 text-fg-muted">{row.cintura}</td>
                                    <td className="px-4 py-3 text-fg-muted">{row.quadril}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="mt-6 text-xs text-fg-subtle">
                    Como medir: busto na parte mais cheia, cintura na parte mais fina e quadril na parte mais larga,
                    com a fita métrica paralela ao chão.
                </p>
            </aside>
        </div>
    );
}
