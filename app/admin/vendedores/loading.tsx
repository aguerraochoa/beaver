import React from 'react';
import { SkeletonStatCard, SkeletonText, SkeletonBase } from '@/components/ui/Skeleton';

export default function VendedoresLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="mb-4 lg:mb-6">
                <SkeletonText className="h-10 w-48 mb-2" />
                <SkeletonText className="h-4 w-72" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                    <SkeletonText className="h-6 w-48 mb-4" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <SkeletonBase className="w-10 h-10 rounded-full" />
                                <SkeletonText className="h-4 w-32" />
                            </div>
                            <SkeletonText className="h-4 w-24" />
                        </div>
                    ))}
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                    <SkeletonText className="h-6 w-48 mb-4" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <SkeletonText className="h-4 w-full" />
                            <SkeletonBase className="h-2 w-full rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
