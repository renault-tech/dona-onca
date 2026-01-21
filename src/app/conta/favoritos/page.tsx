'use client';

import { useFavorites } from '@/contexts/FavoritesContext';
import { useProducts } from '@/contexts/ProductContext';
import ProductGrid from '@/components/ProductGrid';
import Link from 'next/link';

export default function FavoritesPage() {
    const { favorites, loading: loadingFavs } = useFavorites();
    const { products, loading: loadingProducts } = useProducts();

    if (loadingFavs || loadingProducts) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    const favoriteProducts = products.filter(p => favorites.includes(p.id));

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/minha-conta" className="text-gray-500 hover:text-brand-600">
                    ← Voltar
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Meus Favoritos</h1>
            </div>
            <span className="text-sm text-gray-500">
                {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item' : 'itens'}
            </span>


            {
                favoriteProducts.length > 0 ? (
                    <ProductGrid products={favoriteProducts} />
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                        <div className="mb-4 rounded-full bg-gray-100 p-4 text-4xl">
                            ❤️
                        </div>
                        <h3 className="mb-2 text-lg font-medium text-gray-900">
                            Sua lista de desejos está vazia
                        </h3>
                        <p className="mb-6 max-w-sm text-gray-500">
                            Salve os produtos que você mais gostou para ver ou comprar depois.
                        </p>
                        <Link
                            href="/produtos"
                            className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-700"
                        >
                            Explorar Produtos
                        </Link>
                    </div>
                )
            }
        </div >
    );
}
