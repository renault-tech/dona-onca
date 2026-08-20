import type { Metadata } from 'next';
import HomeView from './HomeView';

export const metadata: Metadata = {
    title: 'Dona Onça | Lingerie, Moda Íntima e Lifestyle',
    description:
        'Lingerie, pijamas, moda praia e produtos íntimos com a elegância e a força da Dona Onça. Entrega discreta em todo o Brasil.',
    alternates: { canonical: '/' },
    openGraph: {
        title: 'Dona Onça | Lingerie, Moda Íntima e Lifestyle',
        description: 'Lingerie, pijamas, moda praia e produtos íntimos com a elegância e a força da Dona Onça.',
        url: '/',
    },
};

export default function Page() {
    return <HomeView />;
}
