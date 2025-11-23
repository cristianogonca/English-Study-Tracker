-- ============================================
-- DEBUG: Verificar dias concluídos do aluno Anderson
-- ============================================

-- 1. Ver todos os dias do Anderson
SELECT 
  dia_numero,
  mes,
  semana,
  concluido,
  data,
  titulo_semana
FROM cronograma
WHERE user_id = 'eb39598b-0aa8-4a21-8d59-59a73e5d46f0'
ORDER BY dia_numero
LIMIT 20;

-- 2. Contar dias concluídos
SELECT 
  COUNT(*) as total_dias,
  COUNT(*) FILTER (WHERE concluido = true) as dias_concluidos,
  COUNT(*) FILTER (WHERE concluido = false) as dias_pendentes
FROM cronograma
WHERE user_id = 'eb39598b-0aa8-4a21-8d59-59a73e5d46f0';

-- 3. Ver progresso de tarefas (tempo estudado)
SELECT 
  dia_numero,
  tarefa,
  tempo_gasto,
  concluida,
  data_conclusao
FROM progresso_tarefas
WHERE user_id = 'eb39598b-0aa8-4a21-8d59-59a73e5d46f0'
ORDER BY dia_numero
LIMIT 20;

-- 4. Verificar se há algum dia marcado como concluído
SELECT 
  dia_numero,
  mes,
  data,
  concluido
FROM cronograma
WHERE user_id = 'eb39598b-0aa8-4a21-8d59-59a73e5d46f0'
  AND concluido = true;
