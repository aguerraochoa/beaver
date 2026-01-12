'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth, requireAdmin } from '@/lib/utils/auth'
import { Venta } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getVentas(filters?: {
  estado?: string
  vendedor_id?: string
}) {
  await requireAuth()
  const supabase = await createClient()
  const isAdmin = await requireAdmin().then(() => true).catch(() => false)

  let query = supabase
    .from('ventas')
    .select(`
      *,
      item:items(*),
      vendedor:usuarios!ventas_vendedor_id_fkey(*),
      aprobado_por_usuario:usuarios!ventas_aprobado_por_fkey(*)
    `)
    .order('creado_en', { ascending: false })

  // Apply RLS: vendedores only see their own ventas
  if (!isAdmin) {
    const { data: { user } } = await supabase.auth.getUser()
    query = query.eq('vendedor_id', user?.id)
  }

  if (filters?.estado) {
    query = query.eq('estado', filters.estado)
  }
  if (filters?.vendedor_id && isAdmin) {
    query = query.eq('vendedor_id', filters.vendedor_id)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Error fetching ventas: ${error.message}`)
  }

  return data as Venta[]
}

export async function getVentaById(ventaId: string) {
  await requireAuth()
  const supabase = await createClient()
  const isAdmin = await requireAdmin().then(() => true).catch(() => false)

  const { data, error } = await supabase
    .from('ventas')
    .select(`
      *,
      item:items(*),
      vendedor:usuarios!ventas_vendedor_id_fkey(*),
      aprobado_por_usuario:usuarios!ventas_aprobado_por_fkey(*)
    `)
    .eq('venta_id', ventaId)
    .single()

  if (error) {
    throw new Error(`Error fetching venta: ${error.message}`)
  }

  // Check RLS: vendedores can only see their own ventas
  if (!isAdmin && data.vendedor_id !== (await supabase.auth.getUser()).data.user?.id) {
    throw new Error('Unauthorized')
  }

  return data as Venta
}

export async function createVenta(venta: {
  item_id: string
  precio: number
  moneda: string
  fecha_venta: string
  canal?: string
  evidencia_url: string
  notas?: string
}) {
  await requireAuth()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if venta already exists for this item (prevent duplicates)
  const { data: existingVenta } = await supabase
    .from('ventas')
    .select('venta_id')
    .eq('item_id', venta.item_id)
    .eq('vendedor_id', user.id)
    .eq('estado', 'pendiente')
    .single()

  if (existingVenta) {
    throw new Error('Ya existe una venta pendiente para este item')
  }

  // Verify item is assigned to user and has correct state
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('item_id, estado, asignado_a')
    .eq('item_id', venta.item_id)
    .single()

  if (itemError || !item) {
    throw new Error('Item not found')
  }

  if (item.asignado_a !== user.id) {
    throw new Error('Item is not assigned to you')
  }

  if (item.estado !== 'asignado') {
    throw new Error('Item must be in "asignado" state to create a sale')
  }

  // Create venta
  const { data: ventaData, error: ventaError } = await supabase
    .from('ventas')
    .insert({
      ...venta,
      vendedor_id: user.id,
      estado: 'pendiente',
    })
    .select()
    .single()

  if (ventaError) {
    throw new Error(`Error creating venta: ${ventaError.message}`)
  }

  // Update item state (only if venta was created successfully)
  const { error: updateError } = await supabase
    .from('items')
    .update({ estado: 'vendido_pendiente' })
    .eq('item_id', venta.item_id)
    .eq('estado', 'asignado') // Only update if still in 'asignado' state

  if (updateError) {
    // If update fails, try to rollback the venta creation
    await supabase.from('ventas').delete().eq('venta_id', ventaData.venta_id)
    throw new Error(`Error updating item: ${updateError.message}`)
  }

  revalidatePath('/vendedor/ventas')
  revalidatePath('/admin/ventas')
  return ventaData as Venta
}

export async function approveVenta(ventaId: string) {
  await requireAdmin()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get venta to find item_id
  const { data: venta, error: ventaError } = await supabase
    .from('ventas')
    .select('item_id')
    .eq('venta_id', ventaId)
    .single()

  if (ventaError || !venta) {
    throw new Error('Venta not found')
  }

  // Update venta
  const { data: ventaData, error: updateError } = await supabase
    .from('ventas')
    .update({
      estado: 'aprobada',
      aprobado_por: user?.id,
      aprobado_en: new Date().toISOString(),
    })
    .eq('venta_id', ventaId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Error approving venta: ${updateError.message}`)
  }

  // Update item state
  const { error: itemError } = await supabase
    .from('items')
    .update({ estado: 'vendido_aprobado' })
    .eq('item_id', venta.item_id)

  if (itemError) {
    throw new Error(`Error updating item: ${itemError.message}`)
  }

  revalidatePath('/admin/ventas')
  revalidatePath('/vendedor/ventas')
  return ventaData as Venta
}

export async function rejectVenta(ventaId: string) {
  await requireAdmin()
  const supabase = await createClient()

  // Get venta to find item_id
  const { data: venta, error: ventaError } = await supabase
    .from('ventas')
    .select('item_id')
    .eq('venta_id', ventaId)
    .single()

  if (ventaError || !venta) {
    throw new Error('Venta not found')
  }

  // Update venta
  const { data: ventaData, error: updateError } = await supabase
    .from('ventas')
    .update({
      estado: 'rechazada',
    })
    .eq('venta_id', ventaId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Error rejecting venta: ${updateError.message}`)
  }

  // Update item state back to 'asignado'
  const { error: itemError } = await supabase
    .from('items')
    .update({ estado: 'asignado' })
    .eq('item_id', venta.item_id)

  if (itemError) {
    throw new Error(`Error updating item: ${itemError.message}`)
  }

  revalidatePath('/admin/ventas')
  revalidatePath('/vendedor/ventas')
  return ventaData as Venta
}

