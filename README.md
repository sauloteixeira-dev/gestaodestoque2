# 📦 Sistema de Gestão de Estoque - StockOS

Sistema moderno e eficiente para gestão de estoque, desenvolvido para atender demandas de controle de entrada, saída e monitoramento de produtos.

## 🚀 Tecnologias

### Frontend
- **React** + **TypeScript**
- **Vite** - Build tool ultra-rápida.
- **Recharts** - Gráficos interativos para o Dashboard.
- **Lucide React** - Ícones modernos e leves.
- **React Router** - Navegação SPA.
- **CSS3** - Design sistema com suporte a **Modo Escuro** e **Claro**.

### Backend
- **Node.js** + **Express** - Servidor leve e performático.
- **SQLite** - Banco de dados local, simples e sem configurações complexas.
- **Multer** - Upload de arquivos (para importação de XML).

## ✨ Funcionalidades

### 🏠 Dashboard
- **Visão Geral:** Cards com total de produtos, movimentações, itens críticos e sem estoque.
- **Gráfico:** Análise visual de entradas e saídas nos últimos 30 dias.
- **Atalhos Rápidos:** Botões de ação para operações frequentes.
- **Responsivo:** Layout adaptável para mobile e desktop.

### 📦 Controle de Estoque
- **Cadastro de Produtos:** Interface intuitiva para adicionar novos itens.
- **Editar Estoque:** Ajuste rápido de quantidades e detalhes.
- **Importação de NFe (XML):** Entrada massiva de produtos lendo o XML da Nota Fiscal Eletrônica.

### 🔄 Movimentações
- **Entrada Manual:** Registro detalhado de recebimento de materiais.
- **Saída de Estoque:** Baixa de produtos com vínculo a um local/setor e responsável.
- **Histórico Completo:** Rastreabilidade total de quem retirou, quando e para onde.

### 📊 Relatórios e Monitoramento
- **Estoque Baixo/Crítico:** Listas filtradas para reposição urgente.
- **Impressão Profissional:** Layouts de impressão otimizados para relatórios físicos.
- **Busca Global:** Pesquisa rápida por nome, código de barras ou local.

### ⚙️ Configurações
- **Temas:** Suporte nativo a Tema Escuro (Dark Mode) e Claro.
- **Gestão de Locais:** Cadastro de setores de destino para as saídas.

## 📋 Pré-requisitos

- **Node.js** 18 ou superior.
- **NPM** (gerenciador de pacotes).

## 🔧 Instalação e Execução

### 1. Backend (Servidor)

O backend roda na porta `3001` e gerencia o banco de dados SQLite.

```bash
cd backend
npm install
node server.js
```

### 2. Frontend (Aplicação Web)

O frontend roda na porta `5173` (padrão Vite).

```bash
# Abra um novo terminal
cd frontend
npm install
npm run dev
```

Acesse a aplicação em: `http://localhost:5173`

## 📁 Estrutura do Projeto

```
gestao-estoque/
├── backend/            # API e Banco de Dados
│   ├── database.db     # Arquivo do SQLite (criado automaticamente)
│   ├── server.js       # Lógica do servidor Express
│   └── package.json    # Dependências do backend
│
├── frontend/           # Aplicação React
│   ├── src/
│   │   ├── components/ # Componentes (Sidebar, Cards, etc)
│   │   ├── context/    # Gestão de Estado (Auth, Produtos, Tema)
│   │   ├── pages/      # Telas (Dashboard, Estoque, etc)
│   │   └── styles/     # Arquivos CSS globais
│   └── package.json    # Dependências do frontend
│
└── README.md           # Documentação
```

## 🔒 Banco de Dados

O banco de dados é inicializado automaticamente no arquivo `backend/database.db` na primeira execução do servidor. Tabelas incluídas:
- `produtos`
- `saidas` (com relacionamento para itens)
- `entradas`
- `locais` (setores)
- `logs_exclusao`

## 🤝 Contribuindo

1. Faça um Fork do projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`).
3. Commit suas mudanças (`git commit -m 'Adiciona NovaFeature'`).
4. Push para a branch (`git push origin feature/NovaFeature`).
5. Abra um Pull Request.

## 👨‍💻 Autor

Desenvolvido por **Saulo Adolfo**.
