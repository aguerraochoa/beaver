'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Item } from '@/types/database'
import { createVenta } from '@/app/actions/ventas'

interface RegistrarVentaClientProps {
  item: Item
}

export default function RegistrarVentaClient({ item }: RegistrarVentaClientProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    precio: '',
    moneda: 'MXN',
    fecha_venta: new Date().toISOString().split('T')[0],
    canal: '',
    evidencia_url: '',
    notas: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent double submission
    if (submitting) return

    setSubmitting(true)

    try {
      await createVenta({
        item_id: item.item_id,
        precio: parseFloat(formData.precio),
        moneda: formData.moneda,
        fecha_venta: formData.fecha_venta,
        canal: formData.canal || undefined,
        evidencia_url: formData.evidencia_url,
        notas: formData.notas || undefined,
      })
      router.push('/vendedor/ventas')
    } catch (error: any) {
      alert(`Error: ${error.message}`)
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
        Registrar Venta
      </h1>

      {/* Item Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow p-4 lg:p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Item</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Objeto</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {item.objeto || '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Identificador</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {item.identificador || item.item_id.substring(0, 8)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Categoría</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {item.categoria || '-'} {item.subcategoria && `/ ${item.subcategoria}`}
            </p>
          </div>
          {item.condicion && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Condición</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {item.condicion}
              </p>
            </div>
          )}
          {item.año && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Año</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {item.año}
              </p>
            </div>
          )}
          {(item.rack || item.nivel) && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ubicación</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {item.rack || '-'} {item.nivel && `/ Nivel ${item.nivel}`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sale Form */}
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {/* Price and Currency */}
        <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Detalles de la Venta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Precio *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                required
                className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] text-sm lg:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Moneda *
              </label>
              <select
                value={formData.moneda}
                onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] text-sm lg:text-base"
              >
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Fecha de Venta *
              </label>
              <input
                type="date"
                value={formData.fecha_venta}
                onChange={(e) => setFormData({ ...formData, fecha_venta: e.target.value })}
                required
                className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] text-sm lg:text-base h-[42px] lg:h-auto"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Canal (opcional)
              </label>
              <input
                type="text"
                value={formData.canal}
                onChange={(e) => setFormData({ ...formData, canal: e.target.value })}
                placeholder="MercadoLibre, eBay, en_persona, etc."
                className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] text-sm lg:text-base"
              />
            </div>
          </div>
        </div>

        {/* Evidence */}
        <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Evidencia</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Enlace de Google Drive *
            </label>
            <input
              type="url"
              value={formData.evidencia_url}
              onChange={(e) => setFormData({ ...formData, evidencia_url: e.target.value })}
              required
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] text-sm lg:text-base"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Enlace público de Google Drive con la evidencia de la venta
            </p>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Notas</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              placeholder="Cualquier información adicional sobre la venta..."
              className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] text-sm lg:text-base"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-2.5 lg:py-3 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm lg:text-base"
            >
              {submitting ? 'Registrando...' : 'Registrar Venta'}
            </button>
            <a
              href="/vendedor/mis-items"
              className="px-6 py-2.5 lg:py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm lg:text-base"
            >
              Cancelar
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}
