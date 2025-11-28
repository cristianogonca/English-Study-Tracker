import { supabase } from '../lib/supabase';
import type { ArquivoCompartilhado, ArquivoUpload } from '../types/ArquivoCompartilhado';

const BUCKET_NAME = 'arquivos-compartilhados';

export class ArquivosService {
  /**
   * Faz upload de arquivo do professor para aluno
   */
  static async uploadArquivo(upload: ArquivoUpload): Promise<{ success: boolean; error?: string; arquivo?: ArquivoCompartilhado }> {
    try {
      // 1. Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // 2. Verificar se o professor tem relação com o aluno
      const { data: relacao, error: relacaoError } = await supabase
        .from('usuarios_professor_aluno')
        .select('*')
        .eq('professor_id', user.id)
        .eq('aluno_id', upload.aluno_id)
        .single();

      if (relacaoError || !relacao) {
        return { success: false, error: 'Você não tem permissão para compartilhar arquivos com este aluno' };
      }

      // 3. Gerar nome único para o arquivo
      const timestamp = Date.now();
      const nomeArquivoSeguro = upload.arquivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const caminhoStorage = `${user.id}/${upload.aluno_id}/${timestamp}_${nomeArquivoSeguro}`;

      // 4. Fazer upload do arquivo para o storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(caminhoStorage, upload.arquivo, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error('Erro no upload do arquivo:', storageError);
        return { success: false, error: `Erro ao fazer upload: ${storageError.message}` };
      }

      // 5. Registrar na tabela de arquivos compartilhados
      const { data: arquivoData, error: dbError } = await supabase
        .from('arquivos_compartilhados')
        .insert({
          professor_id: user.id,
          aluno_id: upload.aluno_id,
          nome_arquivo: upload.arquivo.name,
          tamanho_bytes: upload.arquivo.size,
          tipo_arquivo: upload.arquivo.type || 'application/octet-stream',
          caminho_storage: caminhoStorage,
          observacao: upload.observacao || null
        })
        .select()
        .single();

      if (dbError) {
        // Tentar deletar o arquivo do storage se falhar o registro
        await supabase.storage.from(BUCKET_NAME).remove([caminhoStorage]);
        console.error('Erro ao registrar arquivo:', dbError);
        return { success: false, error: `Erro ao registrar arquivo: ${dbError.message}` };
      }

      return { success: true, arquivo: arquivoData };
    } catch (error: any) {
      console.error('Erro inesperado no upload:', error);
      return { success: false, error: error.message || 'Erro inesperado ao fazer upload' };
    }
  }

  /**
   * Lista arquivos compartilhados (professor vê os que enviou, aluno vê os que recebeu)
   */
  static async listarArquivos(): Promise<{ success: boolean; arquivos?: ArquivoCompartilhado[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verificar se é professor ou aluno
      const { data: perfil } = await supabase
        .from('perfis')
        .select('role')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('arquivos_compartilhados')
        .select(`
          *,
          professor:professor_id (id, nome),
          aluno:aluno_id (id, nome)
        `)
        .order('data_upload', { ascending: false });

      if (perfil?.role === 'professor') {
        query = query.eq('professor_id', user.id);
      } else {
        query = query.eq('aluno_id', user.id);
      }

      const { data: arquivos, error } = await query;

      if (error) {
        console.error('Erro ao listar arquivos:', error);
        return { success: false, error: error.message };
      }

      // Processar dados para formato esperado
      const arquivosProcessados = (arquivos || []).map((arq: any) => ({
        ...arq,
        professor_nome: arq.professor?.nome || 'Desconhecido',
        aluno_nome: arq.aluno?.nome || 'Desconhecido'
      }));

      return { success: true, arquivos: arquivosProcessados };
    } catch (error: any) {
      console.error('Erro ao listar arquivos:', error);
      return { success: false, error: error.message || 'Erro inesperado' };
    }
  }

  /**
   * Faz download de arquivo e marca como baixado
   */
  static async baixarArquivo(arquivoId: string): Promise<{ success: boolean; error?: string; blob?: Blob; nomeArquivo?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // 1. Buscar informações do arquivo
      const { data: arquivo, error: dbError } = await supabase
        .from('arquivos_compartilhados')
        .select('*')
        .eq('id', arquivoId)
        .single();

      if (dbError || !arquivo) {
        return { success: false, error: 'Arquivo não encontrado' };
      }

      // 2. Verificar permissão (aluno deve ser o destinatário ou professor deve ser o remetente)
      if (arquivo.aluno_id !== user.id && arquivo.professor_id !== user.id) {
        return { success: false, error: 'Você não tem permissão para baixar este arquivo' };
      }

      // 3. Fazer download do storage
      const { data: blob, error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .download(arquivo.caminho_storage);

      if (storageError || !blob) {
        console.error('Erro ao baixar arquivo:', storageError);
        return { success: false, error: 'Erro ao baixar arquivo do storage' };
      }

      // 4. Se for aluno baixando, marcar como baixado
      if (arquivo.aluno_id === user.id) {
        await supabase
          .from('arquivos_compartilhados')
          .update({
            baixado: true,
            data_baixado: new Date().toISOString()
          })
          .eq('id', arquivoId);
      }

      return {
        success: true,
        blob,
        nomeArquivo: arquivo.nome_arquivo
      };
    } catch (error: any) {
      console.error('Erro ao baixar arquivo:', error);
      return { success: false, error: error.message || 'Erro inesperado ao baixar arquivo' };
    }
  }

  /**
   * Deleta arquivo (tanto do storage quanto do banco)
   * Professor pode deletar qualquer arquivo que enviou
   * Aluno pode deletar arquivo após baixar
   */
  static async deletarArquivo(arquivoId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // 1. Buscar informações do arquivo
      const { data: arquivo, error: dbError } = await supabase
        .from('arquivos_compartilhados')
        .select('*')
        .eq('id', arquivoId)
        .single();

      if (dbError || !arquivo) {
        return { success: false, error: 'Arquivo não encontrado' };
      }

      // 2. Verificar permissão
      const isProfessor = arquivo.professor_id === user.id;
      const isAluno = arquivo.aluno_id === user.id;

      if (!isProfessor && !isAluno) {
        return { success: false, error: 'Você não tem permissão para deletar este arquivo' };
      }

      // 3. Deletar do storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([arquivo.caminho_storage]);

      if (storageError) {
        console.error('Erro ao deletar do storage:', storageError);
        // Continuar mesmo com erro no storage
      }

      // 4. Deletar do banco
      const { error: deleteError } = await supabase
        .from('arquivos_compartilhados')
        .delete()
        .eq('id', arquivoId);

      if (deleteError) {
        console.error('Erro ao deletar do banco:', deleteError);
        return { success: false, error: 'Erro ao deletar arquivo do banco de dados' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao deletar arquivo:', error);
      return { success: false, error: error.message || 'Erro inesperado ao deletar arquivo' };
    }
  }

  /**
   * Formata tamanho em bytes para formato legível
   */
  static formatarTamanho(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Retorna ícone baseado no tipo de arquivo
   */
  static getIconePorTipo(tipo: string): string {
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return '📊';
    if (tipo.includes('word') || tipo.includes('document')) return '📝';
    if (tipo.includes('image')) return '🖼️';
    if (tipo.includes('video')) return '🎥';
    if (tipo.includes('audio')) return '🎵';
    if (tipo.includes('zip') || tipo.includes('rar') || tipo.includes('compressed')) return '📦';
    if (tipo.includes('text')) return '📃';
    return '📎';
  }

  /**
   * Valida tamanho máximo do arquivo (50 MB)
   */
  static validarTamanho(arquivo: File): { valido: boolean; erro?: string } {
    const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
    if (arquivo.size > MAX_SIZE) {
      return {
        valido: false,
        erro: `Arquivo muito grande. Tamanho máximo: 50 MB. Tamanho atual: ${this.formatarTamanho(arquivo.size)}`
      };
    }
    return { valido: true };
  }
}
