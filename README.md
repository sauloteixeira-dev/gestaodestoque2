# 📦 Sistema de Gestão de Estoque

Sistema completo de gestão de estoque com autenticação e controle de acesso baseado em roles (Admin/Usuário).

## 🚀 Tecnologias

### Frontend
- **React** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Navegação
- **Supabase Client** - Autenticação e banco de dados
- **CSS Modules** - Estilização

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions

## ✨ Funcionalidades

### 🔐 Autenticação
- Login/Logout com email e senha
- Controle de acesso baseado em roles (Admin/Usuário)
- Proteção de rotas
- Gerenciamento de sessão

### 👤 Usuário Comum
- ✅ Dashboard
- ✅ Cadastrar Produto
- ✅ Saída de Estoque
- ✅ Histórico de Saídas

### 👑 Administrador
- ✅ Todas as funcionalidades do usuário comum
- ✅ Gerenciar Estoque (entrada/saída/exclusão)
- ✅ Logs de Exclusão

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/sistema-estoque.git
cd sistema-estoque
```

### 2. Instale as dependências do frontend
```bash
cd frontend
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na pasta `frontend`:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 4. Configure o Supabase

Execute as migrations SQL no Supabase SQL Editor (disponíveis na documentação).

## 🚀 Executando o projeto

### Frontend
```bash
cd frontend
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

## 👥 Usuários de Teste

### Admin
- Email: sauloadolfo32@gmail.com
- Senha: Saulo728568

### Usuário Comum
- Email: chain@user.com
- Senha: chain060126

## 📁 Estrutura do Projeto

```
projeto/
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── context/        # Context API (Auth, Produto, Saida)
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── App.tsx         # Componente principal
│   │   └── main.tsx        # Entry point
│   ├── .env                # Variáveis de ambiente (não commitado)
│   └── package.json
├── .gitignore
├── README.md
└── AUTENTICACAO.md         # Documentação detalhada de autenticação
```

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) no banco de dados
- Proteção de rotas no frontend
- Validação de permissões por role
- Limpeza automática de cache ao logout

## 📚 Documentação Adicional

- `AUTENTICACAO.md` - Guia completo de autenticação e permissões

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido por Saulo Adolfo

---

**⚠️ IMPORTANTE:** Nunca commite o arquivo `.env` com suas credenciais do Supabase!
