-- ============================================
-- FIX: Verificar e corrigir dados do João
-- ============================================

-- 1. Ver detalhes do progresso_tarefas do João
SELECT 
  id,
  tarefa_id,
  dia_numero,
  status,
  tempo_gasto,
  data_conclusao,
  notas
FROM progresso_tarefas
WHERE user_id = 'bd7389ed-5102-4375-9705-72a59760754b'
ORDER BY dia_numero;

-- 2. Ver dias do cronograma do João (primeiros 10 dias)
SELECT 
  id,
  dia_numero,
  concluido,
  data,
  tempo_total
FROM cronograma
WHERE user_id = 'bd7389ed-5102-4375-9705-72a59760754b'
ORDER BY dia_numero
LIMIT 10;

-- 3. CORRIGIR: Marcar dia 1 como concluído manualmente (para testar)
UPDATE cronograma
SET concluido = true
WHERE user_id = 'bd7389ed-5102-4375-9705-72a59760754b'
  AND dia_numero = 1;

-- 4. Verificar se funcionou
SELECT 
  nome,
  email,
  total_dias,
  dias_concluidos,
  minutos_estudados
FROM professor_alunos_view
WHERE email = 'joao@gm.com';

-- 5. Ver resultado completo
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN concluido = true THEN 1 ELSE 0 END) as concluidos
FROM cronograma
WHERE user_id = 'bd7389ed-5102-4375-9705-72a59760754b';
