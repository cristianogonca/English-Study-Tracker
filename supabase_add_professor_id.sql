-- ====================================================================
-- ADICIONAR COLUNA professor_id NA TABELA user_configs
-- ====================================================================

-- 1. Adicionar coluna professor_id (nullable para usuários existentes)
ALTER TABLE public.user_configs
ADD COLUMN IF NOT EXISTS professor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_user_configs_professor ON public.user_configs(professor_id);

-- 3. Comentário na coluna
COMMENT ON COLUMN public.user_configs.professor_id IS 'ID do professor vinculado ao aluno (NULL se estudar de forma independente)';

-- ====================================================================
-- INSTRUÇÕES
-- ====================================================================
-- 1. Execute este SQL no Supabase SQL Editor
-- 2. Isso vai adicionar a coluna professor_id na user_configs
-- 3. Depois disso, o Setup poderá salvar o professor_id diretamente
-- ====================================================================
