CREATE TABLE produtos (
  ID SERIAL PRIMARY KEY,
  codigo_barras VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  quantidade INT NOT NULL
);

CREATE TABLE movimentacao_estoque (
    ID SERIAL PRIMARY KEY,
    produto_id INT REFERENCES produtos(ID),
    tipo VARCHAR(10) NOT NULL, -- 'entrada' ou 'saida'
    quantidade INT NOT NULL,
    data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
