-- ===========================================================
-- Script para corrigir estrutura do banco de dados
-- Execute este script no SQL Editor do Supabase
-- ===========================================================

-- 1. Verificar e criar tabela logs_exclusao se não existir
CREATE TABLE IF NOT EXISTS logs_exclusao (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER,
    produto_nome VARCHAR(255),
    produto_codigo_barras VARCHAR(255),
    produto_quantidade INTEGER,
    data_exclusao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_exclusao VARCHAR(255)
);

-- 2. Criar tabela locais_saida se não existir
CREATE TABLE IF NOT EXISTS locais_saida (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela saidas_estoque se não existir
CREATE TABLE IF NOT EXISTS saidas_estoque (
    id SERIAL PRIMARY KEY,
    local_id INTEGER REFERENCES locais_saida(id),
    usuario_retirada VARCHAR(255) NOT NULL,
    data_saida TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observacoes TEXT
);

-- 4. Criar tabela itens_saida com FK para produtos
CREATE TABLE IF NOT EXISTS itens_saida (
    id SERIAL PRIMARY KEY,
    saida_id INTEGER REFERENCES saidas_estoque(id) ON DELETE CASCADE,
    produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
    quantidade INTEGER NOT NULL,
    quantidade_antes INTEGER DEFAULT 0
);

-- 5. Habilitar RLS nas tabelas
ALTER TABLE logs_exclusao ENABLE ROW LEVEL SECURITY;
ALTER TABLE locais_saida ENABLE ROW LEVEL SECURITY;
ALTER TABLE saidas_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_saida ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas de acesso para usuários autenticados
-- Remover políticas existentes se houver e criar novas
DO $$
BEGIN
    -- logs_exclusao
    DROP POLICY IF EXISTS "Permitir leitura de logs para autenticados" ON logs_exclusao;
    DROP POLICY IF EXISTS "Permitir inserção de logs para autenticados" ON logs_exclusao;

    -- locais_saida
    DROP POLICY IF EXISTS "Permitir leitura de locais para autenticados" ON locais_saida;
    DROP POLICY IF EXISTS "Permitir inserção de locais para autenticados" ON locais_saida;
    DROP POLICY IF EXISTS "Permitir atualização de locais para autenticados" ON locais_saida;

    -- saidas_estoque
    DROP POLICY IF EXISTS "Permitir leitura de saidas para autenticados" ON saidas_estoque;
    DROP POLICY IF EXISTS "Permitir inserção de saidas para autenticados" ON saidas_estoque;

    -- itens_saida
    DROP POLICY IF EXISTS "Permitir leitura de itens para autenticados" ON itens_saida;
    DROP POLICY IF EXISTS "Permitir inserção de itens para autenticados" ON itens_saida;
END $$;

-- Criar políticas
-- logs_exclusao
CREATE POLICY "Permitir leitura de logs para autenticados" ON logs_exclusao
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de logs para autenticados" ON logs_exclusao
    FOR INSERT TO authenticated WITH CHECK (true);

-- locais_saida
CREATE POLICY "Permitir leitura de locais para autenticados" ON locais_saida
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de locais para autenticados" ON locais_saida
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização de locais para autenticados" ON locais_saida
    FOR UPDATE TO authenticated USING (true);

-- saidas_estoque
CREATE POLICY "Permitir leitura de saidas para autenticados" ON saidas_estoque
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de saidas para autenticados" ON saidas_estoque
    FOR INSERT TO authenticated WITH CHECK (true);

-- itens_saida
CREATE POLICY "Permitir leitura de itens para autenticados" ON itens_saida
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de itens para autenticados" ON itens_saida
    FOR INSERT TO authenticated WITH CHECK (true);

-- ===========================================================
-- FIM DO SCRIPT
-- ===========================================================
