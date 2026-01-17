'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { Item, Usuario } from '@/types/database'
import { assignItems, createItem, updateItem, deleteItem, splitItem, getItems } from '@/app/actions/items'
import { exportItemsToCSV } from '@/app/actions/csv'

interface InventarioClientProps {
  items: Item[]
  usuarios: Usuario[]
  filters: any
  totalCount: number
  pageSize: number
  filterOptions: {
    categorias: string[]
    subcategorias: string[]
    racks: string[]
    condiciones: string[]
    años: number[]
  }
}

export default function InventarioClient({
  items: initialItems,
  usuarios,
  filters: initialFilters,
  totalCount: initialTotalCount,
  pageSize,
  filterOptions,
}: InventarioClientProps) {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>(initialItems)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filters, setFilters] = useState(initialFilters)
  const [pendingFilters, setPendingFilters] = useState(initialFilters)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [assigning, setAssigning] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedVendedor, setSelectedVendedor] = useState('')
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [saving, setSaving] = useState(false)
  const [showSplitModal, setShowSplitModal] = useState(false)
  const [splittingItem, setSplittingItem] = useState<Item | null>(null)
  const [splitObjetos, setSplitObjetos] = useState<string[]>(['', ''])
  const [filtersOpen, setFiltersOpen] = useState(false) // Mobile filters toggle
  const [formData, setFormData] = useState<Partial<Item>>({
    identificador: '',
    categoria: '',
    subcategoria: '',
    objeto: '',
    condicion: '',
    año: null,
    rack: '',
    nivel: null,
    comentarios: '',
    estado: 'disponible',
  })

  // Reset items when filters change
  useEffect(() => {
    setItems(initialItems)
    setTotalCount(initialTotalCount)
    setFilters(initialFilters)
    setPendingFilters(initialFilters)
  }, [initialItems, initialTotalCount, initialFilters])

  const { categorias, subcategorias, racks } = filterOptions

  const basePath = '/admin/inventario'

  const updateSearchParams = useCallback((mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(window.location.search)
    mutate(params)
    const query = params.toString()
    router.push(query ? `${basePath}?${query}` : basePath)
  }, [router, basePath])

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
      const newFilters = { ...filters }
      const { items: newItems, count } = await getItems(newFilters, {
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

  useEffect(() => {
    setSelectedItems(new Set())
  }, [items])

  const hasMore = items.length < totalCount

  const handleSelectAll = () => {
    const selectableItems = items.filter(i => !i.estado.startsWith('vendido'))
    const allSelectableAreSelected = selectableItems.length > 0 && selectableItems.every(i => selectedItems.has(i.item_id))

    if (allSelectableAreSelected) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(selectableItems.map(i => i.item_id)))
    }
  }

  const handleSelectItem = (itemId: string) => {
    const item = items.find(i => i.item_id === itemId)
    if (!item || item.estado.startsWith('vendido')) return

    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleAssign = async () => {
    if (!selectedVendedor || selectedItems.size === 0) return

    setAssigning(true)
    try {
      await assignItems(Array.from(selectedItems), selectedVendedor)
      setSelectedItems(new Set())
      setShowAssignModal(false)
      setSelectedVendedor('')
      router.refresh()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setAssigning(false)
    }
  }

  const handleExport = async () => {
    try {
      const csv = await exportItemsToCSV(filters)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleCreateNew = () => {
    setEditingItem(null)
    setFormData({
      identificador: '',
      categoria: '',
      subcategoria: '',
      objeto: '',
      condicion: '',
      año: null,
      rack: '',
      nivel: null,
      comentarios: '',
      estado: 'disponible',
    })
    setShowItemModal(true)
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setFormData({
      identificador: item.identificador || '',
      categoria: item.categoria || '',
      subcategoria: item.subcategoria || '',
      objeto: item.objeto || '',
      condicion: item.condicion || '',
      año: item.año || null,
      rack: item.rack || '',
      nivel: item.nivel || null,
      comentarios: item.comentarios || '',
      estado: item.estado,
    })
    setShowItemModal(true)
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingItem) {
        await updateItem(editingItem.item_id, formData)
      } else {
        await createItem(formData)
      }
      setShowItemModal(false)
      setEditingItem(null)
      router.refresh()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('¿Estás seguro de eliminar este item?')) return

    try {
      await deleteItem(itemId)
      router.refresh()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleSplit = (item: Item) => {
    setSplittingItem(item)
    setSplitObjetos(['', ''])
    setShowSplitModal(true)
  }

  const handleSplitSubmit = async () => {
    if (!splittingItem) return

    const validObjetos = splitObjetos.filter(o => o.trim().length > 0)
    if (validObjetos.length < 2) {
      alert('Debes ingresar al menos 2 objetos')
      return
    }

    setSaving(true)
    try {
      await splitItem(splittingItem.item_id, validObjetos)
      setShowSplitModal(false)
      setSplittingItem(null)
      setSplitObjetos(['', ''])
      router.refresh()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const vendedores = usuarios.filter(u => u.rol === 'vendedor' && u.activo)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const closeAssignModal = useCallback(() => {
    if (assigning) return
    setShowAssignModal(false)
    setSelectedVendedor('')
  }, [assigning])

  const closeItemModal = useCallback(() => {
    if (saving) return
    setShowItemModal(false)
    setEditingItem(null)
  }, [saving])

  const closeSplitModal = useCallback(() => {
    if (saving) return
    setShowSplitModal(false)
    setSplittingItem(null)
    setSplitObjetos(['', ''])
  }, [saving])

  useEffect(() => {
    if (!showAssignModal && !showItemModal && !showSplitModal) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (showItemModal) {
        closeItemModal()
        return
      }
      if (showAssignModal) {
        closeAssignModal()
        return
      }
      if (showSplitModal) {
        closeSplitModal()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showAssignModal, showItemModal, showSplitModal, closeAssignModal, closeItemModal, closeSplitModal])

  // Modal content to be rendered via portal
  const modalContent = (
    <>
      {/* Assign Modal */}
      {showAssignModal && (
        <>
          <div
            className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 z-[9999]"
            onClick={closeAssignModal}
            aria-hidden="true"
          />
          <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-md pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="assign-items-title"
              aria-describedby="assign-items-desc"
              tabIndex={-1}
            >
              <h2 id="assign-items-title" className="text-2xl font-bold mb-4">
                Asignar Items
              </h2>
              <p id="assign-items-desc" className="text-slate-600 dark:text-slate-400 mb-4">
                Asignar {selectedItems.size} item(s) a un vendedor
              </p>
              <select
                value={selectedVendedor}
                onChange={(e) => setSelectedVendedor(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg mb-4 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                autoFocus
              >
                <option value="">Seleccionar vendedor</option>
                {vendedores.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  onClick={handleAssign}
                  disabled={!selectedVendedor || assigning}
                  className="flex-1 px-4 py-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  {assigning ? 'Asignando...' : 'Asignar'}
                </button>
                <button
                  onClick={closeAssignModal}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Item Modal */}
      {showItemModal && (
        <>
          <div
            className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 z-[9999]"
            onClick={closeItemModal}
            aria-hidden="true"
          />
          <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
            <div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-2xl my-8 pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="item-modal-title"
              tabIndex={-1}
            >
              <h2 id="item-modal-title" className="text-2xl font-bold mb-4">
                {editingItem ? 'Editar Item' : 'Crear Item'}
              </h2>
              <form onSubmit={handleSaveItem} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Identificador
                    </label>
                    <input
                      type="text"
                      value={formData.identificador || ''}
                      onChange={(e) => setFormData({ ...formData, identificador: e.target.value || null })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      placeholder="ABC-001"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="asignado">Asignado</option>
                      <option value="vendido_pendiente">Vendido Pendiente</option>
                      <option value="vendido_aprobado">Vendido Aprobado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={formData.categoria || ''}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value || null })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      placeholder="Figuras"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Subcategoría
                    </label>
                    <input
                      type="text"
                      value={formData.subcategoria || ''}
                      onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value || null })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      placeholder="Action Figures"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Objeto
                    </label>
                    <input
                      type="text"
                      value={formData.objeto || ''}
                      onChange={(e) => setFormData({ ...formData, objeto: e.target.value || null })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      placeholder="Superman Classic Action Figure"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Condición
                    </label>
                    <input
                      type="text"
                      value={formData.condicion || ''}
                      onChange={(e) => setFormData({ ...formData, condicion: e.target.value || null })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      placeholder="Excelente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Año
                    </label>
                    <input
                      type="text"
                      value={formData.año || ''}
                      onChange={(e) => setFormData({ ...formData, año: e.target.value || null })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      placeholder="2020 o VARIOS"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Rack
                    </label>
                    <input
                      type="text"
                      value={formData.rack || ''}
                      onChange={(e) => setFormData({ ...formData, rack: e.target.value || null })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      placeholder="Rack A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nivel
                    </label>
                    <input
                      type="number"
                      value={formData.nivel || ''}
                      onChange={(e) => setFormData({ ...formData, nivel: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      placeholder="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Comentarios
                    </label>
                    <textarea
                      value={formData.comentarios || ''}
                      onChange={(e) => setFormData({ ...formData, comentarios: e.target.value || null })}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      placeholder="Notas adicionales..."
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : editingItem ? 'Guardar Cambios' : 'Crear Item'}
                  </button>
                  <button
                    type="button"
                    onClick={closeItemModal}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Split Modal */}
      {showSplitModal && splittingItem && (
        <>
          <div
            className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 z-[9999]"
            onClick={closeSplitModal}
            aria-hidden="true"
          />
          <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full p-6 pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="split-item-title"
              aria-describedby="split-item-desc"
              tabIndex={-1}
            >
              <h2 id="split-item-title" className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Dividir Item
              </h2>

              <div className="mb-4">
                <p id="split-item-desc" className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Objeto original:
                </p>
                <p className="text-base font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                  {splittingItem.objeto || '-'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nuevos objetos (uno por línea):
                </label>
                <div className="space-y-2">
                  {splitObjetos.map((objeto, index) => (
                    <input
                      key={index}
                      type="text"
                      value={objeto}
                      onChange={(e) => {
                        const newObjetos = [...splitObjetos]
                        newObjetos[index] = e.target.value
                        setSplitObjetos(newObjetos)
                      }}
                      placeholder={`Objeto ${index + 1}`}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSplitObjetos([...splitObjetos, ''])}
                  className="mt-2 text-sm text-[#2d5a8a] dark:text-[#6ba3d3] hover:text-[#1e3a5f] dark:hover:text-[#4a7bc8] font-medium"
                >
                  + Agregar otro objeto
                </button>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeSplitModal}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSplitSubmit}
                  disabled={saving}
                  className="px-4 py-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {saving ? 'Dividiendo...' : 'Dividir'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Inventario ({totalCount} items)
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg font-semibold transition-colors flex-1 sm:flex-initial"
            title="Crear Item"
            aria-label="Crear Item"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Crear Item</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg font-semibold transition-colors flex-1 sm:flex-initial"
            title="Exportar CSV"
            aria-label="Exportar CSV"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exportar CSV</span>
          </button>
          {selectedItems.size > 0 && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2 bg-[#1e3a5f] hover:bg-[#0f1e3a] text-white rounded-lg font-semibold transition-colors"
              title={`Asignar ${selectedItems.size} item(s)`}
              aria-label={`Asignar ${selectedItems.size} item(s)`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="hidden lg:inline">Asignar</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters - Mobile optimized with collapsible */}
      <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow">
        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="lg:hidden w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          aria-expanded={filtersOpen}
          aria-controls="inventario-filters"
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
        <div id="inventario-filters" className={`${filtersOpen ? 'block' : 'hidden'} lg:block p-3 lg:p-4`}>
          <div className="flex flex-col gap-4">
            {/* Top Row: Search + Actions */}
            <div className="flex items-center gap-3">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={pendingFilters.search || ''}
                  onChange={(e) => handlePendingFilterChange('search', e.target.value)}
                  aria-label="Buscar items"
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
              <select
                value={pendingFilters.categoria || ''}
                onChange={(e) => handlePendingFilterChange('categoria', e.target.value)}
                aria-label="Filtrar por categoría"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm lg:text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(c => (
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
                {subcategorias.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={pendingFilters.rack || ''}
                onChange={(e) => handlePendingFilterChange('rack', e.target.value)}
                aria-label="Filtrar por rack"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm lg:text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
              >
                <option value="">Todos los racks</option>
                {racks.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select
                value={pendingFilters.asignado_a || ''}
                onChange={(e) => handlePendingFilterChange('asignado_a', e.target.value)}
                aria-label="Filtrar por vendedor"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm lg:text-base bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
              >
                <option value="">Todos los vendedores</option>
                {vendedores.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-3">
        {/* Select All Checkbox */}
        <div className="flex items-center gap-2 px-2 py-2 bg-white dark:bg-slate-800 rounded-lg shadow">
          <input
            type="checkbox"
            checked={items.filter(i => !i.estado.startsWith('vendido')).length > 0 && items.filter(i => !i.estado.startsWith('vendido')).every(i => selectedItems.has(i.item_id))}
            onChange={handleSelectAll}
            className="w-5 h-5 text-[#2d5a8a] rounded focus:ring-[#2d5a8a]"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Seleccionar disponibles ({selectedItems.size} seleccionados)
          </span>
        </div>

        {/* Item Cards */}
        {items.map((item) => {
          const assignedUser = item.asignado_a ? usuarios.find(u => u.id === item.asignado_a) : null
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
              {/* Header with checkbox, ID, toggle */}
              <div className="p-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.item_id)}
                  onChange={() => handleSelectItem(item.item_id)}
                  disabled={item.estado.startsWith('vendido')}
                  className={`w-5 h-5 text-[#2d5a8a] rounded focus:ring-[#2d5a8a] flex-shrink-0 mt-0.5 ${item.estado.startsWith('vendido') ? 'opacity-50 cursor-not-allowed' : ''}`}
                />

                <div className="flex-1 min-w-0" onClick={() => toggleExpanded(item.item_id)}>
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate pr-2">
                        {item.objeto || '-'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.categoria || '-'}{item.subcategoria ? ` / ${item.subcategoria}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(item.estado)}`}>
                        {item.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleExpanded(item.item_id)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedItems.has(item.item_id) ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Collapsible Content */}
              {expandedItems.has(item.item_id) && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/50">
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
                    {assignedUser && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Asignado a</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {assignedUser.nombre}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 mt-2 border-t border-gray-200 dark:border-slate-700">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => handleSplit(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#6ba3d3] hover:bg-[#4a7bc8] text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V10M12 10L7 5M12 10l5-5M7 5l-2.5 2.5M17 5l2.5 2.5" />
                      </svg>
                      Dividir
                    </button>
                    <button
                      onClick={() => handleDelete(item.item_id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#4a7bc8] hover:bg-[#2d5a8a] text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
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
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={items.filter(i => !i.estado.startsWith('vendido')).length > 0 && items.filter(i => !i.estado.startsWith('vendido')).every(i => selectedItems.has(i.item_id))}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-[#2d5a8a] rounded focus:ring-[#2d5a8a]"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Objeto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Asignado a</th>
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
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.item_id)}
                      onChange={() => handleSelectItem(item.item_id)}
                      disabled={item.estado.startsWith('vendido')}
                      className={`w-4 h-4 text-[#2d5a8a] rounded focus:ring-[#2d5a8a] ${item.estado.startsWith('vendido') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </td>
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
                    {item.asignado_a ? usuarios.find(u => u.id === item.asignado_a)?.nombre || '-' : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {item.rack || '-'} {item.nivel && `/ ${item.nivel}`}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg transition-colors"
                        title="Editar"
                        aria-label="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleSplit(item)}
                        className="p-2 bg-[#6ba3d3] hover:bg-[#4a7bc8] text-white rounded-lg transition-colors"
                        title="Dividir"
                        aria-label="Dividir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V10M12 10L7 5M12 10l5-5M7 5l-2.5 2.5M17 5l2.5 2.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.item_id)}
                        className="p-2 bg-[#4a7bc8] hover:bg-[#2d5a8a] text-white rounded-lg transition-colors"
                        title="Eliminar"
                        aria-label="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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

      {/* Render modals via portal to escape parent overflow constraints */}
      {mounted && typeof window !== 'undefined' && createPortal(modalContent, document.body)}
    </div>
  )
}
