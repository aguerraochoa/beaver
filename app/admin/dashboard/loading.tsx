import React from 'react';
import { SkeletonDashboard } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
    return (
        <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500">
            <SkeletonDashboard />
        </div>
    );
}
