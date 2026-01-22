'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useProducts } from '@/contexts/ProductContext';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface TeamMemberDisplay {
    name: string;
    role: string;
    image: string;
    email?: string; // Link to profile if exists
}

interface MergedUser {
    id?: string; // Profile ID if exists
    email: string;
    full_name: string;
    photo?: string;
    is_admin: boolean; // From Profile
    is_visible: boolean; // From AboutContent
    role: string; // From AboutContent
    display_image: string; // From AboutContent
    source: 'profile_only' | 'site_only' | 'merged';
}

export default function TeamPage() {
    const { user: currentUser } = useAuth();
    const { aboutContent, updateAboutContent } = useProducts();
    const [users, setUsers] = useState<MergedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);

    // Editing State
    const [editingEmail, setEditingEmail] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: '', role: '', image: '' });

    useEffect(() => {
        fetchData();
    }, [aboutContent]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch all profiles
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name');

            if (error) throw error;

            // 2. Get team from AboutContent
            const teamMembers = aboutContent.team || [];

            // 3. Merge Strategies
            const mergedMap = new Map<string, MergedUser>();

            // Add all profiles first
            profiles?.forEach(p => {
                const email = p.email.toLowerCase();
                mergedMap.set(email, {
                    id: p.id,
                    email: p.email,
                    full_name: p.full_name || 'Sem Nome',
                    is_admin: p.is_admin || false,
                    is_visible: false, // Default, updated below
                    role: '',
                    display_image: '',
                    source: 'profile_only'
                });
            });

            // Merge with Team Members (match by Name approximation or we need to add email to team structure?)
            // Note: The current structure of aboutContent.team DOES NOT have email.
            // This makes mapping precise difficult. 
            // IMPROVEMENT: We will match by NAME if email is missing, but ideally we should update AboutContext to include email?
            // For now, let's treat "Site Only" members as separate if we can't match, 
            // BUT providing a UI to "Link" them would be complex.
            // SIMPLIFICATION: We will list Profiles. If a profile is marked "Visible", we add them to the team array.
            // If there are team members in the array that don't match any profile, we list them as "Site Only".

            // We need a way to link. Let's assume for this version we only support visibility for people with Profiles
            // OR we match by Name loosely.

            // Re-approach: We iterate profiles. We check if their name exists in teamMembers.
            // Limiting factor: Team member names might be generic "Maria".

            // Let's rely on finding by Name for now, ensuring uniqueness could be problematic.
            // BETTER APPROACH: Add 'email' to team members in the JSON structure if possible.
            // Checking AboutContent definition... it DOES NOT have email.
            // We will add it implicitly here for the management UI.

            teamMembers.forEach(member => {
                // Try to find by name in profiles
                const foundProfile = profiles?.find(p => p.full_name?.toLowerCase() === member.name.toLowerCase());

                if (foundProfile) {
                    const existing = mergedMap.get(foundProfile.email.toLowerCase())!;
                    existing.is_visible = true;
                    existing.role = member.role;
                    existing.display_image = member.image;
                    existing.source = 'merged';
                } else {
                    // Site only member (no profile or name mismatch)
                    // We use name as key if email is missing
                    mergedMap.set(member.name, {
                        email: '',
                        full_name: member.name,
                        is_admin: false,
                        is_visible: true,
                        role: member.role,
                        display_image: member.image,
                        source: 'site_only'
                    });
                }
            });

            setUsers(Array.from(mergedMap.values()));

        } catch (error) {
            console.error('Error fetching team data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (user: MergedUser) => {
        if (!user.id) return alert('Este usuário não possui um perfil (apenas site). Crie uma conta para ele primeiro.');
        if (user.id === currentUser?.id) return alert('Você não pode alterar sua própria permissão.');

        setProcessing(user.email || user.full_name);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_admin: !user.is_admin })
                .eq('id', user.id);

            if (error) throw error;
            await fetchData();
        } catch (error) {
            console.error(error);
            alert('Erro ao alterar permissão.');
        } finally {
            setProcessing(null);
        }
    };

    const handleToggleVisibility = async (user: MergedUser) => {
        setProcessing(user.email || user.full_name);
        try {
            const currentTeam = [...(aboutContent.team || [])];

            if (user.is_visible) {
                // Remove from team array
                const newTeam = currentTeam.filter(t => t.name.toLowerCase() !== user.full_name.toLowerCase());
                await updateAboutContent({ team: newTeam });
            } else {
                // Check if member already exists to prevent duplicates
                const alreadyExists = currentTeam.some(t => t.name.toLowerCase() === user.full_name.toLowerCase());
                if (!alreadyExists) {
                    const newMember = {
                        name: user.full_name,
                        role: user.role || 'Colaborador',
                        image: user.display_image || ''
                    };
                    await updateAboutContent({ team: [...currentTeam, newMember] });
                }
            }
            // Don't call fetchData() - useEffect on aboutContent handles refresh
        } catch (error) {
            console.error(error);
            alert('Erro ao alterar visibilidade.');
        } finally {
            setProcessing(null);
        }
    };

    const handleEdit = (user: MergedUser) => {
        setEditingEmail(user.email || user.full_name);
        setEditForm({
            name: user.full_name,
            role: user.role,
            image: user.display_image
        });
    };

    const handleSaveEdit = async () => {
        if (!editingEmail) return;

        setProcessing(editingEmail);
        try {
            // We are editing the VISUAL representation (AboutContent)
            // If the user is in the team array, update them.
            // If not (and they are profile_only), we don't necessarily add them unless toggled visible?
            // UX Decision: Edit implies they should exist in the team array or we are preparing them to be added.

            const currentTeam = [...(aboutContent.team || [])];
            const index = currentTeam.findIndex(t => t.name.toLowerCase() === editForm.name.toLowerCase() || t.name.toLowerCase() === users.find(u => u.email === editingEmail || u.full_name === editingEmail)?.full_name.toLowerCase());

            if (index >= 0) {
                currentTeam[index] = { ...currentTeam[index], name: editForm.name, role: editForm.role, image: editForm.image };
                await updateAboutContent({ team: currentTeam });
            } else {
                // User is not visible yet, but we are editing their "future" details?
                // For simplicity: If editing, we only update if they ARE visible. If not, maybe we shouldn't allow editing role?
                // Actually, let's allow "Add to Team" via the toggle, then "Edit details".
                // If they are not visible, we can't save to 'team' array.
                // UNLESS we check if the user just wants to update the profile name? 
                // Let's stick to updating the TEAM entry.
                alert('Primeiro, torne o usuário visível no site para editar seus detalhes de exibição.');
            }

            setEditingEmail(null);
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Gestão de Equipe</h1>
                                <p className="text-sm text-gray-500">Administradores e Membros Visíveis</p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Add Button */}
                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <input
                            type="text"
                            placeholder="Buscar membros..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white px-4 py-2.5 pl-4 text-sm w-full max-w-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                        <button
                            onClick={() => {
                                setEditForm({ name: '', role: '', image: '' });
                                setEditingEmail('NEW_MEMBER');
                            }}
                            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:w-auto w-full"
                        >
                            <span>+</span> Novo Membro
                        </button>
                    </div>

                    {/* Add New Member Form - Inline */}
                    {editingEmail === 'NEW_MEMBER' && (
                        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Adicionar Novo Membro (Site)</h3>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                    <input
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                                        placeholder="Ex: Ana Silva"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                                    <input
                                        value={editForm.role}
                                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                                        placeholder="Ex: Gerente"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da Foto (Opcional)</label>
                                    <input
                                        value={editForm.image}
                                        onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setEditingEmail(null)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!editForm.name) return alert('Nome é obrigatório');
                                        setProcessing('NEW');
                                        try {
                                            const currentTeam = [...(aboutContent.team || [])];
                                            const newMember = {
                                                name: editForm.name,
                                                role: editForm.role || 'Colaborador',
                                                image: editForm.image || ''
                                            };
                                            await updateAboutContent({ team: [...currentTeam, newMember] });
                                            await fetchData();
                                            setEditingEmail(null);
                                        } catch (e) {
                                            console.error(e);
                                            alert('Erro ao adicionar membro');
                                        } finally {
                                            setProcessing(null);
                                        }
                                    }}
                                    disabled={!!processing}
                                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                                >
                                    {processing ? 'Salvando...' : 'Adicionar Membro'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900">Membro</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Admin (Sistema)</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Visível (Site)</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.email || user.full_name} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.display_image ? (
                                                <Image src={user.display_image} alt="" width={40} height={40} className="rounded-full object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                                                    {user.full_name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{user.full_name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                {user.role && <p className="text-xs text-brand-600 font-medium">{user.role}</p>}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Admin Toggle */}
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleToggleAdmin(user)}
                                            disabled={!!processing || user.source === 'site_only'}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.is_admin ? 'bg-brand-600' : 'bg-gray-200'} ${user.source === 'site_only' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.is_admin ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                        {user.source === 'site_only' && <p className="text-[10px] text-red-400 mt-1">Sem perfil</p>}
                                    </td>

                                    {/* Visibility Toggle */}
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleToggleVisibility(user)}
                                            disabled={!!processing}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.is_visible ? 'bg-green-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.is_visible ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        {editingEmail === (user.email || user.full_name) ? (
                                            <div className="flex flex-col gap-2 absolute right-12 bg-white shadow-xl p-4 rounded-xl z-10 border border-gray-100 min-w-[250px]">
                                                <p className="text-xs font-bold text-gray-500 mb-1">Editar Exibição</p>
                                                <input
                                                    value={editForm.name}
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="border rounded p-1 text-sm" placeholder="Nome"
                                                />
                                                <input
                                                    value={editForm.role}
                                                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                                    className="border rounded p-1 text-sm" placeholder="Cargo"
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button onClick={() => setEditingEmail(null)} className="text-xs text-gray-500">Cancelar</button>
                                                    <button onClick={handleSaveEdit} className="text-xs bg-brand-600 text-white px-2 py-1 rounded">Salvar</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-gray-400 hover:text-brand-600"
                                                disabled={!user.is_visible}
                                                title={!user.is_visible ? "Torne visível organizar detalhes" : "Editar detalhes de exibição"}
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
