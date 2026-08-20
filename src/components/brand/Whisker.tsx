import { SVGProps } from 'react';

/**
 * A curva de um bigode de onça — usada como sublinhado de gesto (nav links,
 * títulos de seção). Desenhada para ser esticada via `preserveAspectRatio="none"`
 * e animada com stroke-dashoffset no hover.
 */
export default function Whisker(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 100 12"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M1 9c14-10 28-10 39-2 12 9 27 9 40-2 8-6 15-6 19-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}
