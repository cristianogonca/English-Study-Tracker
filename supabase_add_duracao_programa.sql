-- Adicionar coluna duracao_programa na tabela user_configs
ALTER TABLE user_configs 
ADD COLUMN IF NOT EXISTS duracao_programa INTEGER DEFAULT 365;

-- Comentário explicativo
COMMENT ON COLUMN user_configs.duracao_programa IS 'Duração total do programa em dias (ex: 90, 180, 365)';
