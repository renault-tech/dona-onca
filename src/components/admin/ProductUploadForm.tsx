'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProducts, categories, Product } from '@/contexts/ProductContext';

interface ImageFile {
    file: File;
    preview: string;
}

export default function ProductUploadForm() {
    const router = useRouter();
    const { addProduct } = useProducts();

    const [images, setImages] = useState<ImageFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '' as Product['category'] | '',
        stock: '',
        hasSize: true,
        hasColor: true,
        sizes: [] as string[],
        colors: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files).filter((file) =>
            file.type.startsWith('image/')
        );

        addFiles(files);
    }, []);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files ? Array.from(e.target.files) : [];
            addFiles(files);
        },
        []
    );

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
            URL.revokeObjectURL(newImages[index].preview);
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

        // Parse form data
        const newProduct: Omit<Product, 'id' | 'createdAt'> = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
            category: formData.category as Product['category'],
            stock: parseInt(formData.stock),
            lowStockAlert: 5, // Default for new products
            hasSize: formData.hasSize,
            hasColor: formData.hasColor,
            sizes: formData.hasSize ? formData.sizes : [],
            colors: formData.hasColor ? formData.colors.split(',').map(c => c.trim()).filter(c => c !== '') : [],
            images: images.map(img => img.preview),
            active: true,
        };

        // Add to context (Supabase)
        await addProduct(newProduct);

        setIsSubmitting(false);

        // Redirect to products list
        router.push('/admin/products');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dropzone */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Imagens do Produto
                </label>
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${isDragOver
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
                        }`}
                >
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <div className="space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
                            <svg
                                className="h-8 w-8 text-brand-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-700">
                                Arraste as fotos aqui
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                ou clique para selecionar do seu dispositivo
                            </p>
                        </div>
                        <p className="text-xs text-gray-400">PNG, JPG até 10MB</p>
                    </div>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                            >
                                <Image
                                    src={img.preview}
                                    alt={`Preview ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                                {index === 0 && (
                                    <span className="absolute bottom-2 left-2 rounded-full bg-brand-600 px-2 py-1 text-xs font-medium text-white">
                                        Capa
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Name */}
                <div className="md:col-span-2">
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Nome do Produto *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ex: Conjunto Rendado Luxo"
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <label
                        htmlFor="description"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Descrição
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Descreva o produto em detalhes..."
                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                </div>

                {/* Price */}
                <div>
                    <label
                        htmlFor="price"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Preço (R$) *
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            R$
                        </span>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="0,00"
                            step="0.01"
                            min="0"
                            required
                            className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                    </div>
                </div>

                {/* Original Price (for discount) */}
                <div>
                    <label
                        htmlFor="originalPrice"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Preço Original (opcional, para desconto)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            R$
                        </span>
                        <input
                            type="number"
                            id="originalPrice"
                            name="originalPrice"
                            value={formData.originalPrice}
                            onChange={handleInputChange}
                            placeholder="0,00"
                            step="0.01"
                            min="0"
                            className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                    </div>
                </div>

                {/* Stock */}
                <div>
                    <label
                        htmlFor="stock"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Estoque *
                    </label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="Quantidade"
                        min="0"
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                </div>

                {/* Category */}
                <div>
                    <label
                        htmlFor="category"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Categoria *
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                        <option value="">Selecione uma categoria</option>
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

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3 font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <svg
                                className="h-5 w-5 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Salvando...
                        </>
                    ) : (
                        <>
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            Salvar Produto
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
