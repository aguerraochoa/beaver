import React from 'react';
import { SkeletonBase, SkeletonText } from '@/components/ui/Skeleton';

export default function RegistrarVentaLoading() {
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                    <SkeletonText className="h-8 w-64" />
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <SkeletonText className="h-4 w-20" />
                            <SkeletonBase className="h-10 w-full rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <SkeletonText className="h-4 w-20" />
                            <SkeletonBase className="h-10 w-full rounded-lg" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <SkeletonText className="h-4 w-24" />
                        <SkeletonBase className="h-32 w-full rounded-xl" />
                    </div>
                    <SkeletonBase className="h-12 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
