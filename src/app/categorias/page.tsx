import type { Metadata } from 'next';
import CategoriasView from './CategoriasView';

export const metadata: Metadata = {
    title: 'Categorias',
    description: 'Navegue pelas categorias da Dona Onça: Lingerie, Pijamas, Praia/Piscina e Sexshop.',
    alternates: { canonical: '/categorias' },
};

export default function Page() {
    return <CategoriasView />;
}
