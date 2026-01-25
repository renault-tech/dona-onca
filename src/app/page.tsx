'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useProducts } from '@/contexts/ProductContext';
import FavoriteButton from '@/components/FavoriteButton';

export default function Home() {
  const { products, getProductsByCategory, loading, homeBanners } = useProducts();
  const activeProducts = products.filter(p => p.active);
  const featuredProducts = activeProducts.slice(0, 6);

  // Ordenar banners por order
  const sortedBanners = [...homeBanners].sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-[#d6008b]" />
          <p className="font-medium text-white/60">Carregando Dona Onça...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - COM imagem de fundo */}
      <section className="relative h-[90vh] min-h-[700px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/header-bg-v2.png"
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: 'center top' }}
            priority
          />
          {/* Gradient Overlay - fade to dark, but keep top more visible */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, 
                rgba(13, 3, 8, 0) 0%, 
                rgba(13, 3, 8, 0.2) 50%, 
                rgba(13, 3, 8, 0.6) 75%, 
                rgba(5, 5, 5, 1) 100%)`
            }}
          />
          {/* Side fades */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, 
                rgba(5, 5, 5, 0.8) 0%, 
                transparent 20%, 
                transparent 80%, 
                rgba(5, 5, 5, 0.8) 100%)`
            }}
          />
          {/* Reduce pink glow - darker overlay on top-left */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 0% 0%, rgba(5, 5, 5, 0.5) 0%, transparent 40%)`
            }}
          />
        </div>

        {/* Jaguar Watermark - Apenas silhueta, SEM fundo branco */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="relative w-[120%] h-[120%] opacity-[0.08]">
            <Image
              src="/onca-watermark.png"
              alt=""
              fill
              className="object-contain"
              style={{ objectPosition: 'center center' }}
              priority
            />
          </div>
        </div>

        {/* Vignette Effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.7) 100%)'
          }}
        />

        {/* Content - SEM logo, apenas texto */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center">
          <h1
            className="mb-6 text-4xl font-semibold text-white md:text-5xl lg:text-6xl tracking-wider leading-tight"
            style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
          >
            SENSUALIDADE
            <br />
            EM CADA DETALHE.
          </h1>

          {/* Botão com fundo rosa semi-transparente */}
          <Link
            href="/produtos"
            className="mt-4 px-10 py-4 text-sm md:text-base tracking-[0.2em] font-medium text-white uppercase rounded-full transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.4) 0%, rgba(214, 0, 139, 0.25) 100%)',
              border: '1px solid rgba(214, 0, 139, 0.6)',
              boxShadow: '0 0 20px rgba(214, 0, 139, 0.3)',
            }}
          >
            Explorar Coleção
          </Link>
        </div>

        {/* Gradient Fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050505] to-transparent" />
      </section>

      {/* Categories Section - Com banners editáveis */}
      <section className="relative py-20 overflow-hidden">
        {/* Background com silhueta da onça */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#050505]" />
          {/* Silhueta grande da onça no fundo */}
          <div className="absolute right-0 top-0 w-[60%] h-full opacity-[0.06] pointer-events-none">
            <Image
              src="/onca-watermark.png"
              alt=""
              fill
              className="object-contain object-right"
            />
          </div>
          {/* Glow rosa no centro inferior */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2"
            style={{
              background: 'radial-gradient(ellipse at center bottom, rgba(214, 0, 139, 0.15) 0%, transparent 70%)'
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4">
          {/* Círculos de categoria - Editáveis via admin */}
          <div className="flex justify-center gap-8 md:gap-16">
            {sortedBanners.map((banner) => (
              <Link
                key={banner.id}
                href={banner.link}
                className="group flex flex-col items-center"
              >
                {/* Circle Container com imagem */}
                <div
                  className="relative flex h-28 w-28 md:h-36 md:w-36 lg:h-44 lg:w-44 items-center justify-center rounded-full overflow-hidden transition-all duration-300 group-hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.2) 0%, rgba(26, 5, 16, 0.8) 100%)',
                    border: '2px solid #d6008b',
                    boxShadow: '0 0 25px rgba(214, 0, 139, 0.4), inset 0 0 30px rgba(214, 0, 139, 0.1)',
                  }}
                >
                  {/* Imagem do banner ou emoji fallback */}
                  {banner.image ? (
                    <>
                      <Image
                        src={banner.image}
                        alt={banner.name}
                        fill
                        className="object-cover"
                        style={{
                          // Filtro mais leve para manter lingeries mais visíveis
                          filter: 'brightness(0.85) saturate(1.15) contrast(1.05)',
                        }}
                      />
                      {/* Overlay rosa para harmonizar com o tema */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#d6008b]/20 to-transparent mix-blend-overlay" />
                    </>
                  ) : (
                    <span className="text-4xl md:text-5xl lg:text-6xl">
                      {banner.name === 'Lingerie' ? '👙' : banner.name === 'Toys' ? '💜' : '🕯️'}
                    </span>
                  )}

                  {/* Overlay rosa no hover */}
                  <div className="absolute inset-0 bg-[#d6008b]/0 group-hover:bg-[#d6008b]/30 transition-colors duration-300" />
                </div>

                {/* Nome da categoria */}
                <h3
                  className="mt-4 text-sm md:text-base font-medium text-white tracking-[0.15em] uppercase group-hover:text-[#d6008b] transition-colors"
                  style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                >
                  {banner.name}
                </h3>
              </Link>
            ))}
          </div>

          {/* Link para ver todas as categorias */}
          <div className="mt-12 text-center">
            <Link
              href="/produtos"
              className="text-sm text-white/50 hover:text-[#d6008b] transition-colors tracking-wide"
            >
              Ver todas as categorias →
            </Link>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 flex items-center justify-between">
            <h2
              className="text-2xl font-semibold text-white md:text-3xl tracking-wide"
              style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
            >
              Destaques
            </h2>
            <Link
              href="/produtos"
              className="font-medium text-[#d6008b] hover:text-white transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="rounded-2xl card-dark p-12 text-center">
              <p className="text-white/50">Nenhum produto cadastrado ainda.</p>
              <Link href="/admin/products/new" className="mt-4 inline-block text-[#d6008b] hover:underline">
                Adicionar primeiro produto →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/produto/${product.id}`}
                  className="group card-dark overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#1a0510]/50 to-transparent">
                    <Image
                      src={product.images[0] || '/logo.png'}
                      alt={product.name}
                      fill
                      className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                    />
                    <span className="absolute left-3 top-3 rounded-full border border-[#d6008b] bg-[#d6008b]/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {product.category}
                    </span>
                    <div className="absolute right-3 bottom-3 z-10">
                      <FavoriteButton productId={product.id} />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="mb-2 font-medium text-white line-clamp-2 group-hover:text-[#d6008b] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold text-[#d6008b]">
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
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a0510]/30 to-transparent" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h2
            className="mb-4 text-3xl font-semibold text-white tracking-wide"
            style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
          >
            Receba Novidades
          </h2>
          <p className="mb-8 text-white/60">
            Cadastre-se e seja a primeira a saber das nossas ofertas exclusivas
          </p>
          <form className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="input-dark px-6 py-4 sm:w-80"
            />
            <button
              type="submit"
              className="px-8 py-4 rounded-full text-white font-medium tracking-wide transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.5) 0%, rgba(214, 0, 139, 0.3) 100%)',
                border: '1px solid rgba(214, 0, 139, 0.6)',
                boxShadow: '0 0 15px rgba(214, 0, 139, 0.3)',
              }}
            >
              Cadastrar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

