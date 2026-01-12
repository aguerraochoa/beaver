import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/utils/auth'
import { getVentas } from '@/app/actions/ventas'
import Layout from '@/components/Layout'
import VentasClient from './VentasClient'

export default async function VendedorVentasPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  if (user.usuario.rol !== 'vendedor') {
    redirect('/')
  }

  const ventas = await getVentas()

  return (
    <Layout>
      <VentasClient ventas={ventas} />
    </Layout>
  )
}

