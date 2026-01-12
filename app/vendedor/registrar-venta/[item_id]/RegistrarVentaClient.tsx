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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
        Registrar Venta
      </h1>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Item</h2>
        <p className="text-slate-600 dark:text-slate-400">
          <strong>Objeto:</strong> {item.objeto || '-'}
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          <strong>Identificador:</strong> {item.identificador || item.item_id.substring(0, 8)}
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          <strong>Categoría:</strong> {item.categoria || '-'} {item.subcategoria && `/ ${item.subcategoria}`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Precio *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.precio}
            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Moneda *
          </label>
          <select
            value={formData.moneda}
            onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Fecha de Venta *
          </label>
          <input
            type="date"
            value={formData.fecha_venta}
            onChange={(e) => setFormData({ ...formData, fecha_venta: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Canal (opcional)
          </label>
          <input
            type="text"
            value={formData.canal}
            onChange={(e) => setFormData({ ...formData, canal: e.target.value })}
            placeholder="MercadoLibre, eBay, en_persona, etc."
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Enlace de Google Drive (Evidencia) *
          </label>
          <input
            type="url"
            value={formData.evidencia_url}
            onChange={(e) => setFormData({ ...formData, evidencia_url: e.target.value })}
            required
            placeholder="https://drive.google.com/..."
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="mt-1 text-xs text-slate-500">
            Enlace público de Google Drive con la evidencia de la venta
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {submitting ? 'Registrando...' : 'Registrar Venta'}
          </button>
          <a
            href="/vendedor/mis-items"
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}

