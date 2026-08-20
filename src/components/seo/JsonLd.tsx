/**
 * Renderiza um bloco JSON-LD. Server component simples -- sem 'use client',
 * para o script sair no HTML da resposta inicial (e ser lido por crawlers
 * que não executam JS).
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
