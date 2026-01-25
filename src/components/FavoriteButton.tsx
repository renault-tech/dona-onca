'use client';

import { useFavorites } from '@/contexts/FavoritesContext';

interface FavoriteButtonProps {
    productId: number;
    className?: string;
    iconSize?: number;
}

export default function FavoriteButton({ productId, className = '', iconSize = 6 }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const active = isFavorite(productId);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if inside a Link
        e.stopPropagation();
        toggleFavorite(productId);
    };

    return (
        <button
            onClick={handleClick}
            className={`group flex items-center justify-center rounded-full bg-black/60 p-2 shadow-sm backdrop-blur-sm transition-all hover:bg-black/80 hover:scale-110 border border-white/10 hover:border-[#d6008b]/50 ${className}`}
            title={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
            <svg
                className={`h-${iconSize} w-${iconSize} transition-colors ${active ? 'fill-[#d6008b] text-[#d6008b]' : 'fill-transparent text-white/60 group-hover:text-[#d6008b]'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={active ? { filter: 'drop-shadow(0 0 6px rgba(214, 0, 139, 0.6))' } : {}}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
            </svg>
        </button>
    );
}
