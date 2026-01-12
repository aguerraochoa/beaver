'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

export default function PendientePage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Check user role
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()

      if (usuario) {
        if (usuario.rol === 'admin') {
          router.push('/admin/dashboard')
        } else if (usuario.rol === 'vendedor') {
          router.push('/vendedor/mis-items')
        }
      }
    }

    checkUser()
  }, [router, supabase])

  const handleRefresh = () => {
    router.refresh()
    window.location.reload()
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#e8f0f8' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Cuenta Pendiente de Aprobación
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Tu cuenta está esperando aprobación de un administrador.
          </p>
          <p className="text-slate-500 dark:text-slate-500 mb-8">
            Una vez que un administrador apruebe tu cuenta, podrás acceder a todas las funcionalidades.
            Te notificaremos cuando tu cuenta sea aprobada.
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg font-semibold"
          >
            Actualizar Estado
          </button>
        </div>
      </div>
    </div>
  )
}

