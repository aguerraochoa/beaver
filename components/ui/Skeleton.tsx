import React from 'react';

export const SkeletonBase = ({ className }: { className?: string }) => (
    <div className={`bg-slate-200 dark:bg-slate-700 animate-pulse rounded ${className}`} />
);

export const SkeletonCircle = ({ size = 'w-12 h-12' }: { size?: string }) => (
    <SkeletonBase className={`rounded-full ${size}`} />
);

export const SkeletonText = ({ className = 'h-4 w-full' }: { className?: string }) => (
    <SkeletonBase className={className} />
);

export const SkeletonStatCard = ({ colored = false }: { colored?: boolean }) => (
    <div className={`p-6 rounded-2xl border shadow-sm space-y-2 ${colored ? 'bg-slate-700 border-slate-600' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
        }`}>
        <SkeletonText className={`h-4 w-24 ${colored ? 'bg-blue-300/30' : ''}`} />
        <SkeletonText className={`h-8 w-32 ${colored ? 'bg-white/20' : ''}`} />
        <SkeletonText className={`h-3 w-40 ${colored ? 'bg-blue-200/20' : ''}`} />
    </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-4">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <SkeletonBase className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SkeletonText className="h-4 w-full" />
                    <SkeletonText className="h-4 w-full hidden md:block" />
                    <SkeletonText className="h-4 w-full hidden md:block" />
                    <div className="flex justify-end">
                        <SkeletonBase className="h-4 w-16" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const SkeletonDashboard = () => (
    <div className="space-y-6">
        <div className="mb-4 lg:mb-6">
            <SkeletonText className="h-10 w-48 mb-2" />
            <SkeletonText className="h-4 w-72" />
        </div>

        {/* First Row: 4 Colored Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonStatCard colored={true} />
            <SkeletonStatCard colored={true} />
            <SkeletonStatCard colored={true} />
            <SkeletonStatCard colored={true} />
        </div>

        {/* Second Row: 4 White Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
        </div>

        {/* Third Row: 3 White Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
        </div>

        {/* Fourth Row: 2 Larger Cards (Top Sellers & Revenue) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                <SkeletonText className="h-6 w-48 mb-4" />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                        <div className="flex items-center gap-3">
                            <SkeletonCircle size="w-10 h-10" />
                            <div className="space-y-1">
                                <SkeletonText className="h-4 w-32" />
                                <SkeletonText className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <SkeletonText className="h-4 w-24" />
                            <SkeletonText className="h-3 w-16 ml-auto" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                <SkeletonText className="h-6 w-48 mb-4" />
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                            <SkeletonText className="h-4 w-16" />
                            <div className="flex gap-2">
                                <SkeletonText className="h-4 w-20" />
                                <SkeletonText className="h-4 w-12" />
                            </div>
                        </div>
                        <SkeletonBase className="h-2.5 w-full rounded-full" />
                    </div>
                ))}
            </div>
        </div>

        {/* Fifth Row: 1 Wide Card (Recent Sales) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
            <SkeletonText className="h-6 w-48 mb-4" />
            <SkeletonTable rows={5} />
        </div>
    </div>
);
