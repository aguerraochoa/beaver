import React from 'react';
import { SkeletonTable, SkeletonBase, SkeletonText } from '@/components/ui/Skeleton';

export default function VentasLoading() {
    return (
        <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
                <SkeletonText className="h-8 w-48" />
                <SkeletonBase className="h-10 w-48 rounded-lg" />
            </div>

            <div className="lg:hidden space-y-3">
                {[...Array(5)].map((_, i) => (
                    <SkeletonBase key={i} className="h-24 w-full rounded-lg" />
                ))}
            </div>

            <div className="hidden lg:block">
                <SkeletonTable rows={10} />
            </div>
        </div>
    );
}
