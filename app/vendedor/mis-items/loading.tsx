import React from 'react';
import { SkeletonTable, SkeletonBase, SkeletonText } from '@/components/ui/Skeleton';

export default function VendedorMisItemsLoading() {
    return (
        <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
                <SkeletonText className="h-8 w-48" />
                <SkeletonBase className="h-10 w-32 rounded-lg" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow p-4 space-y-4">
                <SkeletonBase className="h-12 w-full rounded-lg" />
            </div>

            <div className="lg:hidden space-y-3">
                {[...Array(5)].map((_, i) => (
                    <SkeletonBase key={i} className="h-32 w-full rounded-lg" />
                ))}
            </div>

            <div className="hidden lg:block">
                <SkeletonTable rows={8} />
            </div>
        </div>
    );
}
