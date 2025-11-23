-- ============================================
-- UPDATE: Adicionar minutos_estudados na professor_alunos_view
-- Calcula total de minutos que o aluno estudou (de progresso_tarefas)
-- ============================================

DROP VIEW IF EXISTS professor_alunos_view;

CREATE VIEW professor_alunos_view AS
SELECT 
  au.id,
  COALESCE(uc.nome, up.nome, au.email) as nome,
  au.email,
  uc.data_inicio,
  uc.meta_diaria,
  uc.meta_semanal,
  COALESCE(uc.meta_semanal, 7) as horas_semanais,
  (SELECT COUNT(*) FROM cronograma c WHERE c.user_id = au.id) as total_dias,
  (SELECT COUNT(*) FROM cronograma c WHERE c.user_id = au.id AND c.concluido = true) as dias_concluidos,
  (SELECT COUNT(*) FROM guia_estudos g WHERE g.user_id = au.id) as meses_guia,
  COALESCE((SELECT SUM(pt.tempo_gasto) FROM progresso_tarefas pt WHERE pt.user_id = au.id), 0) as minutos_estudados,
  -- Progresso baseado em tempo: (minutos estudados / minutos esperados) * 100
  CASE 
    WHEN uc.meta_diaria IS NOT NULL AND uc.meta_diaria > 0 AND 
         (SELECT COUNT(*) FROM cronograma c WHERE c.user_id = au.id AND c.concluido = true) > 0 THEN
      ROUND(
        (COALESCE((SELECT SUM(pt.tempo_gasto) FROM progresso_tarefas pt WHERE pt.user_id = au.id), 0)::numeric / 
        (uc.meta_diaria * (SELECT COUNT(*) FROM cronograma c WHERE c.user_id = au.id AND c.concluido = true))::numeric) * 100,
        1
      )
    ELSE 0
  END as progresso_percentual
FROM auth.users au
LEFT JOIN users_profile up ON au.id = up.id
INNER JOIN user_configs uc ON au.id = uc.user_id
WHERE (up.role = 'aluno' OR up.role IS NULL)
ORDER BY COALESCE(uc.nome, up.nome, au.email);

-- Comentário
COMMENT ON VIEW professor_alunos_view IS 'View para professores visualizarem lista de alunos com stats completas incluindo minutos estudados';

-- Verificar resultado com mais detalhes
SELECT 
  nome, 
  email,
  total_dias,
  dias_concluidos,
  minutos_estudados,
  ROUND(minutos_estudados / 60.0, 1) as horas_estudadas,
  CASE 
    WHEN total_dias > 0 THEN ROUND((dias_concluidos::numeric / total_dias::numeric) * 100, 0)
    ELSE 0
  END as progresso_percentual
FROM professor_alunos_view
ORDER BY nome;

-- Debug: Ver dados brutos do cronograma
SELECT 
  user_id,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE concluido = true) as concluidos
FROM cronograma
GROUP BY user_id;
