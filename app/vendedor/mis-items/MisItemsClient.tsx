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
  filterOptions: {
    categorias: string[]
    subcategorias: string[]
    racks: string[]
  }
}

export default function MisItemsClient({ items: initialItems, filters: initialFilters, totalCount: initialTotalCount, pageSize, filterOptions }: MisItemsClientProps) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [filters, setFilters] = useState(initialFilters)
  const [pendingFilters, setPendingFilters] = useState(initialFilters)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false) // Mobile filters toggle

  useEffect(() => {
    setItems(initialItems)
    setTotalCount(initialTotalCount)
    setFilters(initialFilters)
    setPendingFilters(initialFilters)
  }, [initialItems, initialTotalCount, initialFilters])

  const basePath = '/vendedor/mis-items'

  const handlePendingFilterChange = (key: string, value: string) => {
    setPendingFilters((prev: Record<string, string | undefined>) => ({ ...prev, [key]: value || undefined }))
  }

  const handleApplyFilters = () => {
    const params = new URLSearchParams()
    Object.entries(pendingFilters).forEach(([key, value]) => {
      if (value) params.set(key, value as string)
    })
    const query = params.toString()
    router.push(query ? `${basePath}?${query}` : basePath)
  }

  const handleClearFilters = () => {
    setPendingFilters(initialFilters)
    if (Object.values(filters).some(Boolean)) {
      router.push(basePath)
    }
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)
  const hasPendingValues = Object.values(pendingFilters).some(Boolean)
  const hasPendingChanges = JSON.stringify(pendingFilters) !== JSON.stringify(filters)

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
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
        {/* Filter Content */}
        {/* Filter Content */}
        {/* Filter Content */}
        <div id="mis-items-filters" className={`${filtersOpen ? 'block' : 'hidden'} lg:block p-3 lg:p-4`}>
          <div className="flex flex-col gap-4">
            {/* Top Row: Search + Actions */}
            <div className="flex items-center gap-3">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={pendingFilters.search || ''}
                  onChange={(e) => handlePendingFilterChange('search', e.target.value)}
                  aria-label="Buscar items asignados"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm lg:text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
                />
              </div>

              {/* Filter Actions */}
              <div className="flex items-center gap-2 flex-none">
                {(hasActiveFilters || hasPendingValues) && (
                  <button
                    onClick={handleClearFilters}
                    className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Limpiar filtros"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleApplyFilters}
                  disabled={!hasPendingChanges}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none font-medium whitespace-nowrap"
                >
                  <span>Aplicar</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom Row: Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
              <select
                value={pendingFilters.categoria || ''}
                onChange={(e) => handlePendingFilterChange('categoria', e.target.value)}
                aria-label="Filtrar por categoría"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm lg:text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
              >
                <option value="">Todas las categorías</option>
                {filterOptions?.categorias.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={pendingFilters.subcategoria || ''}
                onChange={(e) => handlePendingFilterChange('subcategoria', e.target.value)}
                aria-label="Filtrar por subcategoría"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm lg:text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
              >
                <option value="">Todas las subcategorías</option>
                {filterOptions?.subcategorias.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={pendingFilters.rack || ''}
                onChange={(e) => handlePendingFilterChange('rack', e.target.value)}
                aria-label="Filtrar por rack"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm lg:text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
              >
                <option value="">Todos los racks</option>
                {filterOptions?.racks.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={pendingFilters.estado || ''}
                onChange={(e) => handlePendingFilterChange('estado', e.target.value)}
                aria-label="Filtrar por estado"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm lg:text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
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
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Header with Name, Category, Status, Toggle */}
              <div
                className="p-4 flex items-start justify-between cursor-pointer"
                onClick={() => toggleExpanded(item.item_id)}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.objeto || '-'}{item.año ? ` / ${item.año}` : ''}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.categoria || '-'}{item.subcategoria ? ` / ${item.subcategoria}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(item.estado)}`}>
                    {item.estado.replace('_', ' ')}
                  </span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${expandedItems.has(item.item_id) ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Collapsible Content */}
              {expandedItems.has(item.item_id) && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/50">
                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">ID</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">
                        {item.identificador || item.item_id.substring(0, 8)}
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
                    <div className="pt-4 mt-2 border-t border-gray-200 dark:border-slate-700">
                      <a
                        href={`/vendedor/registrar-venta/${item.item_id}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg text-sm font-semibold transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Registrar Venta
                      </a>
                    </div>
                  )}
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
                    {item.objeto || '-'}{item.año ? ` / ${item.año}` : ''}
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
