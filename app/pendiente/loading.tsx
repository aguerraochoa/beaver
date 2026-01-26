import React from 'react';
import { SkeletonBase, SkeletonText, SkeletonCircle } from '@/components/ui/Skeleton';

export default function PendienteLoading() {
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
            <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4">
                <SkeletonBase className="h-8 w-32 rounded-lg" />
            </div>
            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-12 flex flex-col items-center space-y-6">
                    <SkeletonCircle size="w-20 h-20" />
                    <SkeletonText className="h-10 w-80" />
                    <div className="space-y-2 w-full max-w-lg">
                        <SkeletonText className="h-4 w-full" />
                        <SkeletonText className="h-4 w-full" />
                        <SkeletonText className="h-4 w-3/4 mx-auto" />
                    </div>
                    <SkeletonBase className="h-12 w-48 rounded-xl mt-4" />
                </div>
            </div>
        </div>
    );
}
