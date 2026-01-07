# 🔐 Sistema de Autenticação - Guia de Configuração

## ✅ Implementação Concluída

O sistema de autenticação foi implementado com sucesso usando **Supabase Auth** com controle de acesso baseado em roles (admin/user).

## 📋 Estrutura Implementada

### 1. **Banco de Dados**
- ✅ Tabela `user_profiles` criada com campos:
  - `id` (UUID - referência ao auth.users)
  - `email` (TEXT)
  - `nome` (TEXT)
  - `role` (TEXT - 'admin' ou 'user')
  - `created_at` e `updated_at`

### 2. **Row Level Security (RLS)**
- ✅ Políticas configuradas para:
  - Usuários podem ver apenas seu próprio perfil
  - Admins podem ver todos os perfis
  - Apenas admins podem criar novos usuários
  - Usuários podem atualizar seu perfil (exceto role)

### 3. **Frontend**
- ✅ Contexto de autenticação (`AuthContext`)
- ✅ Página de login (`/login`)
- ✅ Proteção de rotas com `ProtectedRoute`
- ✅ Sidebar com informações do usuário e botão de logout
- ✅ Controle de visibilidade de menu baseado em role

### 4. **Controle de Acesso**

**Rotas apenas para Admin:**
- ➕ Cadastrar Produto
- 📦 Gerenciar Estoque
- 🗑️ Logs de Exclusão

**Rotas para todos os usuários autenticados:**
- 📊 Dashboard
- 📤 Saída de Estoque
- 📋 Histórico de Saídas

## 🚀 Como Criar o Primeiro Usuário Admin

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto: `fygvwzxplsmarvqulysf`
3. Vá em **Authentication** > **Users**
4. Clique em **Add User**
5. Preencha:
   - Email: seu@email.com
   - Password: sua_senha_segura
   - User Metadata (JSON):
     ```json
     {
       "nome": "Seu Nome",
       "role": "admin"
     }
     ```
6. Clique em **Create User**

### Opção 2: Via SQL (Supabase SQL Editor)

1. Acesse **SQL Editor** no Supabase Dashboard
2. Execute o seguinte SQL:

```sql
-- Primeiro, crie o usuário no auth.users via Dashboard
-- Depois, atualize o role para admin:

UPDATE user_profiles
SET role = 'admin'
WHERE email = 'seu@email.com';
```

### Opção 3: Criar via Código (Temporário)

Você pode criar uma rota temporária no backend para criar o primeiro admin:

```typescript
// Adicione isso temporariamente no seu backend
app.post('/api/create-admin', async (req, res) => {
  const { email, password, nome } = req.body;
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nome,
      role: 'admin'
    }
  });
  
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, user: data });
});
```

**⚠️ IMPORTANTE:** Remova esta rota após criar o primeiro admin!

## 🔑 Credenciais de Teste

Para testes, você pode criar um usuário admin com:
- **Email:** admin@estoque.com
- **Senha:** Admin@123456
- **Nome:** Administrador
- **Role:** admin

E um usuário comum:
- **Email:** user@estoque.com
- **Senha:** User@123456
- **Nome:** Usuário Comum
- **Role:** user

## 📱 Como Usar

### Login
1. Acesse: http://localhost:5173/login
2. Digite email e senha
3. Será redirecionado para o Dashboard

### Logout
1. Clique no botão "🚪 Sair" no sidebar
2. Será redirecionado para a página de login

### Verificar Permissões
- O sidebar mostra apenas as opções disponíveis para seu role
- Admins veem todas as opções
- Usuários comuns veem apenas Dashboard, Saída e Histórico

## 🔒 Segurança

### Variáveis de Ambiente
O arquivo `.env` contém as credenciais do Supabase:
```
VITE_SUPABASE_URL=https://fygvwzxplsmarvqulysf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ NUNCA** commite o arquivo `.env` no Git!

### Row Level Security
Todas as operações sensíveis estão protegidas por RLS no Supabase:
- Apenas admins podem excluir produtos
- Apenas admins podem cadastrar novos produtos
- Todos os usuários autenticados podem registrar saídas

## 🐛 Troubleshooting

### Erro: "Cannot find module '@supabase/supabase-js'"
```bash
cd frontend
npm install @supabase/supabase-js
```

### Erro: "Invalid login credentials"
- Verifique se o usuário foi criado no Supabase
- Confirme o email no Supabase Dashboard se necessário
- Verifique se a senha está correta

### Erro: "Access Denied"
- Verifique o role do usuário na tabela `user_profiles`
- Confirme que o role é 'admin' para acessar rotas protegidas

### Usuário não aparece após signup
- Verifique se o trigger `on_auth_user_created` está ativo
- Confirme que a função `handle_new_user()` existe
- Verifique os logs no Supabase Dashboard

## 📚 Próximos Passos

1. ✅ Criar primeiro usuário admin
2. ⏳ Testar login e logout
3. ⏳ Verificar controle de acesso nas rotas
4. ⏳ Testar funcionalidades com diferentes roles
5. ⏳ Adicionar página de gerenciamento de usuários (opcional)

## 🎯 Funcionalidades Futuras (Opcional)

- [ ] Página de gerenciamento de usuários (apenas admin)
- [ ] Recuperação de senha
- [ ] Alteração de senha
- [ ] Perfil do usuário
- [ ] Logs de auditoria (quem fez o quê)
- [ ] 2FA (autenticação de dois fatores)

---

**Desenvolvido com Supabase Auth + React + TypeScript**
