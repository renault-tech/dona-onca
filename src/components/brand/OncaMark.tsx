import { SVGProps } from 'react';

/**
 * Cabeça de onça — versão gráfica derivada da logo, em traço único, para uso
 * em grande escala (sangrada em seções, marca d'água chapada) onde o PNG da
 * logo perderia nitidez ou pesaria demais. Herda a cor via `currentColor`.
 */
export default function OncaMark(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 200 190" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path
                fill="currentColor"
                d="M100 8c-9 0-16 10-19 24-4-9-13-17-23-17-3 0-5 3-4 6 3 10 9 22 17 30-15 3-27 15-32 30-1 4 2 8 6 7 12-3 22-9 29-18-2 8-3 16-3 24 0 42 25 76 56 76s56-34 56-76c0-8-1-16-3-24 7 9 17 15 29 18 4 1 7-3 6-7-5-15-17-27-32-30 8-8 14-20 17-30 1-3-1-6-4-6-10 0-19 8-23 17-3-14-10-24-19-24Z"
            />
            <path
                fill="var(--color-bg)"
                d="M100 30c-14 0-25 16-25 40 0 5 1 10 3 14-4-3-9-5-14-5-3 0-5 3-4 6 3 8 9 15 16 18-5 4-8 10-8 17 0 12 10 22 22 22 3 0 6-1 8-2 0 5 1 9 2 13-5 2-9 6-9 12 0 7 6 12 12 12h6c1 4 6 7 11 7s10-3 11-7h6c6 0 12-5 12-12 0-6-4-10-9-12 1-4 2-8 2-13 2 1 5 2 8 2 12 0 22-10 22-22 0-7-3-13-8-17 7-3 13-10 16-18 1-3-1-6-4-6-5 0-10 2-14 5 2-4 3-9 3-14 0-24-11-40-25-40Z"
            />
        </svg>
    );
}
