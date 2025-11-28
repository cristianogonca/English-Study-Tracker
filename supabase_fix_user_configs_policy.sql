-- ====================================================================
-- PERMITIR PROFESSORES LEREM user_configs DOS ALUNOS
-- ====================================================================

-- Adicionar política para professores verem dados dos alunos
CREATE POLICY "Professores podem ver dados dos alunos"
ON public.user_configs
FOR SELECT
TO authenticated
USING (
  -- Permite se for o próprio usuário OU se for um professor
  user_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.users_profile
    WHERE id = auth.uid() AND role = 'professor'
  )
);

-- ====================================================================
-- INSTRUÇÕES
-- ====================================================================
-- Execute este SQL no Supabase SQL Editor
-- Isso permite que professores vejam os dados dos alunos no sistema de arquivos
-- ====================================================================
