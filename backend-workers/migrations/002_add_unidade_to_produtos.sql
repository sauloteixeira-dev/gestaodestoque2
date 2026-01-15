-- Adicionar coluna unidade na tabela produtos
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS unidade TEXT;

-- Atualizar a função de adicionar/atualizar produto para aceitar unidade
CREATE OR REPLACE FUNCTION adicionar_ou_atualizar_produto(
    p_codigo_barras TEXT,
    p_nome TEXT,
    p_quantidade INTEGER,
    p_unidade TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO produtos (codigo_barras, nome, quantidade, unidade)
    VALUES (p_codigo_barras, p_nome, p_quantidade, p_unidade)
    ON CONFLICT (codigo_barras) 
    DO UPDATE SET 
        quantidade = produtos.quantidade + p_quantidade,
        unidade = COALESCE(p_unidade, produtos.unidade); -- Atualiza unidade se fornecida
END;
$$ LANGUAGE plpgsql;
