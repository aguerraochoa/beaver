-- Allow authenticated users to insert their own usuario record during signup
-- This is needed because when a user first signs up, they don't exist in usuarios table yet
-- so they need permission to create their own record

CREATE POLICY "Users can insert own usuario on signup"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

