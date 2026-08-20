import type { Metadata } from 'next';
import NovidadesView from './NovidadesView';

export const metadata: Metadata = {
    title: 'Novidades',
    description: 'As peças mais recentes da Dona Onça: lançamentos em lingerie, pijamas, moda praia e produtos íntimos.',
    alternates: { canonical: '/novidades' },
};

export default function Page() {
    return <NovidadesView />;
}
