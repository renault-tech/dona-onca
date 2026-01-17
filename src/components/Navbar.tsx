'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { categories } from '@/contexts/ProductContext';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const { itemCount } = useCart();

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="Dona Onça"
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain"
                        priority
                    />
                    <span className="hidden text-xl font-bold text-brand-600 sm:block">
                        Dona Onça
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-6 lg:flex">
                    <Link
                        href="/produtos"
                        className="text-sm font-medium text-gray-700 hover:text-brand-600"
                    >
                        Produtos
                    </Link>

                    {/* Categories Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowCategories(!showCategories)}
                            onBlur={() => setTimeout(() => setShowCategories(false), 150)}
                            className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-brand-600"
                        >
                            Categorias
                            <svg className={`h-4 w-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {showCategories && (
                            <div className="absolute left-0 top-full mt-2 w-48 rounded-xl bg-white py-2 shadow-lg ring-1 ring-black/5">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat}
                                        href={`/produtos?categoria=${encodeURIComponent(cat)}`}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                                        onClick={() => setShowCategories(false)}
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link
                        href="/novidades"
                        className="text-sm font-medium text-gray-700 hover:text-brand-600"
                    >
                        Novidades
                    </Link>
                    <Link
                        href="/sobre"
                        className="text-sm font-medium text-gray-700 hover:text-brand-600"
                    >
                        Sobre
                    </Link>
                    <Link
                        href="/admin"
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                    >
                        Admin
                    </Link>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <Link
                        href="/produtos"
                        className="rounded-full p-2 text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                        aria-label="Buscar"
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
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </Link>

                    {/* Profile */}
                    <Link
                        href="/conta"
                        className="rounded-full p-2 text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                        aria-label="Minha conta"
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </Link>

                    {/* Cart */}
                    <Link
                        href="/sacola"
                        className="relative rounded-full p-2 text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                        aria-label="Sacola de compras"
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
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                        </svg>
                        {/* Cart badge */}
                        {itemCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                                {itemCount > 9 ? '9+' : itemCount}
                            </span>
                        )}
                    </Link>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="rounded-full p-2 text-gray-600 hover:bg-brand-50 hover:text-brand-600 lg:hidden"
                        aria-label="Menu"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {isMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="border-t border-gray-100 bg-white px-4 py-4 lg:hidden">
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/produtos"
                            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Produtos
                        </Link>
                        <div className="border-t border-gray-100 py-2">
                            <p className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">Categorias</p>
                            {categories.map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/produtos?categoria=${encodeURIComponent(cat)}`}
                                    className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>
                        <Link
                            href="/novidades"
                            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Novidades
                        </Link>
                        <Link
                            href="/sobre"
                            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Sobre
                        </Link>
                        <Link
                            href="/admin"
                            className="mt-2 rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Admin
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
