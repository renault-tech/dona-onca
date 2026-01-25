'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
    label?: string;
    fallbackHref?: string;
    className?: string;
}

export default function BackButton({
    label = 'Voltar',
    fallbackHref = '/',
    className = ''
}: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        // Try to go back in history, fallback to href if no history
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push(fallbackHref);
        }
    };

    return (
        <button
            onClick={handleBack}
            className={`inline-flex items-center gap-2 text-white/60 hover:text-[#d6008b] transition-colors group ${className}`}
        >
            <svg
                className="h-5 w-5 transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                />
            </svg>
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}
