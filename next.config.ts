import type { NextConfig } from "next";

const SUPABASE_HOST = 'qvpvfbjdtjfrqqjtjpvf.supabase.co';

// Em dev o Turbopack precisa de 'unsafe-eval' pro HMR; em produção não.
const scriptSrc = process.env.NODE_ENV === 'development'
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

// As diretivas exigem 'unsafe-inline' em style-src porque vários componentes
// usam style={{...}} (atributo inline), não só classes Tailwind -- sem isso
// o CSP quebraria esses estilos.
const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://" + SUPABASE_HOST,
  "font-src 'self'",
  "connect-src 'self' https://" + SUPABASE_HOST + " wss://" + SUPABASE_HOST + " https://viacep.com.br",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: SUPABASE_HOST,
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;
