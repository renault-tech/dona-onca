'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';

type SortField = 'full_name' | 'email' | 'created_at' | 'is_admin';
type SortDirection = 'asc' | 'desc';

export default function CustomersAdminPage() {
    const { user: currentUser } = useAuth();
    const { aboutContent } = useProducts();
    const router = useRouter();
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('full_name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*');

            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (profile: UserProfile) => {
        if (processingId) return;

        // Don't allow removing own admin access
        if (profile.id === currentUser?.id) {
            alert('Você não pode remover sua própria permissão de administrador.');
            return;
        }

        const action = profile.is_admin ? 'remover' : 'adicionar';
        if (!confirm(`Tem certeza que deseja ${action} a permissão de administrador para ${profile.full_name || profile.email}?`)) {
            return;
        }

        setProcessingId(profile.id);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_admin: !profile.is_admin })
                .eq('id', profile.id);

            if (error) throw error;

            await fetchProfiles();
            alert(profile.is_admin
                ? 'Permissão de administrador removida com sucesso.'
                : 'Permissão de administrador concedida com sucesso.');
        } catch (error) {
            console.error('Error toggling admin:', error);
            alert('Ocorreu um erro ao atualizar permissão.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredAndSortedProfiles = useMemo(() => {
        // Get team member names to filter them out
        const teamNames = (aboutContent.team || []).map(t => t.name.toLowerCase());

        // Filter out admins and team members - they appear in Team section
        let result = profiles.filter(profile => {
            // Exclude admins
            if (profile.is_admin) return false;
            // Exclude team members by name match
            if (profile.full_name && teamNames.includes(profile.full_name.toLowerCase())) return false;
            return true;
        });

        // Apply search filter
        result = result.filter(profile =>
            (profile.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (profile.phone || '').includes(searchTerm)
        );

        result.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'full_name':
                    comparison = (a.full_name || '').localeCompare(b.full_name || '');
                    break;
                case 'email':
                    comparison = a.email.localeCompare(b.email);
                    break;
                case 'created_at':
                    comparison = a.created_at.localeCompare(b.created_at);
                    break;
                case 'is_admin':
                    comparison = (a.is_admin === b.is_admin) ? 0 : (a.is_admin ? -1 : 1);
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [profiles, searchTerm, sortField, sortDirection, aboutContent]);

    const SortHeader = ({ field, children, className = '' }: { field: SortField; children: React.ReactNode; className?: string }) => (
        <th
            className={`px-6 py-4 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors select-none ${className}`}
            onClick={() => handleSort(field)}
        >
            <div className={`flex items-center gap-1 ${className.includes('text-right') ? 'justify-end' : className.includes('text-center') ? 'justify-center' : ''}`}>
                {children}
                <span className="text-gray-400">
                    {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
            </div>
        </th>
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin"
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Clientes e Permissões</h1>
                                <p className="text-sm text-gray-500">Gerencie usuários e atribua permissões administrativas</p>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mt-6">
                        <div className="relative max-w-md">
                            <input
                                type="text"
                                placeholder="Buscar por nome, email ou telefone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pl-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {filteredAndSortedProfiles.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <p className="text-gray-500">Nenhum usuário encontrado.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <SortHeader field="full_name">Nome</SortHeader>
                                        <SortHeader field="email">Contato</SortHeader>
                                        <SortHeader field="created_at" className="text-center">Data Cadastro</SortHeader>
                                        <SortHeader field="is_admin" className="text-center">Admin</SortHeader>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAndSortedProfiles.map((profile) => (
                                        <tr
                                            key={profile.id}
                                            className="transition-colors hover:bg-gray-50/50 cursor-pointer"
                                            onClick={() => router.push(`/admin/customers/${profile.id}`)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-600">
                                                        {(profile.full_name || profile.email).charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{profile.full_name || 'Sem nome'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="text-gray-900">{profile.email}</div>
                                                <div className="text-gray-500">{profile.phone || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-600">
                                                {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-medium ${profile.is_admin
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {profile.is_admin ? 'Admin' : 'Cliente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/customers/${profile.id}`}
                                                        className="rounded-lg p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                                        title="Ver Perfil"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleToggleAdmin(profile)}
                                                        disabled={processingId === profile.id || profile.id === currentUser?.id}
                                                        className={`rounded-lg p-2 transition-colors ${profile.is_admin
                                                            ? 'text-red-500 hover:bg-red-50'
                                                            : 'text-gray-400 hover:text-brand-600 hover:bg-brand-50'
                                                            } ${processingId === profile.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        title={profile.is_admin ? "Remover Admin" : "Tornar Admin"}
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
