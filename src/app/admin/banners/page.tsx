'use client';

import { useState, useEffect } from 'react';
import { useProducts, HomeBanner } from '@/contexts/ProductContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

export default function BannersAdminPage() {
    const { homeBanners, updateHomeBanners } = useProducts();
    const [banners, setBanners] = useState<HomeBanner[]>(homeBanners);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    // Sync with context when it loads
    useEffect(() => {
        setBanners(homeBanners);
    }, [homeBanners]);

    const updateBanner = (id: string, field: keyof HomeBanner, value: string | number) => {
        setBanners(prev => prev.map(b =>
            b.id === id ? { ...b, [field]: value } : b
        ));
        setSaved(false);
    };

    const handleImageUpload = async (file: File, bannerId: string) => {
        setUploading(bannerId);
        try {
            // Sanitize filename
            const sanitizedName = file.name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9.]/g, '_');
            const fileName = `banners/${Date.now()}-${sanitizedName}`;

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, file, {
                    contentType: file.type,
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);

            updateBanner(bannerId, 'image', publicUrl);
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`Erro ao fazer upload: ${error?.message || error}`);
        } finally {
            setUploading(null);
        }
    };

    const addBanner = () => {
        const newBanner: HomeBanner = {
            id: Date.now().toString(),
            name: 'Nova Categoria',
            image: '',
            link: '/produtos',
            order: banners.length + 1,
        };
        setBanners([...banners, newBanner]);
        setSaved(false);
    };

    const removeBanner = (id: string) => {
        setBanners(prev => prev.filter(b => b.id !== id));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        await updateHomeBanners(banners);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-4xl px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-gray-400 hover:text-gray-600">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Banners da Home</h1>
                                <p className="text-sm text-gray-500">Edite os círculos de categoria da página inicial</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50 ${saved
                                    ? 'bg-green-600'
                                    : 'bg-brand-600 hover:bg-brand-700'
                                }`}
                        >
                            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Banners List */}
                <div className="space-y-6">
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-start gap-6">
                                {/* Preview with Upload */}
                                <div
                                    className="relative group flex-shrink-0 h-28 w-28 rounded-full overflow-hidden flex items-center justify-center cursor-pointer"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(214, 0, 139, 0.2) 0%, rgba(26, 5, 16, 0.8) 100%)',
                                        border: '2px solid #d6008b',
                                        boxShadow: '0 0 15px rgba(214, 0, 139, 0.3)',
                                    }}
                                >
                                    {banner.image ? (
                                        <Image
                                            src={banner.image}
                                            alt={banner.name}
                                            fill
                                            className="object-cover"
                                            style={{ filter: 'brightness(0.7) saturate(1.2)' }}
                                        />
                                    ) : (
                                        <span className="text-4xl">
                                            {banner.name === 'Lingerie' ? '👙' : banner.name === 'Toys' ? '💜' : '🕯️'}
                                        </span>
                                    )}

                                    {/* Upload Overlay */}
                                    <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        <span className="text-white text-[10px] mt-1">Upload</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], banner.id)}
                                        />
                                    </label>

                                    {/* Loading */}
                                    {uploading === banner.id && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                                        </div>
                                    )}
                                </div>

                                {/* Form Fields */}
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nome
                                        </label>
                                        <input
                                            type="text"
                                            value={banner.name}
                                            onChange={(e) => updateBanner(banner.id, 'name', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-brand-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ordem
                                        </label>
                                        <input
                                            type="number"
                                            value={banner.order}
                                            onChange={(e) => updateBanner(banner.id, 'order', parseInt(e.target.value) || 1)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-brand-500"
                                            min={1}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Link de Destino
                                        </label>
                                        <input
                                            type="text"
                                            value={banner.link}
                                            onChange={(e) => updateBanner(banner.id, 'link', e.target.value)}
                                            placeholder="/produtos?categoria=Lingerie"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-brand-500"
                                        />
                                    </div>
                                    {banner.image && (
                                        <div className="col-span-2">
                                            <button
                                                onClick={() => updateBanner(banner.id, 'image', '')}
                                                className="text-sm text-red-500 hover:text-red-700"
                                            >
                                                Remover imagem
                                            </button>
                                        </div>
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
                </div>

                {/* Add Banner Button */}
                <button
                    onClick={addBanner}
                    className="mt-6 w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-brand-500 hover:text-brand-600 transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar Novo Banner
                </button>

                {/* Info */}
                <div className="mt-8 p-4 rounded-xl bg-brand-50 border border-brand-100">
                    <h3 className="font-medium text-brand-800 mb-2">💡 Dicas</h3>
                    <ul className="text-sm text-brand-700 space-y-1">
                        <li>• <strong>Clique no círculo</strong> para fazer upload de uma imagem</li>
                        <li>• Use imagens quadradas (1:1) para melhor resultado</li>
                        <li>• As imagens são automaticamente ajustadas para o tema escuro</li>
                        <li>• O campo "Ordem" define a posição (menor = esquerda)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
