-- ====================================================================
-- SISTEMA DE ARQUIVOS COMPARTILHADOS (BIDIRECIONAL)
-- ====================================================================

-- 0. Dropar tabela se existir (para recriar com estrutura correta)
DROP TABLE IF EXISTS public.arquivos_compartilhados CASCADE;

-- 1. Criar tabela de arquivos compartilhados
CREATE TABLE public.arquivos_compartilhados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    remetente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    destinatario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_arquivo TEXT NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    tipo_arquivo TEXT NOT NULL,
    caminho_storage TEXT NOT NULL,
    data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observacao TEXT
);

-- 2. Criar índices para performance
CREATE INDEX idx_arquivos_remetente ON public.arquivos_compartilhados(remetente_id);
CREATE INDEX idx_arquivos_destinatario ON public.arquivos_compartilhados(destinatario_id);

-- 3. Habilitar RLS
ALTER TABLE public.arquivos_compartilhados ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de segurança

-- Qualquer usuário autenticado pode inserir arquivos
CREATE POLICY "Usuario pode fazer upload de arquivos"
ON public.arquivos_compartilhados
FOR INSERT
TO authenticated
WITH CHECK (remetente_id = auth.uid());

-- Usuario pode ver arquivos que enviou
CREATE POLICY "Usuario pode ver seus arquivos enviados"
ON public.arquivos_compartilhados
FOR SELECT
TO authenticated
USING (remetente_id = auth.uid());

-- Usuario pode deletar arquivos que enviou
CREATE POLICY "Usuario pode deletar seus arquivos"
ON public.arquivos_compartilhados
FOR DELETE
TO authenticated
USING (remetente_id = auth.uid());

-- Usuario pode ver arquivos compartilhados com ele
CREATE POLICY "Usuario pode ver arquivos recebidos"
ON public.arquivos_compartilhados
FOR SELECT
TO authenticated
USING (destinatario_id = auth.uid());

-- Usuario pode deletar arquivo recebido
CREATE POLICY "Usuario pode deletar arquivo recebido"
ON public.arquivos_compartilhados
FOR DELETE
TO authenticated
USING (destinatario_id = auth.uid());

-- 5. Criar bucket de storage (executar no dashboard do Supabase)
-- Nome do bucket: arquivos-compartilhados
-- Configurações:
--   - Public: false
--   - File size limit: 50 MB
--   - Allowed MIME types: application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/*, text/*, etc.

-- Políticas de Storage (aplicar no dashboard)

-- Professor pode fazer upload
-- CREATE POLICY "Professor pode fazer upload"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'arquivos-compartilhados' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );

-- Professor pode ler seus arquivos
-- CREATE POLICY "Professor pode ler seus arquivos"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (
--   bucket_id = 'arquivos-compartilhados' AND
--   (storage.foldername(name))[1] = auth.uid()::text
-- );

-- Aluno pode ler arquivos compartilhados com ele
-- CREATE POLICY "Aluno pode ler arquivos compartilhados"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (
--   bucket_id = 'arquivos-compartilhados' AND
--   EXISTS (
--     SELECT 1 FROM public.arquivos_compartilhados ac
--     WHERE ac.caminho_storage = name AND ac.aluno_id = auth.uid()
--   )
-- );

-- Qualquer um pode deletar arquivos (com regras da tabela)
-- CREATE POLICY "Deletar arquivos compartilhados"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'arquivos-compartilhados'
-- );

-- ====================================================================
-- INSTRUÇÕES DE CONFIGURAÇÃO DO BUCKET (executar no Dashboard)
-- ====================================================================
-- 1. Ir em Storage > Create a new bucket
-- 2. Nome: arquivos-compartilhados
-- 3. Public: false (privado)
-- 4. File size limit: 52428800 (50 MB)
-- 5. Allowed MIME types: deixar vazio (aceitar todos) ou especificar
-- 6. Criar as políticas de storage listadas acima na seção "Policies"
-- ====================================================================
