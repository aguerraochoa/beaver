import React from 'react';
import { SkeletonTable, SkeletonBase, SkeletonText } from '@/components/ui/Skeleton';

export default function SubadminInventarioLoading() {
    return (
        <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
                <SkeletonText className="h-8 w-64" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow p-4 space-y-4">
                <SkeletonBase className="h-12 w-full rounded-lg" />
            </div>

            <SkeletonTable rows={10} />
        </div>
    );
}
