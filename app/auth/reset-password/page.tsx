'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if we have a valid session with a password reset token
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login?error=no_session')
      }
    }
    checkSession()
  }, [router, supabase.auth])

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }
    
    return null
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      setLoading(false)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setMessage(passwordError)
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
    } else {
      setMessage('Password reset successful! Redirecting to login...')
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 2000)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8" style={{ backgroundColor: '#e8f0f8' }}>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#1e3a5f] to-[#4a7bc8] bg-clip-text text-transparent">
            Restablecer Contraseña
          </h1>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nueva Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Confirmar Nueva Contraseña
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
                Actualizando...
              </span>
            ) : (
              'Restablecer Contraseña'
            )}
          </button>
        </form>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.includes('failed') || message.includes('error') || message.includes('not match') || message.includes('at least')
                ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

