'use client';

import React, { useState, useEffect } from 'react';

const SkeletonRow = () => (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
        <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse" />
    </div>
);

const RealRow = ({ name, status, icon }: { name: string; status: string; icon: string }) => (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 -mx-2 rounded-xl">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
            {icon}
        </div>
        <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-500">Updated 2 mins ago</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
            {status}
        </span>
    </div>
);

export default function RealisticSkeletonDemo() {
    const [activeTab, setActiveTab] = useState<'inventory' | 'sales'>('inventory');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, [activeTab]);

    const data = activeTab === 'inventory'
        ? [
            { name: 'MacBook Pro M3', status: 'Active', icon: '💻' },
            { name: 'iPhone 15 Pro', status: 'In Transit', icon: '📱' },
            { name: 'Sony A7 IV', status: 'Active', icon: '📷' },
            { name: 'Dell UltraSharp', status: 'Storage', icon: '🖥️' },
        ]
        : [
            { name: 'Sale #4921', status: 'Completed', icon: '💰' },
            { name: 'Sale #4922', status: 'Pending', icon: '⏳' },
            { name: 'Sale #4923', status: 'Completed', icon: '💰' },
        ];

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">App Dashboard</h2>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'sales' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Sales
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                {loading ? (
                    <>
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                    </>
                ) : (
                    data.map((item, i) => (
                        <RealRow key={i} {...item} />
                    ))
                )}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 font-medium">
                <span>Showing {loading ? '...' : data.length} items</span>
                <button className="text-blue-600 hover:text-blue-700">View All Account</button>
            </div>
        </div>
    );
}
