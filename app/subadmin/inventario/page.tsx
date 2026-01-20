import { redirect } from 'next/navigation'
import { getCurrentUser, requireInventoryAccess } from '@/lib/utils/auth'
import { getItems, getItemFilterOptions } from '@/app/actions/items'
import { getUsuarios } from '@/app/actions/usuarios'
import Layout from '@/components/Layout'
import InventarioClient from '@/app/admin/inventario/InventarioClient'

export const dynamic = 'force-dynamic'

export default async function SubadminInventarioPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const user = await getCurrentUser()
    if (!user) {
        redirect('/login')
    }

    try {
        await requireInventoryAccess()
    } catch {
        redirect('/')
    }

    // Ensure strict subadmin check to prevent admins from accidentally using this view if they wanted full features
    if (user.usuario.rol !== 'subadmin' && user.usuario.rol !== 'admin') {
        redirect('/')
    }

    const filters = {
        categoria: searchParams.categoria as string | undefined,
        subcategoria: searchParams.subcategoria as string | undefined,
        estado: searchParams.estado as string | undefined,
        rack: searchParams.rack as string | undefined,
        nivel: searchParams.nivel ? parseInt(searchParams.nivel as string) : undefined,
        condicion: searchParams.condicion as string | undefined,
        año: searchParams.año ? parseInt(searchParams.año as string) : undefined,
        asignado_a: searchParams.asignado_a as string | undefined,
        search: searchParams.search as string | undefined,
    }

    const pageSize = 25

    const [{ items, count }, { usuarios }, filterOptions] = await Promise.all([
        getItems(filters, { offset: 0, limit: pageSize }),
        getUsuarios(),
        getItemFilterOptions(),
    ])

    return (
        <Layout>
            <InventarioClient
                items={items}
                usuarios={usuarios}
                filters={filters}
                totalCount={count}
                pageSize={pageSize}
                filterOptions={filterOptions}
                isSubadmin={true}
            />
        </Layout>
    )
}
