# Beaver - Sistema de Gestión de Inventario de Coleccionables

Sistema web completo para gestionar inventario de coleccionables, asignar items a vendedores, y registrar ventas con aprobación administrativa.

## 🚀 Características

- ✅ Gestión completa de inventario
- ✅ Asignación de items a vendedores
- ✅ Registro de ventas con evidencia (Google Drive)
- ✅ Aprobación/rechazo de ventas por admin
- ✅ Importación masiva desde CSV
- ✅ Exportación a CSV
- ✅ Búsqueda y filtros avanzados
- ✅ Dashboard con estadísticas
- ✅ Sistema de roles (Admin/Vendedor)
- ✅ Autenticación con email/password

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js Server Actions + Route Handlers
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Deployment:** Vercel (recomendado)

## 📋 Prerequisitos

- Node.js 18+ y npm
- Cuenta de Supabase
- Git

## 🔧 Setup Inicial

### 1. Clonar e Instalar Dependencias

```bash
cd beaver
npm install
```

### 2. Configurar Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Obtener credenciales:
   - Project URL
   - Anon Key
   - Service Role Key (mantener secreto)

### 3. Ejecutar Migración SQL

1. Ir a SQL Editor en el dashboard de Supabase
2. Copiar el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ejecutar el SQL en el editor

Esto creará:
- Tablas: `usuarios`, `items`, `ventas`
- ENUMs: `rol_enum`, `estado_item_enum`, `estado_venta_enum`
- Índices para optimización
- Triggers para actualización automática
- RLS Policies para seguridad

### 4. Configurar Variables de Entorno

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 5. Configurar Autenticación en Supabase

1. Ir a Authentication → URL Configuration
2. Agregar Site URL: `http://localhost:3000` (desarrollo)
3. Agregar Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - Tu URL de producción + `/auth/callback`

4. Ir a Authentication → Providers
5. Habilitar "Email" provider
6. (Opcional) Deshabilitar "Enable email signup" si quieres solo invite-only

### 6. Crear Primer Admin

**Opción 1: Desde Supabase Dashboard**
1. Ir a Authentication → Users
2. Crear usuario manualmente
3. Copiar User ID (UUID)
4. Ejecutar en SQL Editor:

```sql
INSERT INTO usuarios (id, nombre, rol, activo)
VALUES ('USER_ID_AQUI', 'Tu Nombre', 'admin', true);
```

**Opción 2: Registrarse desde la app**
1. Ejecutar `npm run dev`
2. Ir a `/login`
3. Registrarse con email/password
4. Verificar email
5. Ejecutar SQL para cambiar rol a admin:

```sql
UPDATE usuarios SET rol = 'admin' WHERE id = 'USER_ID_AQUI';
```

### 7. Ejecutar la Aplicación

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
beaver/
├── app/
│   ├── actions/          # Server Actions
│   │   ├── items.ts
│   │   ├── ventas.ts
│   │   ├── usuarios.ts
│   │   ├── csv.ts
│   │   └── stats.ts
│   ├── admin/            # Páginas admin
│   │   ├── dashboard/
│   │   ├── inventario/
│   │   ├── importar/
│   │   ├── usuarios/
│   │   └── ventas/
│   ├── vendedor/         # Páginas vendedor
│   │   ├── mis-items/
│   │   ├── registrar-venta/
│   │   └── ventas/
│   ├── auth/             # Autenticación
│   │   ├── callback/
│   │   └── reset-password/
│   ├── login/             # Login
│   └── layout.tsx
├── components/            # Componentes reutilizables
│   └── Navbar.tsx
├── lib/
│   ├── supabase/         # Clientes Supabase
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── service.ts
│   │   └── middleware.ts
│   └── utils/
│       └── auth.ts        # Helpers de autenticación
├── types/
│   └── database.ts        # Tipos TypeScript
├── supabase/
│   └── migrations/       # Migraciones SQL
│       └── 001_initial_schema.sql
└── middleware.ts          # Middleware de Next.js
```

## 🔐 Seguridad

- **RLS (Row Level Security):** Activado en todas las tablas
- **Service Role Key:** Solo usado server-side, nunca expuesto al cliente
- **Autenticación:** Basada en Supabase Auth con verificación de email
- **Roles:** Admin tiene acceso completo, Vendedor solo a sus items asignados

## 📊 Formato CSV para Importación

El CSV debe tener estas columnas (todas opcionales, pero al menos una debe tener valor):

```csv
identificador,categoria,subcategoria,objeto,condicion,año,rack,nivel,comentarios
```

### Ejemplo:

```csv
identificador,categoria,subcategoria,objeto,condicion,año,rack,nivel,comentarios
ABC-001,Figuras,Action Figures,Superman Classic,Excelente,2020,Rack A,1,Primera edición
ABC-002,Figuras,Action Figures,Batman Dark Knight,Bueno,2019,Rack A,2,Sin caja original
```

### Reglas de Validación:

1. **Duplicados:** Se detectan si TODOS los campos coinciden
2. **Normalización:** Textos se recortan, números se convierten a entero
3. **Límite:** Máximo 5,000 filas por importación
4. **Errores:** Se exportan a CSV con columna "error" explicando el problema

## 🚢 Deployment

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Agregar variables de entorno en Vercel Dashboard
3. Configurar Redirect URLs en Supabase con tu dominio de producción
4. Deploy automático en cada push

### Otras Plataformas

Cualquier plataforma que soporte Next.js 14 funciona. Asegúrate de:
- Configurar variables de entorno
- Configurar Redirect URLs en Supabase
- Ejecutar migración SQL si es necesario

## 📝 Notas Importantes

1. **Service Role Key:** NUNCA exponer al cliente, solo usar server-side
2. **RLS:** Siempre activo, políticas estrictas
3. **Evidencia:** Solo enlaces de Google Drive (no almacenamiento de imágenes)
4. **Bulk Assign:** Solo items con estado 'disponible' o 'asignado'
5. **Email Confirmation:** Puede estar deshabilitado para facilitar testing

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- Verificar que `.env.local` existe y tiene todas las variables
- Reiniciar servidor de desarrollo

### Error: "Unauthorized" en páginas
- Verificar que el usuario tiene el rol correcto en tabla `usuarios`
- Verificar que RLS policies están activas

### Error: "Session creation failed"
- Verificar Redirect URLs en Supabase
- Verificar que Site URL está configurado

## 📄 Licencia

Privado - Todos los derechos reservados

