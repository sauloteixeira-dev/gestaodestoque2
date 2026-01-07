-- ===========================================================
-- Script para corrigir a foreign key entre itens_saida e produtos
-- Execute este script no SQL Editor do Supabase
-- ===========================================================

-- 1. Verificar se a foreign key já existe e removê-la se houver problema
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'itens_saida_produto_id_fkey' 
        AND table_name = 'itens_saida'
    ) THEN
        ALTER TABLE itens_saida DROP CONSTRAINT itens_saida_produto_id_fkey;
    END IF;
END $$;

-- 2. Adicionar a foreign key correta para produtos
ALTER TABLE itens_saida 
ADD CONSTRAINT itens_saida_produto_id_fkey 
FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE SET NULL;

-- 3. Verificar se a foreign key para saidas_estoque existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'itens_saida_saida_id_fkey' 
        AND table_name = 'itens_saida'
    ) THEN
        ALTER TABLE itens_saida 
        ADD CONSTRAINT itens_saida_saida_id_fkey 
        FOREIGN KEY (saida_id) REFERENCES saidas_estoque(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Verificar se a foreign key de local_id para locais_saida existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'saidas_estoque_local_id_fkey' 
        AND table_name = 'saidas_estoque'
    ) THEN
        ALTER TABLE saidas_estoque 
        ADD CONSTRAINT saidas_estoque_local_id_fkey 
        FOREIGN KEY (local_id) REFERENCES locais_saida(id);
    END IF;
END $$;

-- 5. Atualizar o cache do PostgREST (opcional, mas recomendado)
-- Isso força o Supabase a recarregar as relações
NOTIFY pgrst, 'reload schema';

-- ===========================================================
-- FIM DO SCRIPT
-- ===========================================================

-- Após executar este script, recarregue a página do sistema.
-- O erro "não foi possível carregar as listas de saída" deve desaparecer.
