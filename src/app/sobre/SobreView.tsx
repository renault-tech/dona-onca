'use client';

import Image from 'next/image';
import { useProducts } from '@/contexts/ProductContext';
import BackButton from '@/components/BackButton';
import Reveal from '@/components/motion/Reveal';
import OncaMark from '@/components/brand/OncaMark';

export default function SobreView() {
    const { aboutContent } = useProducts();
    const { hero, story, values, team, contact } = aboutContent;

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative overflow-hidden py-20">
                <div className="absolute inset-0">
                    <Image
                        src="/header-bg-v2.png"
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover"
                        style={{ objectPosition: 'center top', filter: 'brightness(1.1)' }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to bottom,
                                rgba(5, 5, 5, 0.1) 0%,
                                rgba(5, 5, 5, 0.35) 55%,
                                rgba(5, 5, 5, 0.95) 100%)`,
                        }}
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-4xl px-4">
                    <div className="mb-8">
                        <BackButton fallbackHref="/" />
                    </div>

                    <div className="text-center">
                        <div className="relative mx-auto mb-8 h-32 w-32 overflow-hidden rounded-full border border-accent bg-surface">
                            {hero.image ? (
                                <Image src={hero.image} alt={hero.title} fill sizes="128px" className="object-contain p-3" priority />
                            ) : (
                                <OncaMark className="h-full w-full p-4 text-accent" />
                            )}
                        </div>

                        <Reveal>
                            <h1 className="font-display text-4xl italic text-fg md:text-5xl">{hero.title}</h1>
                        </Reveal>
                        <Reveal delay={100}>
                            <p className="mx-auto mt-4 max-w-2xl text-lg italic text-fg-muted">{hero.tagline}</p>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* História */}
            <section className="py-20">
                <div className="mx-auto max-w-3xl px-4">
                    <Reveal>
                        <h2 className="mb-8 text-center font-display text-3xl italic text-fg">Nossa História</h2>
                        <div className="space-y-4 whitespace-pre-wrap leading-relaxed text-fg-muted">{story}</div>
                    </Reveal>
                </div>
            </section>

            {/* Valores */}
            <section className="py-20">
                <div className="mx-auto max-w-5xl px-4">
                    <Reveal>
                        <h2 className="mb-12 text-center font-display text-3xl italic text-fg">Nossos Valores</h2>
                    </Reveal>
                    <div className="grid gap-6 md:grid-cols-3">
                        {values.map((value, idx) => (
                            <Reveal key={idx} delay={idx * 100}>
                                <div className="surface h-full p-6 text-center">
                                    <div className="mb-4 flex items-center justify-center">
                                        {value.image ? (
                                            <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border">
                                                <Image src={value.image} alt={value.title} fill sizes="64px" className="object-cover" />
                                            </div>
                                        ) : (
                                            <span className="text-4xl">{value.icon}</span>
                                        )}
                                    </div>
                                    <h3 className="mb-2 font-display text-xl italic text-fg">{value.title}</h3>
                                    <p className="text-sm text-fg-muted">{value.description}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Equipe */}
            <section className="py-20">
                <div className="mx-auto max-w-5xl px-4">
                    <Reveal>
                        <h2 className="mb-12 text-center font-display text-3xl italic text-fg">Nossa Equipe</h2>
                    </Reveal>
                    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                        {team.map((member, idx) => (
                            <Reveal key={idx} delay={idx * 80} className="text-center">
                                <div className="relative mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border border-border bg-surface">
                                    {member.image ? (
                                        <Image src={member.image} alt={member.name} fill sizes="112px" className="object-cover" />
                                    ) : (
                                        <OncaMark className="h-full w-full p-6 text-fg-subtle" />
                                    )}
                                </div>
                                <h3 className="font-medium text-fg">{member.name}</h3>
                                <p className="text-sm text-accent">{member.role}</p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contato */}
            <section className="py-20">
                <div className="mx-auto max-w-3xl px-4 text-center">
                    <Reveal>
                        <h2 className="mb-4 font-display text-3xl italic text-fg">Fale Conosco</h2>
                        <p className="mb-8 text-fg-muted">Estamos sempre prontas para ajudar você</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {contact.email && (
                                <a href={`mailto:${contact.email}`} className="btn btn-outline px-6 py-3 text-sm normal-case">
                                    {contact.email}
                                </a>
                            )}
                            {contact.whatsapp && (
                                <a
                                    href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline px-6 py-3 text-sm normal-case"
                                >
                                    WhatsApp
                                </a>
                            )}
                            {contact.instagram && (
                                <a
                                    href={`https://instagram.com/${contact.instagram.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline px-6 py-3 text-sm normal-case"
                                >
                                    @{contact.instagram.replace('@', '')}
                                </a>
                            )}
                        </div>
                    </Reveal>
                </div>
            </section>
        </div>
    );
}
