import React from 'react';
import { SkeletonTable, SkeletonText } from '@/components/ui/Skeleton';

export default function UsuariosLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
                <SkeletonText className="h-8 w-48" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow overflow-hidden">
                <div className="p-6">
                    <SkeletonTable rows={10} />
                </div>
            </div>
        </div>
    );
}
