import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin } from '@/lib/utils/auth'
import { getVentas } from '@/app/actions/ventas'
import VentasClient from './VentasClient'

export const dynamic = 'force-dynamic'

export default async function AdminVentasPage({
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
    estado: searchParams.estado as string | undefined,
  }

  const pageSize = 25

  const { ventas, count } = await getVentas(filters, { offset: 0, limit: pageSize })

  return (
    <VentasClient
      ventas={ventas}
      filters={filters}
      totalCount={count}
      pageSize={pageSize}
    />
  )
}
