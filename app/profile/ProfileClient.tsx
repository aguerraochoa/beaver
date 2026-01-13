'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, isUsernameAvailableForUser } from '@/app/actions/profile'

interface ProfileClientProps {
    initialNombre: string
    initialUsername: string | null
    email: string | undefined
    rol: string
}

export default function ProfileClient({ initialNombre, initialUsername, email, rol }: ProfileClientProps) {
    const router = useRouter()
    const [nombre, setNombre] = useState(initialNombre)
    const [username, setUsername] = useState(initialUsername || '')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

    // Debounced username availability check
    useEffect(() => {
        if (!username || username === initialUsername) {
            setUsernameStatus('idle')
            return
        }

        // Validate format first
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
            setUsernameStatus('idle')
            return
        }

        const timeoutId = setTimeout(async () => {
            setUsernameStatus('checking')
            const available = await isUsernameAvailableForUser(username)
            setUsernameStatus(available ? 'available' : 'taken')
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [username, initialUsername])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const result = await updateProfile(nombre, username)

        if (result.success) {
            setMessage({ text: 'Perfil actualizado correctamente', type: 'success' })
            // Clear localStorage cache so sidebar updates
            if (typeof window !== 'undefined') {
                localStorage.removeItem('sidebar_user')
            }
            router.refresh()
        } else {
            setMessage({ text: result.error || 'Error al actualizar el perfil', type: 'error' })
        }

        setLoading(false)
    }

    const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
        setUsername(value)
    }, [])

    const hasChanges = nombre !== initialNombre || username !== (initialUsername || '')
    const isValid = nombre.trim() !== '' && username.trim() !== '' && /^[a-zA-Z0-9_-]{3,20}$/.test(username)
    const canSubmit = hasChanges && isValid && usernameStatus !== 'taken' && usernameStatus !== 'checking'

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Page Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
                Mi Perfil
            </h1>

            {/* User Info Card */}
            <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow p-4 lg:p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-[#2d5a8a] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xl lg:text-2xl">
                            {initialNombre?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {initialNombre}
                        </p>
                        {email && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                {email}
                            </p>
                        )}
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 capitalize">
                            {rol}
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                {/* Nombre Field */}
                <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow p-4 lg:p-6">
                    <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nombre Completo
                    </label>
                    <input
                        id="nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm lg:text-base"
                        placeholder="Tu nombre completo"
                    />
                </div>

                {/* Username Field */}
                <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow p-4 lg:p-6">
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nombre de Usuario
                    </label>
                    <div className="relative">
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            required
                            disabled={loading}
                            minLength={3}
                            maxLength={20}
                            className={`w-full px-3 py-2 lg:px-4 lg:py-3 pr-10 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm lg:text-base ${usernameStatus === 'taken'
                                    ? 'border-red-400 dark:border-red-500'
                                    : usernameStatus === 'available'
                                        ? 'border-green-400 dark:border-green-500'
                                        : 'border-slate-300 dark:border-slate-600'
                                }`}
                            placeholder="usuario123"
                        />
                        {/* Status indicator */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {usernameStatus === 'checking' && (
                                <svg className="animate-spin h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {usernameStatus === 'available' && (
                                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {usernameStatus === 'taken' && (
                                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        3-20 caracteres, solo letras, números, guiones y guiones bajos
                    </p>
                    {usernameStatus === 'taken' && (
                        <p className="mt-1 text-xs text-red-500">
                            Este nombre de usuario ya está en uso
                        </p>
                    )}
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`p-4 rounded-lg text-sm ${message.type === 'success'
                                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Submit Button */}
                <div className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow p-4 lg:p-6">
                    <button
                        type="submit"
                        disabled={loading || !canSubmit}
                        className="w-full py-2.5 lg:py-3 px-6 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2d5a8a] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm lg:text-base"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </span>
                        ) : (
                            'Guardar Cambios'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
