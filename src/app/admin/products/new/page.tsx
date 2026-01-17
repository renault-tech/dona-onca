import ProductUploadForm from '@/components/admin/ProductUploadForm';
import Link from 'next/link';

export default function NewProductPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-4xl px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100"
                        >
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
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Novo Produto
                            </h1>
                            <p className="text-sm text-gray-500">
                                Adicione um novo produto ao catálogo
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                    <ProductUploadForm />
                </div>
            </div>
        </div>
    );
}
