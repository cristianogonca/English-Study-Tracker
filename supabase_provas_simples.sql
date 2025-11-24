-- ============================================
-- SISTEMA DE PROVAS SIMPLIFICADO
-- Uma única tabela: professor cria → aluno responde → professor corrige
-- ============================================

-- Dropar sistema antigo
DROP VIEW IF EXISTS aluno_provas_disponiveis CASCADE;
DROP VIEW IF EXISTS professor_provas_submissoes CASCADE;
DROP TABLE IF EXISTS prova_submissoes CASCADE;
DROP TABLE IF EXISTS prova_respostas CASCADE;
DROP TABLE IF EXISTS prova_questoes CASCADE;
DROP TABLE IF EXISTS prova_alunos CASCADE;
DROP TABLE IF EXISTS provas CASCADE;

-- Tabela única de provas
CREATE TABLE provas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados da prova
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_limite TIMESTAMP WITH TIME ZONE,
  
  -- Questões (array de objetos JSON)
  questoes JSONB DEFAULT '[]'::jsonb,
  -- Estrutura: [{ numero: 1, tipo: 'multipla_escolha', enunciado: '...', opcoes: [...], resposta_correta: '...', pontos: 10 }]
  
  -- Respostas do aluno (array de objetos JSON)
  respostas JSONB DEFAULT '[]'::jsonb,
  -- Estrutura: [{ numero: 1, resposta: '...', correta: true/false, pontos_obtidos: 10, comentario: '...' }]
  
  -- Status e avaliação
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'respondida', 'corrigida')),
  data_resposta TIMESTAMP WITH TIME ZONE,
  data_correcao TIMESTAMP WITH TIME ZONE,
  nota_final DECIMAL(5,2),
  comentario_geral TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_provas_professor ON provas(professor_id);
CREATE INDEX idx_provas_aluno ON provas(aluno_id);
CREATE INDEX idx_provas_status ON provas(status);
CREATE UNIQUE INDEX idx_provas_professor_aluno_titulo ON provas(professor_id, aluno_id, titulo);

-- RLS
ALTER TABLE provas ENABLE ROW LEVEL SECURITY;

-- Professor vê e edita suas provas
CREATE POLICY "professor_provas"
  ON provas
  FOR ALL
  TO authenticated
  USING (professor_id = auth.uid())
  WITH CHECK (professor_id = auth.uid());

-- Aluno vê e responde suas provas
CREATE POLICY "aluno_provas"
  ON provas
  FOR ALL
  TO authenticated
  USING (aluno_id = auth.uid())
  WITH CHECK (aluno_id = auth.uid());

-- View para professor ver lista de provas dos alunos
CREATE VIEW professor_provas_lista AS
SELECT 
  p.id,
  p.titulo,
  p.descricao,
  p.data_criacao,
  p.data_limite,
  p.status,
  p.nota_final,
  p.aluno_id,
  COALESCE(uc.nome, up.nome, au.email) as aluno_nome,
  au.email as aluno_email,
  jsonb_array_length(p.questoes) as total_questoes,
  CASE 
    WHEN p.status = 'corrigida' THEN '✅ Graded'
    WHEN p.status = 'respondida' THEN '📝 Answered'
    ELSE '⏳ Pending'
  END as status_texto
FROM provas p
INNER JOIN auth.users au ON p.aluno_id = au.id
LEFT JOIN users_profile up ON au.id = up.id
LEFT JOIN user_configs uc ON au.id = uc.user_id
WHERE p.professor_id = auth.uid();

-- View para aluno ver suas provas
CREATE VIEW aluno_provas_lista AS
SELECT 
  p.id,
  p.titulo,
  p.descricao,
  p.data_criacao,
  p.data_limite,
  p.status,
  p.nota_final,
  p.comentario_geral,
  jsonb_array_length(p.questoes) as total_questoes,
  CASE 
    WHEN p.status = 'corrigida' THEN '✅ Graded - Score: ' || COALESCE(p.nota_final::text, 'N/A')
    WHEN p.status = 'respondida' THEN '⏳ Waiting for correction'
    ELSE '📝 Answer the test'
  END as status_texto
FROM provas p
WHERE p.aluno_id = auth.uid();

COMMENT ON TABLE provas IS 'Sistema simplificado: 1 prova por aluno com questões e respostas em JSON';
