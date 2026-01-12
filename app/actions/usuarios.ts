'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/utils/auth'
import { Usuario, Rol } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getUsuarios() {
  await requireAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('creado_en', { ascending: false })

  if (error) {
    throw new Error(`Error fetching usuarios: ${error.message}`)
  }

  return data as Usuario[]
}

export async function createUsuario(data: {
  email: string
  nombre: string
  username?: string
  rol: Rol
}) {
  await requireAdmin()
  const serviceClient = createServiceClient()

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email: data.email,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      nombre: data.nombre,
    },
  })

  if (authError || !authData.user) {
    throw new Error(`Error creating user: ${authError?.message || 'Unknown error'}`)
  }

  // Create usuario record
  const supabase = await createClient()
  const { data: usuario, error: usuarioError } = await supabase
    .from('usuarios')
    .insert({
      id: authData.user.id,
      nombre: data.nombre,
      username: data.username || null,
      rol: data.rol,
      activo: true,
    })
    .select()
    .single()

  if (usuarioError) {
    // Try to clean up auth user if usuario creation fails
    await serviceClient.auth.admin.deleteUser(authData.user.id)
    throw new Error(`Error creating usuario: ${usuarioError.message}`)
  }

  revalidatePath('/admin/usuarios')
  return usuario as Usuario
}

export async function updateUsuario(usuarioId: string, updates: Partial<Usuario>) {
  await requireAdmin()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', usuarioId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating usuario: ${error.message}`)
  }

  revalidatePath('/admin/usuarios')
  return data as Usuario
}

export async function toggleUsuarioActivo(usuarioId: string) {
  await requireAdmin()
  const supabase = await createClient()

  // Get current state
  const { data: usuario, error: fetchError } = await supabase
    .from('usuarios')
    .select('activo')
    .eq('id', usuarioId)
    .single()

  if (fetchError || !usuario) {
    throw new Error('Usuario not found')
  }

  const { data, error } = await supabase
    .from('usuarios')
    .update({ activo: !usuario.activo })
    .eq('id', usuarioId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating usuario: ${error.message}`)
  }

  revalidatePath('/admin/usuarios')
  return data as Usuario
}
