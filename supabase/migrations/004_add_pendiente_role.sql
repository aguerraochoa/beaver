-- Add 'pendiente' role to rol_enum
-- This allows new users to be in a pending state until admin approves them

-- First, alter the enum to add 'pendiente'
ALTER TYPE rol_enum ADD VALUE IF NOT EXISTS 'pendiente';

-- Update the is_admin function to exclude pendiente users
-- (pendiente users should not have admin access even if somehow set)
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

-- Update RLS policies to block pendiente users from accessing most resources
-- Pendiente users should only be able to read their own usuario record

-- Items: Pendiente users cannot read items
-- (The existing policy already handles this since it checks for admin or asignado_a)

-- Ventas: Pendiente users cannot create ventas
-- (The existing policy already handles this since it checks for asignado_a)

COMMENT ON TYPE rol_enum IS 'Roles: admin (full access), vendedor (can sell assigned items), pendiente (awaiting approval)';

