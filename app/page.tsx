import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/utils/auth'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Redirect based on role
  if (user.usuario.rol === 'admin') {
    redirect('/admin/dashboard')
  } else if (user.usuario.rol === 'vendedor') {
    redirect('/vendedor/mis-items')
  } else if (user.usuario.rol === 'pendiente') {
    redirect('/pendiente')
  }

  redirect('/login')
}

