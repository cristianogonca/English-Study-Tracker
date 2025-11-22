-- ============================================
-- CORRIGIR NOMES NULL EM USERS_PROFILE
-- ============================================

-- Atualizar users_profile com nomes do auth.users.user_metadata
UPDATE users_profile up
SET nome = au.raw_user_meta_data->>'nome'
FROM auth.users au
WHERE up.id = au.id 
  AND up.nome IS NULL 
  AND au.raw_user_meta_data->>'nome' IS NOT NULL;

-- Se ainda houver nomes NULL, usar o email como fallback
UPDATE users_profile up
SET nome = au.email
FROM auth.users au
WHERE up.id = au.id 
  AND up.nome IS NULL;

-- Verificar resultado
SELECT 
  up.id,
  up.nome,
  up.role,
  au.email
FROM users_profile up
JOIN auth.users au ON up.id = au.id;
