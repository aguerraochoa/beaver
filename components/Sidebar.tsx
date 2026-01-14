'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useMemo, memo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface NavItem {
  href: string
  label: string
  icon: string
  group?: string
}

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMounted: boolean
}

function Sidebar({ isOpen, onToggle, isMounted }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const sidebarRef = useRef<HTMLElement>(null)

  // Initialize state - must match server render (no localStorage access)
  const [usuario, setUsuario] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Immediately load from localStorage to show menu items right away
    if (typeof window !== 'undefined') {
      try {
        const cachedUser = localStorage.getItem('sidebar_user')
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser)
          setUsuario(parsed)
          setIsLoading(false)
        }
      } catch (e) {
        // Invalid cache, continue with normal loading
      }
    }
  }, [])

  // Set inert attribute on sidebar when hidden on mobile to prevent focus
  // Also listen to resize events to update when switching between mobile/desktop
  useEffect(() => {
    const updateInert = () => {
      if (!sidebarRef.current) return

      // Only apply inert on mobile when closed
      const isMobileView = window.innerWidth < 1024
      if (isMobileView && !isOpen) {
        sidebarRef.current.setAttribute('inert', '')
      } else {
        sidebarRef.current.removeAttribute('inert')
      }
    }

    // Initial check
    updateInert()

    // Listen to resize events
    window.addEventListener('resize', updateInert)
    return () => window.removeEventListener('resize', updateInert)
  }, [isOpen])

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onToggle])

  useEffect(() => {
    if (!isMounted) return

    let isCancelled = false

    const loadUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (isCancelled) return

        if (authUser) {
          const { data: usuarioData, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (error) {
            console.error('Error fetching usuario:', error)
            if (!isCancelled) {
              setIsLoading(false)
            }
            return
          }

          if (usuarioData && !isCancelled) {
            setUsuario(usuarioData)
            if (typeof window !== 'undefined') {
              localStorage.setItem('sidebar_user', JSON.stringify(usuarioData))
            }
          }
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('sidebar_user')
          }
          if (!isCancelled) {
            setUsuario(null)
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
        // Force sign out to clear potentially invalid tokens
        await supabase.auth.signOut()
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sidebar_user')
        }
        if (!isCancelled) {
          setUsuario(null)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      isCancelled = true
    }
  }, [isMounted, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('sidebar_user')
    router.push('/login')
    router.refresh()
  }

  const navItems = useMemo((): NavItem[] => {
    if (!usuario) return []

    if (usuario.rol === 'admin') {
      return [
        { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard', group: 'main' },
        { href: '/admin/inventario', label: 'Inventario', icon: 'inventory', group: 'main' },
        { href: '/admin/importar', label: 'Importar', icon: 'import', group: 'main' },
        { href: '/admin/usuarios', label: 'Usuarios', icon: 'users', group: 'main' },
        { href: '/admin/vendedores', label: 'Vendedores', icon: 'sellers', group: 'main' },
        { href: '/admin/ventas', label: 'Ventas', icon: 'sales', group: 'main' },
      ]
    } else if (usuario.rol === 'vendedor') {
      return [
        { href: '/vendedor/mis-items', label: 'Mis Items', icon: 'items', group: 'main' },
        { href: '/vendedor/ventas', label: 'Mis Ventas', icon: 'sales', group: 'main' },
      ]
    }

    return []
  }, [usuario])

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
      case 'sellers':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === '/admin/dashboard' || href === '/vendedor/mis-items') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  // Use CSS to handle mobile/desktop visibility
  // Mobile: hidden by default, slides in when isOpen is true
  // Desktop: always visible (lg:translate-x-0)

  return (
    <>
      {/* Mobile Overlay - Only visible when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      {/* 
        Mobile: starts off-screen (-translate-x-full), slides in when isOpen
        Desktop: always visible (lg:translate-x-0)
        CSS handles the responsive behavior, not JavaScript state
      */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#1e3a5f] text-white z-50
          transition-transform duration-300 ease-in-out
          shadow-2xl flex flex-col overflow-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex items-center h-16 border-b border-[#2d5a8a] flex-shrink-0 justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/icon.svg"
              alt="Beaver Logo"
              width={32}
              height={32}
              className="flex-shrink-0"
            />
            <h1 className="text-xl font-bold text-white whitespace-nowrap">
              Beaver
            </h1>
          </div>
          {/* Close button - only visible on mobile via CSS */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-[#2d5a8a] transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4" suppressHydrationWarning>
          {navItems.length > 0 ? (
            <div className="space-y-1 px-2">
              {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-colors min-h-[44px]
                      ${active
                        ? 'bg-[#2d5a8a] text-white'
                        : 'text-blue-200 hover:bg-[#2d5a8a]/50 hover:text-white'
                      }
                    `}
                    aria-current={active ? 'page' : undefined}
                  >
                    {getIcon(item.icon)}
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : null}
        </nav>

        {/* User Info and Logout */}
        {usuario && (
          <div className="border-t border-[#2d5a8a] p-4 flex-shrink-0">
            <Link
              href="/profile"
              className="flex items-center gap-3 mb-4 p-2 -m-2 rounded-lg hover:bg-[#2d5a8a]/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[#2d5a8a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#3d6a9a] transition-colors">
                <span className="text-white font-semibold text-sm">
                  {usuario.nombre?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate text-sm group-hover:text-blue-100 transition-colors">
                  {usuario.nombre}
                </p>
                <p className="text-xs text-blue-200 truncate">
                  {usuario.rol}
                </p>
              </div>
              <svg
                className="w-4 h-4 text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white font-semibold text-sm transition-colors min-h-[44px]"
              aria-label="Cerrar Sesión"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

export default memo(Sidebar)
