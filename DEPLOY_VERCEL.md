# 🚀 Deploy no Vercel - Passo a Passo

## ✅ Pré-requisitos
- [ ] Conta no GitHub (gratuita)
- [ ] Conta no Vercel (gratuita)
- [ ] Supabase configurado

---

## 📦 PASSO 1: Subir código para GitHub

### 1.1 Criar repositório no GitHub
1. Acesse: https://github.com/new
2. Nome do repositório: `english-study-tracker`
3. Deixe como **Private** (privado)
4. **NÃO** marque "Initialize with README"
5. Clique em **"Create repository"**

### 1.2 Enviar código para GitHub

Abra o terminal na pasta do projeto e execute:

```bash
# Inicializar Git (se ainda não tiver)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - English Study Tracker"

# Adicionar o repositório remoto (SUBSTITUA SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/english-study-tracker.git

# Enviar para GitHub
git branch -M main
git push -u origin main
```

**IMPORTANTE**: Substitua `SEU_USUARIO` pelo seu usuário do GitHub!

---

## 🌐 PASSO 2: Deploy no Vercel

### 2.1 Conectar Vercel ao GitHub
1. Acesse: https://vercel.com
2. Clique em **"Sign Up"** (ou Login se já tiver conta)
3. Escolha **"Continue with GitHub"**
4. Autorize o Vercel a acessar seus repositórios

### 2.2 Importar Projeto
1. No Vercel, clique em **"Add New..."** → **"Project"**
2. Encontre o repositório `english-study-tracker`
3. Clique em **"Import"**

### 2.3 Configurar Variáveis de Ambiente

**ANTES** de clicar em "Deploy", adicione as variáveis de ambiente:

1. Expanda a seção **"Environment Variables"**
2. Adicione estas variáveis:

```
VITE_SUPABASE_URL=https://pndygwggndjscwmaxeoc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZHlnd2dnbmRqc2N3bWF4ZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTc2MDcsImV4cCI6MjA3OTMzMzYwN30.Ex_TFLhXl387nO9NP6WZBJ7FozPFQptWbgd8mgcBevo
```

Para cada variável:
- **Name**: `VITE_SUPABASE_URL`
- **Value**: (cole a URL)
- Clique em **"Add"**

Repita para `VITE_SUPABASE_ANON_KEY`

### 2.4 Deploy!
1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Quando aparecer "🎉 Congratulations!", clique em **"Visit"**

---

## 🎯 PASSO 3: Testar o App

Sua URL será algo como: `https://english-study-tracker.vercel.app`

### Teste 1: Criar usuário no Supabase
1. Vá no Supabase: https://pndygwggndjscwmaxeoc.supabase.co
2. **Authentication** → **Users** → **Add user**
3. Email: `teste@exemplo.com`
4. Password: `Teste@2024`
5. ☑️ **Auto Confirm User** (MARCAR!)
6. **Create user**

### Teste 2: Fazer login no app
1. Acesse a URL do Vercel
2. Faça login com: `teste@exemplo.com` / `Teste@2024`
3. Configure seu perfil (Setup)
4. Teste as funcionalidades!

---

## 🔧 Problemas Comuns

### "Page not found" ao acessar rotas
**Solução**: Criar arquivo `vercel.json` na raiz do projeto:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Depois faça commit e push:
```bash
git add vercel.json
git commit -m "Add vercel.json for SPA routing"
git push
```

O Vercel vai fazer redeploy automaticamente!

### Variáveis de ambiente não funcionam
1. No Vercel, vá em **Settings** → **Environment Variables**
2. Verifique se as variáveis estão lá
3. Se precisar mudar, edite e clique em **"Redeploy"**

### Erro 500 ou tela branca
1. No Vercel, clique na última deployment
2. Vá em **"Logs"** ou **"Functions"**
3. Veja os erros no console
4. Me mostre os erros para eu ajudar!

---

## 🎨 PASSO 4: Domínio Personalizado (Opcional)

Se você tiver um domínio (ex: `meuapp.com.br`):

1. No Vercel, vá em **Settings** → **Domains**
2. Clique em **"Add"**
3. Digite seu domínio
4. Siga as instruções para configurar DNS

Se não tiver domínio, pode usar a URL do Vercel mesmo: `nome-do-projeto.vercel.app`

---

## 📊 Monitoramento

### Ver acessos e performance
1. No Vercel, vá em **Analytics**
2. Veja visitantes, performance, erros
3. Plano gratuito tem 100GB de banda/mês

### Ver logs em tempo real
1. No Vercel, clique na deployment
2. Vá em **"Logs"** ou **"Runtime Logs"**
3. Veja erros e requests em tempo real

---

## 🔄 Atualizações Futuras

Sempre que você fizer mudanças no código:

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

O Vercel vai fazer **redeploy automático**! 🎉

---

## 📞 Suporte

Se tiver problemas:
1. Veja os logs no Vercel
2. Teste localmente primeiro (`npm run dev`)
3. Me mostre os erros para eu ajudar!

---

## ✅ Checklist Final

Depois do deploy, teste:
- [ ] Página de login carrega
- [ ] Consegue fazer login com usuário do Supabase
- [ ] Setup funciona (configurar perfil)
- [ ] Dashboard mostra dados
- [ ] Adicionar palavra no vocabulário
- [ ] Marcar dia como concluído
- [ ] Check semanal funciona
- [ ] Cronograma exibe 12 meses
- [ ] Logout funciona
- [ ] Menu dropdown "Trocar Senha" aparece

Se tudo funcionar: **PARABÉNS! 🎉 Seu app está no ar!**

---

## 🚀 Compartilhar com Clientes

Depois do deploy:
1. Pegue a URL: `https://seu-app.vercel.app`
2. Crie usuário no Supabase para o cliente
3. Envie email com:
   - Link do app
   - Email e senha temporária
   - Instruções para trocar senha

Use o template de email do `GUIA_ADMIN.md`!
