-- ============================================
-- SISTEMA DE PROVAS/TESTES
-- Tabelas para professor criar provas e alunos responderem
-- ============================================

-- Tabela de Provas (criadas pelo professor)
CREATE TABLE IF NOT EXISTS provas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_disponivel TIMESTAMP WITH TIME ZONE, -- Quando fica disponível para alunos
  data_limite TIMESTAMP WITH TIME ZONE, -- Prazo para fazer
  duracao_minutos INTEGER, -- Tempo limite para fazer a prova
  ativa BOOLEAN DEFAULT true,
  peso DECIMAL(5,2) DEFAULT 1.0, -- Peso da prova (para cálculo de média)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Atribuição de Provas (quais alunos podem fazer cada prova)
CREATE TABLE IF NOT EXISTS prova_alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prova_id UUID NOT NULL REFERENCES provas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prova_id, aluno_id) -- Cada aluno pode ser atribuído apenas 1x por prova
);

-- Tabela de Questões da Prova
CREATE TABLE IF NOT EXISTS prova_questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prova_id UUID NOT NULL REFERENCES provas(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL, -- Ordem da questão (1, 2, 3...)
  tipo TEXT NOT NULL CHECK (tipo IN ('multipla_escolha', 'dissertativa', 'verdadeiro_falso', 'preencher_lacuna')),
  enunciado TEXT NOT NULL,
  opcoes JSONB, -- Para múltipla escolha: ["A) ...", "B) ...", "C) ...", "D) ..."]
  resposta_correta TEXT, -- Para questões objetivas
  pontos DECIMAL(5,2) DEFAULT 1.0, -- Pontuação da questão
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Respostas dos Alunos
CREATE TABLE IF NOT EXISTS prova_respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prova_id UUID NOT NULL REFERENCES provas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questao_id UUID NOT NULL REFERENCES prova_questoes(id) ON DELETE CASCADE,
  resposta TEXT NOT NULL, -- Resposta do aluno
  correta BOOLEAN, -- NULL = não avaliada, true = correta, false = incorreta
  pontos_obtidos DECIMAL(5,2), -- Pontos que o aluno ganhou nesta questão
  comentario_professor TEXT, -- Feedback do professor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prova_id, aluno_id, questao_id) -- Aluno pode responder cada questão apenas 1x
);

-- Tabela de Submissões (controle de quando aluno iniciou/finalizou)
CREATE TABLE IF NOT EXISTS prova_submissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prova_id UUID NOT NULL REFERENCES provas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_submissao TIMESTAMP WITH TIME ZONE, -- NULL = ainda não finalizou
  nota_total DECIMAL(5,2), -- Nota final calculada
  pontos_totais DECIMAL(10,2), -- Pontos obtidos
  pontos_possiveis DECIMAL(10,2), -- Pontos possíveis
  avaliada BOOLEAN DEFAULT false, -- Professor já avaliou?
  comentario_geral TEXT, -- Comentário geral do professor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prova_id, aluno_id) -- Aluno pode fazer cada prova apenas 1x
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_provas_professor ON provas(professor_id);
CREATE INDEX IF NOT EXISTS idx_provas_ativa ON provas(ativa);
CREATE INDEX IF NOT EXISTS idx_prova_alunos_prova ON prova_alunos(prova_id);
CREATE INDEX IF NOT EXISTS idx_prova_alunos_aluno ON prova_alunos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_prova_questoes_prova ON prova_questoes(prova_id);
CREATE INDEX IF NOT EXISTS idx_prova_respostas_prova_aluno ON prova_respostas(prova_id, aluno_id);
CREATE INDEX IF NOT EXISTS idx_prova_submissoes_prova ON prova_submissoes(prova_id);
CREATE INDEX IF NOT EXISTS idx_prova_submissoes_aluno ON prova_submissoes(aluno_id);

-- View para Professor ver todas as submissões com detalhes
CREATE OR REPLACE VIEW professor_provas_submissoes AS
SELECT 
  ps.id as submissao_id,
  p.id as prova_id,
  p.titulo as prova_titulo,
  p.data_limite,
  au.id as aluno_id,
  COALESCE(uc.nome, up.nome, au.email) as aluno_nome,
  au.email as aluno_email,
  ps.data_inicio,
  ps.data_submissao,
  ps.nota_total,
  ps.pontos_totais,
  ps.pontos_possiveis,
  ps.avaliada,
  ps.comentario_geral,
  -- Status: não_iniciada, em_andamento, submetida, avaliada
  CASE 
    WHEN ps.data_submissao IS NOT NULL AND ps.avaliada = true THEN 'avaliada'
    WHEN ps.data_submissao IS NOT NULL THEN 'submetida'
    WHEN ps.data_inicio IS NOT NULL THEN 'em_andamento'
    ELSE 'nao_iniciada'
  END as status
FROM prova_submissoes ps
INNER JOIN provas p ON ps.prova_id = p.id
INNER JOIN auth.users au ON ps.aluno_id = au.id
LEFT JOIN users_profile up ON au.id = up.id
LEFT JOIN user_configs uc ON au.id = uc.user_id;

-- View para Aluno ver suas provas disponíveis (apenas as atribuídas a ele)
DROP VIEW IF EXISTS aluno_provas_disponiveis;
CREATE VIEW aluno_provas_disponiveis AS
SELECT 
  p.id as prova_id,
  p.titulo,
  p.descricao,
  p.data_disponivel,
  p.data_limite,
  p.duracao_minutos,
  p.peso,
  ps.id as submissao_id,
  ps.data_inicio,
  ps.data_submissao,
  ps.nota_total,
  ps.avaliada,
  pa.aluno_id,
  -- Status
  CASE 
    WHEN ps.data_submissao IS NOT NULL AND ps.avaliada = true THEN 'avaliada'
    WHEN ps.data_submissao IS NOT NULL THEN 'aguardando_avaliacao'
    WHEN ps.data_inicio IS NOT NULL THEN 'em_andamento'
    WHEN p.data_limite IS NOT NULL AND NOW() > p.data_limite THEN 'expirada'
    WHEN p.data_disponivel IS NOT NULL AND NOW() < p.data_disponivel THEN 'nao_disponivel'
    ELSE 'disponivel'
  END as status,
  -- Contagem de questões
  (SELECT COUNT(*) FROM prova_questoes pq WHERE pq.prova_id = p.id) as total_questoes
FROM provas p
INNER JOIN prova_alunos pa ON p.id = pa.prova_id
LEFT JOIN prova_submissoes ps ON p.id = ps.prova_id AND pa.aluno_id = ps.aluno_id
WHERE p.ativa = true;

-- Políticas RLS (Row Level Security)
ALTER TABLE provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE prova_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE prova_questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prova_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE prova_submissoes ENABLE ROW LEVEL SECURITY;

-- Professor pode criar/editar/deletar suas próprias provas
DROP POLICY IF EXISTS "Professor pode gerenciar suas provas" ON provas;
CREATE POLICY "Professor pode gerenciar suas provas"
  ON provas FOR ALL
  USING (
    professor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE id = auth.uid() 
      AND role IN ('professor', 'admin')
    )
  );

-- Professor pode gerenciar atribuições de alunos de suas provas
DROP POLICY IF EXISTS "Professor pode gerenciar atribuições de suas provas" ON prova_alunos;
CREATE POLICY "Professor pode gerenciar atribuições de suas provas"
  ON prova_alunos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM provas p
      WHERE p.id = prova_alunos.prova_id
      AND p.professor_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM users_profile 
        WHERE id = auth.uid() 
        AND role IN ('professor', 'admin')
      )
    )
  );

-- Professor pode gerenciar questões de suas provas
DROP POLICY IF EXISTS "Professor pode gerenciar questões de suas provas" ON prova_questoes;
CREATE POLICY "Professor pode gerenciar questões de suas provas"
  ON prova_questoes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM provas p
      WHERE p.id = prova_questoes.prova_id
      AND p.professor_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM users_profile 
        WHERE id = auth.uid() 
        AND role IN ('professor', 'admin')
      )
    )
  );

-- Aluno pode ver provas ativas atribuídas a ele
DROP POLICY IF EXISTS "Aluno pode ver provas atribuídas a ele" ON provas;
DROP POLICY IF EXISTS "Aluno pode ver provas ativas" ON provas;
CREATE POLICY "Aluno pode ver provas atribuídas a ele"
  ON provas FOR SELECT
  USING (
    ativa = true AND
    EXISTS (
      SELECT 1 FROM prova_alunos pa
      WHERE pa.prova_id = provas.id
      AND pa.aluno_id = auth.uid()
    )
  );

-- Aluno pode ver suas atribuições de provas
DROP POLICY IF EXISTS "Aluno pode ver suas atribuições" ON prova_alunos;
CREATE POLICY "Aluno pode ver suas atribuições"
  ON prova_alunos FOR SELECT
  USING (aluno_id = auth.uid());

-- Aluno pode ver questões de provas atribuídas a ele
DROP POLICY IF EXISTS "Aluno pode ver questões de provas atribuídas" ON prova_questoes;
DROP POLICY IF EXISTS "Aluno pode ver questões de provas ativas" ON prova_questoes;
CREATE POLICY "Aluno pode ver questões de provas atribuídas"
  ON prova_questoes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provas p
      INNER JOIN prova_alunos pa ON p.id = pa.prova_id
      WHERE p.id = prova_questoes.prova_id
      AND p.ativa = true
      AND pa.aluno_id = auth.uid()
    )
  );

-- Aluno pode criar/editar suas próprias respostas (antes de submeter)
DROP POLICY IF EXISTS "Aluno pode gerenciar suas respostas" ON prova_respostas;
CREATE POLICY "Aluno pode gerenciar suas respostas"
  ON prova_respostas FOR ALL
  USING (aluno_id = auth.uid());

-- Aluno pode criar/ver suas próprias submissões
DROP POLICY IF EXISTS "Aluno pode gerenciar suas submissões" ON prova_submissoes;
CREATE POLICY "Aluno pode gerenciar suas submissões"
  ON prova_submissoes FOR ALL
  USING (aluno_id = auth.uid());

-- Professor pode ver todas as respostas de suas provas
DROP POLICY IF EXISTS "Professor pode ver respostas de suas provas" ON prova_respostas;
CREATE POLICY "Professor pode ver respostas de suas provas"
  ON prova_respostas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provas p
      WHERE p.id = prova_respostas.prova_id
      AND p.professor_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM users_profile 
        WHERE id = auth.uid() 
        AND role IN ('professor', 'admin')
      )
    )
  );

-- Professor pode ver todas as submissões de suas provas
DROP POLICY IF EXISTS "Professor pode ver submissões de suas provas" ON prova_submissoes;
CREATE POLICY "Professor pode ver submissões de suas provas"
  ON prova_submissoes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provas p
      WHERE p.id = prova_submissoes.prova_id
      AND p.professor_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM users_profile 
        WHERE id = auth.uid() 
        AND role IN ('professor', 'admin')
      )
    )
  );

-- Comentário
COMMENT ON TABLE provas IS 'Provas/testes criadas pelo professor';
COMMENT ON TABLE prova_alunos IS 'Atribuição de provas para alunos específicos';
COMMENT ON TABLE prova_questoes IS 'Questões de cada prova (dissertativa ou múltipla escolha)';
COMMENT ON TABLE prova_respostas IS 'Respostas dos alunos para cada questão';
COMMENT ON TABLE prova_submissoes IS 'Controle de submissões (início/fim) das provas';

-- Verificação
SELECT 'Tabelas de Provas criadas com sucesso!' as status;
