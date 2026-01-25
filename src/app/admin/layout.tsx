'use client';

import AdminGuard from '@/components/AdminGuard';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminGuard>
            <div className="text-gray-900 antialiased">
                {children}
            </div>
        </AdminGuard>
    );
}
