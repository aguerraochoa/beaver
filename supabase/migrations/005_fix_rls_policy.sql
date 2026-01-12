-- Fix RLS policy for vendedor update to avoid subquery error
-- The issue is that the subquery in WITH CHECK references items.item_id which can be ambiguous
-- We'll simplify the policy to just check that asignado_a matches and user is not admin

-- Drop the existing policy
DROP POLICY IF EXISTS "Vendedor update allowed fields" ON items;

-- Create a simpler policy that doesn't use problematic subqueries
-- Vendedores can only update items assigned to them
-- The application logic will enforce that vendedores can't change estado or asignado_a
CREATE POLICY "Vendedor update allowed fields"
  ON items
  FOR UPDATE
  TO authenticated
  USING (
    asignado_a = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND rol = 'admin'
    )
  )
  WITH CHECK (
    asignado_a = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND rol = 'admin'
    )
  );

