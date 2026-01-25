'use client';

import { useState, useEffect } from 'react';
import { useProducts, AboutContent, HomeBanner } from '@/contexts/ProductContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

type Tab = 'sobre' | 'banners' | 'rodape' | 'dashboard';

export default function SiteSettingsPage() {
    const { aboutContent, updateAboutContent, homeBanners, updateHomeBanners } = useProducts();
    const [activeTab, setActiveTab] = useState<Tab>('sobre');
    const [content, setContent] = useState<AboutContent>(aboutContent);
    const [banners, setBanners] = useState<HomeBanner[]>(homeBanners);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    // Dashboard Config State
    const [salesGoal, setSalesGoal] = useState<number>(50000);

    // Sync with context when it loads
    useEffect(() => {
        setContent(aboutContent);
    }, [aboutContent]);

    useEffect(() => {
        setBanners(homeBanners);
    }, [homeBanners]);

    // Load Dashboard Settings
    useEffect(() => {
        const storedGoal = localStorage.getItem('dona_onca_sales_goal');
        if (storedGoal) setSalesGoal(Number(storedGoal));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (activeTab === 'sobre') {
                await updateAboutContent(content);
            } else if (activeTab === 'banners') {
                await updateHomeBanners(banners);
            } else if (activeTab === 'dashboard') {
                localStorage.setItem('dona_onca_sales_goal', salesGoal.toString());
                window.dispatchEvent(new Event('storage'));
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
        <div className="min-h-screen bg-gray-900 pb-20 text-gray-100">
            {/* Header */}
            <div className="sticky top-0 z-30 border-b border-gray-800 bg-gray-900/95 backdrop-blur-md">
                <div className="mx-auto max-w-5xl px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-gray-500 hover:text-gray-300">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h1 className="text-xl font-bold text-white">Configurações do Site</h1>
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
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            📖 Página Sobre
                        </button>
                        <button
                            onClick={() => setActiveTab('banners')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'banners'
                                ? 'bg-brand-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            🖼️ Banners da Home
                        </button>
                        <button
                            onClick={() => setActiveTab('rodape')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'rodape'
                                ? 'bg-brand-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            📍 Rodapé
                        </button>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'dashboard'
                                ? 'bg-brand-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            📊 Dashboard
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8 admin-form">
                {activeTab === 'sobre' ? (
                    /* ========== SOBRE TAB ========== */
                    <div className="space-y-8">
                        {/* Hero Section */}
                        <section className="rounded-2xl bg-gray-800 p-6 shadow-sm border border-gray-700">
                            <h2 className="mb-6 text-lg font-bold text-white flex items-center gap-2">
                                <span className="text-2xl">✨</span> Hero (Topo da Página)
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400">Título Principal</label>
                                        <input
                                            type="text"
                                            value={content.hero.title}
                                            onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                                            className="mt-1 w-full rounded-xl border border-gray-600 bg-gray-900 text-white px-4 py-2 focus:border-brand-500 focus:ring-brand-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400">Tagline (Subtítulo)</label>
                                        <input
                                            type="text"
                                            value={content.hero.tagline}
                                            onChange={(e) => setContent({ ...content, hero: { ...content.hero, tagline: e.target.value } })}
                                            className="mt-1 w-full rounded-xl border border-gray-600 bg-gray-900 text-white px-4 py-2 focus:border-brand-500 focus:ring-brand-500"
                                        />
                                    </div>
                                </div>
                                <div className="relative group aspect-video rounded-xl border-2 border-dashed border-gray-600 bg-gray-900/50 flex items-center justify-center overflow-hidden">
                                    {content.hero.image ? (
                                        <>
                                            <Image src={content.hero.image} alt="Hero" fill className="object-cover opacity-80" />
                                            <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-bold text-brand-400">Alterar Imagem</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'hero')} />
                                            </label>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-2">
                                            <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            <span className="text-xs font-medium text-gray-500">Upload de Foto</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'hero')} />
                                        </label>
                                    )}
                                    {uploading === 'hero' && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80">
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Story Section */}
                        <section className="rounded-2xl bg-gray-800 p-6 shadow-sm border border-gray-700">
                            <h2 className="mb-6 text-lg font-bold text-white flex items-center gap-2">
                                <span className="text-2xl">📖</span> Nossa História
                            </h2>
                            <textarea
                                rows={6}
                                value={content.story}
                                onChange={(e) => setContent({ ...content, story: e.target.value })}
                                className="w-full rounded-xl border border-gray-600 bg-gray-900 text-white px-4 py-3 focus:border-brand-500 focus:ring-brand-500"
                                placeholder="Conte a história da sua marca..."
                            />
                        </section>

                        {/* Values Section */}
                        <section className="rounded-2xl bg-gray-800 p-6 shadow-sm border border-gray-700">
                            <h2 className="mb-6 text-lg font-bold text-white flex items-center gap-2">
                                <span className="text-2xl">💎</span> Nossos Valores
                            </h2>
                            <div className="grid gap-4 md:grid-cols-3">
                                {content.values.map((v, i) => (
                                    <div key={i} className="rounded-xl border border-gray-700 bg-gray-900/50 p-4 space-y-3">
                                        <div className="flex gap-2">
                                            <div className="relative group h-12 w-12 shrink-0 rounded-lg bg-gray-800 border border-gray-600 flex items-center justify-center overflow-hidden">
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
                                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/60">
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
                                                    className="w-full text-center rounded-lg border border-gray-600 bg-gray-800 text-white py-0.5 text-xs"
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
                                                    className="w-full rounded-lg border border-gray-600 bg-gray-800 text-white px-2 py-0.5 text-sm font-bold"
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
                                            className="w-full rounded-lg border border-gray-600 bg-gray-800 text-white px-2 py-1 text-xs"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Team Section */}
                        <section className="rounded-2xl bg-gray-800 p-6 shadow-sm border border-gray-700">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
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
                                        className="relative group rounded-2xl border border-gray-700 bg-gray-900/50 p-4 pt-6 cursor-grab active:cursor-grabbing transition-all hover:bg-gray-800"
                                    >
                                        {/* Drag handle */}
                                        <div className="absolute left-1/2 -translate-x-1/2 top-1 text-gray-500 group-hover:text-brand-400">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                                            </svg>
                                        </div>

                                        <div className="mb-4 flex flex-col items-center">
                                            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-brand-900/20 flex items-center justify-center border-2 border-brand-500/30 group-hover:border-brand-500 transition-colors">
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
                                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/60">
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
                                                className="w-full text-center text-sm font-bold border-b border-gray-700 bg-transparent text-white focus:border-brand-500 outline-none"
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
                                                className="w-full text-center text-xs text-gray-400 bg-transparent border-none focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {content.team.length === 0 && (
                                <p className="text-center text-gray-500 py-8">Nenhum membro visível. Adicione membros na área de Gestão de Equipe.</p>
                            )}
                        </section>

                        {/* Contact Section */}
                        <section className="rounded-2xl bg-gray-800 p-6 shadow-sm border border-gray-700">
                            <h2 className="mb-6 text-lg font-bold text-white flex items-center gap-2">
                                <span className="text-2xl">📞</span> Fale Conosco & Redes
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">E-mail</label>
                                    <input
                                        type="email"
                                        value={content.contact.email}
                                        onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                                        className="mt-1 w-full rounded-xl border border-gray-600 bg-gray-900 text-white px-4 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">WhatsApp</label>
                                    <input
                                        type="text"
                                        value={content.contact.whatsapp}
                                        onChange={(e) => setContent({ ...content, contact: { ...content.contact, whatsapp: e.target.value } })}
                                        className="mt-1 w-full rounded-xl border border-gray-600 bg-gray-900 text-white px-4 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Instagram</label>
                                    <div className="mt-1 flex items-center">
                                        <span className="rounded-l-xl border border-r-0 border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300">@</span>
                                        <input
                                            type="text"
                                            value={content.contact.instagram}
                                            onChange={(e) => setContent({ ...content, contact: { ...content.contact, instagram: e.target.value } })}
                                            className="w-full rounded-r-xl border border-gray-600 bg-gray-900 text-white px-4 py-2 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                ) : activeTab === 'banners' ? (
                    /* ========== BANNERS TAB ========== */
                    <div className="space-y-6">
                        <p className="text-sm text-gray-400">Edite os círculos de categoria exibidos na página inicial.</p>

                        {banners.map((banner) => (
                            <div key={banner.id} className="rounded-2xl bg-gray-800 p-6 shadow-sm border border-gray-700">
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
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                                            <input
                                                type="text"
                                                value={banner.name}
                                                onChange={(e) => updateBanner(banner.id, 'name', e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white focus:border-brand-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Ordem</label>
                                            <input
                                                type="number"
                                                value={banner.order}
                                                onChange={(e) => updateBanner(banner.id, 'order', parseInt(e.target.value) || 1)}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white focus:border-brand-500"
                                                min={1}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Link de Destino</label>
                                            <input
                                                type="text"
                                                value={banner.link}
                                                onChange={(e) => updateBanner(banner.id, 'link', e.target.value)}
                                                placeholder="/produtos?categoria=Lingerie"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white focus:border-brand-500"
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
                            className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-700 text-gray-500 hover:border-brand-500 hover:text-brand-400 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Adicionar Novo Banner
                        </button>
                    </div>
                ) : activeTab === 'rodape' ? (
                    /* ========== RODAPÉ TAB ========== */
                    <FooterSettingsTab />
                ) : (
                    /* ========== DASHBOARD TAB ========== */
                    <div className="space-y-8">
                        <div className="rounded-2xl bg-gray-800 p-6 shadow-sm border border-gray-700">
                            <h2 className="mb-6 text-lg font-bold text-white flex items-center gap-2">
                                <span className="text-2xl">📊</span> Configurações do Painel Admin
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Meta Mensal de Vendas (R$)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                                    <input
                                        type="number"
                                        value={salesGoal}
                                        onChange={(e) => setSalesGoal(Number(e.target.value))}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-600 bg-gray-900 text-white focus:border-brand-500 focus:ring-brand-500 text-lg font-mono font-medium text-brand-400"
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Este valor será usado como referência para os gráficos de desempenho no dashboard.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ========== FOOTER SETTINGS TAB COMPONENT ==========
function FooterSettingsTab() {
    const [footerSettings, setFooterSettings] = useState({
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
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const { data } = await supabase
                    .from('site_settings')
                    .select('*')
                    .eq('id', 'main')
                    .maybeSingle();

                if (data) {
                    setFooterSettings({
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
                console.warn('Error loading footer settings:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    id: 'main',
                    ...footerSettings,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            alert('Configurações do rodapé salvas com sucesso!');
        } catch (error: any) {
            console.error('Error saving footer settings:', error);
            alert('Erro ao salvar: ' + (error?.message || 'Erro desconhecido'));
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key: string, value: boolean | string) => {
        setFooterSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-400">Configure as redes sociais e links de ajuda exibidos no rodapé do site.</p>

            {/* Redes Sociais */}
            <section className="rounded-2xl bg-gray-800 p-6 shadow-sm border border-gray-700">
                <h2 className="mb-6 text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🔗</span> Redes Sociais
                </h2>
                <p className="text-sm text-gray-500 mb-4">Ative ou desative cada rede social e configure o link.</p>

                <div className="space-y-4">
                    {/* Facebook */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-gray-700">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={footerSettings.facebook_enabled}
                                onChange={(e) => updateSetting('facebook_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="font-medium text-white">Facebook</span>
                            </div>
                            <input
                                type="url"
                                value={footerSettings.facebook_url}
                                onChange={(e) => updateSetting('facebook_url', e.target.value)}
                                placeholder="https://facebook.com/donaonca"
                                disabled={!footerSettings.facebook_enabled}
                                className="w-full rounded-lg border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm disabled:bg-gray-700 disabled:text-gray-500"
                            />
                        </div>
                    </div>

                    {/* Instagram */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-gray-700">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={footerSettings.instagram_enabled}
                                onChange={(e) => updateSetting('instagram_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63z" />
                                </svg>
                                <span className="font-medium text-white">Instagram</span>
                            </div>
                            <div className="flex items-center">
                                <span className="rounded-l-lg border border-r-0 border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300">@</span>
                                <input
                                    type="text"
                                    value={footerSettings.instagram_url}
                                    onChange={(e) => updateSetting('instagram_url', e.target.value)}
                                    placeholder="donaonca"
                                    disabled={!footerSettings.instagram_enabled}
                                    className="w-full rounded-r-lg border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm disabled:bg-gray-700 disabled:text-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Twitter/X */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-gray-700">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={footerSettings.twitter_enabled}
                                onChange={(e) => updateSetting('twitter_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                <span className="font-medium text-white">X (Twitter)</span>
                            </div>
                            <input
                                type="url"
                                value={footerSettings.twitter_url}
                                onChange={(e) => updateSetting('twitter_url', e.target.value)}
                                placeholder="https://x.com/donaonca"
                                disabled={!footerSettings.twitter_enabled}
                                className="w-full rounded-lg border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm disabled:bg-gray-700 disabled:text-gray-500"
                            />
                        </div>
                    </div>

                    {/* YouTube */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-gray-700">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={footerSettings.youtube_enabled}
                                onChange={(e) => updateSetting('youtube_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                                <span className="font-medium text-white">YouTube</span>
                            </div>
                            <input
                                type="url"
                                value={footerSettings.youtube_url}
                                onChange={(e) => updateSetting('youtube_url', e.target.value)}
                                placeholder="https://youtube.com/@donaonca"
                                disabled={!footerSettings.youtube_enabled}
                                className="w-full rounded-lg border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm disabled:bg-gray-700 disabled:text-gray-500"
                            />
                        </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-gray-700">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={footerSettings.whatsapp_enabled}
                                onChange={(e) => updateSetting('whatsapp_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span className="font-medium text-white">WhatsApp</span>
                            </div>
                            <input
                                type="tel"
                                value={footerSettings.whatsapp_url}
                                onChange={(e) => updateSetting('whatsapp_url', e.target.value)}
                                placeholder="(11) 99999-9999"
                                disabled={!footerSettings.whatsapp_enabled}
                                className="w-full rounded-lg border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm disabled:bg-gray-700 disabled:text-gray-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Seção de Ajuda */}
            <section className="rounded-2xl bg-gray-800 p-6 shadow-sm border border-gray-700">
                <h2 className="mb-6 text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">❓</span> Seção de Ajuda
                </h2>
                <p className="text-sm text-gray-500 mb-4">Escolha quais links de ajuda exibir no rodapé.</p>

                <div className="space-y-3">
                    {/* Contato */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">📧</span>
                            <div>
                                <span className="font-medium text-gray-100">Contato</span>
                                <p className="text-xs text-gray-500">Link para página de contato</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={footerSettings.help_contact_enabled}
                                onChange={(e) => updateSetting('help_contact_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                    </div>

                    {/* FAQ */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">💬</span>
                            <div>
                                <span className="font-medium text-gray-100">Central de Ajuda</span>
                                <p className="text-xs text-gray-500">Perguntas frequentes (FAQ)</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={footerSettings.help_faq_enabled}
                                onChange={(e) => updateSetting('help_faq_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                    </div>

                    {/* Termos */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">📜</span>
                            <div>
                                <span className="font-medium text-gray-100">Termos de Uso</span>
                                <p className="text-xs text-gray-500">Termos e política de privacidade</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={footerSettings.help_terms_enabled}
                                onChange={(e) => updateSetting('help_terms_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                    </div>
                </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-brand-600 px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-brand-700 disabled:opacity-50"
                >
                    {saving ? 'Salvando...' : 'Salvar Configurações do Rodapé'}
                </button>
            </div>

            {/* Dica */}
            <div className="rounded-xl bg-brand-900/20 border border-brand-500/30 p-4">
                <p className="text-sm text-brand-300">
                    <strong>💡 Dica:</strong> As alterações serão refletidas imediatamente no rodapé de todas as páginas após salvar.
                </p>
            </div>
        </div>
    );
}
