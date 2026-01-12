'use client'

import { DashboardStats } from '@/app/actions/stats'

interface DashboardClientProps {
  stats: DashboardStats
}

export default function DashboardClient({ stats }: DashboardClientProps) {
  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'aprobada':
        return 'bg-[#d4e4f0] text-[#1e3a5f]'
      case 'pendiente':
        return 'bg-[#e8f0f8] text-[#2d5a8a] border border-[#c4d4e4]'
      case 'rechazada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-[#d4e4f0] text-[#2d5a8a]'
    }
  }

  const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue), 1)

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Revenue Overview Cards - Mobile optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-6">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8a] rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-4 lg:p-6 text-white">
          <div>
            <p className="text-blue-200 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Ingresos Totales</p>
            <p className="text-xl lg:text-3xl font-bold mb-1">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-blue-200 text-xs">
              {stats.ventasAprobadas} ventas aprobadas
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#2d5a8a] to-[#4a7bc8] rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-4 lg:p-6 text-white">
          <div>
            <p className="text-blue-200 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Ingresos Aprobados</p>
            <p className="text-xl lg:text-3xl font-bold mb-1">{formatCurrency(stats.revenueAprobadas)}</p>
            <p className="text-blue-200 text-xs">
              Confirmados
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#4a7bc8] to-[#6ba3d3] rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-4 lg:p-6 text-white">
          <div>
            <p className="text-blue-100 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Pendientes</p>
            <p className="text-xl lg:text-3xl font-bold mb-1">{formatCurrency(stats.revenuePendientes)}</p>
            <p className="text-blue-100 text-xs">
              {stats.ventasPendientes} ventas
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#4a7bc8] rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-4 lg:p-6 text-white">
          <div>
            <p className="text-blue-200 text-xs lg:text-sm font-medium mb-1 lg:mb-2">Precio Promedio</p>
            <p className="text-xl lg:text-3xl font-bold mb-1">{formatCurrency(stats.averageSalePrice)}</p>
            <p className="text-blue-200 text-xs">
              Por venta aprobada
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Mobile optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 lg:p-5 border border-gray-100">
          <h3 className="text-xs font-medium text-slate-500 mb-1 lg:mb-2">
            Total Items
          </h3>
          <p className="text-xl lg:text-3xl font-bold text-slate-900">
            {stats.totalItems}
          </p>
        </div>

        <div className="bg-white rounded-lg lg:rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 lg:p-5 border border-gray-100">
          <h3 className="text-xs font-medium text-slate-500 mb-1 lg:mb-2">
            Disponibles
          </h3>
          <p className="text-xl lg:text-3xl font-bold text-[#4a7bc8]">
            {stats.itemsDisponibles}
          </p>
        </div>

        <div className="bg-white rounded-lg lg:rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 lg:p-5 border border-gray-100">
          <h3 className="text-xs font-medium text-slate-500 mb-1 lg:mb-2">
            Asignados
          </h3>
          <p className="text-xl lg:text-3xl font-bold text-[#2d5a8a]">
            {stats.itemsAsignados}
          </p>
        </div>

        <div className="bg-white rounded-lg lg:rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 lg:p-5 border border-gray-100">
          <h3 className="text-xs font-medium text-slate-500 mb-1 lg:mb-2">
            Vendidos
          </h3>
          <p className="text-xl lg:text-3xl font-bold text-[#1e3a5f]">
            {stats.itemsVendidos}
          </p>
        </div>
      </div>

      {/* Sales Stats - Mobile optimized */}
      <div className="grid grid-cols-3 gap-3 lg:gap-6">
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 lg:p-5 border border-gray-100">
          <h3 className="text-xs font-medium text-slate-500 mb-1 lg:mb-2">
            Ventas Aprobadas
          </h3>
          <p className="text-xl lg:text-3xl font-bold text-[#2d5a8a]">
            {stats.ventasAprobadas}
          </p>
        </div>

        <div className="bg-white rounded-lg lg:rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 lg:p-5 border border-gray-100">
          <h3 className="text-xs font-medium text-slate-500 mb-1 lg:mb-2">
            Ventas Pendientes
          </h3>
          <p className="text-xl lg:text-3xl font-bold text-[#4a7bc8]">
            {stats.ventasPendientes}
          </p>
        </div>

        <div className="bg-white rounded-lg lg:rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 lg:p-5 border border-gray-100">
          <h3 className="text-xs font-medium text-slate-500 mb-1 lg:mb-2">
            Total Ventas
          </h3>
          <p className="text-xl lg:text-3xl font-bold text-slate-900">
            {stats.totalVentas}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Top Sellers */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-gray-100 p-4 lg:p-6">
          <h2 className="text-base lg:text-xl font-bold text-slate-900 mb-3 lg:mb-4">
            Top Vendedores
          </h2>
          <div className="space-y-2 lg:space-y-3">
            {stats.topSellers.length > 0 ? (
              stats.topSellers.map((seller, index) => (
                <div
                  key={seller.vendedor_id}
                  className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-[#2d5a8a] to-[#1e3a5f] text-white font-bold text-xs lg:text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 text-sm lg:text-base truncate">
                        {seller.nombre}
                      </p>
                      <p className="text-xs text-slate-500">
                        {seller.ventasAprobadas} ventas aprobadas
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-bold text-[#1e3a5f] text-sm lg:text-base">
                      {formatCurrency(seller.totalRevenue)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {seller.totalVentas} total
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-6 lg:py-8 text-sm">
                No hay ventas aún
              </p>
            )}
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-gray-100 p-4 lg:p-6">
          <h2 className="text-base lg:text-xl font-bold text-slate-900 mb-3 lg:mb-4">
            Ingresos Mensuales
          </h2>
          {stats.monthlyRevenue.length > 0 ? (
            <div className="space-y-3 lg:space-y-4">
              {stats.monthlyRevenue.map((month) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex justify-between items-center flex-wrap gap-1">
                    <span className="text-xs lg:text-sm font-medium text-slate-700">
                      {month.month}
                    </span>
                    <div className="text-right">
                      <span className="text-xs lg:text-sm font-bold text-slate-900">
                        {formatCurrency(month.revenue)}
                      </span>
                      <span className="text-xs text-slate-500 ml-1 lg:ml-2">
                        ({month.count} ventas)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#d4e4f0] rounded-full h-2 lg:h-2.5">
                    <div
                      className="bg-gradient-to-r from-[#2d5a8a] to-[#4a7bc8] h-2 lg:h-2.5 rounded-full transition-all"
                      style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-6 lg:py-8 text-sm">
              No hay datos de ingresos mensuales
            </p>
          )}
        </div>
      </div>

      {/* Recent Sales - Mobile optimized with card layout */}
      <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-gray-100 p-4 lg:p-6">
        <h2 className="text-base lg:text-xl font-bold text-slate-900 mb-3 lg:mb-4">
          Ventas Recientes
        </h2>
        {stats.recentSales.length > 0 ? (
          <>
            {/* Mobile Card Layout */}
            <div className="lg:hidden space-y-3">
              {stats.recentSales.map((sale) => (
                <div
                  key={sale.venta_id}
                  className="p-4 bg-slate-50 rounded-lg border border-gray-100 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {sale.item_objeto || '-'}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {sale.vendedor_nombre}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 whitespace-nowrap ${getStatusColor(sale.estado)}`}>
                      {sale.estado}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs text-slate-500">
                      {formatDate(sale.fecha_venta)}
                    </span>
                    <span className="text-sm font-bold text-[#1e3a5f]">
                      {formatCurrency(sale.precio, sale.moneda)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block overflow-x-auto -mx-6 px-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentSales.map((sale) => (
                    <tr key={sale.venta_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 whitespace-nowrap">
                        {formatDate(sale.fecha_venta)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {sale.vendedor_nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {sale.item_objeto || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#1e3a5f]">
                        {formatCurrency(sale.precio, sale.moneda)}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(sale.estado)}`}>
                          {sale.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-slate-500 text-center py-6 lg:py-8 text-sm">
            No hay ventas recientes
          </p>
        )}
      </div>
    </div>
  )
}

