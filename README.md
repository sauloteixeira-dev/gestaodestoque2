# 📦 StockOS - Sistema de Gestão de Estoque

Sistema completo de gestão de estoque desenvolvido para a **Prefeitura Municipal de Alfenas - Secretaria de Ação Social**, com foco em rastreabilidade, documentação e controle preciso de movimentações.

## 🌟 Funcionalidades Principais

### 📊 Dashboard Interativo
- Visão geral em tempo real do estoque
- Gráfico de movimentações dos últimos 30 dias (Entradas, Saídas e Devoluções)
- Cards com métricas essenciais:
  - Total de produtos em estoque
  - Número de movimentações de saída
  - Itens críticos (abaixo de 10 unidades)
  - Produtos sem estoque
- Ações rápidas para cadastro de produtos e registro de saídas

### 📝 Cadastro de Produtos
- Registro com código de barras (leitor ou câmera)
- **Unidade de Medida** (UN, KG, CX, PCT, M, L)
- Busca automática de produtos existentes
- Adição rápida de estoque para produtos já cadastrados
- Quantidade inicial configurável

### 📥 Entrada de Estoque
- **Cadastro Manual**: Registro individual de produtos com código de barras
- **Importação de NFe (XML)** 🧪 *(Em Testes)*: 
  - Upload de XML da Nota Fiscal Eletrônica
  - Extração automática de produtos via API Workers
  - Registro em lote de múltiplos itens
  - Leitura de código de barras da chave de acesso
  - *Funcionalidade experimental em desenvolvimento*

### 📤 Saída de Estoque
- Seleção múltipla de produtos via código de barras
- Definição de local de destino
- Identificação do responsável pela retirada
- Campo de observações
- Validação de estoque disponível
- Geração automática de documentos de saída

### ↩️ Sistema de Devoluções
- Processamento de devoluções parciais ou totais
- Registro de motivo da devolução
- Atualização automática do estoque
- Geração de comprovante de devolução (Nº DEV-YYYYMMDD-XXXXX)
- Impressão de documento oficial em formato A4

### 📈 Controle de Estoque
- Listagem completa de produtos
- Filtros por status:
  - Todos os itens
  - Apenas com estoque (quantidade > 0)
  - Estoque baixo (quantidade < 10)
  - Sem estoque (quantidade = 0)
- Busca por nome ou código de barras
- Impressão de relatório de estoque
- Informações de quantidade com unidade de medida

### 📋 Relatórios
- **Movimentações consolidadas**:
  - Entradas de estoque
  - Saídas de estoque
  - Devoluções
- Filtros por tipo de movimentação
- Busca por produto ou responsável
- Exportação e impressão de relatórios
- Identificação do usuário que realizou cada operação (nickname/email)

### 📄 Histórico de Saídas
- Listagem de todas as saídas com paginação
- Filtros por data e responsável
- Visualização de documentos de saída
- Acesso a comprovantes de devolução
- Botão "Devolver" para processar devoluções
- Impressão de documentos oficiais:
  - **Entrega de Mercadoria**: Documento de saída com paginação automática
  - **Comprovante de Devolução**: Documento A4 com numeração única

### 🎨 Interface e Experiência
- **Temas**: Modo claro e escuro
- **Design Responsivo**: Otimizado para desktop, tablet e mobile
- **Acessibilidade**: Navegação intuitiva e alto contraste
- **Sidebar Móvel**: Menu adaptativo para dispositivos móveis
- **Impressão Otimizada**: Documentos prontos para impressão A4

### 🔐 Autenticação e Segurança
- Sistema de login via Supabase Auth
- Perfis de usuário com nickname
- Controle de acesso por usuário
- Registro de todas as operações com identificação do responsável
- Logs de exclusão de produtos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** para build ultrarrápido
- **React Router** para navegação
- **Recharts** para gráficos interativos
- **Lucide React** para ícones
- **CSS Variáveis** para temas dinâmicos

### Backend
- **Cloudflare Workers** (Serverless)
- **Hono Framework** (API REST)
- **Supabase** (PostgreSQL + Auth)
- **TypeScript**

### Deploy
- **Frontend**: Vercel
- **Backend**: Cloudflare Workers
- **Banco de Dados**: Supabase (PostgreSQL)

## 📁 Estrutura do Projeto

```
gestao-estoque/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── context/          # Contexts (Produto, Saída, Devolução, Auth)
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── services/         # Serviços (API, Supabase)
│   │   └── types.ts          # Definições TypeScript
│   └── package.json
│
├── backend-workers/          # API Cloudflare Workers
│   ├── src/
│   │   └── index.ts          # Endpoints da API
│   ├── migrations/           # Migrações SQL
│   │   ├── 001_create_devolucoes.sql
│   │   └── 002_add_unidade_to_produtos.sql
│   └── wrangler.toml         # Configuração Cloudflare
│
├── INSTALL.md                # Guia de instalação
├── SISTEMA_DEVOLUCAO.md      # Documentação do sistema de devoluções
└── README.md                 # Este arquivo
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Conta Supabase
- Conta Cloudflare (para backend)
- Conta Vercel (para frontend)

### 1. Configurar Banco de Dados (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrações SQL no SQL Editor:
   - `backend-workers/migrations/001_create_devolucoes.sql`
   - `backend-workers/migrations/002_add_unidade_to_produtos.sql`
3. Anote a URL e a chave anônima do projeto

### 2. Configurar Backend (Cloudflare Workers)

```bash
cd backend-workers
npm install

# Configurar variáveis de ambiente
cp .dev.vars.example .dev.vars
# Editar .dev.vars com suas credenciais Supabase

# Deploy
npm run deploy
```

### 3. Configurar Frontend

```bash
cd frontend
npm install

# Criar arquivo .env
echo "VITE_SUPABASE_URL=sua-url-supabase" > .env
echo "VITE_SUPABASE_ANON_KEY=sua-chave-supabase" >> .env
echo "VITE_API_URL=https://sua-api.workers.dev" >> .env

# Desenvolvimento
npm run dev

# Deploy (Vercel)
vercel --prod
```

### 4. Configurar Autenticação

1. No Supabase, vá em **Authentication > Providers**
2. Habilite **Email** provider
3. Configure **Site URL** e **Redirect URLs** para seu domínio

## 📸 Capturas de Tela

### Dashboard
- Visão geral com métricas e gráfico de movimentações

### Cadastro de Produtos
- Interface de cadastro com leitor de código de barras

### Saída de Estoque
- Seleção de produtos e registro de saída

### Comprovantes
- Documentos de saída e devolução prontos para impressão

## 🔄 Fluxo de Trabalho Típico

1. **Entrada de Produtos**:
   - Cadastro manual via código de barras
   - *(Opcional)* Upload de XML da NFe (funcionalidade em testes)
   - Produtos registrados com código de barras, nome e unidade de medida

2. **Saída de Produtos**:
   - Escanear código de barras dos produtos
   - Selecionar local de destino
   - Informar responsável
   - Gerar documento de saída

3. **Devolução**:
   - Acessar histórico de saídas
   - Clicar em "Devolver"
   - Selecionar itens e quantidades
   - Informar motivo
   - Gerar comprovante de devolução

4. **Acompanhamento**:
   - Dashboard mostra movimentações em tempo real
   - Relatórios consolidam todas as operações
   - Controle de estoque alerta sobre itens críticos

## 📄 Documentação Adicional

- [INSTALL.md](./INSTALL.md) - Guia detalhado de instalação
- [SISTEMA_DEVOLUCAO.md](./SISTEMA_DEVOLUCAO.md) - Documentação do sistema de devoluções

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Changelog

### [1.2.0] - 2026-01-14
- ✨ Adicionado campo "Unidade de Medida" em produtos
- ✨ Exibição de unidade integrada em todas as telas
- ✨ Devoluções adicionadas ao gráfico do Dashboard
- 🐛 Correções de TypeScript para build da Vercel
- 📄 Documentos de saída e devolução com unidade de medida

### [1.1.0] - 2026-01-13
- ✨ Sistema completo de devoluções
- ✨ Comprovantes de devolução numerados
- ✨ Relatórios com identificação de usuários
- 🎨 Melhorias na impressão de documentos

### [1.0.0] - 2026-01-12
- 🎉 Versão inicial do sistema
- ✨ Cadastro de produtos
- ✨ Entrada e saída de estoque
- ✨ Dashboard e relatórios
- ✨ Autenticação de usuários

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através do GitHub Issues.

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com ❤️ para a **Prefeitura Municipal de Alfenas - Secretaria de Ação Social**
