-- Beaver Database Schema
-- Complete migration for initial setup

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE rol_enum AS ENUM ('admin', 'vendedor');
CREATE TYPE estado_item_enum AS ENUM ('disponible', 'asignado', 'vendido_pendiente', 'vendido_aprobado');
CREATE TYPE estado_venta_enum AS ENUM ('pendiente', 'aprobada', 'rechazada');

-- ============================================
-- TABLES
-- ============================================

-- Table: usuarios
CREATE TABLE usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  rol rol_enum NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now()
);

-- Table: items
CREATE TABLE items (
  item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- System fields
  estado estado_item_enum NOT NULL DEFAULT 'disponible',
  asignado_a uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  asignado_en timestamptz,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  creado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  -- User/CSV fields (all optional)
  identificador text,
  categoria text,
  subcategoria text,
  objeto text,
  condicion text,
  año integer,
  rack text,
  nivel integer,
  comentarios text
);

-- Table: ventas
CREATE TABLE ventas (
  venta_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(item_id) ON DELETE CASCADE,
  vendedor_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  precio numeric(12,2) NOT NULL,
  moneda text NOT NULL DEFAULT 'MXN',
  fecha_venta date NOT NULL DEFAULT current_date,
  canal text,
  evidencia_url text NOT NULL,
  notas text,
  estado estado_venta_enum NOT NULL DEFAULT 'pendiente',
  creado_en timestamptz NOT NULL DEFAULT now(),
  aprobado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  aprobado_en timestamptz
);

-- ============================================
-- INDEXES
-- ============================================

-- Items indexes
CREATE INDEX idx_items_categoria ON items(categoria);
CREATE INDEX idx_items_subcategoria ON items(subcategoria);
CREATE INDEX idx_items_estado ON items(estado);
CREATE INDEX idx_items_asignado_a ON items(asignado_a);
CREATE INDEX idx_items_año ON items(año);

-- Full-text search index for objeto
CREATE INDEX idx_items_objeto_fts ON items USING gin(to_tsvector('spanish', coalesce(objeto, '')));

-- Ventas indexes
CREATE INDEX idx_ventas_item_id ON ventas(item_id);
CREATE INDEX idx_ventas_vendedor_id ON ventas(vendedor_id);
CREATE INDEX idx_ventas_estado ON ventas(estado);
CREATE INDEX idx_ventas_fecha_venta ON ventas(fecha_venta);

-- Usuarios indexes
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update actualizado_en timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for items
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = user_id
    AND rol = 'admin'
    AND activo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: usuarios
-- ============================================

-- Admin: full access
CREATE POLICY "Admin full access on usuarios"
  ON usuarios
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Vendedor: can read own row
CREATE POLICY "Vendedor read own usuario"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Vendedor: can update own nombre
CREATE POLICY "Vendedor update own nombre"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND rol = (SELECT rol FROM usuarios WHERE id = auth.uid())
    AND activo = (SELECT activo FROM usuarios WHERE id = auth.uid())
  );

-- ============================================
-- RLS POLICIES: items
-- ============================================

-- Admin: full access
CREATE POLICY "Admin full access on items"
  ON items
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Vendedor: can read assigned items
CREATE POLICY "Vendedor read assigned items"
  ON items
  FOR SELECT
  TO authenticated
  USING (asignado_a = auth.uid());

-- Vendedor: can update allowed fields (NOT estado, NOT asignado_a)
CREATE POLICY "Vendedor update allowed fields"
  ON items
  FOR UPDATE
  TO authenticated
  USING (asignado_a = auth.uid())
  WITH CHECK (
    asignado_a = auth.uid()
    AND estado = (SELECT estado FROM items WHERE item_id = items.item_id)
    AND asignado_a = (SELECT asignado_a FROM items WHERE item_id = items.item_id)
  );

-- ============================================
-- RLS POLICIES: ventas
-- ============================================

-- Admin: full access
CREATE POLICY "Admin full access on ventas"
  ON ventas
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Vendedor: can create ventas for assigned items
CREATE POLICY "Vendedor create ventas for assigned items"
  ON ventas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    vendedor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM items
      WHERE item_id = ventas.item_id
      AND asignado_a = auth.uid()
      AND estado = 'asignado'
    )
  );

-- Vendedor: can read own ventas
CREATE POLICY "Vendedor read own ventas"
  ON ventas
  FOR SELECT
  TO authenticated
  USING (vendedor_id = auth.uid());

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE usuarios IS 'Perfiles de usuarios vinculados a auth.users';
COMMENT ON TABLE items IS 'Inventario de coleccionables';
COMMENT ON TABLE ventas IS 'Registro de ventas realizadas por vendedores';

COMMENT ON COLUMN items.estado IS 'Estado del item: disponible, asignado, vendido_pendiente, vendido_aprobado';
COMMENT ON COLUMN items.asignado_a IS 'ID del vendedor asignado';
COMMENT ON COLUMN ventas.estado IS 'Estado de aprobación: pendiente, aprobada, rechazada';
COMMENT ON COLUMN ventas.evidencia_url IS 'Enlace de Google Drive con evidencia de la venta';

