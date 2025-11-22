-- ============================================
-- CORRIGIR POLICIES DO CRONOGRAMA PARA PROFESSOR
-- ============================================

-- 1. Deletar todas as policies do cronograma
DROP POLICY IF EXISTS "Users can view own cronograma" ON cronograma;
DROP POLICY IF EXISTS "Users can update own cronograma" ON cronograma;
DROP POLICY IF EXISTS "Users can view cronograma" ON cronograma;
DROP POLICY IF EXISTS "Users can update cronograma" ON cronograma;
DROP POLICY IF EXISTS "Users can insert own cronograma" ON cronograma;
DROP POLICY IF EXISTS "Users can delete own cronograma" ON cronograma;
DROP POLICY IF EXISTS "Users can delete their own cronograma" ON cronograma;
DROP POLICY IF EXISTS "Users can insert their own cronograma" ON cronograma;

-- 2. Criar policies corretas

-- SELECT: Aluno vê seu cronograma, professor vê todos
CREATE POLICY "Users can view cronograma" ON cronograma
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('professor', 'admin'))
  );

-- INSERT: Apenas o próprio usuário
CREATE POLICY "Users can insert cronograma" ON cronograma
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Aluno atualiza seu cronograma, professor atualiza qualquer
CREATE POLICY "Users can update cronograma" ON cronograma
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('professor', 'admin'))
  );

-- DELETE: Apenas o próprio usuário
CREATE POLICY "Users can delete cronograma" ON cronograma
  FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Verificar resultado
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'cronograma';

