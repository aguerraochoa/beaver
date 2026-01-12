import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin } from '@/lib/utils/auth'
import { getUsuarios } from '@/app/actions/usuarios'
import Layout from '@/components/Layout'
import UsuariosClient from './UsuariosClient'

export default async function AdminUsuariosPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  try {
    await requireAdmin()
  } catch {
    redirect('/')
  }

  const usuarios = await getUsuarios()

  return (
    <Layout>
      <UsuariosClient usuarios={usuarios} currentUserId={user.id} />
    </Layout>
  )
}

