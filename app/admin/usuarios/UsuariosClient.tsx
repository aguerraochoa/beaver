'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Usuario, Rol } from '@/types/database'
import { toggleUsuarioActivo, updateUsuario } from '@/app/actions/usuarios'

interface UsuariosClientProps {
  usuarios: Usuario[]
  currentUserId: string
}

export default function UsuariosClient({ usuarios: initialUsuarios, currentUserId }: UsuariosClientProps) {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState(initialUsuarios)


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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Usuarios ({usuarios.length})
        </h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
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
                    <div className="text-xs text-slate-500">@{usuario.username}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    usuario.rol === 'admin' ? 'bg-purple-100 text-purple-800' :
                    usuario.rol === 'vendedor' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                  {new Date(usuario.creado_en).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    {usuario.rol === 'pendiente' && (
                      <>
                        <button
                          onClick={() => handleApprove(usuario.id, 'vendedor')}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
                          title="Aprobar como Vendedor"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleApprove(usuario.id, 'admin')}
                          className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors border border-purple-200"
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
                        className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors border border-purple-200"
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
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
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
                        className={`p-2 rounded-lg transition-colors border ${
                        usuario.activo
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                            : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

