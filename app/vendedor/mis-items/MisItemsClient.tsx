'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Item } from '@/types/database'

interface MisItemsClientProps {
  items: Item[]
  filters: any
}

export default function MisItemsClient({ items, filters }: MisItemsClientProps) {
  const router = useRouter()
  const [filtersOpen, setFiltersOpen] = useState(false) // Mobile filters toggle

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/vendedor/mis-items?${params.toString()}`)
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
        Mis Items ({items.length})
      </h1>

      {/* Filters - Mobile optimized with collapsible */}
      <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow">
        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="lg:hidden w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
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
        <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block p-3 lg:p-4`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <input
              type="text"
              placeholder="Buscar..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
            />
            <select
              value={filters.estado || ''}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
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
              case 'disponible': return 'bg-green-100 text-green-800'
              case 'asignado': return 'bg-blue-100 text-blue-800'
              case 'vendido_pendiente': return 'bg-yellow-100 text-yellow-800'
              case 'vendido_aprobado': return 'bg-purple-100 text-purple-800'
              default: return 'bg-gray-100 text-gray-800'
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
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${getStatusColor(item.estado)}`}>
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
                      <span className="text-slate-500"> / {item.subcategoria}</span>
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
                  case 'disponible': return 'bg-green-100 text-green-800'
                  case 'asignado': return 'bg-blue-100 text-blue-800'
                  case 'vendido_pendiente': return 'bg-yellow-100 text-yellow-800'
                  case 'vendido_aprobado': return 'bg-purple-100 text-purple-800'
                  default: return 'bg-gray-100 text-gray-800'
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.estado)}`}>
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
    </div>
  )
}

