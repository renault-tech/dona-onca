'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useProducts, categories } from '@/contexts/ProductContext';

export default function Home() {
  const { products, getProductsByCategory, loading } = useProducts();
  const activeProducts = products.filter(p => p.active);
  const featuredProducts = activeProducts.slice(0, 6);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="font-medium text-gray-500">Carregando Dona On├ºa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-brand-500">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          style={{
            backgroundImage: 'url("/onca-watermark.jpg")',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'invert(1) brightness(0.7) contrast(1000%)',
            mixBlendMode: 'screen',
            opacity: 0.2,
            transform: 'scale(1.1)',
          }}
        />

        {/* Overlay Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:30px_30px]" />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-4 text-5xl font-black text-white drop-shadow-2xl md:text-8xl lg:text-9xl">
            Dona On├ºa
          </h1>
          <p className="mb-8 max-w-2xl text-xl font-medium text-white/95 drop-shadow-lg md:text-2xl">
            Eleg├óncia e sensualidade em cada pe├ºa. <br className="hidden md:block" />
            Descubra nossa cole├º├úo exclusiva.
          </p>
          <Link
            href="/produtos"
            className="rounded-2xl bg-white px-10 py-4 text-lg font-bold text-brand-600 shadow-xl transition-all hover:scale-105 hover:bg-brand-50 hover:shadow-2xl active:scale-95"
          >
            Explorar Cole├º├úo
          </Link>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-full md:h-24"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Categorias
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((cat) => {
              const categoryProducts = getProductsByCategory(cat);
              const icons: Record<string, string> = {
                'Lingerie': '­ƒÆÄ',
                'Pijamas': '­ƒîÖ',
                'Praia/Piscina': '­ƒÅû´©Å',
                'Sexshop': '­ƒöÑ',
              };
              return (
                <Link
                  key={cat}
                  href={`/produtos?categoria=${encodeURIComponent(cat)}`}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 p-6 text-center transition-transform hover:scale-105"
                >
                  <div className="mb-4 flex h-16 w-full items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-200 text-2xl transition-colors group-hover:bg-brand-600">
                      {icons[cat] || 'Ô£¿'}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900">{cat}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {categoryProducts.length} {categoryProducts.length === 1 ? 'produto' : 'produtos'}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Destaques
            </h2>
            <Link
              href="/produtos"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Ver todos ÔåÆ
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <p className="text-gray-500">Nenhum produto cadastrado ainda.</p>
              <Link href="/admin/products/new" className="mt-4 inline-block text-brand-600 hover:underline">
                Adicionar primeiro produto ÔåÆ
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/produto/${product.id}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={product.images[0] || '/logo.png'}
                      alt={product.name}
                      fill
                      className="object-contain p-8 transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white">
                      {product.category}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="mb-1 font-medium text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-brand-600">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Receba Novidades
          </h2>
          <p className="mb-8 text-brand-100">
            Cadastre-se e seja a primeira a saber das nossas ofertas exclusivas
          </p>
          <form className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="rounded-xl px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 sm:w-80"
            />
            <button
              type="submit"
              className="rounded-xl bg-white px-8 py-4 font-semibold text-brand-600 transition-transform hover:scale-105"
            >
              Cadastrar
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Image
                src="/logo.png"
                alt="Dona On├ºa"
                width={48}
                height={48}
                className="mb-4 brightness-0 invert"
              />
              <p className="text-sm">
                Eleg├óncia e sensualidade em cada pe├ºa.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Categorias</h4>
              <ul className="space-y-2 text-sm">
                {categories.map((cat) => (
                  <li key={cat}>
                    <Link href={`/produtos?categoria=${encodeURIComponent(cat)}`} className="hover:text-white">
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Ajuda</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/trocas" className="hover:text-white">Trocas e Devolu├º├Áes</Link></li>
                <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Redes Sociais</h4>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white">Instagram</a>
                <a href="#" className="hover:text-white">WhatsApp</a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
            ┬® 2026 Dona On├ºa. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
