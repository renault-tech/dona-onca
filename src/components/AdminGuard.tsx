'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AdminGuardProps {
    children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const { user, profile, loading, isAdmin } = useAuth();
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (loading) return;

        // Not logged in - redirect to login
        if (!user) {
            router.push('/conta?redirect=/admin');
            return;
        }

        // Logged in but not admin - redirect to home
        if (!isAdmin) {
            // Check if is_admin is true but not verified yet
            if (profile?.is_admin && !profile?.admin_verified) {
                router.push('/conta/verificar-admin');
                return;
            }

            router.push('/');
            return;
        }

        // User is verified admin
        setChecking(false);
    }, [user, profile, loading, isAdmin, router]);

    // Show loading while checking permissions
    if (loading || checking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando permissões...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
