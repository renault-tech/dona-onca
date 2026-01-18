'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useProducts, categories, Product } from '@/contexts/ProductContext';

interface ImageFile {
    file?: File;
    preview: string;
}

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const { getProductById, updateProduct } = useProducts();

    const [images, setImages] = useState<ImageFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '' as Product['category'] | '',
        stock: '',
        lowStockAlert: '',
        hasSize: true,
        hasColor: true,
        sizes: [] as string[],
        colors: '',
        active: true,
    });

    const product = getProductById(Number(params.id));

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                originalPrice: product.originalPrice?.toString() || '',
                category: product.category,
                stock: product.stock.toString(),
                lowStockAlert: product.lowStockAlert.toString(),
                hasSize: product.hasSize ?? (product.sizes.length > 0 && product.sizes[0] !== 'Único'),
                hasColor: product.hasColor ?? (product.colors.length > 0 && product.colors[0] !== 'Único'),
                sizes: product.sizes,
                colors: product.colors.join(', '),
                active: product.active,
            });
            setImages(product.images.map(url => ({ preview: url })));
        }
    }, [product]);

    if (!product) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-bold text-gray-900">Produto não encontrado</h1>
                    <Link href="/admin/products" className="text-brand-600 hover:underline">
                        ← Voltar aos produtos
                    </Link>
                </div>
            </div>
        );
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter((file) =>
            file.type.startsWith('image/')
        );
        addFiles(files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        addFiles(files);
    };

    const addFiles = (files: File[]) => {
        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
    };

    const removeImage = (index: number) => {
        setImages((prev) => {
            const newImages = [...prev];
            if (newImages[index].file) {
                URL.revokeObjectURL(newImages[index].preview);
            }
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.category || !formData.stock) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        setIsSubmitting(true);

        await updateProduct(product.id, {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
            category: formData.category as Product['category'],
            stock: parseInt(formData.stock),
            lowStockAlert: parseInt(formData.lowStockAlert) || 5,
            hasSize: formData.hasSize,
            hasColor: formData.hasColor,
            sizes: formData.hasSize ? formData.sizes : [],
            colors: formData.hasColor ? formData.colors.split(',').map(c => c.trim()).filter(c => c !== '') : [],
            images: images.map(img => img.preview),
            active: formData.active,
        });

        setIsSubmitting(false);
        router.push('/admin/products');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-4xl px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/products"
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
                            <p className="text-sm text-gray-500">{product.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="mx-auto max-w-4xl px-4 py-8">
                <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                    {/* Active Toggle */}
                    <div className="mb-8 flex items-center justify-between rounded-xl bg-gray-50 p-4">
                        <div>
                            <h3 className="font-medium text-gray-900">Status do Produto</h3>
                            <p className="text-sm text-gray-500">Produtos inativos não aparecem na loja</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.active ? 'bg-brand-600' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Dropzone */}
                    <div className="mb-8">
                        <label className="mb-2 block text-sm font-medium text-gray-700">Imagens</label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all ${isDragOver ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400'
                                }`}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            />
                            <p className="text-gray-600">Arraste imagens ou clique para adicionar</p>
                        </div>

                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-4 gap-3">
                                {images.map((img, index) => (
                                    <div key={index} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                                        <Image src={img.preview} alt="" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">Nome *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">Descrição</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Preço (R$) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                step="0.01"
                                required
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Preço Original (desconto)</label>
                            <input
                                type="number"
                                name="originalPrice"
                                value={formData.originalPrice}
                                onChange={handleInputChange}
                                step="0.01"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Estoque *</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Alerta de Baixo Estoque</label>
                            <input
                                type="number"
                                name="lowStockAlert"
                                value={formData.lowStockAlert}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Categoria *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-brand-500 focus:outline-none"
                            >
                                <option value="">Selecione</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Configuration Toggles */}
                        <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
                            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                                <div>
                                    <span className="block font-medium text-gray-700">Habilitar Escolha de Tamanho</span>
                                    <span className="text-xs text-gray-500">Obrigatório para o cliente selecionar</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, hasSize: !prev.hasSize }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.hasSize ? 'bg-brand-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.hasSize ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                                <div>
                                    <span className="block font-medium text-gray-700">Habilitar Escolha de Cor</span>
                                    <span className="text-xs text-gray-500">Obrigatório para o cliente selecionar</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, hasColor: !prev.hasColor }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.hasColor ? 'bg-brand-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.hasColor ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>
                        </div>

                        {/* Sizes Selection */}
                        {formData.hasSize && (
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Tamanhos Disponíveis
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {['P', 'M', 'G', 'GG', 'PLUS', 'Único'].map((size) => {
                                        const isSelected = formData.sizes.includes(size);
                                        return (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        sizes: isSelected
                                                            ? prev.sizes.filter(s => s !== size)
                                                            : [...prev.sizes, size]
                                                    }));
                                                }}
                                                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${isSelected
                                                    ? 'border-brand-600 bg-brand-50 text-brand-600'
                                                    : 'border-gray-200 text-gray-600 hover:border-brand-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                                {formData.sizes.length === 0 && (
                                    <p className="mt-2 text-xs text-red-500">Selecione pelo menos um tamanho</p>
                                )}
                            </div>
                        )}

                        {/* Colors */}
                        {formData.hasColor && (
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="colors"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Cores (separadas por vírgula)
                                </label>
                                <input
                                    type="text"
                                    id="colors"
                                    name="colors"
                                    value={formData.colors}
                                    onChange={handleInputChange}
                                    placeholder="Preto, Vermelho, Nude"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                />
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 flex justify-end gap-4">
                        <Link
                            href="/admin/products"
                            className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl bg-brand-600 px-8 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
