'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Item } from '@/types/database'
import { getItems } from '@/app/actions/items'

interface MisItemsClientProps {
  items: Item[]
  filters: any
  totalCount: number
  pageSize: number
}

export default function MisItemsClient({ items: initialItems, filters: initialFilters, totalCount: initialTotalCount, pageSize }: MisItemsClientProps) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [filters, setFilters] = useState(initialFilters)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false) // Mobile filters toggle

  useEffect(() => {
    setItems(initialItems)
    setTotalCount(initialTotalCount)
    setFilters(initialFilters)
  }, [initialItems, initialTotalCount, initialFilters])

  const basePath = '/vendedor/mis-items'

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
    if (loadingMore || items.length >= totalCount) return

    setLoadingMore(true)
    try {
      const { items: newItems, count } = await getItems(filters, {
        offset: items.length,
        limit: pageSize,
      })
      setItems([...items, ...newItems])
      setTotalCount(count)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoadingMore(false)
    }
  }

  const hasMore = items.length < totalCount

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
        Mis Items ({totalCount})
      </h1>

      {/* Filters - Mobile optimized with collapsible */}
      <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow">
        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="lg:hidden w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          aria-expanded={filtersOpen}
          aria-controls="mis-items-filters"
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

        {/* Filter Content */}
        <div id="mis-items-filters" className={`${filtersOpen ? 'block' : 'hidden'} lg:block p-3 lg:p-4`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <input
              type="text"
              placeholder="Buscar..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              aria-label="Buscar items asignados"
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm lg:text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
            />
            <select
              value={filters.estado || ''}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              aria-label="Filtrar por estado"
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm lg:text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
            >
              <option value="">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="asignado">Asignado</option>
              <option value="vendido_pendiente">Vendido Pendiente</option>
              <option value="vendido_aprobado">Vendido Aprobado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-3">
        {items.map((item) => {
          const getStatusColor = (estado: string) => {
            switch (estado) {
              case 'disponible': return 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300'
              case 'asignado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
              case 'vendido_pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300'
              case 'vendido_aprobado': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
              default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }
          }

          return (
            <div
              key={item.item_id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {item.objeto || '-'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ID: {item.identificador || item.item_id.substring(0, 8)}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 whitespace-nowrap ${getStatusColor(item.estado)}`}>
                  {item.estado.replace('_', ' ')}
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Categoría</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {item.categoria || '-'}
                    {item.subcategoria && (
                      <span className="text-slate-500 dark:text-slate-400"> / {item.subcategoria}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Rack/Nivel</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {item.rack || '-'} {item.nivel && `/ ${item.nivel}`}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {item.estado === 'asignado' && (
                <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                  <a
                    href={`/vendedor/registrar-venta/${item.item_id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Registrar Venta
                  </a>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Objeto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Rack/Nivel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {items.map((item) => {
              const getStatusColor = (estado: string) => {
                switch (estado) {
                  case 'disponible': return 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300'
                  case 'asignado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                  case 'vendido_pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300'
                  case 'vendido_aprobado': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                  default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }
              }

              return (
                <tr key={item.item_id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {item.identificador || item.item_id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {item.objeto || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {item.categoria || '-'} {item.subcategoria && `/ ${item.subcategoria}`}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(item.estado)}`}>
                      {item.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {item.rack || '-'} {item.nivel && `/ ${item.nivel}`}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.estado === 'asignado' && (
                      <a
                        href={`/vendedor/registrar-venta/${item.item_id}`}
                        className="px-3 py-1 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded text-xs font-semibold"
                      >
                        Registrar Venta
                      </a>
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
            {loadingMore ? 'Cargando...' : `Cargar más (${items.length} de ${totalCount})`}
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
