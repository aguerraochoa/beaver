# Supabase Setup Instructions

## 1. Crear un Proyecto Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta/inicia sesión
2. Crea un nuevo proyecto
3. Espera a que el proyecto esté completamente provisionado

## 2. Obtener API Keys

1. Ve a Project Settings → API
2. Copia lo siguiente:
   - **Project URL** (para `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (para `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role key** (para `SUPABASE_SERVICE_ROLE_KEY` - ¡mantener secreto!)

## 3. Ejecutar Migración SQL

1. Ve a SQL Editor en el dashboard de Supabase
2. Copia el contenido de `supabase/migrations/001_initial_schema.sql`
3. Pégalo y ejecútalo en el SQL Editor

Esto creará:
- Todas las tablas necesarias (usuarios, items, ventas)
- ENUMs (rol_enum, estado_item_enum, estado_venta_enum)
- Índices para optimización
- Triggers para actualización automática
- Funciones helper (is_admin, update_updated_at_column)
- RLS Policies completas

## 4. Configurar Autenticación

1. Ve a Authentication → URL Configuration
2. Agrega tu Site URL (e.g., `http://localhost:3000` para desarrollo)
3. Agrega Redirect URLs:
   - `http://localhost:3000/auth/callback` (desarrollo)
   - Tu URL de producción + `/auth/callback` (producción)

## 5. Habilitar Email Auth

1. Ve a Authentication → Providers
2. Habilita "Email" provider
3. (Opcional) Configura templates de email si lo deseas

## 6. Crear Primer Admin

**Método 1: Desde Dashboard**
1. Ve a Authentication → Users
2. Crea un usuario manualmente
3. Copia el User ID (UUID)
4. Ejecuta en SQL Editor:

```sql
INSERT INTO usuarios (id, nombre, rol, activo)
VALUES ('USER_ID_AQUI', 'Tu Nombre', 'admin', true);
```

**Método 2: Desde la App**
1. Ejecuta la app (`npm run dev`)
2. Ve a `/login`
3. Regístrate con email/password
4. Verifica tu email
5. Ejecuta SQL para cambiar rol:

```sql
UPDATE usuarios SET rol = 'admin' WHERE id = 'USER_ID_AQUI';
```

## 7. Verificar RLS Policies

Las políticas RLS están configuradas en la migración. Verifica que están activas:

```sql
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## ✅ Setup Completo

¡Listo! Tu configuración de Supabase está completa. Ahora puedes:

1. Configurar variables de entorno en `.env.local`
2. Ejecutar `npm run dev`
3. Iniciar sesión con tu usuario admin

