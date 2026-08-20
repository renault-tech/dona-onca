import type { Metadata } from 'next';
import SobreView from './SobreView';

export const metadata: Metadata = {
    title: 'Sobre',
    description: 'Conheça a história, os valores e a equipe por trás da Dona Onça.',
    alternates: { canonical: '/sobre' },
};

export default function Page() {
    return <SobreView />;
}
