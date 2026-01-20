-- Add 'subadmin' role to rol_enum
ALTER TYPE rol_enum ADD VALUE IF NOT EXISTS 'subadmin';

-- Create function to check if user is subadmin
CREATE OR REPLACE FUNCTION is_subadmin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = user_id
    AND rol = 'subadmin'
    AND activo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for subadmin on items table
-- Subadmin has full access to items (view, create, update, delete)
CREATE POLICY "Subadmin full access on items"
  ON items
  FOR ALL
  TO authenticated
  USING (is_subadmin(auth.uid()))
  WITH CHECK (is_subadmin(auth.uid()));

-- Add RLS policy for subadmin to read own user record
-- This is critical for role checks to work
CREATE POLICY "Subadmin read own usuario"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
