import React from 'react';
import { SkeletonBase, SkeletonText, SkeletonCircle } from '@/components/ui/Skeleton';

export default function ProfileLoading() {
    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-8 space-y-8">
                    <div className="flex flex-col items-center space-y-4">
                        <SkeletonCircle size="w-24 h-24" />
                        <SkeletonText className="h-6 w-48" />
                        <SkeletonBase className="h-5 w-24 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <div className="space-y-2">
                            <SkeletonText className="h-4 w-32" />
                            <SkeletonBase className="h-12 w-full rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <SkeletonText className="h-4 w-32" />
                            <SkeletonBase className="h-12 w-full rounded-xl" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <SkeletonText className="h-4 w-32" />
                            <SkeletonBase className="h-12 w-full rounded-xl" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <SkeletonBase className="h-12 w-40 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
