export interface Produto {
    id: number;
    codigo_barras: string;
    nome: string;
    quantidade: number;
}

export interface LocalSaida {
    id: number;
    nome: string;
    descricao?: string;
    data_criacao: string;
}

export interface ItemSaida {
    produto_id: number;
    quantidade: number;
    produto_nome?: string;
    produto_codigo_barras?: string;
    produto_quantidade_antes?: number;
}

export interface SaidaEstoque {
    id: number;
    local_id: number;
    usuario_retirada: string;
    data_saida: string;
    observacoes?: string;
    local?: { nome: string };
    itens?: ItemSaida[];
}

export interface LogExclusao {
    id: number;
    produto_id: number;
    produto_nome: string;
    produto_codigo_barras: string;
    produto_quantidade: number;
    data_exclusao: string;
    usuario_exclusao: string;
}
