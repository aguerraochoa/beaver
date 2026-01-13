'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Venta } from '@/types/database'
import { getVentas } from '@/app/actions/ventas'

interface VentaWithRelations extends Venta {
  item?: any
  vendedor?: any
}

interface VentasClientProps {
  ventas: VentaWithRelations[]
  totalCount: number
  pageSize: number
}

export default function VentasClient({ ventas: initialVentas, totalCount: initialTotalCount, pageSize }: VentasClientProps) {
  const router = useRouter()
  const [ventas, setVentas] = useState(initialVentas)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    setVentas(initialVentas)
    setTotalCount(initialTotalCount)
  }, [initialVentas, initialTotalCount])

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

  const handleLoadMore = async () => {
    if (loadingMore || ventas.length >= totalCount) return

    setLoadingMore(true)
    try {
      const { ventas: newVentas, count } = await getVentas(undefined, {
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

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
        Mis Ventas ({totalCount})
      </h1>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-3">
        {ventas.map((venta) => {
          const getStatusColor = (estado: string) => {
            switch (estado) {
              case 'pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
              case 'aprobada': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
              case 'rechazada': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
              default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 whitespace-nowrap ${getStatusColor(venta.estado)}`}>
                  {venta.estado}
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Precio</p>
                  <p className="text-sm font-bold text-[#1e3a5f] dark:text-[#6ba3d3]">
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
                    className="text-sm text-[#2d5a8a] dark:text-[#6ba3d3] hover:text-[#1e3a5f] dark:hover:text-[#4a7bc8] underline font-medium"
                  >
                    Ver evidencia →
                  </a>
                </div>
              </div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Evidencia</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {ventas.map((venta) => {
              const getStatusColor = (estado: string) => {
                switch (estado) {
                  case 'pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                  case 'aprobada': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                  case 'rechazada': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                  default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }
              }

              return (
                <tr key={venta.venta_id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {venta.item?.objeto || venta.item?.identificador || venta.item_id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#1e3a5f] dark:text-[#6ba3d3]">
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
                      className="text-[#2d5a8a] dark:text-[#6ba3d3] hover:text-[#1e3a5f] dark:hover:text-[#4a7bc8] underline"
                    >
                      Ver evidencia
                    </a>
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
