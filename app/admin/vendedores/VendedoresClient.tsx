'use client'

import { useState } from 'react'
import { VendedoresPageData, VendedorStats } from '@/app/actions/vendedor-stats'

interface VendedoresClientProps {
    data: VendedoresPageData
}

type SortField = 'revenue' | 'sales' | 'approval' | 'name'
type SortOrder = 'asc' | 'desc'

export default function VendedoresClient({ data }: VendedoresClientProps) {
    const [sortField, setSortField] = useState<SortField>('revenue')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
    const [expandedVendedor, setExpandedVendedor] = useState<string | null>(null)
    const [showInactive, setShowInactive] = useState(false)

    const formatCurrency = (amount: number, currency: string = 'MXN') => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('desc')
        }
    }

    const sortedVendedores = [...data.vendedores]
        .filter(v => showInactive || v.activo)
        .sort((a, b) => {
            let comparison = 0
            switch (sortField) {
                case 'revenue':
                    comparison = a.totalRevenue - b.totalRevenue
                    break
                case 'sales':
                    comparison = a.totalVentas - b.totalVentas
                    break
                case 'approval':
                    comparison = a.approvalRate - b.approvalRate
                    break
                case 'name':
                    comparison = a.nombre.localeCompare(b.nombre)
                    break
            }
            return sortOrder === 'asc' ? comparison : -comparison
        })

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300'
            case 'aprobada': return 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300'
            case 'rechazada': return 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }
    }

    const getApprovalRateColor = (rate: number) => {
        if (rate >= 80) return 'text-green-600'
        if (rate >= 50) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 lg:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 lg:p-3 rounded-lg bg-[#2d5a8a]/10 dark:bg-[#2d5a8a]/20">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#2d5a8a] dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">Vendedores</p>
                            <p className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {data.totals.totalVendedores}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 lg:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 lg:p-3 rounded-lg bg-[#2d5a8a]/10 dark:bg-[#2d5a8a]/20">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#2d5a8a] dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">Ingresos Aprobados</p>
                            <p className="text-lg lg:text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {formatCurrency(data.totals.totalRevenueAprobadas)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 lg:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 lg:p-3 rounded-lg bg-[#2d5a8a]/10 dark:bg-[#2d5a8a]/20">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#2d5a8a] dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">Total Ventas</p>
                            <p className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {data.totals.totalVentas}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 lg:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 lg:p-3 rounded-lg bg-[#2d5a8a]/10 dark:bg-[#2d5a8a]/20">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#2d5a8a] dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">Tasa Aprobación</p>
                            <p className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {data.totals.averageApprovalRate.toFixed(0)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            value={sortField}
                            onChange={(e) => {
                                setSortField(e.target.value as SortField)
                                setSortOrder('desc')
                            }}
                            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] focus:border-transparent cursor-pointer min-w-[140px]"
                        >
                            <option value="revenue">Por Ingresos</option>
                            <option value="sales">Por Ventas</option>
                            <option value="approval">Por Aprobación</option>
                            <option value="name">Por Nombre</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#2d5a8a] hover:border-[#2d5a8a] transition-all"
                        title={sortOrder === 'asc' ? 'Ascendente (Menor a Mayor)' : 'Descendente (Mayor a Menor)'}
                    >
                        {sortOrder === 'asc' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                            </svg>
                        )}
                    </button>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                        className="w-4 h-4 text-[#2d5a8a] rounded focus:ring-[#2d5a8a]"
                    />
                    Mostrar inactivos
                </label>
            </div>

            {/* Vendedor Cards */}
            <div className="space-y-4">
                {sortedVendedores.map((vendedor, index) => (
                    <div
                        key={vendedor.vendedor_id}
                        className={`bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden ${!vendedor.activo ? 'opacity-60' : ''
                            }`}
                    >
                        {/* Card Header */}
                        <div
                            className="p-4 lg:p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            onClick={() => setExpandedVendedor(
                                expandedVendedor === vendedor.vendedor_id ? null : vendedor.vendedor_id
                            )}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                {/* Rank and Avatar */}
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300`}>
                                        {index + 1}
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-[#2d5a8a] flex items-center justify-center text-white font-bold text-lg">
                                        {vendedor.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            {vendedor.nombre}
                                            {!vendedor.activo && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                                                    Inactivo
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">@{vendedor.username}</p>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
                                    <div className="text-center lg:text-left">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Ingresos Totales</p>
                                        <p className="font-bold text-slate-900 dark:text-slate-100">
                                            {formatCurrency(vendedor.totalRevenue)}
                                        </p>
                                    </div>
                                    <div className="text-center lg:text-left">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Ventas</p>
                                        <p className="font-bold text-slate-900 dark:text-slate-100">
                                            {vendedor.totalVentas}
                                            <span className="text-xs font-normal text-slate-500 ml-1">
                                                ({vendedor.ventasAprobadas} ✓)
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-center lg:text-left">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Tasa Aprobación</p>
                                        <p className={`font-bold ${getApprovalRateColor(vendedor.approvalRate)}`}>
                                            {vendedor.approvalRate.toFixed(0)}%
                                        </p>
                                    </div>
                                    <div className="text-center lg:text-left">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Precio Promedio</p>
                                        <p className="font-bold text-slate-900 dark:text-slate-100">
                                            {formatCurrency(vendedor.averageSalePrice)}
                                        </p>
                                    </div>
                                    <div className="text-center lg:text-left hidden lg:block">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Items Asignados</p>
                                        <p className="font-bold text-slate-900 dark:text-slate-100">
                                            {vendedor.itemsAsignados}
                                        </p>
                                    </div>
                                </div>

                                {/* Expand Icon */}
                                <div className="hidden lg:flex items-center">
                                    <svg
                                        className={`w-5 h-5 text-slate-400 transition-transform ${expandedVendedor === vendedor.vendedor_id ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {vendedor.ventasPendientes > 0 && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300">
                                        {vendedor.ventasPendientes} pendiente{vendedor.ventasPendientes !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {vendedor.ventasAprobadas > 0 && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                        {vendedor.ventasAprobadas} aprobada{vendedor.ventasAprobadas !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {vendedor.ventasRechazadas > 0 && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                                        {vendedor.ventasRechazadas} rechazada{vendedor.ventasRechazadas !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {vendedor.revenuePendientes > 0 && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                        {formatCurrency(vendedor.revenuePendientes)} pendiente
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedVendedor === vendedor.vendedor_id && (
                            <div className="border-t border-slate-200 dark:border-slate-700 p-4 lg:p-6 bg-slate-50 dark:bg-slate-700/30">
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                                    Ventas Recientes
                                </h4>
                                {vendedor.recentSales.length > 0 ? (
                                    <div className="space-y-2">
                                        {vendedor.recentSales.map((sale) => (
                                            <div
                                                key={sale.venta_id}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                                        {sale.item_objeto || 'Item sin nombre'}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {formatDate(sale.fecha_venta)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">
                                                        {formatCurrency(sale.precio, sale.moneda)}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.estado)}`}>
                                                        {sale.estado}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        Este vendedor no tiene ventas registradas.
                                    </p>
                                )}

                                {/* Revenue Breakdown */}
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                                        Resumen de Ingresos
                                    </h4>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <p className="text-xs text-green-700 dark:text-green-400">Aprobados</p>
                                            <p className="font-bold text-green-800 dark:text-green-300">
                                                {formatCurrency(vendedor.revenueAprobadas)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <p className="text-xs text-yellow-700 dark:text-yellow-400">Pendientes</p>
                                            <p className="font-bold text-yellow-800 dark:text-yellow-300">
                                                {formatCurrency(vendedor.revenuePendientes)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg col-span-2 lg:col-span-1">
                                            <p className="text-xs text-slate-600 dark:text-slate-400">Total</p>
                                            <p className="font-bold text-slate-900 dark:text-slate-100">
                                                {formatCurrency(vendedor.totalRevenue)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {sortedVendedores.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow">
                        <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No hay vendedores registrados.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
