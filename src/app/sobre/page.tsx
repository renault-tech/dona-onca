'use client';

import Image from 'next/image';
import { useProducts } from '@/contexts/ProductContext';
import BackButton from '@/components/BackButton';

export default function AboutPage() {
    const { aboutContent } = useProducts();
    const { hero, story, values, team, contact } = aboutContent;

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative py-20 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="/header-bg-v2.png"
                        alt=""
                        fill
                        className="object-cover"
                        style={{ objectPosition: 'center top', filter: 'brightness(1.1)' }}
                    />
                    {/* Gradient Overlay - lighter at top to show image */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to bottom, 
                                rgba(13, 3, 8, 0) 0%, 
                                rgba(13, 3, 8, 0.1) 40%, 
                                rgba(13, 3, 8, 0.3) 70%, 
                                rgba(5, 5, 5, 0.95) 100%)`
                        }}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-4xl px-4">
                    {/* Back Button */}
                    <div className="mb-8">
                        <BackButton fallbackHref="/" />
                    </div>

                    <div className="text-center">
                        {/* Logo/Image */}
                        <div
                            className="relative h-36 w-36 mx-auto mb-8 rounded-full overflow-hidden flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.2) 0%, rgba(26, 5, 16, 0.8) 100%)',
                                border: '2px solid #d6008b',
                                boxShadow: '0 0 30px rgba(214, 0, 139, 0.4)',
                            }}
                        >
                            {hero.image ? (
                                <Image
                                    src={hero.image}
                                    alt={hero.title}
                                    fill
                                    className="object-contain p-2"
                                    priority
                                />
                            ) : (
                                <Image
                                    src="/onca-watermark.png"
                                    alt="Dona Onça"
                                    fill
                                    className="object-contain p-2"
                                    style={{ filter: 'drop-shadow(0 0 10px rgba(214, 0, 139, 0.5))' }}
                                    priority
                                />
                            )}
                        </div>

                        <h1
                            className="text-4xl font-bold text-white md:text-5xl tracking-wide"
                            style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                        >
                            {hero.title}
                        </h1>
                        <p className="mt-4 text-xl text-white/60 font-medium italic max-w-2xl mx-auto">
                            {hero.tagline}
                        </p>
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="py-16">
                <div className="mx-auto max-w-3xl px-4">
                    <h2
                        className="mb-8 text-center text-3xl font-bold text-white tracking-wide"
                        style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                    >
                        Nossa História
                    </h2>
                    <div className="space-y-4 text-white/70 whitespace-pre-wrap leading-relaxed">
                        {story}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 relative">
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to bottom, transparent, rgba(214, 0, 139, 0.05), transparent)'
                    }}
                />
                <div className="relative z-10 mx-auto max-w-5xl px-4">
                    <h2
                        className="mb-12 text-center text-3xl font-bold text-white tracking-wide"
                        style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                    >
                        Nossos Valores
                    </h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        {values.map((value, idx) => (
                            <div
                                key={idx}
                                className="card-dark p-6 text-center hover:border-[#d6008b]/50 transition-all"
                            >
                                <div className="mb-4 flex items-center justify-center">
                                    {value.image ? (
                                        <div
                                            className="relative h-16 w-16 overflow-hidden rounded-xl"
                                            style={{ border: '1px solid rgba(214, 0, 139, 0.3)' }}
                                        >
                                            <Image src={value.image} alt={value.title} fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <span className="text-4xl">{value.icon}</span>
                                    )}
                                </div>
                                <h3
                                    className="mb-2 text-xl font-bold text-white"
                                    style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                                >
                                    {value.title}
                                </h3>
                                <p className="text-white/60">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-16">
                <div className="mx-auto max-w-5xl px-4">
                    <h2
                        className="mb-12 text-center text-3xl font-bold text-white tracking-wide"
                        style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                    >
                        Nossa Equipe
                    </h2>
                    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                        {team.map((member, idx) => (
                            <div key={idx} className="text-center group">
                                <div
                                    className="mx-auto mb-4 relative h-32 w-32 overflow-hidden rounded-full flex items-center justify-center transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.2) 0%, rgba(26, 5, 16, 0.6) 100%)',
                                        border: '2px solid rgba(214, 0, 139, 0.3)',
                                    }}
                                >
                                    {member.image ? (
                                        <Image src={member.image} alt={member.name} fill className="object-cover" />
                                    ) : (
                                        <span className="text-4xl">👩</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-white">{member.name}</h3>
                                <p className="text-sm text-[#d6008b]">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="py-16 relative">
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to bottom, transparent, rgba(214, 0, 139, 0.1))'
                    }}
                />
                <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
                    <h2
                        className="mb-4 text-3xl font-bold text-white tracking-wide"
                        style={{ fontFamily: 'var(--font-cinzel), Cinzel, serif' }}
                    >
                        Fale Conosco
                    </h2>
                    <p className="mb-8 text-white/60">
                        Estamos sempre prontas para ajudar você
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {contact.email && (
                            <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-2 px-6 py-3 rounded-full text-white transition-all hover:scale-105"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.3) 0%, rgba(214, 0, 139, 0.15) 100%)',
                                    border: '1px solid rgba(214, 0, 139, 0.4)',
                                }}
                            >
                                📧 {contact.email}
                            </a>
                        )}
                        {contact.whatsapp && (
                            <a
                                href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 rounded-full text-white transition-all hover:scale-105"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.3) 0%, rgba(214, 0, 139, 0.15) 100%)',
                                    border: '1px solid rgba(214, 0, 139, 0.4)',
                                }}
                            >
                                📱 WhatsApp
                            </a>
                        )}
                        {contact.instagram && (
                            <a
                                href={`https://instagram.com/${contact.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 rounded-full text-white transition-all hover:scale-105"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.3) 0%, rgba(214, 0, 139, 0.15) 100%)',
                                    border: '1px solid rgba(214, 0, 139, 0.4)',
                                }}
                            >
                                📸 @{contact.instagram.replace('@', '')}
                            </a>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
