'use client';

import Image from 'next/image';
import { useProducts } from '@/contexts/ProductContext';

export default function AboutPage() {
    const { aboutContent } = useProducts();
    const { hero, story, values, team, contact } = aboutContent;

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-brand-700 to-brand-500 py-10 px-4">
                <div className="mx-auto max-w-4xl text-center text-white">

                    {/* White square with jaguar image */}
                    <div className="relative h-40 w-40 mx-auto mb-8 bg-white p-2 rounded-2xl shadow-lg">
                        <div className="relative h-full w-full overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
                            {hero.image ? (
                                <Image
                                    src={hero.image}
                                    alt={hero.title}
                                    fill
                                    className="object-contain p-1"
                                    priority
                                />
                            ) : (
                                <Image
                                    src="/onca-watermark.png"
                                    alt="Dona Onça"
                                    fill
                                    className="object-contain p-1"
                                    priority
                                />
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-extrabold md:text-5xl tracking-tight leading-tight">
                            {hero.title}
                        </h1>
                        <p className="text-xl text-brand-100 font-medium max-w-2xl mx-auto italic">
                            {hero.tagline}
                        </p>
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-3xl px-4">
                    <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">Nossa História</h2>
                    <div className="space-y-4 text-gray-600 whitespace-pre-wrap">
                        {story}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gray-50 py-16">
                <div className="mx-auto max-w-5xl px-4">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Nossos Valores</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        {values.map((value, idx) => (
                            <div key={idx} className="rounded-2xl bg-white p-6 text-center shadow-sm border border-transparent hover:border-brand-200 transition-all">
                                <div className="mb-4 flex items-center justify-center">
                                    {value.image ? (
                                        <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                                            <Image src={value.image} alt={value.title} fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <span className="text-4xl">{value.icon}</span>
                                    )}
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-gray-900">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-5xl px-4">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Nossa Equipe</h2>
                    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                        {team.map((member, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="mx-auto mb-4 relative h-32 w-32 overflow-hidden rounded-full bg-brand-100 flex items-center justify-center border-2 border-transparent group-hover:border-brand-500 transition-all">
                                    {member.image ? (
                                        <Image src={member.image} alt={member.name} fill className="object-cover" />
                                    ) : (
                                        <span className="text-4xl text-brand-600">👩</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900">{member.name}</h3>
                                <p className="text-sm text-gray-500">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="bg-brand-600 py-16">
                <div className="mx-auto max-w-3xl px-4 text-center text-white">
                    <h2 className="mb-4 text-3xl font-bold">Fale Conosco</h2>
                    <p className="mb-8 text-brand-100">
                        Estamos sempre prontas para ajudar você
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        {contact.email && (
                            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors">
                                📧 {contact.email}
                            </a>
                        )}
                        {contact.whatsapp && (
                            <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors">
                                📱 WhatsApp
                            </a>
                        )}
                        {contact.instagram && (
                            <a href={`https://instagram.com/${contact.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors">
                                📸 @{contact.instagram.replace('@', '')}
                            </a>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
