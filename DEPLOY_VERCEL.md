# 🚀 Deploy na Vercel - Guia Completo

## 📋 Pré-requisitos

- Conta na Vercel (gratuita): https://vercel.com/signup
- Projeto no GitHub (já feito ✅)
- Credenciais do Supabase

## 🎯 Opção 1: Deploy via Dashboard Vercel (Recomendado)

### 1. Acesse a Vercel
1. Entre em: https://vercel.com
2. Faça login com sua conta GitHub

### 2. Importe o Projeto
1. Clique em **"Add New..."** → **"Project"**
2. Selecione o repositório: `sistema-gestao-estoque`
3. Clique em **"Import"**

### 3. Configure o Projeto

**Framework Preset:** Vite  
**Root Directory:** `frontend`  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

### 4. Configure as Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

```
VITE_SUPABASE_URL=https://fygvwzxplsmarvqulysf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5Z3Z3enhwbHNtYXJ2cXVseXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MzM0NzcsImV4cCI6MjA4MzMwOTQ3N30.7sVXN2V0AtuQOxKVoYbG5BsImwaGVAhR7ZnGruh9S5g
```

**⚠️ IMPORTANTE:** Marque para aplicar em todos os ambientes (Production, Preview, Development)

### 5. Deploy
1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. ✅ Pronto! Seu site estará no ar

---

## 🎯 Opção 2: Deploy via CLI Vercel

### 1. Instale a Vercel CLI
```bash
npm install -g vercel
```

### 2. Faça Login
```bash
vercel login
```

### 3. Configure o Projeto
```bash
cd c:\Users\saulo\OneDrive\Desktop\windsurf\projeto
vercel
```

Responda as perguntas:
- **Set up and deploy?** → Yes
- **Which scope?** → Sua conta
- **Link to existing project?** → No
- **Project name?** → sistema-gestao-estoque
- **Directory?** → frontend
- **Override settings?** → Yes
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
  - **Development Command:** `npm run dev`

### 4. Adicione Variáveis de Ambiente
```bash
vercel env add VITE_SUPABASE_URL
# Cole: https://fygvwzxplsmarvqulysf.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Cole: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Deploy em Produção
```bash
vercel --prod
```

---

## 🔧 Configuração do Supabase para Produção

### 1. Adicione a URL da Vercel no Supabase

1. Acesse: https://supabase.com/dashboard/project/fygvwzxplsmarvqulysf/settings/api
2. Vá em **"URL Configuration"**
3. Adicione sua URL da Vercel em **"Site URL"**:
   - Exemplo: `https://sistema-gestao-estoque.vercel.app`

### 2. Configure Redirect URLs

Em **"Authentication"** → **"URL Configuration"** → **"Redirect URLs"**, adicione:
```
https://sistema-gestao-estoque.vercel.app/*
https://sistema-gestao-estoque.vercel.app/login
```

---

## 📊 Monitoramento

### Dashboard Vercel
- **URL:** https://vercel.com/dashboard
- Veja logs, analytics, e performance
- Configure domínio customizado (opcional)

### Logs em Tempo Real
```bash
vercel logs
```

---

## 🔄 Atualizações Automáticas

✅ **Deploy Automático Configurado!**

Toda vez que você fizer push para o GitHub:
```bash
git add .
git commit -m "Sua mensagem"
git push origin main
```

A Vercel automaticamente:
1. Detecta o push
2. Faz o build
3. Faz o deploy
4. Atualiza o site em produção

---

## 🌐 Domínio Customizado (Opcional)

### Adicionar Domínio Próprio

1. Vá em **Project Settings** → **Domains**
2. Clique em **"Add"**
3. Digite seu domínio (ex: `meusite.com`)
4. Configure os DNS conforme instruções
5. Aguarde propagação (até 48h)

---

## 🐛 Troubleshooting

### Erro: "Build Failed"
- Verifique se as variáveis de ambiente estão corretas
- Confira os logs de build na Vercel
- Teste o build localmente: `npm run build`

### Erro: "Cannot connect to Supabase"
- Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas
- Confirme que a URL da Vercel está nas Redirect URLs do Supabase

### Erro 404 em rotas
- Já configurado no `vercel.json` para redirecionar todas as rotas para `index.html`

---

## ✅ Checklist Final

- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Build concluído com sucesso
- [ ] Site acessível na URL da Vercel
- [ ] URL da Vercel adicionada no Supabase
- [ ] Login funcionando
- [ ] Todas as páginas carregando

---

## 📱 URLs Importantes

**Seu Site:** https://sistema-gestao-estoque.vercel.app (será gerado após deploy)  
**Dashboard Vercel:** https://vercel.com/dashboard  
**Supabase Dashboard:** https://supabase.com/dashboard/project/fygvwzxplsmarvqulysf

---

**🎉 Parabéns! Seu sistema está em produção!**
