# Como Resetar Seu Perfil e Refazer o Setup

## Opção 1: Pelo Supabase Dashboard (RECOMENDADO)

1. Acesse https://supabase.com e faça login
2. Vá no seu projeto
3. Clique em "Table Editor" no menu lateral
4. Para cada tabela abaixo, DELETE todos os registros do seu usuário:
   - `users_profile` - DELETE WHERE email = 'seu-email@gmail.com'
   - `cronograma` - DELETE WHERE user_id = 'seu-user-id'
   - `fases` - DELETE WHERE user_id = 'seu-user-id'
   - `vocabulario` - DELETE WHERE user_id = 'seu-user-id'
   - `checks_semanais` - DELETE WHERE user_id = 'seu-user-id'
   - `progresso_tarefas` - DELETE WHERE user_id = 'seu-user-id'

5. Faça logout da aplicação
6. Faça login novamente
7. Refaça o setup escolhendo o nível desejado

## Opção 2: SQL Rápido no Supabase

1. Vá em "SQL Editor" no Supabase
2. Cole e execute este SQL (SUBSTITUA o email pelo seu):

```sql
-- Buscar seu user_id primeiro
SELECT id FROM auth.users WHERE email = 'SEU-EMAIL-AQUI@gmail.com';

-- Copie o ID que aparecer e use abaixo
DELETE FROM users_profile WHERE id = 'COLE-SEU-USER-ID-AQUI';
DELETE FROM cronograma WHERE user_id = 'COLE-SEU-USER-ID-AQUI';
DELETE FROM fases WHERE user_id = 'COLE-SEU-USER-ID-AQUI';
DELETE FROM vocabulario WHERE user_id = 'COLE-SEU-USER-ID-AQUI';
DELETE FROM checks_semanais WHERE user_id = 'COLE-SEU-USER-ID-AQUI';
DELETE FROM progresso_tarefas WHERE user_id = 'COLE-SEU-USER-ID-AQUI';
```

3. Faça logout e login novamente
4. Refaça o setup

---

**Após resetar, o sistema vai gerar o cronograma correto com todas as tarefas detalhadas!** ✅
