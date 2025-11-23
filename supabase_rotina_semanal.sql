-- ============================================
-- TABELA: rotina_semanal (Rotina Padrão Editável)
-- ============================================

CREATE TABLE IF NOT EXISTS rotina_semanal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT DEFAULT '📝',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, dia_semana)
);

CREATE INDEX idx_rotina_semanal_user_id ON rotina_semanal(user_id);

-- ============================================
-- RLS POLICIES: rotina_semanal
-- ============================================

ALTER TABLE rotina_semanal ENABLE ROW LEVEL SECURITY;

-- SELECT: Aluno vê sua rotina, professor vê todas
CREATE POLICY "Users can view rotina_semanal" ON rotina_semanal
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('professor', 'admin'))
  );

-- INSERT: Apenas o próprio usuário pode inserir
CREATE POLICY "Users can insert rotina_semanal" ON rotina_semanal
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Aluno atualiza sua rotina, professor atualiza qualquer
CREATE POLICY "Users can update rotina_semanal" ON rotina_semanal
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM users_profile WHERE id = auth.uid() AND role IN ('professor', 'admin'))
  );

-- DELETE: Apenas o próprio usuário
CREATE POLICY "Users can delete rotina_semanal" ON rotina_semanal
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- INSERIR ROTINA PADRÃO (7 dias)
-- ============================================
-- Esta rotina será inserida automaticamente no setup do aluno
-- Professor pode editar depois conforme necessidade de cada aluno
