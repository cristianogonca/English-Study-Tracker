-- ============================================
-- DEBUG COMPLETO: Verificar dados do João
-- ============================================

-- 1. Ver user_id do João
SELECT 
  id, 
  email,
  'Usuario encontrado' as status
FROM auth.users 
WHERE email LIKE '%joao%';

-- 2. Ver dados na tabela cronograma
SELECT 
  user_id,
  COUNT(*) as total_dias,
  SUM(CASE WHEN concluido = true THEN 1 ELSE 0 END) as dias_concluidos
FROM cronograma 
GROUP BY user_id
HAVING user_id IN (SELECT id FROM auth.users WHERE email LIKE '%joao%');

-- 3. Ver dados na tabela progresso_tarefas
SELECT 
  user_id,
  SUM(tempo_gasto) as minutos_totais,
  COUNT(*) as total_registros
FROM progresso_tarefas
GROUP BY user_id
HAVING user_id IN (SELECT id FROM auth.users WHERE email LIKE '%joao%');

-- 4. Ver o que a view professor_alunos_view retorna
SELECT 
  nome,
  email,
  total_dias,
  dias_concluidos,
  minutos_estudados
FROM professor_alunos_view
WHERE email LIKE '%joao%';

-- 5. Query manual para comparar (todos os alunos)
SELECT 
  au.id,
  au.email,
  COALESCE(uc.nome, up.nome, au.email) as nome,
  (SELECT COUNT(*) FROM cronograma c WHERE c.user_id = au.id) as manual_total_dias,
  (SELECT COUNT(*) FROM cronograma c WHERE c.user_id = au.id AND c.concluido = true) as manual_dias_concluidos,
  (SELECT SUM(pt.tempo_gasto) FROM progresso_tarefas pt WHERE pt.user_id = au.id) as manual_minutos
FROM auth.users au
LEFT JOIN users_profile up ON au.id = up.id
LEFT JOIN user_configs uc ON au.id = uc.user_id
WHERE uc.user_id IS NOT NULL
ORDER BY au.email;
