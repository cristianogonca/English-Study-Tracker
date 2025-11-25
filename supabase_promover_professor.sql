-- ============================================
-- PROMOVER USUÁRIO A PROFESSOR
-- ============================================

-- 1. Ver todos os usuários e seus roles atuais
SELECT 
  au.id,
  au.email,
  au.created_at,
  COALESCE(up.role, 'SEM PERFIL') as role_atual,
  COALESCE(up.nome, au.raw_user_meta_data->>'nome', au.email) as nome
FROM auth.users au
LEFT JOIN users_profile up ON au.id = up.id
ORDER BY au.created_at DESC;

-- 2. OPÇÃO A: Promover usuário específico por EMAIL
-- Substitua 'email@do.professor' pelo email real
UPDATE users_profile 
SET role = 'professor'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'email@do.professor'
);

-- 3. OPÇÃO B: Promover usuário específico por UUID
-- Substitua 'UUID_AQUI' pelo UUID real
-- UPDATE users_profile 
-- SET role = 'professor'
-- WHERE id = 'UUID_AQUI';

-- 4. Se o usuário NÃO tem registro em users_profile ainda, criar:
INSERT INTO users_profile (id, nome, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'nome', au.email) as nome,
  'professor'
FROM auth.users au
WHERE au.email = 'email@do.professor'
  AND NOT EXISTS (SELECT 1 FROM users_profile WHERE id = au.id);

-- 5. Verificar resultado
SELECT 
  au.id,
  au.email,
  up.role,
  up.nome
FROM auth.users au
JOIN users_profile up ON au.id = up.id
WHERE up.role = 'professor';

-- ============================================
-- INSTRUÇÕES:
-- 1. Execute a query #1 para ver todos os usuários
-- 2. Copie o email ou UUID do usuário que quer promover
-- 3. Cole no comando #2 (por email) ou #3 (por UUID)
-- 4. Execute o comando #4 caso o usuário não tenha perfil
-- 5. Execute a query #5 para confirmar
-- 6. Usuário deve fazer logout e login novamente
-- ============================================
