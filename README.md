# Dona Onça

E-commerce de lingerie, moda íntima e lifestyle. Next.js (App Router) + Supabase.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (config CSS-first em `src/app/globals.css`, sem `tailwind.config`)
- **Supabase** (`@supabase/supabase-js`) para auth, banco e storage de imagens

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Crie um `.env.local` na raiz com:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

## Scripts

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção
- `npm run start` — serve o build de produção
- `npm run lint` — ESLint

## Estrutura

- `src/app` — rotas (App Router), incluindo a vitrine pública, a área do cliente (`/conta`, `/minha-conta`) e o painel administrativo (`/admin`)
- `src/components` — componentes de UI compartilhados
- `src/contexts` — estado de autenticação, carrinho, favoritos e catálogo
- `src/lib` — cliente Supabase e utilitários
- `scripts/` — scripts SQL auxiliares

## Deploy

Hospedado na [Vercel](https://vercel.com), com deploy automático por branch.
