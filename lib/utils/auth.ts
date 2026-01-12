import { createClient } from '@/lib/supabase/server'
import { Usuario, Rol } from '@/types/database'

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user profile from usuarios table
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !usuario) {
    return null
  }

  return {
    ...user,
    usuario,
  }
}

export async function getUserRole(): Promise<Rol | null> {
  const user = await getCurrentUser()
  return user?.usuario?.rol || null
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'admin'
}

export async function isVendedor(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'vendedor'
}

export async function requireAdmin() {
  const isUserAdmin = await isAdmin()
  if (!isUserAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized: Authentication required')
  }
  return user
}

