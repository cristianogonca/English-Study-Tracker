-- ====================================================================
-- PERMITIR ALUNOS LEREM users_profile (para ver lista de professores)
-- ====================================================================

-- Adicionar política de leitura para usuários autenticados
CREATE POLICY "Usuarios autenticados podem ver professores"
ON public.users_profile
FOR SELECT
TO authenticated
USING (true);

-- ====================================================================
-- INSTRUÇÕES
-- ====================================================================
-- Execute este SQL no Supabase SQL Editor
-- Isso permite que alunos vejam a lista de professores no Setup
-- ====================================================================
