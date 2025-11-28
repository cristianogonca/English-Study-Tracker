import { supabase } from '../lib/supabase';
import type { ArquivoCompartilhado, ArquivoUpload } from '../types/ArquivoCompartilhado';

const BUCKET_NAME = 'arquivos-compartilhados';

export class ArquivosService {
  /**
   * Faz upload de arquivo (bidirecional: professor <-> aluno)
   */
  static async uploadArquivo(upload: ArquivoUpload): Promise<{ success: boolean; error?: string; arquivo?: ArquivoCompartilhado }> {
    try {
      // 1. Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // 2. Gerar nome único para o arquivo
      const timestamp = Date.now();
      const nomeArquivoSeguro = upload.arquivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const caminhoStorage = `${user.id}/${upload.destinatario_id}/${timestamp}_${nomeArquivoSeguro}`;

      // 3. Fazer upload do arquivo para o storage
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

      // 4. Registrar na tabela de arquivos compartilhados
      const { data: arquivoData, error: dbError } = await supabase
        .from('arquivos_compartilhados')
        .insert({
          remetente_id: user.id,
          destinatario_id: upload.destinatario_id,
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

      // Buscar arquivos sem joins
      const { data: arquivos, error } = await supabase
        .from('arquivos_compartilhados')
        .select('*')
        .or(`remetente_id.eq.${user.id},destinatario_id.eq.${user.id}`)
        .order('data_upload', { ascending: false });

      if (error) {
        console.error('Erro ao listar arquivos:', error);
        return { success: false, error: error.message };
      }

      if (!arquivos || arquivos.length === 0) {
        return { success: true, arquivos: [] };
      }

      // Buscar TODOS os alunos e professores (não apenas os que têm arquivos)
      const { data: alunos } = await supabase
        .from('user_configs')
        .select('user_id, nome');

      const { data: professores } = await supabase
        .from('users_profile')
        .select('id, nome');

      console.log('Alunos encontrados:', alunos);
      console.log('Professores encontrados:', professores);

      // Mapear nomes (unificar alunos e professores)
      const nomesMap = new Map();
      (alunos || []).forEach((a: any) => {
        nomesMap.set(a.user_id, a.nome || 'Desconhecido');
      });
      (professores || []).forEach((p: any) => {
        nomesMap.set(p.id, p.nome || 'Desconhecido');
      });

      console.log('Mapa de nomes:', nomesMap);

      // Processar dados para formato esperado
      const arquivosProcessados = arquivos.map((arq: any) => ({
        ...arq,
        remetente_nome: nomesMap.get(arq.remetente_id) || 'Desconhecido',
        destinatario_nome: nomesMap.get(arq.destinatario_id) || 'Desconhecido'
      }));

      console.log('Arquivos processados:', arquivosProcessados);

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

      // 2. Verificar permissão (destinatário deve ser quem está baixando ou remetente)
      if (arquivo.destinatario_id !== user.id && arquivo.remetente_id !== user.id) {
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
   * Remetente pode deletar qualquer arquivo que enviou
   * Destinatário pode deletar arquivo recebido
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
      const isRemetente = arquivo.remetente_id === user.id;
      const isDestinatario = arquivo.destinatario_id === user.id;

      if (!isRemetente && !isDestinatario) {
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
