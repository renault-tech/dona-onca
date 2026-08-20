// Leituras de catálogo do lado do servidor (Server Components, generateMetadata,
// sitemap.ts). Deliberadamente NÃO usa @supabase/supabase-js: o cliente em
// src/lib/supabase.ts lança em escopo de módulo se as env vars faltarem, o que
// derrubaria o build inteiro. Aqui usamos `fetch` cru contra o PostgREST do
// Supabase, participamos do Data Cache do Next (`next.revalidate`) e toda
// função devolve um valor "vazio" seguro em vez de propagar erro.

import { type Product, mapRowToProduct } from '@/lib/catalog';

const REVALIDATE_SECONDS = 300;

function restConfig() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return { url, key };
}

async function restFetch(path: string): Promise<unknown[] | null> {
    const config = restConfig();
    if (!config) return null;

    try {
        const res = await fetch(`${config.url}/rest/v1/${path}`, {
            headers: {
                apikey: config.key,
                Authorization: `Bearer ${config.key}`,
            },
            next: { revalidate: REVALIDATE_SECONDS },
        });
        if (!res.ok) return null;
        return (await res.json()) as unknown[];
    } catch {
        return null;
    }
}

/** Busca um único produto por id. Retorna null se não existir ou em erro. */
export async function getProductByIdServer(id: number): Promise<Product | null> {
    if (!Number.isFinite(id)) return null;
    const rows = await restFetch(`products?id=eq.${id}&select=*&limit=1`);
    if (!rows || rows.length === 0) return null;
    return mapRowToProduct(rows[0]);
}

/** Busca todos os produtos ativos, mais recentes primeiro. Retorna [] em erro. */
export async function getActiveProductsServer(): Promise<Product[]> {
    const rows = await restFetch('products?active=eq.true&select=*&order=created_at.desc');
    if (!rows) return [];
    return rows.map(mapRowToProduct);
}
