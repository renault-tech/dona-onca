'use client';

import { useEffect, useRef, useState, ReactNode, ElementType } from 'react';

interface RevealProps {
    children: ReactNode;
    /** Atraso do reveal em ms -- para orquestrar staggers entre elementos. */
    delay?: number;
    as?: ElementType;
    className?: string;
}

/**
 * Wrapper de scroll-reveal via IntersectionObserver puro (sem dependência de
 * animação). Some pra dentro na primeira vez que o elemento entra na tela,
 * uma vez só. Respeita prefers-reduced-motion via .reveal em globals.css.
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }: RevealProps) {
    const ref = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(node);
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={ref as any}
            className={`reveal ${isVisible ? 'is-visible' : ''} ${className}`}
            style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
        >
            {children}
        </Tag>
    );
}
