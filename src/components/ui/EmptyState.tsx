import Link from 'next/link';
import OncaRosette from '@/components/brand/OncaRosette';

interface EmptyStateProps {
    message: string;
    actionLabel?: string;
    actionHref?: string;
    className?: string;
}

/** Substitui os blocos ad-hoc de "nenhum produto encontrado" repetidos pelo catálogo. */
export default function EmptyState({ message, actionLabel, actionHref, className = '' }: EmptyStateProps) {
    return (
        <div className={`rounded-onca surface flex flex-col items-center gap-4 p-12 text-center ${className}`}>
            <OncaRosette className="h-8 w-8 text-fg-subtle" aria-hidden />
            <p className="text-fg-subtle">{message}</p>
            {actionLabel && actionHref && (
                <Link href={actionHref} className="text-accent hover:underline">
                    {actionLabel} →
                </Link>
            )}
        </div>
    );
}
