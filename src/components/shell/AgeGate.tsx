'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import OncaMark from '@/components/brand/OncaMark';

const STORAGE_KEY = 'donaonca-age-ok';

/**
 * Portal de verificação de idade (18+). O catálogo inclui produtos adultos
 * (Sexshop) além de lingerie -- exigido tanto por boa prática quanto pela
 * classificação de conteúdo do site.
 *
 * Lido de localStorage em useEffect (não em useState inicial) de propósito:
 * evita mismatch de hidratação -- o servidor sempre renderiza "sem decisão
 * ainda", e o cliente decide depois de montar. Isso custa um flash em branco
 * de um frame no primeiro carregamento, mas nunca um flash do próprio gate
 * para quem já aceitou.
 */
export default function AgeGate() {
    const pathname = usePathname();
    const [status, setStatus] = useState<'checking' | 'gate' | 'blocked' | 'clear'>('checking');

    useEffect(() => {
        try {
            const ok = localStorage.getItem(STORAGE_KEY) === '1';
            setStatus(ok ? 'clear' : 'gate');
        } catch {
            setStatus('clear');
        }
    }, []);

    useEffect(() => {
        if (status === 'gate' || status === 'blocked') {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [status]);

    // Nunca bloqueia o admin -- é a área de trabalho da equipe, não a vitrine.
    if (pathname?.startsWith('/admin')) return null;
    if (status === 'checking' || status === 'clear') return null;

    const accept = () => {
        try {
            localStorage.setItem(STORAGE_KEY, '1');
        } catch {
            // localStorage indisponível (modo privado restrito) -- segue sem persistir
        }
        setStatus('clear');
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirmação de idade"
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-bg"
        >
            <OncaMark
                className="pointer-events-none absolute -right-24 top-1/2 h-[140%] w-auto -translate-y-1/2 text-accent opacity-90 md:-right-10"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.92) 60%)' }}
            />

            <div className="relative z-10 mx-auto max-w-xl px-6 text-center">
                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-fg-subtle">Dona Onça</p>
                <h1 className="font-display text-4xl italic text-fg sm:text-5xl">
                    Você tem 18 anos<br />ou mais?
                </h1>
                <p className="mt-4 text-sm text-fg-muted">
                    Este site tem produtos de conteúdo adulto. Precisamos confirmar sua idade para continuar.
                </p>

                <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-10">
                    <button
                        onClick={accept}
                        className="font-display text-2xl italic text-fg underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent"
                    >
                        Sim, tenho 18 anos
                    </button>
                    <a
                        href="https://www.google.com"
                        className="text-sm text-fg-subtle underline decoration-fg-subtle underline-offset-4 transition-colors hover:text-fg-muted"
                    >
                        Não, sair do site
                    </a>
                </div>
            </div>
        </div>
    );
}
