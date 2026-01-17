-- Change año column from integer to text to support values like 'VARIOS'
ALTER TABLE items ALTER COLUMN año TYPE text USING año::text;

COMMENT ON COLUMN items.año IS 'Año del item (puede ser texto, e.g., "VARIOS")';
