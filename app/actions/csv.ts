'use server'

import { requireAdmin } from '@/lib/utils/auth'
import { createClient } from '@/lib/supabase/server'
import { CSVRow, CSVImportError } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function importCSV(rows: CSVRow[]): Promise<{
  success: number
  errors: CSVImportError[]
}> {
  await requireAdmin()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const errors: CSVImportError[] = []
  const successItems: any[] = []
  const seenRows = new Map<string, number>() // Track duplicates

  // Limit to 5000 rows
  const rowsToProcess = rows.slice(0, 5000)

  for (let i = 0; i < rowsToProcess.length; i++) {
    const row = rowsToProcess[i]
    const fila = i + 2 // +2 because row 1 is header, and arrays are 0-indexed

    try {
      // Normalize row data
      const normalized: any = {
        creado_por: user?.id,
        estado: 'disponible',
      }

      // Trim text fields and convert empty strings to null
      if (row.identificador !== undefined) {
        normalized.identificador = row.identificador?.trim() || null
      }
      if (row.categoria !== undefined) {
        normalized.categoria = row.categoria?.trim() || null
      }
      if (row.subcategoria !== undefined) {
        normalized.subcategoria = row.subcategoria?.trim() || null
      }
      if (row.objeto !== undefined) {
        normalized.objeto = row.objeto?.trim() || null
      }
      if (row.condicion !== undefined) {
        normalized.condicion = row.condicion?.trim() || null
      }
      if (row.rack !== undefined) {
        normalized.rack = row.rack?.trim() || null
      }
      if (row.comentarios !== undefined) {
        normalized.comentarios = row.comentarios?.trim() || null
      }

      // Convert año to string (no parsing needs)
      if (row.año !== undefined && row.año !== null && row.año !== '') {
        const añoStr = String(row.año).trim()
        normalized.año = añoStr
      } else {
        normalized.año = null
      }

      // Convert nivel to integer
      if (row.nivel !== undefined && row.nivel !== null && row.nivel !== '') {
        const nivelNum = typeof row.nivel === 'string' ? parseInt(row.nivel.trim(), 10) : row.nivel
        if (isNaN(nivelNum)) {
          errors.push({
            fila,
            error: `Error al convertir nivel a número: ${row.nivel}`,
            datos: row,
          })
          continue
        }
        normalized.nivel = nivelNum
      } else {
        normalized.nivel = null
      }

      // Check if at least one field has a value
      const hasValue = Object.values(normalized).some(
        (val) => val !== null && val !== undefined && val !== ''
      )

      if (!hasValue) {
        errors.push({
          fila,
          error: 'Todas las columnas están vacías',
          datos: row,
        })
        continue
      }

      // Duplicates are allowed per user request, so we just add it
      successItems.push(normalized)
    } catch (error: any) {
      errors.push({
        fila,
        error: error.message || 'Error desconocido',
        datos: row,
      })
    }
  }

  // Insert successful items in batch
  if (successItems.length > 0) {
    const { error: insertError } = await supabase
      .from('items')
      .insert(successItems)

    if (insertError) {
      throw new Error(`Error inserting items: ${insertError.message}`)
    }
  }

  revalidatePath('/admin/inventario')
  return {
    success: successItems.length,
    errors,
  }
}

export async function exportItemsToCSV(filters?: {
  categoria?: string
  subcategoria?: string
  estado?: string
  rack?: string
  nivel?: number
  condicion?: string
  año?: number
  asignado_a?: string
  search?: string
}): Promise<string> {
  await requireAdmin()
  const supabase = await createClient()

  let query = supabase
    .from('items')
    .select('identificador,categoria,subcategoria,objeto,condicion,año,rack,nivel,comentarios,estado,item_id,creado_en')
    .order('creado_en', { ascending: false })

  if (filters?.categoria) {
    query = query.eq('categoria', filters.categoria)
  }
  if (filters?.subcategoria) {
    query = query.eq('subcategoria', filters.subcategoria)
  }
  if (filters?.estado) {
    query = query.eq('estado', filters.estado)
  }
  if (filters?.rack) {
    query = query.eq('rack', filters.rack)
  }
  if (filters?.nivel) {
    query = query.eq('nivel', filters.nivel)
  }
  if (filters?.condicion) {
    query = query.eq('condicion', filters.condicion)
  }
  if (filters?.año) {
    query = query.eq('año', filters.año)
  }
  if (filters?.asignado_a) {
    query = query.eq('asignado_a', filters.asignado_a)
  }
  if (filters?.search) {
    query = query.or(`objeto.ilike.%${filters.search}%,identificador.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Error exporting items: ${error.message}`)
  }

  // Convert to CSV
  const headers = [
    'identificador',
    'categoria',
    'subcategoria',
    'objeto',
    'condicion',
    'año',
    'rack',
    'nivel',
    'comentarios',
    'estado',
    'item_id',
    'creado_en',
  ]

  const csvRows = [
    headers.join(','),
    ...(data || []).map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof typeof row]
          if (value === null || value === undefined) {
            return ''
          }
          // Escape commas and quotes in CSV
          const stringValue = String(value)
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        })
        .join(',')
    ),
  ]

  return csvRows.join('\n')
}

