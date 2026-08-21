// Cálculo de frete compartilhado entre /produto/[id] (novo, Fase 6) e /sacola
// (já existia, mas com a lógica duplicada inline). Consulta o ViaCEP para
// achar o estado e aplica uma tabela simples por região -- é uma estimativa,
// não uma integração real com transportadora.

export interface ShippingResult {
    value: number;
    uf: string;
}

/** Busca o estado (UF) a partir de um CEP via ViaCEP. Retorna null se inválido. */
export async function lookupCepState(cep: string): Promise<string | null> {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return null;

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    if (data.erro) return null;
    return data.uf as string;
}

/** Estima o valor do frete por estado, com frete grátis acima de R$ 199. */
export function estimateShippingByUf(uf: string, subtotal: number): number {
    if (uf === 'SP') return subtotal >= 199 ? 0 : 15.9;
    if (['RJ', 'MG', 'ES'].includes(uf)) return subtotal >= 199 ? 0 : 19.9;
    if (['RS', 'SC', 'PR'].includes(uf)) return subtotal >= 199 ? 0 : 22.9;
    return subtotal >= 199 ? 0 : 29.9;
}

/** Busca o CEP e já devolve o frete estimado. Lança em CEP inválido. */
export async function calculateShippingByCep(cep: string, subtotal: number): Promise<ShippingResult> {
    const uf = await lookupCepState(cep);
    if (!uf) throw new Error('CEP não encontrado');
    return { value: estimateShippingByUf(uf, subtotal), uf };
}
