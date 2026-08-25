import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase-middleware';

/**
 * Protege /admin no servidor. Antes disso, a única barreira era o
 * AdminGuard client-side (useEffect que redireciona depois de montar) --
 * o HTML e os dados da página chegavam ao navegador antes da checagem
 * rodar. Aqui a sessão é validada e o role é conferido antes de a rota
 * ser renderizada.
 */
export async function middleware(request: NextRequest) {
    const { supabase, response } = createMiddlewareClient(request);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        const redirectUrl = new URL('/conta', request.url);
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.is_admin) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
}

export const config = {
    matcher: ['/admin', '/admin/:path*'],
};
