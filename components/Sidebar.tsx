'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useMemo, memo } from 'react'
import Link from 'next/link'

interface NavItem {
  href: string
  label: string
  icon: string
  group?: string
}

function Sidebar({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  // Initialize state - must match server render (no sessionStorage access)
  const [usuario, setUsuario] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isMounted) return // Wait for client-side mount to avoid hydration issues
    
    const loadUser = async () => {
      // Try to get from sessionStorage first for instant display (client-side only)
      let hasCachedUser = false
      if (typeof window !== 'undefined') {
        const cachedUser = sessionStorage.getItem('sidebar_user')
        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser)
            setUsuario(parsed)
            hasCachedUser = true
            setIsLoading(false) // Show nav items immediately if we have cache
          } catch (e) {
            // Invalid cache, continue to fetch
          }
        }
      }

      // If no cached user, show loading
      if (!hasCachedUser) {
        setIsLoading(true)
      }

      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser) {
          const { data: usuarioData, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', authUser.id)
            .single()
          
          if (error) {
            console.error('Error fetching usuario:', error)
            setIsLoading(false)
            return
          }
          
          if (usuarioData) {
            setUsuario(usuarioData)
            // Cache user data for instant display on navigation
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('sidebar_user', JSON.stringify(usuarioData))
            }
          }
        } else {
          // Clear cache if no auth user
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('sidebar_user')
          }
          setUsuario(null)
        }
      } catch (error) {
        console.error('Error loading user:', error)
        setUsuario(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUser()
  }, [isMounted, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem('sidebar_user')
    router.push('/login')
    router.refresh()
  }

  // Memoize navItems to prevent recalculation on every render
  const navItems = useMemo((): NavItem[] => {
    if (!usuario) return []

    if (usuario.rol === 'admin') {
      return [
        { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard', group: 'main' },
        { href: '/admin/inventario', label: 'Inventario', icon: 'inventory', group: 'main' },
        { href: '/admin/importar', label: 'Importar', icon: 'import', group: 'main' },
        { href: '/admin/usuarios', label: 'Usuarios', icon: 'users', group: 'main' },
        { href: '/admin/ventas', label: 'Ventas', icon: 'sales', group: 'main' },
      ]
    } else if (usuario.rol === 'vendedor') {
      return [
        { href: '/vendedor/mis-items', label: 'Mis Items', icon: 'items', group: 'main' },
        { href: '/vendedor/ventas', label: 'Mis Ventas', icon: 'sales', group: 'main' },
      ]
    }

    return []
  }, [usuario]) // Recalculate when usuario changes

  const getIcon = (iconName: string) => {
    const iconClass = "w-5 h-5 flex-shrink-0"
    switch (iconName) {
      case 'dashboard':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      case 'inventory':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      case 'import':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )
      case 'users':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )
      case 'sales':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'items':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
      default:
        return null
    }
  }

  const isActive = (href: string) => {
    if (href === '/admin/dashboard' || href === '/vendedor/mis-items') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  // On desktop: isOpen means expanded (shows labels), !isOpen means collapsed (icons only)
  // On mobile: isOpen means visible (overlay), !isOpen means hidden
  const showLabels = isOpen

  return (
    <>
      {/* Mobile Overlay - Only visible on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-[#1e3a5f] text-white z-50
          transition-all duration-300 ease-in-out
          shadow-2xl
          flex flex-col
          overflow-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64
          lg:translate-x-0
          ${isOpen ? 'lg:w-64' : 'lg:w-20'}
        `}
      >
        {/* Header */}
        <div className={`
          flex items-center h-16 border-b border-[#2d5a8a] flex-shrink-0
          ${showLabels ? 'justify-between px-4' : 'justify-center px-2'}
        `}>
          {showLabels && (
            <h1 className="text-xl font-bold text-white whitespace-nowrap">
              Beaver
            </h1>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-[#2d5a8a] transition-colors flex-shrink-0"
            aria-label={showLabels ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {showLabels ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {isLoading && navItems.length === 0 ? (
            <div className="px-4 py-2 text-sm text-blue-200">Cargando...</div>
          ) : (
            <div className="space-y-1 px-2">
              {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-colors
                      ${active 
                        ? 'bg-[#2d5a8a] text-white' 
                        : 'text-blue-200 hover:bg-[#2d5a8a]/50 hover:text-white'
                      }
                      ${!showLabels ? 'justify-center' : ''}
                    `}
                    title={!showLabels ? item.label : undefined}
                  >
                    {getIcon(item.icon)}
                    {showLabels && (
                      <span className="text-sm font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* User Info and Logout */}
        {usuario && (
          <div className="border-t border-[#2d5a8a] p-4 flex-shrink-0">
            {showLabels ? (
              <>
                {/* User Profile with Avatar */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#2d5a8a] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {usuario.nombre?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate text-sm">
                      {usuario.nombre}
                    </p>
                    <p className="text-xs text-blue-200 truncate">
                      {usuario.rol}
                    </p>
                  </div>
                </div>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white font-semibold text-sm transition-colors"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#2d5a8a] flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {usuario.nombre?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-[#2d5a8a] transition-colors"
                  title="Cerrar Sesión"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  )
}

export default memo(Sidebar)