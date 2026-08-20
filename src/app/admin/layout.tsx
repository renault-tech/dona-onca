'use client';

import AdminGuard from '@/components/AdminGuard';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminGuard>
            <div data-theme="light" className="min-h-screen bg-bg text-fg antialiased">
                {children}
            </div>
        </AdminGuard>
    );
}
