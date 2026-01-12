import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/utils/auth'
import { getVentas } from '@/app/actions/ventas'
import Layout from '@/components/Layout'
import VentasClient from './VentasClient'

export const dynamic = 'force-dynamic'

export default async function VendedorVentasPage({
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

  const pageSize = 25

  const { ventas, count } = await getVentas(undefined, { offset: 0, limit: pageSize })

  return (
    <Layout>
      <VentasClient
        ventas={ventas}
        totalCount={count}
        pageSize={pageSize}
      />
    </Layout>
  )
}
