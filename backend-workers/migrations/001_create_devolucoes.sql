-- Migration: Sistema de Devolução de Estoque
-- Descrição: Cria tabelas para gerenciar devoluções de saídas de estoque
-- Data: 2026-01-14

-- ===================================================
-- 1. Criar tabela de devoluções
-- ===================================================
CREATE TABLE IF NOT EXISTS devolucoes (
  id SERIAL PRIMARY KEY,
  saida_id INT NOT NULL REFERENCES saidas_estoque(id) ON DELETE CASCADE,
  data_devolucao TIMESTAMP DEFAULT NOW(),
  observacao TEXT,
  user_id UUID REFERENCES auth.users(id),
  comprovante_numero VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_devolucoes_saida_id ON devolucoes(saida_id);
CREATE INDEX idx_devolucoes_user_id ON devolucoes(user_id);
CREATE INDEX idx_devolucoes_data ON devolucoes(data_devolucao DESC);
CREATE UNIQUE INDEX idx_devolucoes_comprovante ON devolucoes(comprovante_numero);

-- ===================================================
-- 2. Criar tabela de itens devolvidos
-- ===================================================
CREATE TABLE IF NOT EXISTS itens_devolucao (
  id SERIAL PRIMARY KEY,
  devolucao_id INT NOT NULL REFERENCES devolucoes(id) ON DELETE CASCADE,
  item_saida_id INT NOT NULL REFERENCES itens_saida(id),
  produto_id INT NOT NULL REFERENCES produtos(id),
  produto_nome VARCHAR(255) NOT NULL,
  produto_codigo_barras VARCHAR(100),
  quantidade_devolvida INT NOT NULL CHECK (quantidade_devolvida > 0),
  motivo VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_itens_devolucao_devolucao_id ON itens_devolucao(devolucao_id);
CREATE INDEX idx_itens_devolucao_produto_id ON itens_devolucao(produto_id);
CREATE INDEX idx_itens_devolucao_item_saida_id ON itens_devolucao(item_saida_id);

-- ===================================================
-- 3. Modificar tabela saidas_estoque
-- ===================================================
-- Adicionar colunas para rastrear devoluções
ALTER TABLE saidas_estoque 
  ADD COLUMN IF NOT EXISTS tem_devolucao BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS total_itens_devolvidos INT DEFAULT 0;

-- Índice para filtrar saídas com devolução
CREATE INDEX IF NOT EXISTS idx_saidas_tem_devolucao ON saidas_estoque(tem_devolucao) WHERE tem_devolucao = TRUE;

-- ===================================================
-- 4. Função para gerar número de comprovante único
-- ===================================================
CREATE OR REPLACE FUNCTION gerar_numero_comprovante_devolucao()
RETURNS VARCHAR(50) AS $$
DECLARE
  nova_sequencia INT;
  data_atual VARCHAR(8);
  numero_comprovante VARCHAR(50);
BEGIN
  -- Formato: DEV-YYYYMMDD-XXXXX
  data_atual := TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Buscar o último número usado hoje
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(comprovante_numero FROM 'DEV-[0-9]{8}-([0-9]{5})') AS INT
    )
  ), 0) + 1 INTO nova_sequencia
  FROM devolucoes
  WHERE comprovante_numero LIKE 'DEV-' || data_atual || '-%';
  
  -- Gerar número com padding de zeros
  numero_comprovante := 'DEV-' || data_atual || '-' || LPAD(nova_sequencia::TEXT, 5, '0');
  
  RETURN numero_comprovante;
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- 5. Trigger para gerar número automaticamente
-- ===================================================
CREATE OR REPLACE FUNCTION trigger_gerar_comprovante_devolucao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.comprovante_numero IS NULL OR NEW.comprovante_numero = '' THEN
    NEW.comprovante_numero := gerar_numero_comprovante_devolucao();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_devolucao
  BEFORE INSERT ON devolucoes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_gerar_comprovante_devolucao();

-- ===================================================
-- 6. Comentários para documentação
-- ===================================================
COMMENT ON TABLE devolucoes IS 'Registra devoluções de saídas de estoque';
COMMENT ON TABLE itens_devolucao IS 'Itens específicos devolvidos em cada devolução';
COMMENT ON COLUMN saidas_estoque.tem_devolucao IS 'Indica se a saída possui pelo menos uma devolução';
COMMENT ON COLUMN saidas_estoque.total_itens_devolvidos IS 'Soma total de itens devolvidos desta saída';
