import type { Metadata } from 'next';
import ProdutosView from './ProdutosView';

export const metadata: Metadata = {
    title: 'Produtos',
    description:
        'Explore o catálogo completo da Dona Onça: lingerie, pijamas, moda praia e produtos íntimos. Filtre por categoria, cor e tamanho.',
    alternates: { canonical: '/produtos' },
};

export default function Page() {
    return <ProdutosView />;
}
