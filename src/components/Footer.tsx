'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface FooterSettings {
    facebook_enabled: boolean;
    facebook_url: string;
    instagram_enabled: boolean;
    instagram_url: string;
    twitter_enabled: boolean;
    twitter_url: string;
    youtube_enabled: boolean;
    youtube_url: string;
    whatsapp_enabled: boolean;
    whatsapp_url: string;
    help_contact_enabled: boolean;
    help_faq_enabled: boolean;
    help_terms_enabled: boolean;
}

const defaultSettings: FooterSettings = {
    facebook_enabled: false,
    facebook_url: '',
    instagram_enabled: true,
    instagram_url: '',
    twitter_enabled: false,
    twitter_url: '',
    youtube_enabled: false,
    youtube_url: '',
    whatsapp_enabled: true,
    whatsapp_url: '',
    help_contact_enabled: true,
    help_faq_enabled: true,
    help_terms_enabled: true,
};

export default function Footer() {
    const [settings, setSettings] = useState<FooterSettings>(defaultSettings);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const { data } = await supabase
                    .from('site_settings')
                    .select('*')
                    .eq('id', 'main')
                    .maybeSingle();

                if (data) {
                    setSettings({
                        facebook_enabled: data.facebook_enabled ?? false,
                        facebook_url: data.facebook_url ?? '',
                        instagram_enabled: data.instagram_enabled ?? true,
                        instagram_url: data.instagram_url ?? '',
                        twitter_enabled: data.twitter_enabled ?? false,
                        twitter_url: data.twitter_url ?? '',
                        youtube_enabled: data.youtube_enabled ?? false,
                        youtube_url: data.youtube_url ?? '',
                        whatsapp_enabled: data.whatsapp_enabled ?? true,
                        whatsapp_url: data.whatsapp_url ?? '',
                        help_contact_enabled: data.help_contact_enabled ?? true,
                        help_faq_enabled: data.help_faq_enabled ?? true,
                        help_terms_enabled: data.help_terms_enabled ?? true,
                    });
                }
            } catch (error) {
                console.warn('Could not load footer settings, using defaults');
            }
        };
        loadSettings();
    }, []);

    const getInstagramUrl = () => {
        if (!settings.instagram_url) return '#';
        if (settings.instagram_url.startsWith('http')) return settings.instagram_url;
        return `https://instagram.com/${settings.instagram_url.replace('@', '')}`;
    };

    const getWhatsAppUrl = () => {
        if (!settings.whatsapp_url) return '#';
        const number = settings.whatsapp_url.replace(/\D/g, '');
        return `https://wa.me/55${number}`;
    };

    return (
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
                    {/* Logo e slogan */}
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
                            {settings.help_contact_enabled && (
                                <li><Link href="/contato" className="hover:text-[#d6008b] transition-colors">Contato</Link></li>
                            )}
                            {settings.help_faq_enabled && (
                                <li><Link href="/faq" className="hover:text-[#d6008b] transition-colors">Central de Ajuda</Link></li>
                            )}
                            {settings.help_terms_enabled && (
                                <li><Link href="/termos" className="hover:text-[#d6008b] transition-colors">Termos de Uso</Link></li>
                            )}
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
                            {settings.facebook_enabled && (
                                <a
                                    href={settings.facebook_url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6008b] text-[#d6008b] hover:bg-[#d6008b] hover:text-white transition-all"
                                    aria-label="Facebook"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                            )}
                            {/* Twitter */}
                            {settings.twitter_enabled && (
                                <a
                                    href={settings.twitter_url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6008b] text-[#d6008b] hover:bg-[#d6008b] hover:text-white transition-all"
                                    aria-label="Twitter"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                    </svg>
                                </a>
                            )}
                            {/* Instagram */}
                            {settings.instagram_enabled && (
                                <a
                                    href={getInstagramUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6008b] text-[#d6008b] hover:bg-[#d6008b] hover:text-white transition-all"
                                    aria-label="Instagram"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                                    </svg>
                                </a>
                            )}
                            {/* YouTube */}
                            {settings.youtube_enabled && (
                                <a
                                    href={settings.youtube_url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6008b] text-[#d6008b] hover:bg-[#d6008b] hover:text-white transition-all"
                                    aria-label="YouTube"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                            )}
                            {/* WhatsApp */}
                            {settings.whatsapp_enabled && (
                                <a
                                    href={getWhatsAppUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6008b] text-[#d6008b] hover:bg-[#d6008b] hover:text-white transition-all"
                                    aria-label="WhatsApp"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/40">
                    © Copyright 2026. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
