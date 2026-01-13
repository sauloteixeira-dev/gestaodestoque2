-- Add user_id column to track who performed the action
-- We use UUID type because Supabase Auth uses UUIDs

ALTER TABLE entradas_estoque 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE saidas_estoque 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE logs_exclusao 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Optional: Create an index for performance
CREATE INDEX IF NOT EXISTS idx_entradas_user_id ON entradas_estoque(user_id);
CREATE INDEX IF NOT EXISTS idx_saidas_user_id ON saidas_estoque(user_id);
