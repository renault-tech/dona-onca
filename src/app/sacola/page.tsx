import type { Metadata } from 'next';
import SacolaView from './SacolaView';

export const metadata: Metadata = {
    title: 'Sacola',
    robots: { index: false, follow: true },
};

export default function Page() {
    return <SacolaView />;
}
