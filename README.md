# 📦 StockOS — Sistema de Gestão de Estoque

<div align="center">

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Serverless-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Sistema completo de gestão de estoque desenvolvido para a Prefeitura Municipal de Alfenas — Secretaria de Ação Social**

Rastreabilidade total · Documentação automática · Controle preciso de movimentações

</div>

---

## 📑 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Fluxo de Trabalho](#-fluxo-de-trabalho)
- [Rodando Localmente](#-rodando-localmente)
- [Deploy](#-deploy)
- [Changelog](#-changelog)
- [Licença](#-licença)

---

## 🔍 Visão Geral

O **StockOS** é uma aplicação web fullstack para gerenciamento de estoque institucional. O sistema permite o cadastro de produtos com código de barras, controle de entradas e saídas com rastreabilidade completa, sistema de devoluções com comprovantes numerados, relatórios de consumo por local e impressão de documentos oficiais em formato A4.

### Destaques

- ✅ **100% Web** — Acesse de qualquer dispositivo com navegador
- 🌙 **Modo Escuro/Claro** — Interface adaptável com troca de tema
- 📱 **Responsivo** — Funciona em desktop, tablet e celular
- 🖨️ **Impressão A4** — Documentos oficiais prontos para imprimir
- 🔐 **Autenticação** — Login seguro via Supabase Auth
- 📊 **Dashboard em tempo real** — Gráficos e métricas atualizados

---

## ✨ Funcionalidades

### 📊 Dashboard Interativo
- Visão geral em tempo real do estoque
- Gráfico de movimentações dos últimos 30 dias (Entradas, Saídas e Devoluções)
- Cards com métricas: total de produtos, movimentações, itens críticos, sem estoque
- Ações rápidas para cadastro e registro de saídas

### 📝 Cadastro de Produtos
- Registro com **código de barras** (leitor físico ou câmera do celular)
- Unidade de medida configurável (UN, KG, CX, PCT, M, L)
- Busca automática de produtos existentes
- Adição rápida de estoque para produtos já cadastrados

### 📥 Entrada de Estoque
- **Cadastro Manual**: Registro individual com código de barras
- **Importação de NFe (XML)** 🧪: Upload de XML da Nota Fiscal Eletrônica com extração automática de produtos e registro em lote

### 📤 Saída de Estoque
- Seleção múltipla de produtos via código de barras
- Definição de local de destino e responsável pela retirada
- Validação de estoque disponível em tempo real
- Geração automática de **Documento de Saída** para impressão

### ↩️ Sistema de Devoluções
- Devoluções parciais ou totais por item
- Registro obrigatório de motivo
- Reposição automática ao estoque
- **Comprovante de Devolução** numerado (Nº DEV-YYYYMMDD-XXXXX)
- Impressão em formato A4 oficial

### 📈 Controle de Estoque
- Listagem completa com filtros: todos, com estoque, baixo, sem estoque
- Busca por nome ou código de barras
- Impressão de relatório completo
- Paginação automática

### 📋 Relatórios
- **Movimentações consolidadas**: Entradas, Saídas e Devoluções
- **Relatório de Consumo por Local** com:
  - Filtro por período e mês
  - Seleção de locais para inclusão
  - Geração de relatório paginado para impressão A4
  - Totalizadores por local e geral
- Filtros por tipo de movimentação, produto e responsável
- Identificação do usuário que realizou cada operação

### 📄 Histórico de Saídas
- Listagem completa com paginação
- Filtros por data e responsável
- Visualização e impressão de Documentos de Saída
- Acesso a Comprovantes de Devolução
- Botão "Devolver" integrado

### ⚠️ Estoque Baixo
- Alerta visual de produtos com estoque crítico (< 10 unidades)
- Filtros por nível: todos, com estoque, crítico, baixo
- Relatório de estoque baixo para impressão
- Indicadores visuais com cores (verde, amarelo, vermelho)

### ⚙️ Configurações
- Configuração do nome da empresa para documentos impressos
- Perfil de usuário com nickname personalizável
- Alternância de tema (Claro/Escuro)

### 🔐 Autenticação e Segurança
- Login via Supabase Auth com email/senha
- Perfis de usuário com nickname
- Registro de todas as operações com identificação do responsável
- Logs de exclusão de produtos
- Controle de acesso por rotas protegidas

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                  React 19 + TypeScript                       │
│                   Deploy: Vercel                            │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Pages   │  │Components│  │ Contexts │  │  Services  │  │
│  │ (15 pgs) │  │(Sidebar, │  │(Auth,    │  │(Supabase   │  │
│  │          │  │ Layout,  │  │ Produto, │  │ Client)    │  │
│  │Dashboard │  │ Barcode, │  │ Saida,   │  │            │  │
│  │Estoque   │  │ Relatorio│  │ Devolução│  │            │  │
│  │Saidas    │  │ Paginação│  │ Theme,   │  │            │  │
│  │Login...  │  │   ...)   │  │ Logs)    │  │            │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│                        │                                    │
└────────────────────────┼────────────────────────────────────┘
                         │ REST API (HTTPS)
┌────────────────────────┼────────────────────────────────────┐
│                 BACKEND (API)                               │
│            Cloudflare Workers + Hono                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Rotas: /produtos, /saidas-estoque, /devolucoes,    │   │
│  │         /locais-saida, /entradas-estoque,           │   │
│  │         /api/entrada-estoque, /logs-exclusao        │   │
│  │  Middleware: CORS, Autenticação JWT                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │ PostgreSQL + Auth
┌─────────────────────────┼───────────────────────────────────┐
│                    BANCO DE DADOS                           │
│                 Supabase (PostgreSQL)                       │
│                                                             │
│  Tabelas: produtos, saidas_estoque, itens_saida,           │
│           devolucoes, itens_devolucao, locais_saida,        │
│           entradas_estoque, logs_exclusao, profiles         │
│                                                             │
│  RPC: adicionar_ou_atualizar_produto, dar_baixa_estoque    │
│  Triggers: comprovante_numero automático                    │
│  Auth: Supabase Auth (email/senha)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias

### Frontend
| Tecnologia | Versão | Função |
|---|---|---|
| **React** | 19.2 | Biblioteca de UI com componentes funcionais e hooks |
| **TypeScript** | 5.9 | Tipagem estática para segurança do código |
| **Vite (Rolldown)** | 7.2 | Build tool ultrarrápido com HMR |
| **React Router DOM** | 7.11 | Roteamento SPA com rotas protegidas |
| **Recharts** | 3.6 | Gráficos interativos (Dashboard) |
| **Lucide React** | 0.562 | Biblioteca de ícones SVG |
| **Supabase JS** | 2.39 | Cliente de auth e comunicação com DB |
| **Axios** | 1.13 | Requisições HTTP para a API |
| **date-fns** | 4.1 | Formatação e manipulação de datas |
| **html5-qrcode** | 2.3 | Leitura de código de barras via câmera |
| **fast-xml-parser** | 5.3 | Parsing de XML de Notas Fiscais |
| **React Toastify** | 10.0 | Notificações toast na interface |
| **React Day Picker** | 9.13 | Seletor de datas |
| **CSS Variables** | — | Sistema de temas (claro/escuro) dinâmico |

### Backend
| Tecnologia | Função |
|---|---|
| **Cloudflare Workers** | Runtime serverless Edge (latência < 50ms) |
| **Hono** | Framework web leve para Workers |
| **TypeScript** | Tipagem no backend |
| **Wrangler** | CLI para deploy e gestão do Worker |

### Banco de Dados & Auth
| Tecnologia | Função |
|---|---|
| **Supabase** | Backend-as-a-Service (PostgreSQL + Auth) |
| **PostgreSQL** | Banco relacional com RPC e triggers |
| **Supabase Auth** | Autenticação email/senha com JWT |
| **Row Level Security** | Políticas de segurança no banco |

### Deploy & Infra
| Serviço | Função |
|---|---|
| **Vercel** | Hosting do frontend (CI/CD automático via Git) |
| **Cloudflare Workers** | Hosting do backend (edge computing) |
| **GitHub** | Controle de versão e CI |

---

## 📁 Estrutura do Projeto

```
gestaodestoque2/
├── frontend/                    # Aplicação React
│   ├── public/
│   │   └── images/              # Brasão e logos para impressão
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   │   ├── BarcodeScanner   # Leitor de código de barras (câmera)
│   │   │   ├── Layout           # Layout principal com Sidebar
│   │   │   ├── Pagination       # Paginação reutilizável
│   │   │   ├── RelatorioConsumo # Relatório de consumo por local
│   │   │   ├── Sidebar          # Menu lateral responsivo
│   │   │   └── ui/              # Componentes UI base (Button, Popover...)
│   │   │
│   │   ├── context/             # Contextos React (estado global)
│   │   │   ├── AuthContext      # Autenticação e sessão
│   │   │   ├── ProdutoContext   # CRUD de produtos
│   │   │   ├── SaidaContext     # Saídas de estoque
│   │   │   ├── DevolucaoContext # Sistema de devoluções
│   │   │   ├── ThemeContext     # Tema (claro/escuro) e cores
│   │   │   └── LogsExclusao    # Logs de exclusão
│   │   │
│   │   ├── pages/               # Páginas da aplicação
│   │   │   ├── Dashboard        # Página inicial com métricas
│   │   │   ├── CadastroProduto  # Cadastro/entrada de produtos
│   │   │   ├── SaidaEstoque     # Registro de saídas
│   │   │   ├── HistoricoSaidas  # Histórico + documentos
│   │   │   ├── ProcessarDevolucao # Formulário de devolução
│   │   │   ├── ControleEstoque  # Visão geral do estoque
│   │   │   ├── EstoqueBaixo     # Alertas de estoque crítico
│   │   │   ├── Relatorios       # Central de relatórios
│   │   │   ├── Estoque          # Redirecionamento
│   │   │   ├── EntradaNota      # Importação de NFe (XML)
│   │   │   ├── Settings         # Configurações do sistema
│   │   │   ├── Login            # Tela de login
│   │   │   ├── SetupProfile     # Configuração inicial do perfil
│   │   │   ├── LogsAdmin        # Logs administrativos
│   │   │   └── LogsExclusao     # Histórico de exclusões
│   │   │
│   │   ├── lib/                 # Utilitários (Supabase client, utils)
│   │   ├── services/            # Serviços (integrações)
│   │   ├── types.ts             # Tipos TypeScript globais
│   │   ├── App.tsx              # Roteamento principal
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Estilos globais + temas + print
│   │
│   ├── .env                     # Variáveis de ambiente (não versionado)
│   ├── package.json             # Dependências
│   ├── tsconfig.app.json        # Configuração TypeScript
│   └── vite.config.ts           # Configuração Vite
│
├── backend-workers/             # API Cloudflare Workers
│   ├── src/
│   │   └── index.ts             # Rotas da API REST (Hono)
│   ├── wrangler.toml            # Configuração do Worker
│   └── package.json             # Dependências do backend
│
├── vercel.json                  # Config de deploy Vercel
└── README.md                    # Este arquivo
```

---

## 🔄 Fluxo de Trabalho

### Fluxo Principal — Ciclo de Vida do Estoque

```
  ┌──────────────────┐
  │  1. CADASTRO     │  Produto cadastrado com código de barras,
  │     DE PRODUTO   │  nome, quantidade e unidade de medida
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │  2. ENTRADA      │  Via cadastro manual individual ou
  │     DE ESTOQUE   │  importação em lote de XML da NFe
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │  3. SAÍDA        │  Seleção de produtos, definição de local,
  │     DE ESTOQUE   │  responsável e observações → Documento de Saída
  └────────┬─────────┘
           │
           ├──────────────────────────────┐
           ▼                              ▼
  ┌──────────────────┐          ┌──────────────────┐
  │  4. HISTÓRICO    │          │  5. DEVOLUÇÃO     │
  │     DE SAÍDAS    │          │     (parcial/total)│
  │  Consulta e      │          │  Reposição ao     │
  │  impressão       │          │  estoque + Comprov.│
  └──────────────────┘          └──────────────────┘
           │                              │
           ▼                              ▼
  ┌───────────────────────────────────────────────┐
  │              6. RELATÓRIOS                     │
  │  Movimentações · Consumo por Local · Estoque  │
  │  Filtros por período, local e tipo             │
  └───────────────────────────────────────────────┘
```

### Fluxo de Saída (Detalhado)

1. **Operador acessa** a tela de Saída de Estoque
2. **Escaneia o código de barras** de cada produto (via leitor USB ou câmera)
3. **Define a quantidade** de cada item
4. **Seleciona o local** de destino (ex: CRAS Norte, CRAS Sul)
5. **Informa o responsável** pela retirada
6. **Registra a saída** → Sistema valida estoque e gera documento
7. **Imprime o Documento de Saída** em A4 para assinatura

### Fluxo de Devolução (Detalhado)

1. **Acessa o Histórico de Saídas** e localiza a saída em questão
2. **Clica em "Devolver"** → abre formulário de devolução
3. **Seleciona os itens** e quantidades a devolver
4. **Informa o motivo** (ex: "Produto com defeito", "Quantidade excedente")
5. **Processa a devolução** → estoque é atualizado automaticamente
6. **Comprovante numerado** (DEV-YYYYMMDD-XXXXX) é gerado
7. **Imprime o Comprovante de Devolução** em A4

---

## 🚀 Rodando Localmente

### Pré-requisitos

- **Node.js** 18+
- **npm** 9+
- Conta no **Supabase** (para banco de dados e auth)
- Conta na **Cloudflare** (para o backend Workers)

### 1. Clone o repositório

```bash
git clone https://github.com/sauloteixeira-dev/gestaodestoque2.git
cd gestaodestoque2
```

### 2. Configure o Frontend

```bash
cd frontend
npm install
```

Crie o arquivo `.env` na pasta `frontend/`:

```env
VITE_API_URL=http://localhost:8787
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

### 3. Configure o Backend

```bash
cd backend-workers
npm install
```

Configure os secrets do Wrangler:

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_KEY
```

Inicie o Worker localmente:

```bash
npx wrangler dev
```

O backend estará disponível em `http://localhost:8787`

---

## 🌐 Deploy

### Frontend — Vercel

O deploy do frontend é automático via integração com o GitHub:

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente (`VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. Cada push na branch `main` dispara um novo deploy automaticamente

### Backend — Cloudflare Workers

```bash
cd backend-workers
npx wrangler deploy
```

O Worker será publicado na URL configurada no `wrangler.toml`.

### Banco de Dados — Supabase

O schema do banco é gerenciado diretamente no painel do Supabase.

**Tabelas principais:**
- `produtos` — Cadastro de produtos
- `saidas_estoque` — Registro de saídas
- `itens_saida` — Itens de cada saída
- `devolucoes` — Registro de devoluções
- `itens_devolucao` — Itens devolvidos
- `locais_saida` — Locais de destino
- `entradas_estoque` — Log de entradas
- `logs_exclusao` — Histórico de exclusões
- `profiles` — Perfis de usuário

---

## 📝 Changelog

### [3.0.0] - 2026-02-19
- ✨ Novo **Relatório de Consumo por Local** com paginação automática para impressão A4
- ✨ Filtro por mês e período nos relatórios
- 🎨 Padronização de cores de botões de impressão via `ThemeContext`
- 🎨 Redesign do Dashboard com gráficos aprimorados
- 🔒 Remoção de chaves de API hardcoded e preparação para portfólio
- 🔧 Correção de tela de Login (remoção de cadastro, link WhatsApp)
- 🔧 Limpeza de arquivos desnecessários (backups, docs internos)

### [1.2.0] - 2026-01-14
- ✨ Campo "Unidade de Medida" em produtos
- ✨ Exibição de unidade integrada em todas as telas
- ✨ Devoluções adicionadas ao gráfico do Dashboard
- 🐛 Correções de TypeScript para build da Vercel

### [1.1.0] - 2026-01-13
- ✨ Sistema completo de devoluções
- ✨ Comprovantes de devolução numerados
- ✨ Relatórios com identificação de usuários
- 🎨 Melhorias na impressão de documentos

### [1.0.0] - 2026-01-12
- 🎉 Versão inicial do sistema
- ✨ Cadastro de produtos com código de barras
- ✨ Entrada e saída de estoque
- ✨ Dashboard e relatórios
- ✨ Autenticação de usuários

---

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Desenvolvido com ❤️ por **Saulo Teixeira** para a **Prefeitura Municipal de Alfenas — Secretaria de Ação Social**

</div>
