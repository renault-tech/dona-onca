import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required in environment variables');
}

// createBrowserClient (em vez do createClient genérico) guarda a sessão em
// cookies, não só em localStorage -- é o que permite o middleware.ts ler a
// sessão no servidor antes de renderizar rotas protegidas como /admin.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
