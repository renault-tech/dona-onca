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
          {/* Gradient Overlay - fade to dark */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, 
                rgba(13, 3, 8, 0) 0%, 
                rgba(13, 3, 8, 0.3) 40%, 
                rgba(13, 3, 8, 0.7) 70%, 
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
                          // Filtro automático para adequar ao tema dark
                          filter: 'brightness(0.7) saturate(1.2)',
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

      {/* Footer */}
      <footer className="relative border-t border-[#d6008b]/30 bg-black py-12 text-white/60">
        {/* Glow rosa no topo */}
        <div
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(214, 0, 139, 0.1) 0%, transparent 100%)'
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Logo e slogan - usando watermark ao invés de logo com fundo branco */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative h-12 w-12">
                  <Image
                    src="/onca-watermark.png"
                    alt="Dona Onça"
                    fill
                    className="object-contain"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(214, 0, 139, 0.5))' }}
                  />
                </div>
                <span
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                >
                  Dona Onça
                </span>
              </div>
              <p className="text-sm uppercase tracking-wider text-white/50">
                A sua nova experiência de luxo.
              </p>
            </div>

            {/* Navegação */}
            <div>
              <h4
                className="mb-4 font-semibold text-white"
                style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
              >
                Navegação
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/produtos?categoria=Lingerie" className="hover:text-[#d6008b] transition-colors">Lingeries</Link></li>
                <li><Link href="/produtos?categoria=Sexshop" className="hover:text-[#d6008b] transition-colors">Toys</Link></li>
                <li><Link href="/produtos" className="hover:text-[#d6008b] transition-colors">Todos os Produtos</Link></li>
              </ul>
            </div>

            {/* Ajuda */}
            <div>
              <h4
                className="mb-4 font-semibold text-white"
                style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
              >
                Ajuda
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contato" className="hover:text-[#d6008b] transition-colors">Contato</Link></li>
                <li><Link href="/faq" className="hover:text-[#d6008b] transition-colors">Central de Ajuda</Link></li>
                <li><Link href="/termos" className="hover:text-[#d6008b] transition-colors">Termos de Uso</Link></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4
                className="mb-4 font-semibold text-white"
                style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
              >
                Social
              </h4>
              <div className="flex gap-3">
                {/* Facebook */}
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6008b] text-[#d6008b] hover:bg-[#d6008b] hover:text-white transition-all"
                  aria-label="Facebook"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                {/* Twitter */}
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6008b] text-[#d6008b] hover:bg-[#d6008b] hover:text-white transition-all"
                  aria-label="Twitter"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6008b] text-[#d6008b] hover:bg-[#d6008b] hover:text-white transition-all"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6008b] text-[#d6008b] hover:bg-[#d6008b] hover:text-white transition-all"
                  aria-label="YouTube"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/40">
            © Copyright 2026. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
