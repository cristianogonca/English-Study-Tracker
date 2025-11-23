-- ============================================
-- FIX: professor_alunos_view para mostrar nome dos alunos
-- Problema: Nome estava vindo de users_profile, mas alunos não têm registro lá
-- Solução: Buscar nome de user_configs.nome (onde alunos salvam no setup)
-- ============================================

-- Dropar view antiga e recriar (necessário quando mudamos colunas)
DROP VIEW IF EXISTS professor_alunos_view;

CREATE VIEW professor_alunos_view AS
SELECT 
  au.id,
  COALESCE(uc.nome, up.nome, 'Sem nome') as nome,  -- Prioriza user_configs.nome
  au.email,
  uc.data_inicio,
  uc.meta_diaria,
  uc.meta_semanal,
  COALESCE(uc.meta_semanal, 7) as horas_semanais,  -- Adiciona horas_semanais
  (SELECT COUNT(*) FROM cronograma c WHERE c.user_id = au.id) as total_dias,
  (SELECT COUNT(*) FROM cronograma c WHERE c.user_id = au.id AND c.concluido = true) as dias_concluidos,
  (SELECT COUNT(*) FROM guia_estudos g WHERE g.user_id = au.id) as meses_guia
FROM auth.users au
LEFT JOIN users_profile up ON au.id = up.id
LEFT JOIN user_configs uc ON au.id = uc.user_id
WHERE up.role = 'aluno' OR up.role IS NULL
ORDER BY COALESCE(uc.nome, up.nome, au.email);

-- Comentário
COMMENT ON VIEW professor_alunos_view IS 'View para professores visualizarem lista de alunos com dados de user_configs';

-- Verificar resultado
SELECT * FROM professor_alunos_view;
