'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Venta } from '@/types/database'
import { approveVenta, rejectVenta, getVentas } from '@/app/actions/ventas'

interface VentaWithRelations extends Venta {
  item?: any
  vendedor?: any
  aprobado_por_usuario?: any
}

interface VentasClientProps {
  ventas: VentaWithRelations[]
  filters: any
  totalCount: number
  pageSize: number
}

export default function VentasClient({ ventas: initialVentas, filters: initialFilters, totalCount: initialTotalCount, pageSize }: VentasClientProps) {
  const router = useRouter()
  const [ventas, setVentas] = useState(initialVentas)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [filters, setFilters] = useState(initialFilters)
  const [loadingMore, setLoadingMore] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false) // Mobile filters toggle

  useEffect(() => {
    setVentas(initialVentas)
    setTotalCount(initialTotalCount)
    setFilters(initialFilters)
  }, [initialVentas, initialTotalCount, initialFilters])

  const basePath = '/admin/ventas'

  const updateSearchParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(window.location.search)
    mutate(params)
    const query = params.toString()
    router.push(query ? `${basePath}?${query}` : basePath)
  }

  const handleFilterChange = (key: string, value: string) => {
    updateSearchParams((params) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
  }

  const handleLoadMore = async () => {
    if (loadingMore || ventas.length >= totalCount) return

    setLoadingMore(true)
    try {
      const { ventas: newVentas, count } = await getVentas(filters, {
        offset: ventas.length,
        limit: pageSize,
      })
      setVentas([...ventas, ...newVentas])
      setTotalCount(count)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoadingMore(false)
    }
  }

  const hasMore = ventas.length < totalCount

  const handleApprove = async (ventaId: string) => {
    setProcessing(ventaId)
    try {
      await approveVenta(ventaId)
      router.refresh()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (ventaId: string) => {
    if (!confirm('¿Estás seguro de rechazar esta venta?')) return

    setProcessing(ventaId)
    try {
      await rejectVenta(ventaId)
      router.refresh()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setProcessing(null)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
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


  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Ventas ({totalCount})
        </h1>
        {/* Desktop Filter - Always visible */}
        <select
          value={filters.estado || ''}
          onChange={(e) => handleFilterChange('estado', e.target.value)}
          aria-label="Filtrar por estado"
          className="hidden lg:block px-4 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
      </div>

      {/* Mobile Filter - Collapsible */}
      <div className="lg:hidden bg-white dark:bg-slate-800 rounded-lg shadow">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          aria-expanded={filtersOpen}
          aria-controls="ventas-filters"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium text-slate-900 dark:text-slate-100">Filtros</span>
          </div>
          <svg
            className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {filtersOpen && (
          <div id="ventas-filters" className="p-4 border-t border-gray-200 dark:border-slate-700">
            <select
              value={filters.estado || ''}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              aria-label="Filtrar por estado"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-3">
        {ventas.map((venta) => {
          const getStatusColor = (estado: string) => {
            switch (estado) {
              case 'pendiente': return 'bg-yellow-100 text-yellow-800'
              case 'aprobada': return 'bg-green-100 text-green-800'
              case 'rechazada': return 'bg-red-100 text-red-800'
              default: return 'bg-gray-100 text-gray-800'
            }
          }

          return (
            <div
              key={venta.venta_id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {venta.item?.objeto || venta.item?.identificador || venta.item_id.substring(0, 8)}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {venta.vendedor?.nombre || '-'}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 whitespace-nowrap ${getStatusColor(venta.estado)}`}>
                  {venta.estado}
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Precio</p>
                  <p className="text-sm font-bold text-[#1e3a5f]">
                    {formatCurrency(venta.precio, venta.moneda)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Fecha</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {formatDate(venta.fecha_venta)}
                  </p>
                </div>
                <div className="col-span-2">
                  <a
                    href={venta.evidencia_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#2d5a8a] hover:text-[#1e3a5f] underline font-medium"
                  >
                    Ver evidencia →
                  </a>
                </div>
              </div>

              {/* Actions */}
              {venta.estado === 'pendiente' && (
                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => handleApprove(venta.venta_id)}
                    disabled={processing === venta.venta_id}
                    className="flex-1 flex items-center justify-center p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg disabled:opacity-50 transition-colors border border-green-200"
                    title="Aprobar venta"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleReject(venta.venta_id)}
                    disabled={processing === venta.venta_id}
                    className="flex-1 flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg disabled:opacity-50 transition-colors border border-red-200"
                    title="Rechazar venta"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {venta.estado === 'aprobada' && venta.aprobado_por_usuario && (
                <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aprobada por {venta.aprobado_por_usuario.nombre}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Vendedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Evidencia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {ventas.map((venta) => {
              const getStatusColor = (estado: string) => {
                switch (estado) {
                  case 'pendiente': return 'bg-yellow-100 text-yellow-800'
                  case 'aprobada': return 'bg-green-100 text-green-800'
                  case 'rechazada': return 'bg-red-100 text-red-800'
                  default: return 'bg-gray-100 text-gray-800'
                }
              }

              return (
                <tr key={venta.venta_id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {venta.item?.objeto || venta.item?.identificador || venta.item_id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {venta.vendedor?.nombre || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#1e3a5f]">
                    {formatCurrency(venta.precio, venta.moneda)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {formatDate(venta.fecha_venta)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(venta.estado)}`}>
                      {venta.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <a
                      href={venta.evidencia_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2d5a8a] hover:text-[#1e3a5f] underline"
                    >
                      Ver evidencia
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {venta.estado === 'pendiente' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(venta.venta_id)}
                          disabled={processing === venta.venta_id}
                          className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200 disabled:opacity-50"
                          title="Aprobar venta"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleReject(venta.venta_id)}
                          disabled={processing === venta.venta_id}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors border border-red-200 disabled:opacity-50"
                          title="Rechazar venta"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {venta.estado === 'aprobada' && venta.aprobado_por_usuario && (
                      <span className="text-xs text-slate-500">
                        Aprobada por {venta.aprobado_por_usuario.nombre}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow px-4 py-3">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? 'Cargando...' : `Cargar más (${ventas.length} de ${totalCount})`}
          </button>
        </div>
      )}
      {!hasMore && totalCount > 0 && (
        <div className="flex justify-center bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow px-4 py-3">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Mostrando todos los {totalCount} resultados
          </div>
        </div>
      )}
    </div>
  )
}
