import OncaRosette from '@/components/brand/OncaRosette';

interface MarqueeRibbonProps {
    text: string;
    className?: string;
}

/**
 * Fita horizontal contínua, CSS-only (@keyframes marquee em globals.css).
 * Duplicamos o conteúdo uma vez para o loop ficar sem costura.
 */
export default function MarqueeRibbon({ text, className = '' }: MarqueeRibbonProps) {
    const segment = (
        <span className="flex items-center gap-6 pr-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="flex items-center gap-6">
                    <span className="font-display text-2xl italic text-fg/80 sm:text-3xl">{text}</span>
                    <OncaRosette className="h-4 w-4 text-accent" aria-hidden />
                </span>
            ))}
        </span>
    );

    return (
        <div className={`overflow-hidden ${className}`} aria-hidden="true">
            <div className="marquee-track">
                {segment}
                {segment}
            </div>
        </div>
    );
}
