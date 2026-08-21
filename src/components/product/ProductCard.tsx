import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@/contexts/ProductContext';
import FavoriteButton from '@/components/FavoriteButton';

interface ProductCardProps {
    product: Product;
    /** Marca a imagem como LCP candidate (primeiras linhas da grade). */
    priority?: boolean;
    /** Rótulo opcional extra no canto (ex.: "Novo"). O desconto e o
     * esgotado são calculados automaticamente a partir do produto. */
    badge?: string;
    /** Mostra a linha "ou 3x de R$ ..." abaixo do preço. */
    showInstallments?: boolean;
}

/**
 * Card de produto único, em retrato 4:5 com a foto sangrada (object-cover) --
 * substitui o `object-contain p-6` sobre fundo cinza que fazia o catálogo
 * parecer marketplace, e a duplicação do mesmo bloco de ~35 linhas que
 * existia em Home, /produtos, /novidades e no antigo ProductGrid.
 */
export default function ProductCard({ product, priority, badge, showInstallments }: ProductCardProps) {
    const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
    const discountPct = hasDiscount
        ? Math.round((1 - product.price / product.originalPrice!) * 100)
        : 0;
    const outOfStock = product.stock <= 0;

    return (
        <Link href={`/produto/${product.id}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-onca bg-surface">
                <Image
                    src={product.images[0] || '/logo.png'}
                    alt={product.name}
                    fill
                    priority={priority}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${outOfStock ? 'opacity-50 grayscale' : ''}`}
                />

                <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                    <span className="rounded-full bg-bg/80 px-3 py-1 text-[10px] uppercase tracking-wide text-fg-muted backdrop-blur-sm">
                        {product.category}
                    </span>
                    {badge && !outOfStock && (
                        <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                            {badge}
                        </span>
                    )}
                    {hasDiscount && !outOfStock && (
                        <span className="rounded-full bg-fg px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-bg">
                            -{discountPct}%
                        </span>
                    )}
                </div>

                {outOfStock && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-fg">
                        Esgotado
                    </span>
                )}

                <div className="absolute right-3 bottom-3 z-10">
                    <FavoriteButton productId={product.id} />
                </div>
            </div>

            <div className="mt-3">
                <h3 className="text-sm text-fg-muted line-clamp-1 group-hover:text-fg transition-colors">
                    {product.name}
                </h3>
                <div className="mt-1 flex items-baseline gap-2">
                    <p className="text-base font-semibold text-accent">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                    </p>
                    {hasDiscount && (
                        <p className="text-xs text-fg-subtle line-through">
                            R$ {product.originalPrice!.toFixed(2).replace('.', ',')}
                        </p>
                    )}
                </div>
                {showInstallments && (
                    <p className="mt-1 text-[10px] italic text-fg-subtle">
                        ou 3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')}
                    </p>
                )}
            </div>
        </Link>
    );
}
