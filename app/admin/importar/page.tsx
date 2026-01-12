'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { importCSV } from '@/app/actions/csv'
import { CSVRow, CSVImportError } from '@/types/database'
import Layout from '@/components/Layout'

export const dynamic = 'force-dynamic'

export default function AdminImportarPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CSVRow[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: CSVImportError[] } | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setResult(null)

    // Parse CSV preview
    const text = await selectedFile.text()
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length === 0) return

    const headers = lines[0].split(',').map(h => h.trim())
    const previewRows: CSVRow[] = []

    for (let i = 1; i < Math.min(11, lines.length); i++) {
      const values = lines[i].split(',')
      const row: CSVRow = {}
      headers.forEach((header, idx) => {
        row[header as keyof CSVRow] = values[idx]?.trim() || ''
      })
      previewRows.push(row)
    }

    setPreview(previewRows)
  }

  const parseCSV = async (): Promise<CSVRow[]> => {
    if (!file) return []

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim())
    const rows: CSVRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const row: CSVRow = {}
      headers.forEach((header, idx) => {
        const value = values[idx]?.trim() || ''
        row[header as keyof CSVRow] = value || undefined
      })
      rows.push(row)
    }

    return rows
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    try {
      const rows = await parseCSV()
      const result = await importCSV(rows)
      setResult(result)
      if (result.errors.length === 0) {
        setTimeout(() => {
          router.push('/admin/inventario')
        }, 2000)
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setImporting(false)
    }
  }

  const handleExportErrors = () => {
    if (!result || result.errors.length === 0) return

    const headers = ['fila', 'error', 'identificador', 'categoria', 'subcategoria', 'objeto', 'condicion', 'año', 'rack', 'nivel', 'comentarios']
    const csvRows = [
      headers.join(','),
      ...result.errors.map(err => [
        err.fila,
        `"${err.error.replace(/"/g, '""')}"`,
        err.datos.identificador || '',
        err.datos.categoria || '',
        err.datos.subcategoria || '',
        err.datos.objeto || '',
        err.datos.condicion || '',
        err.datos.año || '',
        err.datos.rack || '',
        err.datos.nivel || '',
        err.datos.comentarios || '',
      ].join(','))
    ]

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `errores_importacion_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Importar CSV
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Importa items desde un archivo CSV
        </p>
      </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Seleccionar archivo CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#2d5a8a] file:text-white hover:file:bg-[#1e3a5f]"
            />
            <p className="mt-2 text-xs text-slate-500">
              El CSV debe tener las columnas: identificador, categoria, subcategoria, objeto, condicion, año, rack, nivel, comentarios
            </p>
          </div>

          {preview.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Vista previa (primeras 10 filas)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                      {Object.keys(preview[0] || {}).map(key => (
                        <th key={key} className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {preview.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((value, vIdx) => (
                          <td key={vIdx} className="px-4 py-2 text-sm text-slate-900 dark:text-slate-100">
                            {value || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {file && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full py-3 px-4 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {importing ? 'Importando...' : 'Importar'}
            </button>
          )}

          {result && (
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
              <h3 className="text-lg font-semibold mb-2">Resultado de la importación</h3>
              <p className="text-green-600 dark:text-green-400 mb-2">
                ✓ {result.success} items importados exitosamente
              </p>
              {result.errors.length > 0 && (
                <div>
                  <p className="text-red-600 dark:text-red-400 mb-2">
                    ✗ {result.errors.length} errores encontrados
                  </p>
                  <button
                    onClick={handleExportErrors}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                  >
                    Descargar errores (CSV)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
    </Layout>
  )
}

