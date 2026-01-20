'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth, requireAdmin, requireInventoryAccess } from '@/lib/utils/auth'
import { Item } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getItems(
  filters?: {
    categoria?: string
    subcategoria?: string
    estado?: string
    rack?: string
    nivel?: number
    condicion?: string
    año?: number
    asignado_a?: string
    search?: string
  },
  pagination?: {
    offset?: number
    limit?: number
  }
) {
  await requireAuth()
  const supabase = await createClient()
  const isAdmin = await requireAdmin().then(() => true).catch(() => false)

  const limit = pagination?.limit ?? 25
  const offset = pagination?.offset ?? 0
  const from = offset
  const to = offset + limit - 1

  let query = supabase
    .from('items')
    .select(`
      *,
      asignado_a_usuario:usuarios!items_asignado_a_fkey(*),
      creado_por_usuario:usuarios!items_creado_por_fkey(*)
    `, { count: 'exact' })
    .order('creado_en', { ascending: false })

  // Apply RLS: vendedores only see assigned items
  if (!isAdmin) {
    const { data: { user } } = await supabase.auth.getUser()
    query = query.eq('asignado_a', user?.id)
  }

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
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.search)
    if (isUUID) {
      query = query.or(`objeto.ilike.%${filters.search}%,identificador.ilike.%${filters.search}%,item_id.eq.${filters.search}`)
    } else {
      query = query.or(`objeto.ilike.%${filters.search}%,identificador.ilike.%${filters.search}%`)
    }
  }

  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw new Error(`Error fetching items: ${error.message}`)
  }

  return { items: data as Item[], count: count ?? 0 }
}

export async function getItemFilterOptions() {
  await requireAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('items')
    .select('categoria, subcategoria, rack, condicion, año')

  if (error) {
    throw new Error(`Error fetching item filters: ${error.message}`)
  }

  const categorias = new Set<string>()
  const subcategorias = new Set<string>()
  const racks = new Set<string>()
  const condiciones = new Set<string>()
  const años = new Set<number>()

  type FilterRow = {
    categoria: string | null
    subcategoria: string | null
    rack: string | null
    condicion: string | null
    año: number | null
  }

  const rows = (data as unknown) as FilterRow[] | null
  for (const row of rows ?? []) {
    if (row.categoria) categorias.add(row.categoria)
    if (row.subcategoria) subcategorias.add(row.subcategoria)
    if (row.rack) racks.add(row.rack)
    if (row.condicion) condiciones.add(row.condicion)
    if (row.año !== null && row.año !== undefined) años.add(row.año)
  }

  return {
    categorias: Array.from(categorias).sort((a, b) => a.localeCompare(b)),
    subcategorias: Array.from(subcategorias).sort((a, b) => a.localeCompare(b)),
    racks: Array.from(racks).sort((a, b) => a.localeCompare(b)),
    condiciones: Array.from(condiciones).sort((a, b) => a.localeCompare(b)),
    años: Array.from(años).sort((a, b) => b - a),
  }
}

export async function getVendorFilterOptions(vendedorId: string) {
  await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('items')
    .select('categoria, subcategoria, rack')
    .eq('asignado_a', vendedorId)

  if (error) {
    throw new Error(`Error fetching vendor filters: ${error.message}`)
  }

  const categorias = new Set<string>()
  const subcategorias = new Set<string>()
  const racks = new Set<string>()

  type FilterRow = {
    categoria: string | null
    subcategoria: string | null
    rack: string | null
  }

  const rows = (data as unknown) as FilterRow[] | null
  for (const row of rows ?? []) {
    if (row.categoria) categorias.add(row.categoria)
    if (row.subcategoria) subcategorias.add(row.subcategoria)
    if (row.rack) racks.add(row.rack)
  }

  return {
    categorias: Array.from(categorias).sort((a, b) => a.localeCompare(b)),
    subcategorias: Array.from(subcategorias).sort((a, b) => a.localeCompare(b)),
    racks: Array.from(racks).sort((a, b) => a.localeCompare(b)),
  }
}

export async function getItemById(itemId: string) {
  await requireAuth()
  const supabase = await createClient()
  const isAdmin = await requireAdmin().then(() => true).catch(() => false)

  let query = supabase
    .from('items')
    .select(`
      *,
      asignado_a_usuario:usuarios!items_asignado_a_fkey(*),
      creado_por_usuario:usuarios!items_creado_por_fkey(*)
    `)
    .eq('item_id', itemId)
    .single()

  const { data, error } = await query

  if (error) {
    throw new Error(`Error fetching item: ${error.message}`)
  }

  // Check RLS: vendedores can only see assigned items
  if (!isAdmin && data.asignado_a !== (await supabase.auth.getUser()).data.user?.id) {
    throw new Error('Unauthorized')
  }

  return data as Item
}

export async function createItem(item: Partial<Item>) {
  await requireInventoryAccess()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('items')
    .insert({
      ...item,
      creado_por: user?.id,
      estado: 'disponible',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating item: ${error.message}`)
  }

  revalidatePath('/admin/inventario')
  return data as Item
}

export async function updateItem(itemId: string, updates: Partial<Item>) {
  await requireAuth()
  const supabase = await createClient()
  const isAdmin = await requireAdmin().then(() => true).catch(() => false)
  const isSubadmin = await requireInventoryAccess().then(() => true).catch(() => false)

  // Vendedores can only update certain fields
  if (!isAdmin && !isSubadmin) {
    const { data: { user } } = await supabase.auth.getUser()
    // Check if item is assigned to user
    const { data: item } = await supabase
      .from('items')
      .select('asignado_a')
      .eq('item_id', itemId)
      .single()

    if (item?.asignado_a !== user?.id) {
      throw new Error('Unauthorized')
    }

    // Remove fields vendedores cannot update
    delete updates.estado
    delete updates.asignado_a
    delete updates.asignado_en
  }

  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('item_id', itemId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating item: ${error.message}`)
  }

  revalidatePath('/admin/inventario')
  revalidatePath('/vendedor/mis-items')
  return data as Item
}

export async function assignItems(itemIds: string[], vendedorId: string) {
  await requireAdmin()
  const supabase = await createClient()

  // Only assign items that are 'disponible' or 'asignado'
  const { data: items, error: fetchError } = await supabase
    .from('items')
    .select('item_id, estado')
    .in('item_id', itemIds)
    .in('estado', ['disponible', 'asignado'])

  if (fetchError) {
    throw new Error(`Error fetching items: ${fetchError.message}`)
  }

  const validItemIds = items.map(i => i.item_id)

  const { data, error } = await supabase
    .from('items')
    .update({
      asignado_a: vendedorId,
      asignado_en: new Date().toISOString(),
      estado: 'asignado',
    })
    .in('item_id', validItemIds)
    .select()

  if (error) {
    throw new Error(`Error assigning items: ${error.message}`)
  }

  revalidatePath('/admin/inventario')
  revalidatePath('/vendedor/mis-items')
  return data as Item[]
}

export async function deleteItem(itemId: string) {
  await requireInventoryAccess()
  const supabase = await createClient()

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('item_id', itemId)

  if (error) {
    throw new Error(`Error deleting item: ${error.message}`)
  }

  revalidatePath('/admin/inventario')
}

export async function splitItem(
  itemId: string,
  newObjetos: string[] // Array de nuevos objetos
) {
  await requireInventoryAccess()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Obtener el item original
  const { data: originalItem, error: fetchError } = await supabase
    .from('items')
    .select('*')
    .eq('item_id', itemId)
    .single()

  if (fetchError || !originalItem) {
    throw new Error(`Error fetching item: ${fetchError?.message}`)
  }

  // Verificar que el item no esté vendido
  if (originalItem.estado === 'vendido_aprobado' || originalItem.estado === 'vendido_pendiente') {
    throw new Error('No se puede dividir un item que ya está vendido')
  }

  // Filtrar objetos vacíos
  const validObjetos = newObjetos.filter(o => o.trim().length > 0)
  if (validObjetos.length < 2) {
    throw new Error('Debes ingresar al menos 2 objetos')
  }

  // Crear los nuevos items
  const newItems = validObjetos.map(objeto => ({
    identificador: originalItem.identificador,
    categoria: originalItem.categoria,
    subcategoria: originalItem.subcategoria,
    objeto: objeto.trim(),
    condicion: originalItem.condicion,
    año: originalItem.año,
    rack: originalItem.rack,
    nivel: originalItem.nivel,
    comentarios: originalItem.comentarios,
    estado: 'disponible' as const,
    creado_por: user?.id || null,
    // Resetear asignación si estaba asignado
    asignado_a: null,
    asignado_en: null,
  }))

  // Insertar los nuevos items
  const { error: insertError } = await supabase
    .from('items')
    .insert(newItems)

  if (insertError) {
    throw new Error(`Error creating new items: ${insertError.message}`)
  }

  // Eliminar el item original
  const { error: deleteError } = await supabase
    .from('items')
    .delete()
    .eq('item_id', itemId)

  if (deleteError) {
    throw new Error(`Error deleting original item: ${deleteError.message}`)
  }

  revalidatePath('/admin/inventario')
  return { success: true, count: newItems.length }
}

export async function unassignItems(itemIds: string[]) {
  await requireAdmin()
  const supabase = await createClient()

  // Only unassign items that are currently assigned
  const { data: items, error: fetchError } = await supabase
    .from('items')
    .select('item_id, estado')
    .in('item_id', itemIds)
    .eq('estado', 'asignado')

  if (fetchError) {
    throw new Error(`Error fetching items: ${fetchError.message}`)
  }

  const validItemIds = items.map(i => i.item_id)

  if (validItemIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('items')
    .update({
      asignado_a: null,
      asignado_en: null,
      estado: 'disponible',
    })
    .in('item_id', validItemIds)
    .select()

  if (error) {
    throw new Error(`Error unassigning items: ${error.message}`)
  }

  revalidatePath('/admin/inventario')
  revalidatePath('/vendedor/mis-items')
  return data as Item[]
}
