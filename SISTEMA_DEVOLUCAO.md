# Sistema de Devolução de Estoque - Instruções de Instalação

## ✅ O que foi implementado

Foi criado um sistema completo de devolução de itens de saída de estoque com as seguintes funcionalidades:

- ✅ **Backend**: 4 novos endpoints de API para gerenciar devoluções
- ✅ **Frontend**: Interface completa para processar devoluções
- ✅ **Validações**: Sistema robusto de validação de quantidades
- ✅ **Histórico**: Auditoria completa de todas as devoluções

## 📋 Pré-requisitos

Antes de usar o sistema, você precisa executar a migration SQL no Supabase para criar as tabelas necessárias.

## 🔧 Instalação

### Passo 1: Executar Migration SQL no Supabase

1. Acesse o dashboard do seu projeto Supabase: https://supabase.com/dashboard
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New Query** para criar uma nova consulta
4. Copie todo o conteúdo do arquivo `backend-workers/migrations/001_create_devolucoes.sql`
5. Cole no editor SQL
6. Clique em **Run** (ou pressione Ctrl+Enter) para executar
7. Aguarde a mensagem de sucesso

### Passo 2: Verificar Instalação

Execute a seguinte query no SQL Editor para verificar se as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('devolucoes', 'itens_devolucao');
```

Você deve ver 2 linhas retornadas: `devolucoes` e `itens_devolucao`.

### Passo 3: Verificar Colunas Adicionadas

Execute esta query para verificar se as colunas foram adicionadas à tabela `saidas_estoque`:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'saidas_estoque' 
AND column_name IN ('tem_devolucao', 'total_itens_devolvidos');
```

Você deve ver 2 linhas retornadas.

## 🚀 Como Usar

### Processar uma Devolução

1. **Acesse o Histórico de Saídas**:
   - No menu lateral, clique em "Comprovantes de Saída"

2. **Selecione a Saída**:
   - Localize a saída que deseja processar devolução
   - Clique no botão **"↩️ Devolver"**

3. **Selecione os Itens**:
   - Marque o checkbox dos produtos que não foram entregues
   - Ajuste a quantidade a devolver (se necessário)
   - O sistema exibe:
     - Quantidade original
     - Quantidade já devolvida (se houver)
     - Quantidade disponível para devolução

4. **Adicione Observações**:
   - Descreva o motivo da devolução no campo de observações
   - Isso é opcional, mas recomendado para auditoria

5. **Confirme a Devolução**:
   - Revise o resumo da devolução
   - Clique em **"✓ Confirmar Devolução"**
   - O sistema irá:
     - Retornar os itens ao estoque
     - Gerar número único de comprovante
     - Atualizar o histórico

### Visualizar Devoluções

- **Indicador Visual**: Saídas com devolução exibem um badge "⚠️ X devolvidos"
- **No Comprovante**: Ao visualizar uma saída, as devoluções serão listadas

## 🔍 Validações Automáticas

O sistema impede:

- ❌ Devolver mais do que foi enviado
- ❌ Devolver itens de outra saída
- ❌ Devolver quantidade zero ou negativa
- ❌ Processar devolução sem autenticação

## 📊 Estrutura do Banco de Dados

### Tabela: `devolucoes`
Armazena informações gerais de cada devolução:
- `id`: Identificador único
- `saida_id`: Referência para a saída original
- `data_devolucao`: Data/hora da devolução
- `observacao`: Motivo da devolução
- `user_id`: Usuário que processou
- `comprovante_numero`: Número único (formato: DEV-YYYYMMDD-XXXXX)

### Tabela: `itens_devolucao`
Armazena os itens específicos devolvidos:
- `id`: Identificador único
- `devolucao_id`: Referência para a devolução
- `item_saida_id`: Referência para o item original da saída
- `produto_id`: Referência para o produto
- `quantidade_devolvida`: Quantidade devolvida
- `motivo`: Motivo específico do item (opcional)

### Atualização: `saidas_estoque`
Novas colunas adicionadas:
- `tem_devolucao`: Flag booleana
- `total_itens_devolvidos`: Contador total

## 🛠️ Troubleshooting

### Erro: "Tabela não existe"
- **Solução**: Execute a migration SQL conforme Passo 1

### Erro: "Não autenticado"
- **Solução**: Faça login novamente no sistema

### Erro: "Quantidade excede disponível"
- **Solução**: Verifique se há devoluções anteriores para este item

### Estoque não atualiza
- **Solução**: Verifique as permissões RLS no Supabase para a tabela `produtos`

## 📝 Notas Importantes

1. **Múltiplas Devoluções**: É possível fazer várias devoluções parciais da mesma saída
2. **Auditoria**: Todas as devoluções ficam registradas permanentemente
3. **Número Único**: Cada devolução recebe um número sequencial por dia
4. **Estoque Automático**: O estoque é atualizado automaticamente ao confirmar a devolução

## 🎯 Próximos Passos

Após a instalação, você pode:
- [ ] Criar comprovantes de impressão para devoluções
- [ ] Adicionar relatórios de devoluções
- [ ] Implementar notificações por email
- [ ] Adicionar dashboard com métricas de devoluções

## ❓ Suporte

Se encontrar algum problema:
1. Verifique os logs do navegador (F12 → Console)
2. Verifique os logs do Supabase
3. Consulte a documentação da API

---

**Versão**: 1.0.0  
**Data**: 2026-01-14  
**Autor**: Sistema de Gestão de Estoque
