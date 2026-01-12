import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin } from '@/lib/utils/auth'
import { getItems, getItemFilterOptions } from '@/app/actions/items'
import { getUsuarios } from '@/app/actions/usuarios'
import Layout from '@/components/Layout'
import InventarioClient from './InventarioClient'

export const dynamic = 'force-dynamic'

export default async function AdminInventarioPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  try {
    await requireAdmin()
  } catch {
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
      />
    </Layout>
  )
}
