# Guia Rápido - Executar Migration

## 📍 Você está aqui

Precisa executar a migration SQL para criar as tabelas de devolução no Supabase.

## 🔗 Links Rápidos

1. **Abrir Supabase**: https://supabase.com/dashboard
2. **Arquivo SQL para copiar**: [001_create_devolucoes.sql](./backend-workers/migrations/001_create_devolucoes.sql)

## ⚡ Passos Rápidos

### 1. Copiar SQL
Abra o arquivo `backend-workers/migrations/001_create_devolucoes.sql` e copie TODO o conteúdo (Ctrl+A, Ctrl+C)

### 2. Executar no Supabase

1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto
3. Menu lateral: **SQL Editor**
4. Botão: **New Query**
5. Cole o SQL (Ctrl+V)
6. Botão: **Run** (ou Ctrl+Enter)
7. Aguarde: ✅ "Success. No rows returned"

### 3. Verificar

Cole e execute esta query no SQL Editor:

```sql
-- Deve retornar 2 linhas
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('devolucoes', 'itens_devolucao');
```

Se retornar 2 linhas, está OK! ✅

## ❓ Problemas?

### "already exists"
Se aparecer erro "already exists", a migration JÁ FOI executada antes. Tudo bem!

### "permission denied"
Você precisa ser admin/owner do projeto no Supabase.

### Outro erro
Copie a mensagem de erro e me informe!

## ✅ Pronto!

Após executar a migration:
1. Inicie o frontend: `cd frontend && npm run dev`
2. Acesse "Comprovantes de Saída"
3. Clique em "↩️ Devolver" em qualquer saída

---

**Documentação Completa**: [SISTEMA_DEVOLUCAO.md](./SISTEMA_DEVOLUCAO.md)
