-- Revert: Restore original RLS policy for vendedores to only see assigned items
-- This reverses the changes from migration 006

-- Drop the policy that allows vendedores to read all items
DROP POLICY IF EXISTS "Vendedor read all items" ON items;

-- Restore the original policy: vendedores can only read assigned items
CREATE POLICY "Vendedor read assigned items"
  ON items
  FOR SELECT
  TO authenticated
  USING (asignado_a = auth.uid());

-- Revert the usuarios read policy to be more restrictive
-- Drop the permissive policy
DROP POLICY IF EXISTS "Users can read usuarios for display" ON usuarios;

-- Restore the original policy: vendedores can only read their own usuario
CREATE POLICY "Vendedor read own usuario"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

