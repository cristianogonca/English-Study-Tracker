-- ============================================
-- ADICIONAR ROLES E TABELA GUIA DE ESTUDOS
-- ============================================

-- 1. Criar tabela users_profile (se não existir) para armazenar role e outros dados
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  role TEXT DEFAULT 'aluno' CHECK (role IN ('aluno', 'professor', 'admin')),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS na users_profile
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- Policy para users_profile: usuário vê apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON users_profile
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users_profile
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users_profile
  FOR UPDATE
  USING (auth.uid() = id);

-- Criar índice para role
CREATE INDEX IF NOT EXISTS idx_users_profile_role ON users_profile(role);

-- 2. Criar tabela guia_estudos
CREATE TABLE IF NOT EXISTS guia_estudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mes INT NOT NULL CHECK (mes >= 1 AND mes <= 12),
  titulo TEXT NOT NULL,
  objetivos JSONB DEFAULT '[]'::jsonb,
  gramatica JSONB DEFAULT '[]'::jsonb,
  vocabulario JSONB DEFAULT '[]'::jsonb,
  listening JSONB DEFAULT '[]'::jsonb,
  speaking JSONB DEFAULT '[]'::jsonb,
  reading JSONB DEFAULT '[]'::jsonb,
  writing JSONB DEFAULT '[]'::jsonb,
  check_final JSONB DEFAULT '[]'::jsonb,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mes)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_guia_estudos_user_id ON guia_estudos(user_id);
CREATE INDEX IF NOT EXISTS idx_guia_estudos_mes ON guia_estudos(mes);

-- 3. RLS Policies para guia_estudos

-- Enable RLS
ALTER TABLE guia_estudos ENABLE ROW LEVEL SECURITY;

-- SELECT: Aluno vê apenas seu guia, professor vê todos
CREATE POLICY "Users can view own guia_estudos" ON guia_estudos
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('professor', 'admin'))
  );

-- INSERT: Apenas o próprio usuário ou professor/admin pode criar
CREATE POLICY "Users can insert own guia_estudos" ON guia_estudos
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('professor', 'admin'))
  );

-- UPDATE: Aluno atualiza apenas seu guia, professor atualiza qualquer guia
CREATE POLICY "Users can update own guia_estudos" ON guia_estudos
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('professor', 'admin'))
  );

-- DELETE: Apenas o próprio usuário ou professor/admin pode deletar
CREATE POLICY "Users can delete own guia_estudos" ON guia_estudos
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('professor', 'admin'))
  );

-- 4. Atualizar policies de cronograma para permitir professor editar

-- DROP existing policies
DROP POLICY IF EXISTS "Users can view own cronograma" ON cronograma;
DROP POLICY IF EXISTS "Users can update own cronograma" ON cronograma;

-- SELECT: Aluno vê seu cronograma, professor vê todos
CREATE POLICY "Users can view cronograma" ON cronograma
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('professor', 'admin'))
  );

-- UPDATE: Aluno atualiza seu cronograma, professor atualiza qualquer
CREATE POLICY "Users can update cronograma" ON cronograma
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('professor', 'admin'))
  );

-- 5. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_guia_estudos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guia_estudos_updated_at
  BEFORE UPDATE ON guia_estudos
  FOR EACH ROW
  EXECUTE FUNCTION update_guia_estudos_updated_at();

-- 6. View para professores verem lista de alunos
CREATE OR REPLACE VIEW professor_alunos_view AS
SELECT 
  au.id,
  up.nome,
  au.email,
  uc.data_inicio,
  uc.meta_diaria,
  uc.meta_semanal,
  (SELECT COUNT(*) FROM cronograma c WHERE c.user_id = au.id) as total_dias,
  (SELECT COUNT(*) FROM cronograma c WHERE c.user_id = au.id AND c.concluido = true) as dias_concluidos,
  (SELECT COUNT(*) FROM guia_estudos g WHERE g.user_id = au.id) as meses_guia
FROM auth.users au
LEFT JOIN users_profile up ON au.id = up.id
LEFT JOIN user_configs uc ON au.id = uc.user_id
WHERE up.role = 'aluno' OR up.role IS NULL
ORDER BY up.nome;

-- Grant para authenticated users
GRANT SELECT ON professor_alunos_view TO authenticated;

COMMENT ON TABLE guia_estudos IS 'Guia de estudos mensal editável por professor';
COMMENT ON VIEW professor_alunos_view IS 'View para professores visualizarem lista de alunos';
