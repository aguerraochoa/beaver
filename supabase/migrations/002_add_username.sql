-- Add username field to usuarios table
-- This allows users to sign in with either username or email

-- Add username column (unique, nullable for existing users)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);

-- Update RLS policy to allow users to update their own username
-- (Vendedor can already update nombre, we'll allow username too)
-- The existing policy already covers this since it allows updating nombre

COMMENT ON COLUMN usuarios.username IS 'Username único para login alternativo al email';

