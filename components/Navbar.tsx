'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [usuario, setUsuario] = useState<any>(null)

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        setUser(authUser)
        const { data: usuarioData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', authUser.id)
          .single()
        setUsuario(usuarioData)
      }
    }
    loadUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const getNavLinks = () => {
    if (!usuario) return []

    if (usuario.rol === 'admin') {
      return [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/inventario', label: 'Inventario' },
        { href: '/admin/importar', label: 'Importar' },
        { href: '/admin/usuarios', label: 'Usuarios' },
        { href: '/admin/ventas', label: 'Ventas' },
      ]
    } else if (usuario.rol === 'vendedor') {
      return [
        { href: '/vendedor/mis-items', label: 'Mis Items' },
        { href: '/vendedor/ventas', label: 'Mis Ventas' },
      ]
    }

    return []
  }

  return (
    <nav className="bg-[#1e3a5f] dark:bg-slate-800 border-b border-[#2d5a8a] dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-white">
                Beaver
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {getNavLinks().map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="border-transparent text-blue-200 hover:border-blue-300 hover:text-white dark:text-slate-400 dark:hover:text-slate-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {usuario && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-blue-100 dark:text-slate-300">
                  {usuario.nombre} {usuario.username && `(@${usuario.username})`} ({usuario.rol})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-blue-200 hover:text-white dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

