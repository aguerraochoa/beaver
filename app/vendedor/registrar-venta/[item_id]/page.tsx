import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/utils/auth'
import { getItemById } from '@/app/actions/items'
import RegistrarVentaClient from './RegistrarVentaClient'

export default async function RegistrarVentaPage({
  params,
}: {
  params: { item_id: string }
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  if (user.usuario.rol !== 'vendedor') {
    redirect('/')
  }

  try {
    const item = await getItemById(params.item_id)

    // Verify item is assigned to user and in correct state
    if (item.asignado_a !== user.id || item.estado !== 'asignado') {
      redirect('/vendedor/mis-items')
    }

    return (
      <RegistrarVentaClient item={item} />
    )
  } catch (error) {
    redirect('/vendedor/mis-items')
  }
}

