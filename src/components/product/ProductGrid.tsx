import { type Product } from '@/contexts/ProductContext';
import ProductCard from './ProductCard';
import EmptyState from '@/components/ui/EmptyState';

interface ProductGridProps {
    products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return <EmptyState message="Nenhum produto encontrado neste filtro." />;
    }

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
            {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 3} />
            ))}
        </div>
    );
}
