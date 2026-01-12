'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Usuario, Rol } from '@/types/database'
import { toggleUsuarioActivo, updateUsuario } from '@/app/actions/usuarios'

interface UsuariosClientProps {
  usuarios: Usuario[]
}

export default function UsuariosClient({ usuarios: initialUsuarios }: UsuariosClientProps) {
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
                  <div className="flex gap-2">
                    {usuario.rol === 'pendiente' && (
                      <>
                        <button
                          onClick={() => handleApprove(usuario.id, 'vendedor')}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold"
                        >
                          Aprobar Vendedor
                        </button>
                        <button
                          onClick={() => handleApprove(usuario.id, 'admin')}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold"
                        >
                          Aprobar Admin
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleToggleActivo(usuario.id)}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        usuario.activo
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {usuario.activo ? 'Desactivar' : 'Activar'}
                    </button>
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

