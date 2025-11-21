-- =====================================================
-- SUPABASE DATABASE SETUP
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: subscriptions (Assinaturas)
-- =====================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- =====================================================
-- TABELA: user_configs (Configurações do Usuário)
-- =====================================================
CREATE TABLE user_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome TEXT NOT NULL,
  meta_diaria INTEGER DEFAULT 60,
  meta_semanal INTEGER DEFAULT 420,
  dias_estudo TEXT[] DEFAULT ARRAY['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'],
  data_inicio DATE NOT NULL,
  nivel_inicial TEXT DEFAULT 'basico' CHECK (nivel_inicial IN ('basico', 'intermediario', 'avancado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_configs_user_id ON user_configs(user_id);

-- =====================================================
-- TABELA: cronograma (Dias de Estudo)
-- =====================================================
CREATE TABLE cronograma (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dia_numero INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  semana INTEGER NOT NULL,
  fase INTEGER NOT NULL,
  data DATE NOT NULL,
  concluido BOOLEAN DEFAULT FALSE,
  tempo_total INTEGER DEFAULT 0,
  tarefas JSONB DEFAULT '[]'::jsonb,
  titulo_semana TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, dia_numero)
);

CREATE INDEX idx_cronograma_user_id ON cronograma(user_id);
CREATE INDEX idx_cronograma_mes ON cronograma(user_id, mes);
CREATE INDEX idx_cronograma_data ON cronograma(user_id, data);

-- =====================================================
-- TABELA: vocabulario (Palavras Aprendidas)
-- =====================================================
CREATE TABLE vocabulario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  palavra TEXT NOT NULL,
  traducao TEXT NOT NULL,
  exemplo TEXT,
  nivel TEXT DEFAULT 'basico' CHECK (nivel IN ('basico', 'intermediario', 'avancado')),
  data_aprendida TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revisada BOOLEAN DEFAULT FALSE,
  acertos INTEGER DEFAULT 0,
  erros INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vocabulario_user_id ON vocabulario(user_id);
CREATE INDEX idx_vocabulario_revisada ON vocabulario(user_id, revisada);

-- =====================================================
-- TABELA: checks_semanais (Avaliações Semanais)
-- =====================================================
CREATE TABLE checks_semanais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  semana INTEGER NOT NULL,
  data DATE NOT NULL,
  checkpoints JSONB DEFAULT '[]'::jsonb,
  nota_final INTEGER,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, semana)
);

CREATE INDEX idx_checks_user_id ON checks_semanais(user_id);
CREATE INDEX idx_checks_semana ON checks_semanais(user_id, semana);

-- =====================================================
-- TABELA: progresso_tarefas (Progresso das Tarefas)
-- =====================================================
CREATE TABLE progresso_tarefas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tarefa_id TEXT NOT NULL,
  dia_numero INTEGER NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
  tempo_gasto INTEGER DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tarefa_id)
);

CREATE INDEX idx_progresso_user_id ON progresso_tarefas(user_id);
CREATE INDEX idx_progresso_dia ON progresso_tarefas(user_id, dia_numero);

-- =====================================================
-- TABELA: fases (Fases do Currículo)
-- =====================================================
CREATE TABLE fases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  nivel TEXT,
  mes_inicio INTEGER NOT NULL,
  mes_fim INTEGER NOT NULL,
  horas_total INTEGER DEFAULT 0,
  concluida BOOLEAN DEFAULT FALSE,
  progresso INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, numero)
);

CREATE INDEX idx_fases_user_id ON fases(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronograma ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulario ENABLE ROW LEVEL SECURITY;
ALTER TABLE checks_semanais ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fases ENABLE ROW LEVEL SECURITY;

-- Políticas para subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_configs
CREATE POLICY "Users can view own config" ON user_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config" ON user_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config" ON user_configs
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para cronograma
CREATE POLICY "Users can view own cronograma" ON cronograma
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cronograma" ON cronograma
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cronograma" ON cronograma
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cronograma" ON cronograma
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para vocabulario
CREATE POLICY "Users can view own vocabulario" ON vocabulario
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulario" ON vocabulario
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulario" ON vocabulario
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vocabulario" ON vocabulario
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para checks_semanais
CREATE POLICY "Users can view own checks" ON checks_semanais
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checks" ON checks_semanais
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checks" ON checks_semanais
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para progresso_tarefas
CREATE POLICY "Users can view own progresso" ON progresso_tarefas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progresso" ON progresso_tarefas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progresso" ON progresso_tarefas
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para fases
CREATE POLICY "Users can view own fases" ON fases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fases" ON fases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fases" ON fases
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS PARA AUTO-UPDATE updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_configs_updated_at BEFORE UPDATE ON user_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cronograma_updated_at BEFORE UPDATE ON cronograma
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulario_updated_at BEFORE UPDATE ON vocabulario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checks_updated_at BEFORE UPDATE ON checks_semanais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progresso_updated_at BEFORE UPDATE ON progresso_tarefas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fases_updated_at BEFORE UPDATE ON fases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÃO: Criar assinatura FREE automaticamente
-- =====================================================

CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, expires_at)
  VALUES (NEW.id, 'free', 'active', NOW() + INTERVAL '30 days')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Se der erro, ignora e permite criar o usuário mesmo assim
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_free_subscription();

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Estatísticas do usuário
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  u.id as user_id,
  u.email,
  s.plan,
  s.status as subscription_status,
  COUNT(DISTINCT c.id) as total_dias,
  COUNT(DISTINCT CASE WHEN c.concluido THEN c.id END) as dias_concluidos,
  COUNT(DISTINCT v.id) as total_palavras,
  COUNT(DISTINCT CASE WHEN v.revisada THEN v.id END) as palavras_revisadas,
  COUNT(DISTINCT cs.id) as checks_completos
FROM auth.users u
LEFT JOIN subscriptions s ON s.user_id = u.id
LEFT JOIN cronograma c ON c.user_id = u.id
LEFT JOIN vocabulario v ON v.user_id = u.id
LEFT JOIN checks_semanais cs ON cs.user_id = u.id
GROUP BY u.id, u.email, s.plan, s.status;

-- =====================================================
-- SETUP COMPLETO!
-- =====================================================
-- Execute este SQL no Supabase SQL Editor (Query)
-- Depois configure as variáveis de ambiente no projeto
-- =====================================================
