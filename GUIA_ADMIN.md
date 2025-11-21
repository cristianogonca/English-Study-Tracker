# 🔐 Guia de Administração - English Study Tracker

## 📋 Modelo de Negócio

Este sistema **NÃO permite cadastro público**. Você controla 100% quem acessa.

### Fluxo de Vendas:

1. ✅ Cliente compra o curso/assinatura
2. ✅ Você cria o usuário manualmente no Supabase
3. ✅ Você envia email com credenciais temporárias
4. ✅ Cliente faz login e troca a senha
5. ✅ Cliente configura seu perfil de estudos

---

## 🆕 Como Criar um Novo Usuário

### Passo 1: Acessar Supabase Dashboard

1. Acesse: https://pndygwggndjscwmaxeoc.supabase.co
2. Vá em **Authentication** → **Users**
3. Clique em **Add user** (botão verde)

### Passo 2: Preencher Dados do Usuário

```
Email: email_do_cliente@exemplo.com
Password: Temp@2024  (ou qualquer senha temporária)
☑️ Auto Confirm User (MARQUE ESTA OPÇÃO!)
```

**IMPORTANTE**: Sempre marque "Auto Confirm User" para o usuário não precisar confirmar email.

### Passo 3: Definir Assinatura

Após criar o usuário, a assinatura FREE é criada automaticamente por 30 dias.

Para mudar o plano, vá no **SQL Editor** e execute:

```sql
-- Ver assinatura do usuário
SELECT * FROM subscriptions 
WHERE user_id = 'COLE_O_ID_DO_USUARIO_AQUI';

-- Atualizar para plano BASIC
UPDATE subscriptions 
SET plan = 'basic', 
    status = 'active',
    expires_at = NOW() + INTERVAL '1 year'
WHERE user_id = 'COLE_O_ID_DO_USUARIO_AQUI';

-- Atualizar para plano PREMIUM
UPDATE subscriptions 
SET plan = 'premium', 
    status = 'active',
    expires_at = NOW() + INTERVAL '1 year'
WHERE user_id = 'COLE_O_ID_DO_USUARIO_AQUI';
```

**Dica**: Copie o `user_id` da tabela Users (coluna ID).

---

## 📧 Email de Boas-Vindas (Template)

Envie este email para o novo cliente:

```
Assunto: 🎉 Bem-vindo ao English Study Tracker!

Olá [NOME],

Seja bem-vindo(a) ao seu curso de inglês! Suas credenciais de acesso estão abaixo:

🔗 Link de Acesso: https://seusite.com/login
📧 Email: [EMAIL_DO_CLIENTE]
🔑 Senha Temporária: Temp@2024

⚠️ IMPORTANTE: 
1. Faça login com as credenciais acima
2. Vá em "Perfil" ou "Trocar Senha" no menu
3. Altere sua senha para uma senha pessoal e segura

📚 Após o primeiro login, você será guiado para configurar:
- Seu nome
- Metas de estudo (tempo diário/semanal)
- Dias da semana disponíveis
- Data de início do cronograma

Qualquer dúvida, responda este email!

Bons estudos! 🚀
[SEU NOME]
```

---

## 👥 Planos e Limites

### 🆓 FREE (30 dias)
- Vocabulário: até 50 palavras
- Check Semanal: até 4 checks
- Funcionalidades básicas

### 📦 BASIC (Recomendado)
- Vocabulário: até 500 palavras
- Check Semanal: ilimitado
- Todas funcionalidades
- Suporte por email

### 💎 PREMIUM
- Vocabulário: ilimitado
- Check Semanal: ilimitado
- Todas funcionalidades
- Suporte prioritário
- Relatórios avançados

---

## 🔧 Gerenciamento de Usuários

### Ver Todos os Usuários

SQL Editor:

```sql
-- Lista completa com estatísticas
SELECT * FROM user_statistics;

-- Apenas emails e planos
SELECT 
  u.email,
  s.plan,
  s.status,
  s.expires_at
FROM auth.users u
LEFT JOIN subscriptions s ON s.user_id = u.id
ORDER BY u.created_at DESC;
```

### Renovar Assinatura

```sql
-- Renovar por 1 ano
UPDATE subscriptions 
SET expires_at = NOW() + INTERVAL '1 year',
    status = 'active'
WHERE user_id = 'ID_DO_USUARIO';
```

### Cancelar Assinatura

```sql
UPDATE subscriptions 
SET status = 'canceled'
WHERE user_id = 'ID_DO_USUARIO';
```

### Deletar Usuário

**CUIDADO**: Isso apaga TODOS os dados do usuário!

1. Vá em Authentication → Users
2. Clique nos 3 pontinhos (...) ao lado do usuário
3. Selecione "Delete user"
4. Confirme

Ou via SQL:

```sql
-- ISSO APAGA TUDO! Use com cuidado!
DELETE FROM auth.users WHERE id = 'ID_DO_USUARIO';
-- Row Level Security apaga automaticamente todos dados relacionados
```

---

## 🔍 Monitoramento

### Usuários Ativos

```sql
SELECT COUNT(*) as usuarios_ativos
FROM subscriptions 
WHERE status = 'active' 
AND expires_at > NOW();
```

### Usuários por Plano

```sql
SELECT 
  plan,
  COUNT(*) as total
FROM subscriptions 
WHERE status = 'active'
GROUP BY plan;
```

### Engajamento

```sql
-- Top 10 usuários com mais palavras
SELECT 
  u.email,
  COUNT(v.id) as total_palavras
FROM auth.users u
LEFT JOIN vocabulario v ON v.user_id = u.id
GROUP BY u.email
ORDER BY total_palavras DESC
LIMIT 10;

-- Dias concluídos por usuário
SELECT 
  u.email,
  COUNT(CASE WHEN c.concluido THEN 1 END) as dias_completos,
  COUNT(c.id) as total_dias
FROM auth.users u
LEFT JOIN cronograma c ON c.user_id = u.id
GROUP BY u.email
ORDER BY dias_completos DESC;
```

---

## 🛡️ Segurança

### Senhas Temporárias Recomendadas

Use senhas fortes mas fáceis de digitar:

- `Welcome2024!`
- `Start@2024`
- `Temp!2024`
- `Begin#2024`

### Política de Senha

O sistema exige:
- Mínimo 6 caracteres (recomendado: 8+)
- Supabase aceita qualquer caractere

### Auditoria

Para ver logs de acesso:

1. Supabase Dashboard → Authentication
2. Aba "Logs"
3. Filtrar por email ou evento (login, signup, etc.)

---

## 🚀 Deploy e URLs

Depois do deploy no Vercel:

1. Anote a URL final: `https://seu-app.vercel.app`
2. Atualize o email de boas-vindas com a URL correta
3. Teste o fluxo completo:
   - Criar usuário no Supabase
   - Fazer login com senha temporária
   - Trocar senha
   - Configurar perfil
   - Testar funcionalidades

---

## 📞 Suporte aos Clientes

### Problemas Comuns

**"Não consigo fazer login"**
- Verifique se o email está correto
- Confirme que o usuário foi criado no Supabase
- Verifique se "Auto Confirm User" estava marcado
- Resetar senha (ver abaixo)

**"Esqueci minha senha"**
Via SQL Editor:

```sql
-- Resetar para senha temporária
-- IMPORTANTE: Use o email do usuário para encontrar o ID
UPDATE auth.users 
SET encrypted_password = crypt('NovaSenhaTemp@2024', gen_salt('bf'))
WHERE email = 'email@cliente.com';
```

Depois envie email informando a nova senha temporária.

**"Perdi meus dados"**
Se você deletou por engano, não há como recuperar.
Sempre faça backup antes de deletar!

---

## 📊 Backup de Dados

### Exportar Dados de um Usuário

```sql
-- Copie o resultado e salve em arquivo
SELECT jsonb_build_object(
  'usuario', (SELECT row_to_json(u) FROM auth.users u WHERE id = 'ID_USUARIO'),
  'config', (SELECT row_to_json(c) FROM user_configs c WHERE user_id = 'ID_USUARIO'),
  'cronograma', (SELECT array_agg(row_to_json(cr)) FROM cronograma cr WHERE user_id = 'ID_USUARIO'),
  'vocabulario', (SELECT array_agg(row_to_json(v)) FROM vocabulario v WHERE user_id = 'ID_USUARIO'),
  'checks', (SELECT array_agg(row_to_json(cs)) FROM checks_semanais cs WHERE user_id = 'ID_USUARIO')
) as backup_completo;
```

---

## 🎯 Próximos Passos

- [ ] Configurar domínio personalizado
- [ ] Integrar sistema de pagamento (Stripe, etc.)
- [ ] Automatizar envio de emails de boas-vindas
- [ ] Criar painel admin web (opcional)
- [ ] Configurar emails transacionais (reset senha, etc.)

---

**Dúvidas?** Consulte a documentação do Supabase: https://supabase.com/docs
