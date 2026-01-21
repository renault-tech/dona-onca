'use client';

import Link from 'next/link';
import Image from 'next/image';
import FavoriteButton from './FavoriteButton';
import { Product } from '@/contexts/ProductContext'; // Adjust import based on your context structure

interface ProductGridProps {
    products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Nenhum produto encontrado neste filtro.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
            {products.map((product) => (
                <Link
                    key={product.id}
                    href={`/produto/${product.id}`}
                    className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <Image
                            src={product.images[0] || '/logo.png'}
                            alt={product.name}
                            fill
                            className="object-contain p-8 transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white">
                            {product.category}
                        </span>
                        <div className="absolute right-3 bottom-3 z-10">
                            <FavoriteButton productId={product.id} />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                        <h3 className="mb-1 font-medium text-gray-900 line-clamp-2">
                            {product.name}
                        </h3>
                        <p className="text-lg font-bold text-brand-600">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
