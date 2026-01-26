import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/utils/auth'
import { getItems, getVendorFilterOptions } from '@/app/actions/items'
import MisItemsClient from './MisItemsClient'

export const dynamic = 'force-dynamic'

export default async function VendedorMisItemsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  if (user.usuario.rol !== 'vendedor') {
    redirect('/')
  }

  const filters = {
    estado: searchParams.estado as string | undefined,
    search: searchParams.search as string | undefined,
    categoria: searchParams.categoria as string | undefined,
    subcategoria: searchParams.subcategoria as string | undefined,
    rack: searchParams.rack as string | undefined,
    asignado_a: user.id, // Only show items assigned to this vendedor
  }

  const filterOptions = await getVendorFilterOptions(user.id)

  const pageSize = 25

  const { items, count } = await getItems(filters, { offset: 0, limit: pageSize })

  return (
    <MisItemsClient
      items={items}
      filters={filters}
      totalCount={count}
      pageSize={pageSize}
      filterOptions={filterOptions}
    />
  )
}
