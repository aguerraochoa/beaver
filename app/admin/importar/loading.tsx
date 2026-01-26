import React from 'react';
import { SkeletonBase, SkeletonText } from '@/components/ui/Skeleton';

export default function ImportarLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="mb-6">
                <SkeletonText className="h-10 w-48 mb-2" />
                <SkeletonText className="h-4 w-72" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-6">
                <div className="space-y-2">
                    <SkeletonText className="h-4 w-40" />
                    <SkeletonBase className="h-12 w-full rounded-lg" />
                    <SkeletonText className="h-3 w-full max-w-lg" />
                </div>

                <SkeletonBase className="h-12 w-full rounded-lg mt-8" />
            </div>
        </div>
    );
}
