import React from 'react';
import Layout from '@/components/Layout';
import { getCurrentUser } from '@/lib/utils/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();
    return <Layout initialUser={user?.usuario}>{children}</Layout>;
}
