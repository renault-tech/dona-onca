'use client';

import Link from 'next/link';
import Image from 'next/image';
import FavoriteButton from './FavoriteButton';
import { Product } from '@/contexts/ProductContext';

interface ProductGridProps {
    products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-white/50">Nenhum produto encontrado neste filtro.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
            {products.map((product) => (
                <Link
                    key={product.id}
                    href={`/produto/${product.id}`}
                    className="group card-dark overflow-hidden"
                >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#1a0510]/50 to-transparent">
                        <Image
                            src={product.images[0] || '/logo.png'}
                            alt={product.name}
                            fill
                            className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                        />
                        <span className="absolute left-3 top-3 rounded-full border border-[#d6008b] bg-[#d6008b]/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            {product.category}
                        </span>
                        <div className="absolute right-3 bottom-3 z-10">
                            <FavoriteButton productId={product.id} />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                        <h3 className="mb-2 font-medium text-white line-clamp-2 group-hover:text-[#d6008b] transition-colors">
                            {product.name}
                        </h3>
                        <p className="text-xl font-bold text-[#d6008b]">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
