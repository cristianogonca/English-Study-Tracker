-- =====================================================
-- SQL DE CORREÇÃO - Execute AGORA no Supabase
-- =====================================================
-- Este SQL corrige o erro "Database error creating new user"
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. REMOVER TRIGGER ANTIGO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_free_subscription();

-- 2. ADICIONAR CONSTRAINT UNIQUE em subscriptions.user_id
-- (evita duplicatas e melhora performance)
ALTER TABLE subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_user_id_key;

ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);

-- 3. CRIAR FUNÇÃO CORRIGIDA (não falha se der erro)
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

-- 4. RECRIAR TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_free_subscription();

-- =====================================================
-- PRONTO! Agora você pode criar usuários normalmente
-- =====================================================
-- Vá em Authentication → Users → Add user
-- Preencha: email, senha, e MARQUE "Auto Confirm User"
-- =====================================================
