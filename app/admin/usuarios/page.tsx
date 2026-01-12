import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin } from '@/lib/utils/auth'
import { getUsuarios } from '@/app/actions/usuarios'
import Layout from '@/components/Layout'
import UsuariosClient from './UsuariosClient'

export default async function AdminUsuariosPage({
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

  const pageSize = 25

  const { usuarios, count } = await getUsuarios({ offset: 0, limit: pageSize })

  return (
    <Layout>
      <UsuariosClient
        usuarios={usuarios}
        currentUserId={user.id}
        totalCount={count}
        pageSize={pageSize}
      />
    </Layout>
  )
}
