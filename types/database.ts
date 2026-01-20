// Database types based on the schema

export type Rol = 'admin' | 'subadmin' | 'vendedor' | 'pendiente'
export type EstadoItem = 'disponible' | 'asignado' | 'vendido_pendiente' | 'vendido_aprobado'
export type EstadoVenta = 'pendiente' | 'aprobada' | 'rechazada'

export interface Usuario {
  id: string
  nombre: string
  username: string | null
  rol: Rol
  activo: boolean
  creado_en: string
}

export interface Item {
  item_id: string
  // System fields
  estado: EstadoItem
  asignado_a: string | null
  asignado_en: string | null
  creado_en: string
  actualizado_en: string
  creado_por: string | null
  // User/CSV fields (all optional)
  identificador: string | null
  categoria: string | null
  subcategoria: string | null
  objeto: string | null
  condicion: string | null
  año: string | null
  rack: string | null
  nivel: number | null
  comentarios: string | null
}

export interface Venta {
  venta_id: string
  item_id: string
  vendedor_id: string
  precio: number
  moneda: string
  fecha_venta: string
  canal: string | null
  evidencia_url: string
  notas: string | null
  estado: EstadoVenta
  creado_en: string
  aprobado_por: string | null
  aprobado_en: string | null
}

export interface ItemWithRelations extends Item {
  asignado_a_usuario?: Usuario | null
  creado_por_usuario?: Usuario | null
}

export interface VentaWithRelations extends Venta {
  item?: Item | null
  vendedor?: Usuario | null
  aprobado_por_usuario?: Usuario | null
}

// CSV Import types
export interface CSVRow {
  identificador?: string
  categoria?: string
  subcategoria?: string
  objeto?: string
  condicion?: string
  año?: string | number
  rack?: string
  nivel?: string | number
  comentarios?: string
}

export interface CSVImportError {
  fila: number
  error: string
  datos: CSVRow
}

