export interface Produto {
    id: number;
    codigo_barras: string;
    nome: string;
    quantidade: number;
    unidade?: string;
}

export interface LocalSaida {
    id: number;
    nome: string;
    descricao?: string;
    data_criacao: string;
}

export interface ItemSaida {
    id?: number;
    produto_id: number;
    quantidade: number;
    produto_nome?: string;
    produto_codigo_barras?: string;
    produto_quantidade_antes?: number;
    produto?: {
        unidade?: string;
    };
}

export interface ItemDevolucao {
    id?: number;
    devolucao_id?: number;
    item_saida_id: number;
    produto_id: number;
    produto_nome: string;
    produto_codigo_barras?: string;
    quantidade_devolvida: number;
    motivo?: string;
    produto?: {
        unidade?: string;
    };
}

export interface Devolucao {
    id: number;
    saida_id: number;
    data_devolucao: string;
    observacao?: string;
    comprovante_numero: string;
    user_id?: string;
    itens?: ItemDevolucao[];
    saida?: SaidaEstoque;
    usuario?: {
        nickname?: string;
        email?: string;
        nome?: string;
    };
}

export interface SaidaEstoque {
    id: number;
    local_id: number;
    usuario_retirada: string;
    data_saida: string;
    observacoes?: string;
    local?: { nome: string };
    itens?: ItemSaida[];
    tem_devolucao?: boolean;
    total_itens_devolvidos?: number;
    devolucoes?: Devolucao[];
}

export interface LogExclusao {
    id: number;
    produto_id?: number;
    produto_nome: string;
    produto_codigo_barras: string;
    produto_quantidade: number;
    data_exclusao: string;
    usuario_exclusao: string;
}

