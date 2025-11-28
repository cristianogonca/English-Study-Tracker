-- ====================================================================
-- SISTEMA DE ARQUIVOS COMPARTILHADOS (PROFESSOR -> ALUNO)
-- ====================================================================

-- 1. Criar tabela de arquivos compartilhados
CREATE TABLE IF NOT EXISTS public.arquivos_compartilhados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_arquivo TEXT NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    tipo_arquivo TEXT NOT NULL,
    caminho_storage TEXT NOT NULL,
    data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    baixado BOOLEAN DEFAULT FALSE,
    data_baixado TIMESTAMP WITH TIME ZONE,
    observacao TEXT
);

-- 2. Criar índices para performance
CREATE INDEX idx_arquivos_aluno ON public.arquivos_compartilhados(aluno_id);
CREATE INDEX idx_arquivos_professor ON public.arquivos_compartilhados(professor_id);
CREATE INDEX idx_arquivos_baixado ON public.arquivos_compartilhados(baixado);

-- 3. Habilitar RLS
ALTER TABLE public.arquivos_compartilhados ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de segurança

-- Qualquer usuário autenticado pode inserir arquivos (controle será feito no frontend)
CREATE POLICY "Usuario pode fazer upload de arquivos"
ON public.arquivos_compartilhados
FOR INSERT
TO authenticated
WITH CHECK (professor_id = auth.uid());

-- Usuario pode ver arquivos que enviou
CREATE POLICY "Usuario pode ver seus arquivos enviados"
ON public.arquivos_compartilhados
FOR SELECT
TO authenticated
USING (professor_id = auth.uid());

-- Usuario pode deletar arquivos que enviou
CREATE POLICY "Usuario pode deletar seus arquivos"
ON public.arquivos_compartilhados
FOR DELETE
TO authenticated
USING (professor_id = auth.uid());

-- Usuario pode ver arquivos compartilhados com ele
CREATE POLICY "Usuario pode ver arquivos recebidos"
ON public.arquivos_compartilhados
FOR SELECT
TO authenticated
USING (aluno_id = auth.uid());

-- Usuario pode atualizar status de "baixado"
CREATE POLICY "Usuario pode marcar arquivo como baixado"
ON public.arquivos_compartilhados
FOR UPDATE
TO authenticated
USING (aluno_id = auth.uid())
WITH CHECK (aluno_id = auth.uid());

-- Usuario pode deletar arquivo recebido
CREATE POLICY "Usuario pode deletar arquivo recebido"
ON public.arquivos_compartilhados
FOR DELETE
TO authenticated
USING (aluno_id = auth.uid());

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
