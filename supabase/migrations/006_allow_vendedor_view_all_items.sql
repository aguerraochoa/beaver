-- Allow vendedores to view all items (not just assigned ones)
-- They can still only update items assigned to them

-- Drop the existing policy that restricts vendedores to only see assigned items
DROP POLICY IF EXISTS "Vendedor read assigned items" ON items;

-- Create new policy that allows vendedores to read all items
CREATE POLICY "Vendedor read all items"
  ON items
  FOR SELECT
  TO authenticated
  USING (
    -- Admin can see all (handled by admin policy)
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND rol = 'admin'
    )
    OR
    -- Vendedores can see all items
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND rol = 'vendedor'
      AND activo = true
    )
  );

-- Also allow vendedores to read usuarios (for displaying names)
-- Drop existing policy if it's too restrictive
DROP POLICY IF EXISTS "Vendedor read own usuario" ON usuarios;

-- Allow all authenticated users to read usuarios (for displaying names in items)
CREATE POLICY "Users can read usuarios for display"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (true);

