import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Client Supabase para uso dentro do middleware. Lê/escreve a sessão via
 * cookies da requisição -- é o contraponto server-side do client de
 * @/lib/supabase (que usa createBrowserClient, guardando a mesma sessão
 * em cookies no navegador).
 */
export function createMiddlewareClient(request: NextRequest) {
    const response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                },
            },
        }
    );

    return { supabase, response };
}
