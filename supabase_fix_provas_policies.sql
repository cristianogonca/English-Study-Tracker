-- ============================================
-- FIX: Corrigir recursão infinita nas políticas de provas
-- ============================================

-- Remover todas as políticas antigas que causam recursão
DROP POLICY IF EXISTS "Professor pode gerenciar suas provas" ON provas;
DROP POLICY IF EXISTS "Aluno pode ver provas atribuídas a ele" ON provas;
DROP POLICY IF EXISTS "Aluno pode ver provas ativas" ON provas;

-- Nova política simples para professor ver/criar/editar suas provas
CREATE POLICY "Professor acesso total suas provas"
  ON provas
  USING (professor_id = auth.uid())
  WITH CHECK (professor_id = auth.uid());

-- Nova política simples para aluno ver provas atribuídas
CREATE POLICY "Aluno ver provas atribuidas"
  ON provas FOR SELECT
  USING (
    ativa = true 
    AND EXISTS (
      SELECT 1 FROM prova_alunos 
      WHERE prova_alunos.prova_id = provas.id 
      AND prova_alunos.aluno_id = auth.uid()
    )
  );

-- Comentário
COMMENT ON TABLE provas IS 'Tabela de provas com políticas RLS corrigidas (sem recursão infinita)';
