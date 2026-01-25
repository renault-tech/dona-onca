'use client';

import { useState, useEffect } from 'react';
import { useProducts, AboutContent, HomeBanner } from '@/contexts/ProductContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

type Tab = 'sobre' | 'banners' | 'rodape';

export default function SiteSettingsPage() {
    const { aboutContent, updateAboutContent, homeBanners, updateHomeBanners } = useProducts();
    const [activeTab, setActiveTab] = useState<Tab>('sobre');
    const [content, setContent] = useState<AboutContent>(aboutContent);
    const [banners, setBanners] = useState<HomeBanner[]>(homeBanners);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    // Sync with context when it loads
    useEffect(() => {
        setContent(aboutContent);
    }, [aboutContent]);

    useEffect(() => {
        setBanners(homeBanners);
    }, [homeBanners]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (activeTab === 'sobre') {
                await updateAboutContent(content);
            } else {
                await updateHomeBanners(banners);
            }
            alert('Alterações salvas com sucesso!');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (file: File, type: 'hero' | 'team' | 'value' | 'banner', index?: number, bannerId?: string) => {
        const uploadKey = type + (index !== undefined ? index : '') + (bannerId || '');
        setUploading(uploadKey);
        try {
            const sanitizedName = file.name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9.]/g, '_');
            const folder = type === 'banner' ? 'banners' : 'about';
            const fileName = `${folder}/${Date.now()}-${sanitizedName}`;

            const { error } = await supabase.storage
                .from('product-images')
                .upload(fileName, file, { contentType: file.type, upsert: true });

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
            } else if (type === 'banner' && bannerId) {
                setBanners(prev => prev.map(b => b.id === bannerId ? { ...b, image: publicUrl } : b));
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`Erro ao fazer upload: ${error?.message || error}`);
        } finally {
            setUploading(null);
        }
    };

    // Banner functions
    const updateBanner = (id: string, field: keyof HomeBanner, value: string | number) => {
        setBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const addBanner = () => {
        setBanners([...banners, {
            id: Date.now().toString(),
            name: 'Nova Categoria',
            image: '',
            link: '/produtos',
            order: banners.length + 1,
        }]);
    };

    const removeBanner = (id: string) => {
        setBanners(prev => prev.filter(b => b.id !== id));
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
                            <h1 className="text-xl font-bold text-gray-900">Configurações do Site</h1>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-700 disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => setActiveTab('sobre')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'sobre'
                                ? 'bg-brand-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            📖 Página Sobre
                        </button>
                        <button
                            onClick={() => setActiveTab('banners')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'banners'
                                ? 'bg-brand-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            🖼️ Banners da Home
                        </button>
                        <button
                            onClick={() => setActiveTab('rodape')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'rodape'
                                ? 'bg-brand-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            📍 Rodapé
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8 admin-form">
                {activeTab === 'sobre' ? (
                    /* ========== SOBRE TAB ========== */
                    <div className="space-y-8">
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
                                </div>
                                <div className="relative group aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                    {content.hero.image ? (
                                        <>
                                            <Image src={content.hero.image} alt="Hero" fill className="object-cover opacity-80" />
                                            <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand-600">Alterar Imagem</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'hero')} />
                                            </label>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-2">
                                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            <span className="text-xs font-medium text-gray-500">Upload de Foto</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'hero')} />
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

                        {/* Story Section */}
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
                                <span className="text-xs text-gray-500">Arraste para reordenar</span>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                                {content.team.map((member, i) => (
                                    <div
                                        key={i}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('text/plain', i.toString());
                                            e.currentTarget.classList.add('opacity-50');
                                        }}
                                        onDragEnd={(e) => {
                                            e.currentTarget.classList.remove('opacity-50');
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.add('ring-2', 'ring-brand-500');
                                        }}
                                        onDragLeave={(e) => {
                                            e.currentTarget.classList.remove('ring-2', 'ring-brand-500');
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.remove('ring-2', 'ring-brand-500');
                                            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                            const toIndex = i;
                                            if (fromIndex !== toIndex) {
                                                const newTeam = [...content.team];
                                                const [moved] = newTeam.splice(fromIndex, 1);
                                                newTeam.splice(toIndex, 0, moved);
                                                setContent({ ...content, team: newTeam });
                                            }
                                        }}
                                        className="relative group rounded-2xl border border-gray-100 p-4 pt-6 cursor-grab active:cursor-grabbing transition-all hover:shadow-md"
                                    >
                                        {/* Drag handle */}
                                        <div className="absolute left-1/2 -translate-x-1/2 top-1 text-gray-300 group-hover:text-brand-400">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                                            </svg>
                                        </div>

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
                            {content.team.length === 0 && (
                                <p className="text-center text-gray-400 py-8">Nenhum membro visível. Adicione membros na área de Gestão de Equipe.</p>
                            )}
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
                                    <label className="block text-xs font-medium text-gray-500 uppercase">WhatsApp</label>
                                    <input
                                        type="text"
                                        value={content.contact.whatsapp}
                                        onChange={(e) => setContent({ ...content, contact: { ...content.contact, whatsapp: e.target.value } })}
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Instagram</label>
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
                ) : activeTab === 'banners' ? (
                    /* ========== BANNERS TAB ========== */
                    <div className="space-y-6">
                        <p className="text-sm text-gray-600">Edite os círculos de categoria exibidos na página inicial.</p>

                        {banners.map((banner) => (
                            <div key={banner.id} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                                <div className="flex items-start gap-6">
                                    {/* Preview with Upload */}
                                    <div
                                        className="relative group flex-shrink-0 h-24 w-24 rounded-full overflow-hidden flex items-center justify-center cursor-pointer"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.2) 0%, rgba(26, 5, 16, 0.8) 100%)',
                                            border: '2px solid #d6008b',
                                        }}
                                    >
                                        {banner.image ? (
                                            <Image src={banner.image} alt={banner.name} fill className="object-cover" style={{ filter: 'brightness(0.7) saturate(1.2)' }} />
                                        ) : (
                                            <span className="text-3xl">{banner.name === 'Lingerie' ? '👙' : banner.name === 'Toys' ? '💜' : '🕯️'}</span>
                                        )}
                                        <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner', undefined, banner.id)} />
                                        </label>
                                        {uploading?.includes(banner.id) && (
                                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Form Fields */}
                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                            <input
                                                type="text"
                                                value={banner.name}
                                                onChange={(e) => updateBanner(banner.id, 'name', e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                                            <input
                                                type="number"
                                                value={banner.order}
                                                onChange={(e) => updateBanner(banner.id, 'order', parseInt(e.target.value) || 1)}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500"
                                                min={1}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Link de Destino</label>
                                            <input
                                                type="text"
                                                value={banner.link}
                                                onChange={(e) => updateBanner(banner.id, 'link', e.target.value)}
                                                placeholder="/produtos?categoria=Lingerie"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500"
                                            />
                                        </div>
                                        {banner.image && (
                                            <button onClick={() => updateBanner(banner.id, 'image', '')} className="text-sm text-red-500 hover:text-red-700">
                                                Remover imagem
                                            </button>
                                        )}
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => removeBanner(banner.id)}
                                        className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remover banner"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add Banner Button */}
                        <button
                            onClick={addBanner}
                            className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-brand-500 hover:text-brand-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Adicionar Novo Banner
                        </button>
                    </div>
                ) : (
                    /* ========== RODAPÉ TAB ========== */
                    <div className="space-y-6">
                        <p className="text-sm text-gray-600">Configure as informações exibidas no rodapé do site.</p>

                        {/* Redes Sociais */}
                        <section className="rounded-2xl bg-white p-6 shadow-sm border border-brand-100">
                            <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-2xl">🔗</span> Redes Sociais
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                                    <div className="flex items-center">
                                        <span className="rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">@</span>
                                        <input
                                            type="text"
                                            value={content.contact.instagram}
                                            onChange={(e) => setContent({ ...content, contact: { ...content.contact, instagram: e.target.value } })}
                                            className="w-full rounded-r-lg border border-gray-300 px-4 py-2"
                                            placeholder="donaonca"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                    <input
                                        type="text"
                                        value={content.contact.whatsapp}
                                        onChange={(e) => setContent({ ...content, contact: { ...content.contact, whatsapp: e.target.value } })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                    <input
                                        type="email"
                                        value={content.contact.email}
                                        onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                        placeholder="contato@donaonca.com.br"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Informações da Loja */}
                        <section className="rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="text-2xl">🏪</span> Informações da Loja
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
                                    <input
                                        type="text"
                                        value={content.hero.title}
                                        onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                        placeholder="Dona Onça"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
                                    <input
                                        type="text"
                                        value={content.hero.tagline}
                                        onChange={(e) => setContent({ ...content, hero: { ...content.hero, tagline: e.target.value } })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                        placeholder="Sensualidade em cada detalhe"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Dica */}
                        <div className="rounded-xl bg-brand-50 border border-brand-200 p-4">
                            <p className="text-sm text-brand-700">
                                <strong>💡 Dica:</strong> As alterações feitas aqui também atualizam a página Sobre e os ícones do rodapé em todo o site.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
