'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { revalidatePath } from 'next/cache'

/**
 * Check if username is available for the current user
 * Returns true if the username is available or belongs to the current user
 */
export async function isUsernameAvailableForUser(username: string): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    const { data, error } = await supabase
        .from('usuarios')
        .select('id, username')
        .eq('username', username.toLowerCase().trim())
        .single()

    // If no user found with that username, it's available
    if (error) {
        return true
    }

    // If the username belongs to the current user, it's available (no change)
    return data?.id === user.id
}

/**
 * Update the current user's profile (nombre and username)
 */
export async function updateProfile(nombre: string, username: string): Promise<{ success: boolean; error?: string }> {
    try {
        const currentUser = await requireAuth()
        const supabase = await createClient()

        // Validate inputs
        const trimmedNombre = nombre.trim()
        const trimmedUsername = username.toLowerCase().trim()

        if (!trimmedNombre) {
            return { success: false, error: 'El nombre es requerido' }
        }

        if (!trimmedUsername) {
            return { success: false, error: 'El nombre de usuario es requerido' }
        }

        // Validate username format
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(trimmedUsername)) {
            return {
                success: false,
                error: 'El nombre de usuario debe tener entre 3 y 20 caracteres y solo puede contener letras, números, guiones y guiones bajos'
            }
        }

        // Check if username is available (or belongs to current user)
        const isAvailable = await isUsernameAvailableForUser(trimmedUsername)
        if (!isAvailable) {
            return { success: false, error: 'Este nombre de usuario ya está en uso' }
        }

        // Update the user's profile
        const { error } = await supabase
            .from('usuarios')
            .update({
                nombre: trimmedNombre,
                username: trimmedUsername,
            })
            .eq('id', currentUser.usuario.id)

        if (error) {
            console.error('Error updating profile:', error)
            return { success: false, error: 'Error al actualizar el perfil' }
        }

        // Revalidate pages that might show user info
        revalidatePath('/profile')
        revalidatePath('/')

        return { success: true }
    } catch (error: any) {
        console.error('Error in updateProfile:', error)
        return { success: false, error: error.message || 'Error al actualizar el perfil' }
    }
}

/**
 * Get the current user's profile data
 */
export async function getCurrentProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, nombre, username, rol')
        .eq('id', user.id)
        .single()

    if (error || !usuario) {
        return null
    }

    return {
        id: usuario.id,
        nombre: usuario.nombre,
        username: usuario.username,
        rol: usuario.rol,
        email: user.email,
    }
}
