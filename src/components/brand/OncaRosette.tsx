import { SVGProps } from 'react';

/**
 * A "pinta" da onça — rosette extraída da logo, usada como divisor de seção,
 * marcador de lista, indicador de slide ativo e spinner de carregamento.
 * Substitui os pontos/bullets genéricos por um elemento de marca próprio.
 */
export default function OncaRosette(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path
                fill="currentColor"
                d="M12 2c1.8 0 3.3 1.9 3.9 4.6 1.2-1.9 3.1-3 4.7-2.6.9.2 1.1 1.4.4 2-1.4 1.2-2.4 2.9-2.7 4.7 1.9.5 3.4 1.9 3.9 3.7.3 1-.6 1.9-1.6 1.6-1.8-.5-3.7-.1-5.1 1 .8 1.1 1.2 2.5 1.2 4 0 1-1.1 1.6-1.9 1-1.3-.9-3-1.4-4.8-1.4s-3.5.5-4.8 1.4c-.8.6-1.9 0-1.9-1 0-1.5.4-2.9 1.2-4-1.4-1.1-3.3-1.5-5.1-1-1 .3-1.9-.6-1.6-1.6.5-1.8 2-3.2 3.9-3.7-.3-1.8-1.3-3.5-2.7-4.7-.7-.6-.5-1.8.4-2 1.6-.4 3.5.7 4.7 2.6C8.7 3.9 10.2 2 12 2Z"
            />
        </svg>
    );
}
