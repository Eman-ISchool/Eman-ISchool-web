import AdminLayout from '@/components/admin/AdminLayout';
import './admin.css';
import { ReactNode } from 'react';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
    return <AdminLayout>{children}</AdminLayout>;
}
