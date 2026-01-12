'use server'

import { requireAdmin } from '@/lib/utils/auth'
import { createClient } from '@/lib/supabase/server'

export interface DashboardStats {
  // Item stats
  totalItems: number
  itemsDisponibles: number
  itemsAsignados: number
  itemsVendidos: number
  
  // Sales stats
  ventasPendientes: number
  ventasAprobadas: number
  ventasRechazadas: number
  totalVentas: number
  
  // Money stats
  totalRevenue: number
  revenueAprobadas: number
  revenuePendientes: number
  averageSalePrice: number
  
  // Seller stats
  topSellers: Array<{
    vendedor_id: string
    nombre: string
    totalVentas: number
    totalRevenue: number
    ventasAprobadas: number
  }>
  
  // Recent activity
  recentSales: Array<{
    venta_id: string
    precio: number
    moneda: string
    fecha_venta: string
    estado: string
    vendedor_nombre: string
    item_objeto: string | null
  }>
  
  // Monthly revenue (last 6 months)
  monthlyRevenue: Array<{
    month: string
    revenue: number
    count: number
  }>
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin()
  const supabase = await createClient()

  // Get basic counts
  const [
    totalItems,
    itemsDisponibles,
    itemsAsignados,
    itemsVendidos,
    ventasPendientes,
    ventasAprobadas,
    ventasRechazadas,
  ] = await Promise.all([
    supabase.from('items').select('item_id', { count: 'exact', head: true }),
    supabase.from('items').select('item_id', { count: 'exact', head: true }).eq('estado', 'disponible'),
    supabase.from('items').select('item_id', { count: 'exact', head: true }).eq('estado', 'asignado'),
    supabase.from('items').select('item_id', { count: 'exact', head: true }).eq('estado', 'vendido_aprobado'),
    supabase.from('ventas').select('venta_id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
    supabase.from('ventas').select('venta_id', { count: 'exact', head: true }).eq('estado', 'aprobada'),
    supabase.from('ventas').select('venta_id', { count: 'exact', head: true }).eq('estado', 'rechazada'),
  ])

  // Get all approved sales for revenue calculation
  const { data: ventasAprobadasData } = await supabase
    .from('ventas')
    .select('precio, moneda')
    .eq('estado', 'aprobada')

  // Get all pending sales for pending revenue
  const { data: ventasPendientesData } = await supabase
    .from('ventas')
    .select('precio, moneda')
    .eq('estado', 'pendiente')

  // Calculate revenue (assuming all in same currency for now, or convert)
  const revenueAprobadas = ventasAprobadasData?.reduce((sum, v) => sum + Number(v.precio), 0) || 0
  const revenuePendientes = ventasPendientesData?.reduce((sum, v) => sum + Number(v.precio), 0) || 0
  const totalRevenue = revenueAprobadas + revenuePendientes
  const averageSalePrice = ventasAprobadasData && ventasAprobadasData.length > 0
    ? revenueAprobadas / ventasAprobadasData.length
    : 0

  // Get top sellers
  const { data: ventasWithSellers } = await supabase
    .from('ventas')
    .select(`
      vendedor_id,
      precio,
      estado,
      vendedor:usuarios!ventas_vendedor_id_fkey(nombre)
    `)

  const sellerStats = new Map<string, {
    vendedor_id: string
    nombre: string
    totalVentas: number
    totalRevenue: number
    ventasAprobadas: number
  }>()

  ventasWithSellers?.forEach((venta: any) => {
    const vendedorId = venta.vendedor_id
    const vendedorNombre = venta.vendedor?.nombre || 'Unknown'
    const precio = Number(venta.precio)
    const estado = venta.estado

    if (!sellerStats.has(vendedorId)) {
      sellerStats.set(vendedorId, {
        vendedor_id: vendedorId,
        nombre: vendedorNombre,
        totalVentas: 0,
        totalRevenue: 0,
        ventasAprobadas: 0,
      })
    }

    const stats = sellerStats.get(vendedorId)!
    stats.totalVentas++
    stats.totalRevenue += precio
    if (estado === 'aprobada') {
      stats.ventasAprobadas++
    }
  })

  const topSellers = Array.from(sellerStats.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10)

  // Get recent sales (last 10)
  const { data: recentSalesData } = await supabase
    .from('ventas')
    .select(`
      venta_id,
      precio,
      moneda,
      fecha_venta,
      estado,
      vendedor:usuarios!ventas_vendedor_id_fkey(nombre),
      item:items(objeto)
    `)
    .order('creado_en', { ascending: false })
    .limit(10)

  const recentSales = recentSalesData?.map((v: any) => ({
    venta_id: v.venta_id,
    precio: Number(v.precio),
    moneda: v.moneda,
    fecha_venta: v.fecha_venta,
    estado: v.estado,
    vendedor_nombre: v.vendedor?.nombre || 'Unknown',
    item_objeto: v.item?.objeto || null,
  })) || []

  // Get monthly revenue (last 6 months) - use fecha_venta instead of creado_en
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: monthlyData } = await supabase
    .from('ventas')
    .select('precio, fecha_venta, estado')
    .eq('estado', 'aprobada')
    .gte('fecha_venta', sixMonthsAgo.toISOString().split('T')[0]) // Use date only for comparison

  const monthlyMap = new Map<string, { revenue: number; count: number }>()

  monthlyData?.forEach((venta: any) => {
    // Use fecha_venta (sale date) instead of creado_en (creation date)
    const date = new Date(venta.fecha_venta)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { revenue: 0, count: 0 })
    }
    
    const monthData = monthlyMap.get(monthKey)!
    monthData.revenue += Number(venta.precio)
    monthData.count++
  })

  const monthlyRevenue = Array.from(monthlyMap.entries())
    .map(([key, data]) => {
      const [year, month] = key.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      return {
        month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        revenue: data.revenue,
        count: data.count,
        sortKey: key, // Keep original key for sorting
      }
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey, ...rest }) => rest) // Remove sortKey from final output

  return {
    totalItems: totalItems.count || 0,
    itemsDisponibles: itemsDisponibles.count || 0,
    itemsAsignados: itemsAsignados.count || 0,
    itemsVendidos: itemsVendidos.count || 0,
    ventasPendientes: ventasPendientes.count || 0,
    ventasAprobadas: ventasAprobadas.count || 0,
    ventasRechazadas: ventasRechazadas.count || 0,
    totalVentas: (ventasPendientes.count || 0) + (ventasAprobadas.count || 0) + (ventasRechazadas.count || 0),
    totalRevenue,
    revenueAprobadas,
    revenuePendientes,
    averageSalePrice,
    topSellers,
    recentSales,
    monthlyRevenue,
  }
}

