'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * Get email from username or return the input if it's already an email
 * Uses service client to bypass RLS for username lookup
 */
export async function getEmailFromUsernameOrEmail(input: string): Promise<string | null> {
  // If it looks like an email, return it directly
  if (input.includes('@')) {
    return input
  }

  // Otherwise, look up email from username using service client (bypasses RLS)
  const serviceClient = createServiceClient()
  const { data, error } = await serviceClient
    .from('usuarios')
    .select('id')
    .eq('username', input.toLowerCase().trim())
    .single()

  if (error || !data) {
    return null
  }

  // Get email from auth.users using service client
  const { data: authData, error: authError } = await serviceClient.auth.admin.getUserById(data.id)

  if (authError || !authData?.user?.email) {
    return null
  }

  return authData.user.email
}

/**
 * Check if username is available
 * Uses service client to bypass RLS
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const serviceClient = createServiceClient()
  const { data, error } = await serviceClient
    .from('usuarios')
    .select('username')
    .eq('username', username.toLowerCase().trim())
    .single()

  // If error means no user found, so username is available
  return !!error
}

/**
 * Create usuario record after signup
 * Uses service client to bypass RLS since user doesn't exist in usuarios table yet
 */
export async function createUsuarioAfterSignup(
  userId: string,
  nombre: string,
  username: string
): Promise<void> {
  const serviceClient = createServiceClient()
  
  const { error } = await serviceClient
    .from('usuarios')
    .insert({
      id: userId,
      nombre,
      username,
      rol: 'pendiente', // New users start as pending until admin approves
      activo: true,
    })

  if (error) {
    throw new Error(`Error creating usuario: ${error.message}`)
  }
}

