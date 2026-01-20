'use client';

import { useState } from 'react';
import { useProducts, AboutContent } from '@/contexts/ProductContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

export default function ManageAboutPage() {
    const { aboutContent, updateAboutContent } = useProducts();
    const [content, setContent] = useState<AboutContent>(aboutContent);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateAboutContent(content);
            alert('Conteúdo atualizado com sucesso!');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Erro ao salvar conteúdo.');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (file: File, type: 'hero' | 'team' | 'value', index?: number) => {
        setUploading(type + (index !== undefined ? index : ''));
        try {
            const fileName = `${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);

            if (type === 'hero') {
                setContent({ ...content, hero: { ...content.hero, image: publicUrl } });
            } else if (type === 'team' && index !== undefined) {
                const newTeam = [...content.team];
                newTeam[index].image = publicUrl;
                setContent({ ...content, team: newTeam });
            } else if (type === 'value' && index !== undefined) {
                const newValues = [...content.values];
                newValues[index].image = publicUrl;
                setContent({ ...content, values: newValues });
            }
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Erro ao fazer upload da imagem.');
        } finally {
            setUploading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-5xl px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-gray-400 hover:text-gray-600">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h1 className="text-xl font-bold text-gray-900">Gerenciar Página Sobre</h1>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-700 disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
                {/* Hero Section */}
                <section className="rounded-2xl bg-white p-6 shadow-sm border border-brand-100">
                    <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">✨</span> Hero (Topo da Página)
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Título Principal</label>
                                <input
                                    type="text"
                                    value={content.hero.title}
                                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-brand-500 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tagline (Subtítulo)</label>
                                <input
                                    type="text"
                                    value={content.hero.tagline}
                                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, tagline: e.target.value } })}
                                    className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-brand-500 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Enquadramento da Foto</label>
                                <div className="mt-2 flex gap-2">
                                    {[
                                        { value: 'object-top', label: 'Topo' },
                                        { value: 'object-center', label: 'Centro' },
                                        { value: 'object-bottom', label: 'Base' },
                                        { value: 'object-contain', label: 'Ajustar (Sem Cortar)' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setContent({ ...content, hero: { ...content.hero, alignment: opt.value as any } })}
                                            className={`flex-1 rounded-lg border py-2 text-[10px] font-bold transition-all ${content.hero.alignment === opt.value
                                                    ? 'border-brand-600 bg-brand-50 text-brand-600'
                                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="relative group aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center overflow-hidden transition-colors hover:border-brand-300">
                            {content.hero.image ? (
                                <>
                                    <Image
                                        src={content.hero.image}
                                        alt="Hero"
                                        fill
                                        className={`opacity-80 ${content.hero.alignment === 'object-contain' ? 'object-contain bg-gray-100' : `object-cover ${content.hero.alignment}`}`}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand-600">
                                            Alterar Imagem
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'hero')}
                                            />
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-2">
                                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span className="text-xs font-medium text-gray-500">Upload de Foto do Topo</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'hero')}
                                    />
                                </label>
                            )}
                            {uploading === 'hero' && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Our Story */}
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">📖</span> Nossa História
                    </h2>
                    <textarea
                        rows={6}
                        value={content.story}
                        onChange={(e) => setContent({ ...content, story: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:ring-brand-500"
                        placeholder="Conte a história da sua marca..."
                    />
                </section>

                {/* Values Section */}
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">💎</span> Nossos Valores
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {content.values.map((v, i) => (
                            <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                                <div className="flex gap-2">
                                    <div className="relative group h-12 w-12 shrink-0 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                                        {v.image ? (
                                            <Image src={v.image} alt={v.title} fill className="object-cover" />
                                        ) : (
                                            <span className="text-xl">{v.icon}</span>
                                        )}
                                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            </svg>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'value', i)}
                                            />
                                        </label>
                                        {uploading === 'value' + i && (
                                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <input
                                            type="text"
                                            placeholder="🚀"
                                            value={v.icon}
                                            onChange={(e) => {
                                                const newVals = [...content.values];
                                                newVals[i].icon = e.target.value;
                                                setContent({ ...content, values: newVals });
                                            }}
                                            className="w-full text-center rounded-lg border border-gray-300 py-0.5 text-xs"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Título"
                                            value={v.title}
                                            onChange={(e) => {
                                                const newVals = [...content.values];
                                                newVals[i].title = e.target.value;
                                                setContent({ ...content, values: newVals });
                                            }}
                                            className="w-full rounded-lg border border-gray-300 px-2 py-0.5 text-sm font-bold"
                                        />
                                    </div>
                                </div>
                                <textarea
                                    rows={2}
                                    placeholder="Descrição"
                                    value={v.description}
                                    onChange={(e) => {
                                        const newVals = [...content.values];
                                        newVals[i].description = e.target.value;
                                        setContent({ ...content, values: newVals });
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Team Section */}
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-2xl">👩‍💻</span> Nossa Equipe
                        </h2>
                        <button
                            onClick={() => setContent({ ...content, team: [...content.team, { name: '', role: '', image: '' }] })}
                            className="text-sm font-bold text-brand-600 hover:text-brand-700"
                        >
                            + Adicionar Membro
                        </button>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {content.team.map((member, i) => (
                            <div key={i} className="relative group rounded-2xl border border-gray-100 p-4 pt-10">
                                <button
                                    onClick={() => setContent({ ...content, team: content.team.filter((_, idx) => idx !== i) })}
                                    className="absolute right-2 top-2 text-gray-400 hover:text-red-500"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <div className="mb-4 flex flex-col items-center">
                                    <div className="relative h-24 w-24 overflow-hidden rounded-full bg-brand-50 flex items-center justify-center border-2 border-brand-100 group-hover:border-brand-500 transition-colors">
                                        {member.image ? (
                                            <Image src={member.image} alt={member.name} fill className="object-cover" />
                                        ) : (
                                            <span className="text-2xl">👩</span>
                                        )}
                                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            </svg>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'team', i)}
                                            />
                                        </label>
                                        {uploading === 'team' + i && (
                                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Nome"
                                        value={member.name}
                                        onChange={(e) => {
                                            const newTeam = [...content.team];
                                            newTeam[i].name = e.target.value;
                                            setContent({ ...content, team: newTeam });
                                        }}
                                        className="w-full text-center text-sm font-bold border-b border-gray-200 focus:border-brand-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Cargo"
                                        value={member.role}
                                        onChange={(e) => {
                                            const newTeam = [...content.team];
                                            newTeam[i].role = e.target.value;
                                            setContent({ ...content, team: newTeam });
                                        }}
                                        className="w-full text-center text-xs text-gray-500 border-none focus:ring-0"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact Section */}
                <section className="rounded-2xl bg-white p-6 shadow-sm border border-brand-100">
                    <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">📞</span> Fale Conosco & Redes
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase">E-mail</label>
                            <input
                                type="email"
                                value={content.contact.email}
                                onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase">WhatsApp (Número com DDD)</label>
                            <input
                                type="text"
                                value={content.contact.whatsapp}
                                onChange={(e) => setContent({ ...content, contact: { ...content.contact, whatsapp: e.target.value } })}
                                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase">Instagram (Usuário)</label>
                            <div className="mt-1 flex items-center">
                                <span className="rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">@</span>
                                <input
                                    type="text"
                                    value={content.contact.instagram}
                                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, instagram: e.target.value } })}
                                    className="w-full rounded-r-xl border border-gray-300 px-4 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
