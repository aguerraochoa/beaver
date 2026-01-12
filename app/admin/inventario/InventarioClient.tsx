'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { Item, Usuario } from '@/types/database'
import { assignItems, createItem, updateItem, deleteItem, splitItem } from '@/app/actions/items'
import { exportItemsToCSV } from '@/app/actions/csv'

interface InventarioClientProps {
  items: Item[]
  usuarios: Usuario[]
  filters: any
}

export default function InventarioClient({ items, usuarios, filters }: InventarioClientProps) {
  const router = useRouter()
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

  // Get unique values for filters
  const categorias = useMemo(() => [...new Set(items.map(i => i.categoria).filter((c): c is string => Boolean(c)))], [items])
  const subcategorias = useMemo(() => [...new Set(items.map(i => i.subcategoria).filter((s): s is string => Boolean(s)))], [items])
  const racks = useMemo(() => [...new Set(items.map(i => i.rack).filter((r): r is string => Boolean(r)))], [items])
  const condiciones = useMemo(() => [...new Set(items.map(i => i.condicion).filter((c): c is string => Boolean(c)))], [items])
  const años = useMemo(() => [...new Set(items.map(i => i.año).filter((a): a is number => a !== null && a !== undefined))].sort((a, b) => b - a), [items])

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/inventario?${params.toString()}`)
  }

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map(i => i.item_id)))
    }
  }

  const handleSelectItem = (itemId: string) => {
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

  // Modal content to be rendered via portal
  const modalContent = (
    <>
      {/* Assign Modal */}
      {showAssignModal && (
        <>
          <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 z-[9999]" />
          <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-md pointer-events-auto">
              <h2 className="text-2xl font-bold mb-4">Asignar Items</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Asignar {selectedItems.size} item(s) a un vendedor
              </p>
              <select
                value={selectedVendedor}
                onChange={(e) => setSelectedVendedor(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-4"
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
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedVendedor('')
                  }}
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
          <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 z-[9999]" />
          <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-2xl my-8 pointer-events-auto">
              <h2 className="text-2xl font-bold mb-4">
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
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="ABC-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                      className="w-full px-4 py-2 border rounded-lg"
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
                      className="w-full px-4 py-2 border rounded-lg"
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
                      className="w-full px-4 py-2 border rounded-lg"
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
                      className="w-full px-4 py-2 border rounded-lg"
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
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Excelente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Año
                    </label>
                    <input
                      type="number"
                      value={formData.año || ''}
                      onChange={(e) => setFormData({ ...formData, año: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="2020"
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
                      className="w-full px-4 py-2 border rounded-lg"
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
                      className="w-full px-4 py-2 border rounded-lg"
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
                      className="w-full px-4 py-2 border rounded-lg"
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
                    onClick={() => {
                      setShowItemModal(false)
                      setEditingItem(null)
                    }}
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
          <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 z-[9999]" />
          <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 pointer-events-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Dividir Item</h2>
              
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">Objeto original:</p>
                <p className="text-base font-medium text-slate-900 bg-slate-50 p-3 rounded-lg">
                  {splittingItem.objeto || '-'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSplitObjetos([...splitObjetos, ''])}
                  className="mt-2 text-sm text-[#2d5a8a] hover:text-[#1e3a5f] font-medium"
                >
                  + Agregar otro objeto
                </button>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowSplitModal(false)
                    setSplittingItem(null)
                    setSplitObjetos(['', ''])
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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
          Inventario ({items.length} items)
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
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
            <select
              value={filters.categoria || ''}
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={filters.subcategoria || ''}
              onChange={(e) => handleFilterChange('subcategoria', e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
            >
              <option value="">Todas las subcategorías</option>
              {subcategorias.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={filters.rack || ''}
              onChange={(e) => handleFilterChange('rack', e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
            >
              <option value="">Todos los racks</option>
              {racks.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select
              value={filters.asignado_a || ''}
              onChange={(e) => handleFilterChange('asignado_a', e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]"
            >
              <option value="">Todos los vendedores</option>
              {vendedores.map(v => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-3">
        {/* Select All Checkbox */}
        <div className="flex items-center gap-2 px-2 py-2 bg-white dark:bg-slate-800 rounded-lg shadow">
          <input
            type="checkbox"
            checked={selectedItems.size === items.length && items.length > 0}
            onChange={handleSelectAll}
            className="w-5 h-5 text-[#2d5a8a] rounded focus:ring-[#2d5a8a]"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Seleccionar todos ({selectedItems.size} seleccionados)
          </span>
        </div>

        {/* Item Cards */}
        {items.map((item) => {
          const assignedUser = item.asignado_a ? usuarios.find(u => u.id === item.asignado_a) : null
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
              {/* Header with checkbox and ID */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.item_id)}
                    onChange={() => handleSelectItem(item.item_id)}
                    className="w-5 h-5 text-[#2d5a8a] rounded focus:ring-[#2d5a8a] flex-shrink-0 mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {item.objeto || '-'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      ID: {item.identificador || item.item_id.substring(0, 8)}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(item.estado)}`}>
                  {item.estado.replace('_', ' ')}
                </span>
              </div>

              {/* Details Grid */}
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
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={() => handleSplit(item)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#6ba3d3] hover:bg-[#4a7bc8] text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V10M12 10L7 5M12 10l5-5M7 5l-2.5 2.5M17 5l2.5 2.5" />
                  </svg>
                  Dividir
                </button>
                <button
                  onClick={() => handleDelete(item.item_id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#4a7bc8] hover:bg-[#2d5a8a] text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
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
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.size === items.length && items.length > 0}
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
                  case 'disponible': return 'bg-green-100 text-green-800'
                  case 'asignado': return 'bg-blue-100 text-blue-800'
                  case 'vendido_pendiente': return 'bg-yellow-100 text-yellow-800'
                  case 'vendido_aprobado': return 'bg-purple-100 text-purple-800'
                  default: return 'bg-gray-100 text-gray-800'
                }
              }

              return (
                <tr key={item.item_id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.item_id)}
                      onChange={() => handleSelectItem(item.item_id)}
                      className="w-4 h-4 text-[#2d5a8a] rounded focus:ring-[#2d5a8a]"
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.estado)}`}>
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
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V4M12 4L8 8M12 4l4 4M8 8l-2 2M16 8l2 2" />
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

      {/* Render modals via portal to escape parent overflow constraints */}
      {mounted && typeof window !== 'undefined' && createPortal(modalContent, document.body)}
    </div>
  )
}

