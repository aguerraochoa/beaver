'use server'

import { requireAdmin } from '@/lib/utils/auth'
import { createClient } from '@/lib/supabase/server'

export interface VendedorStats {
    vendedor_id: string
    nombre: string
    username: string
    activo: boolean

    // Sales counts
    totalVentas: number
    ventasPendientes: number
    ventasAprobadas: number
    ventasRechazadas: number

    // Revenue
    totalRevenue: number
    revenueAprobadas: number
    revenuePendientes: number

    // Metrics
    approvalRate: number
    averageSalePrice: number

    // Items
    itemsAsignados: number

    // Recent sales
    recentSales: Array<{
        venta_id: string
        precio: number
        moneda: string
        fecha_venta: string
        estado: string
        item_objeto: string | null
    }>
}

export interface VendedoresPageData {
    vendedores: VendedorStats[]
    totals: {
        totalVendedores: number
        totalVentas: number
        totalRevenue: number
        totalRevenueAprobadas: number
        averageApprovalRate: number
    }
}

export async function getVendedorStats(): Promise<VendedoresPageData> {
    await requireAdmin()
    const supabase = await createClient()

    // Get all vendedores
    const { data: vendedoresData, error: vendedoresError } = await supabase
        .from('usuarios')
        .select('id, nombre, username, activo')
        .eq('rol', 'vendedor')
        .order('nombre')

    if (vendedoresError) {
        console.error('Error fetching vendedores:', vendedoresError)
        throw new Error('Failed to fetch vendedores')
    }

    // Get all ventas with item info
    const { data: ventasData, error: ventasError } = await supabase
        .from('ventas')
        .select(`
      venta_id,
      vendedor_id,
      precio,
      moneda,
      fecha_venta,
      estado,
      creado_en,
      item:items(objeto, "año")
    `)
        .order('creado_en', { ascending: false })

    if (ventasError) {
        console.error('Error fetching ventas:', ventasError)
        throw new Error('Failed to fetch ventas')
    }

    // Get items assigned to each vendedor
    const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('item_id, asignado_a')
        .not('asignado_a', 'is', null)

    if (itemsError) {
        console.error('Error fetching items:', itemsError)
        throw new Error('Failed to fetch items')
    }

    // Count items per vendedor
    const itemsPerVendedor = new Map<string, number>()
    itemsData?.forEach(item => {
        const count = itemsPerVendedor.get(item.asignado_a) || 0
        itemsPerVendedor.set(item.asignado_a, count + 1)
    })

    // Group ventas by vendedor
    const ventasByVendedor = new Map<string, any[]>()
    ventasData?.forEach(venta => {
        const vendedorId = venta.vendedor_id
        if (!ventasByVendedor.has(vendedorId)) {
            ventasByVendedor.set(vendedorId, [])
        }
        ventasByVendedor.get(vendedorId)!.push(venta)
    })

    // Calculate stats for each vendedor
    const vendedores: VendedorStats[] = vendedoresData.map(vendedor => {
        const ventas = ventasByVendedor.get(vendedor.id) || []

        const ventasPendientes = ventas.filter(v => v.estado === 'pendiente')
        const ventasAprobadas = ventas.filter(v => v.estado === 'aprobada')
        const ventasRechazadas = ventas.filter(v => v.estado === 'rechazada')

        const revenueAprobadas = ventasAprobadas.reduce((sum, v) => sum + Number(v.precio), 0)
        const revenuePendientes = ventasPendientes.reduce((sum, v) => sum + Number(v.precio), 0)
        const totalRevenue = revenueAprobadas + revenuePendientes

        const totalDecided = ventasAprobadas.length + ventasRechazadas.length
        const approvalRate = totalDecided > 0
            ? (ventasAprobadas.length / totalDecided) * 100
            : 0

        const averageSalePrice = ventasAprobadas.length > 0
            ? revenueAprobadas / ventasAprobadas.length
            : 0

        // Get 5 most recent sales
        const recentSales = ventas.slice(0, 5).map((v: any) => ({
            venta_id: v.venta_id,
            precio: Number(v.precio),
            moneda: v.moneda,
            fecha_venta: v.fecha_venta,
            estado: v.estado,
            item_objeto: v.item ? (v.item.año ? `${v.item.objeto} / ${v.item.año}` : v.item.objeto) : null,
        }))

        return {
            vendedor_id: vendedor.id,
            nombre: vendedor.nombre,
            username: vendedor.username,
            activo: vendedor.activo,
            totalVentas: ventas.length,
            ventasPendientes: ventasPendientes.length,
            ventasAprobadas: ventasAprobadas.length,
            ventasRechazadas: ventasRechazadas.length,
            totalRevenue,
            revenueAprobadas,
            revenuePendientes,
            approvalRate,
            averageSalePrice,
            itemsAsignados: itemsPerVendedor.get(vendedor.id) || 0,
            recentSales,
        }
    })

    // Sort by total revenue (highest first)
    vendedores.sort((a, b) => b.totalRevenue - a.totalRevenue)

    // Calculate totals
    const totalVentas = vendedores.reduce((sum, v) => sum + v.totalVentas, 0)
    const totalRevenue = vendedores.reduce((sum, v) => sum + v.totalRevenue, 0)
    const totalRevenueAprobadas = vendedores.reduce((sum, v) => sum + v.revenueAprobadas, 0)
    const vendedoresWithSales = vendedores.filter(v => v.totalVentas > 0)
    const averageApprovalRate = vendedoresWithSales.length > 0
        ? vendedoresWithSales.reduce((sum, v) => sum + v.approvalRate, 0) / vendedoresWithSales.length
        : 0

    return {
        vendedores,
        totals: {
            totalVendedores: vendedores.length,
            totalVentas,
            totalRevenue,
            totalRevenueAprobadas,
            averageApprovalRate,
        },
    }
}
