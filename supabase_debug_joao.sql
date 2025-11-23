-- ============================================
-- DEBUG: Verificar dados do aluno João
-- ============================================

-- 1. Buscar João na tabela de usuários
SELECT 
  au.id,
  au.email,
  up.nome as nome_profile,
  uc.nome as nome_config
FROM auth.users au
LEFT JOIN users_profile up ON au.id = up.id
LEFT JOIN user_configs uc ON au.id = uc.user_id
WHERE au.email ILIKE '%joao%' OR up.nome ILIKE '%joao%' OR uc.nome ILIKE '%joao%';

-- 2. Ver o que a view professor_alunos_view retorna para João
SELECT * FROM professor_alunos_view
WHERE nome ILIKE '%joao%' OR email ILIKE '%joao%';

-- 3. Ver dias do cronograma do João (substitua USER_ID_JOAO pelo id encontrado acima)
-- SELECT 
--   dia_numero,
--   concluido,
--   data,
--   titulo_semana
-- FROM cronograma
-- WHERE user_id = 'USER_ID_JOAO'
-- ORDER BY dia_numero
-- LIMIT 20;

-- 4. Ver progresso de tarefas do João
-- SELECT 
--   dia_numero,
--   tarefa,
--   tempo_gasto,
--   concluida
-- FROM progresso_tarefas
-- WHERE user_id = 'USER_ID_JOAO'
-- ORDER BY dia_numero;
