'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getEmailFromUsernameOrEmail, isUsernameAvailable, createUsuarioAfterSignup } from '@/app/actions/auth'

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Check for error/status in URL params first, then check if user is logged in
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const details = urlParams.get('details')
    const verified = urlParams.get('verified')
    const reset = urlParams.get('reset')
    
    if (error === 'auth_failed') {
      setMessage(
        details
          ? `Authentication failed: ${details}`
          : 'Authentication failed. Please check your Supabase redirect URL configuration.'
      )
      window.history.replaceState({}, '', '/login')
    } else if (error === 'session_failed') {
      setMessage('Session creation failed. Please try again.')
      window.history.replaceState({}, '', '/login')
    } else if (error === 'email_not_verified') {
      setMessage(details || 'Please verify your email before signing in.')
      window.history.replaceState({}, '', '/login')
    } else if (verified === 'true') {
      setMessage('Email verified successfully! Redirecting...')
      window.history.replaceState({}, '', '/login')
    } else if (verified === 'false') {
      setMessage('Email verification failed. Please try again or request a new verification email.')
      window.history.replaceState({}, '', '/login')
    } else if (reset === 'success') {
      setMessage('Password reset successful! You can now sign in with your new password.')
      window.history.replaceState({}, '', '/login')
    }
  }, [])

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const urlParams = new URLSearchParams(window.location.search)
        const nextUrl = urlParams.get('next') || '/'
        
        if (urlParams.get('verified') === 'true') {
          setTimeout(() => {
            router.push(nextUrl)
            router.refresh()
          }, 1500)
        } else {
          router.push(nextUrl)
          router.refresh()
        }
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }
    
    return null
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validate required fields
    if (!email || !username || !nombre) {
      setMessage('Por favor completa todos los campos')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setMessage(passwordError)
      setLoading(false)
      return
    }

    // Check if username is available
    const usernameAvailable = await isUsernameAvailable(username)
    if (!usernameAvailable) {
      setMessage('Este nombre de usuario ya está en uso')
      setLoading(false)
      return
    }

    // Validate username format (alphanumeric, underscore, hyphen, 3-20 chars)
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      setMessage('El nombre de usuario debe tener entre 3 y 20 caracteres y solo puede contener letras, números, guiones y guiones bajos')
      setLoading(false)
      return
    }

    const urlParams = new URLSearchParams(window.location.search)
    const nextUrl = urlParams.get('next') || '/'
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('next', nextUrl)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl.toString(),
        data: {
          nombre,
          username,
        },
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
    } else if (data.user) {
      // Create usuario record with username
      try {
        await createUsuarioAfterSignup(data.user.id, nombre, username)
        setMessage('Revisa tu email para verificar tu cuenta antes de iniciar sesión.')
      } catch (err: any) {
        setMessage(`Error al crear perfil: ${err.message}`)
      }
      setEmail('')
      setUsername('')
      setNombre('')
      setPassword('')
      setConfirmPassword('')
      setLoading(false)
    }
  }

  const handleEmailSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Get email from username or email input
    const loginInput = email.trim().toLowerCase() // Reusing email field for username/email
    let actualEmail: string | null = null

    try {
      actualEmail = await getEmailFromUsernameOrEmail(loginInput)
    } catch (err: any) {
      console.error('Error getting email from username:', err)
      setMessage('Error al buscar usuario. Por favor intenta con tu email.')
      setLoading(false)
      return
    }

    if (!actualEmail) {
      setMessage('Usuario o email no encontrado')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: actualEmail,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
    } else if (data.user) {
      if (!data.user.email_confirmed_at) {
        setMessage('Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.')
        await supabase.auth.signOut()
        setLoading(false)
      } else {
        const urlParams = new URLSearchParams(window.location.search)
        const nextUrl = urlParams.get('next') || '/'
        router.push(nextUrl)
        router.refresh()
      }
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setMessage('')

    if (!resetEmail) {
      setMessage('Please enter your email address')
      setResetLoading(false)
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setMessage(error.message)
      setResetLoading(false)
    } else {
      setMessage('Check your email for a password reset link.')
      setResetEmail('')
      setShowForgotPassword(false)
      setResetLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8" style={{ backgroundColor: '#e8f0f8' }}>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#1e3a5f] to-[#4a7bc8] bg-clip-text text-transparent">
            Beaver
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gestión de Inventario de Coleccionables
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Toggle between sign in and sign up */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setMessage('')
                setEmail('')
                setUsername('')
                setNombre('')
                setPassword('')
                setConfirmPassword('')
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setMessage('')
                setEmail('')
                setUsername('')
                setNombre('')
                setPassword('')
                setConfirmPassword('')
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Email/Password Form */}
          <form
            onSubmit={mode === 'signup' ? handleEmailSignup : handleEmailSignin}
            className="space-y-4"
          >
            {mode === 'signin' ? (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Usuario o Email
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="usuario o tu@ejemplo.com"
                />
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="tu@ejemplo.com"
                  />
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nombre de Usuario *
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    required
                    disabled={loading}
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_-]{3,20}"
                    className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="usuario123"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    3-20 caracteres, solo letras, números, guiones y guiones bajos
                  </p>
                </div>
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Tu Nombre"
                  />
                </div>
              </>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true)
                      setResetEmail(email)
                    }}
                    className="text-xs text-[#2d5a8a] hover:text-[#1e3a5f] dark:text-[#6ba3d3] dark:hover:text-[#4a7bc8] font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6b7d5a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : 'Ingresa tu contraseña'}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Confirma tu contraseña"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2d5a8a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'signup' ? 'Creando cuenta...' : 'Iniciando sesión...'}
                </span>
              ) : (
                mode === 'signup' ? 'Registrarse' : 'Iniciar Sesión'
              )}
            </button>
          </form>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.includes('failed') || message.includes('error') || message.includes('not match') || message.includes('at least')
                  ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : message.includes('Check your email') || message.includes('verify')
                  ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 md:p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Restablecer Contraseña
              </h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false)
                  setResetEmail('')
                  setMessage('')
                }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Ingresa tu dirección de email y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={resetLoading}
                  className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="tu@ejemplo.com"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 px-4 py-2 bg-[#6b7d5a] hover:bg-[#5a6b4a] text-white rounded-lg font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6b7d5a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {resetLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    'Enviar Enlace'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail('')
                    setMessage('')
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

