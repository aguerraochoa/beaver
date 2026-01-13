'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Usuario } from '@/types/database'
import { toggleUsuarioActivo, updateUsuario, getUsuarios } from '@/app/actions/usuarios'

interface UsuariosClientProps {
  usuarios: Usuario[]
  currentUserId: string
  totalCount: number
  pageSize: number
}

export default function UsuariosClient({ usuarios: initialUsuarios, currentUserId, totalCount: initialTotalCount, pageSize }: UsuariosClientProps) {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState(initialUsuarios)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    setUsuarios(initialUsuarios)
    setTotalCount(initialTotalCount)
  }, [initialUsuarios, initialTotalCount])

  const handleToggleActivo = async (usuarioId: string) => {
    try {
      const updated = await toggleUsuarioActivo(usuarioId)
      setUsuarios(usuarios.map(u => u.id === usuarioId ? updated : u))
      router.refresh()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleApprove = async (usuarioId: string, rol: 'vendedor' | 'admin') => {
    try {
      const updated = await updateUsuario(usuarioId, { rol })
      setUsuarios(usuarios.map(u => u.id === usuarioId ? updated : u))
      router.refresh()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleChangeRole = async (usuarioId: string, newRol: 'vendedor' | 'admin') => {
    if (!confirm(`¿Estás seguro de cambiar el rol a ${newRol}?`)) {
      return
    }
    try {
      const updated = await updateUsuario(usuarioId, { rol: newRol })
      setUsuarios(usuarios.map(u => u.id === usuarioId ? updated : u))
      router.refresh()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const renderActions = (usuario: Usuario) => (
    <div className="flex items-center gap-2 flex-wrap">
      {usuario.rol === 'pendiente' && (
        <>
          <button
            onClick={() => handleApprove(usuario.id, 'vendedor')}
            className="p-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg transition-colors border border-blue-200 dark:border-blue-700"
            title="Aprobar como Vendedor"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => handleApprove(usuario.id, 'admin')}
            className="p-2 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 rounded-lg transition-colors border border-purple-200 dark:border-purple-700"
            title="Aprobar como Admin"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </button>
        </>
      )}
      {usuario.rol === 'vendedor' && (
        <button
          onClick={() => handleChangeRole(usuario.id, 'admin')}
          className="p-2 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 rounded-lg transition-colors border border-purple-200 dark:border-purple-700"
          title="Promover a Admin"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
      {usuario.rol === 'admin' && usuario.id !== currentUserId && (
        <button
          onClick={() => handleChangeRole(usuario.id, 'vendedor')}
          className="p-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg transition-colors border border-blue-200 dark:border-blue-700"
          title="Cambiar a Vendedor"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      {usuario.id !== currentUserId && (
        <button
          onClick={() => handleToggleActivo(usuario.id)}
          className={`p-2 rounded-lg transition-colors border ${usuario.activo
              ? 'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700'
              : 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700'
            }`}
          title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
        >
          {usuario.activo ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      )}
    </div>
  )

  const handleLoadMore = async () => {
    if (loadingMore || usuarios.length >= totalCount) return

    setLoadingMore(true)
    try {
      const { usuarios: newUsuarios, count } = await getUsuarios({
        offset: usuarios.length,
        limit: pageSize,
      })
      setUsuarios([...usuarios, ...newUsuarios])
      setTotalCount(count)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoadingMore(false)
    }
  }

  const hasMore = usuarios.length < totalCount

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Usuarios ({totalCount})
        </h1>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-3">
        {usuarios.map((usuario) => (
          <div
            key={usuario.id}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {usuario.nombre}
                </p>
                {usuario.username && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">@{usuario.username}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={`px-2 py-1 rounded text-xs ${usuario.rol === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                    usuario.rol === 'vendedor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                  }`}>
                  {usuario.rol}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${usuario.activo ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                  }`}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Creado: {new Date(usuario.creado_en).toLocaleDateString()}
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
              {renderActions(usuario)}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Creado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                  <div>{usuario.nombre}</div>
                  {usuario.username && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">@{usuario.username}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${usuario.rol === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                      usuario.rol === 'vendedor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                    }`}>
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${usuario.activo ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                    }`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                  {new Date(usuario.creado_en).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  {renderActions(usuario)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow px-4 py-3">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-[#2d5a8a] hover:bg-[#1e3a5f] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? 'Cargando...' : `Cargar más (${usuarios.length} de ${totalCount})`}
          </button>
        </div>
      )}
      {!hasMore && totalCount > 0 && (
        <div className="flex justify-center bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl shadow px-4 py-3">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Mostrando todos los {totalCount} resultados
          </div>
        </div>
      )}
    </div>
  )
}
