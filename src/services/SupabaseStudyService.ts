import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  ConfigUsuario,
  DiaEstudo,
  CheckSemanal,
  ProgressoTarefa,
  PalavraNova,
  Fase,
} from '../types';

class SupabaseStudyService {
  private usuarioId: string | null = null;

  // ============================================
  // SET USUARIO
  // ============================================
  setUsuario(usuarioId: string) {
    this.usuarioId = usuarioId;
  }

  // ============================================
  // CONFIGURAÇÃO
  // ============================================
  async salvarConfiguracao(config: ConfigUsuario): Promise<void> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const { error } = await supabase
        .from('user_configs')
        .upsert({
          user_id: this.usuarioId,
          nome: config.nome,
          meta_diaria: config.metaDiaria,
          meta_semanal: config.metaSemanal,
          dias_estudo: config.diasEstudo,
          data_inicio: config.dataInicio,
          nivel_inicial: config.nivelInicial,
        }, { onConflict: 'user_id' });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      throw error;
    }
  }

  async obterConfiguracao(): Promise<ConfigUsuario | null> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const { data, error } = await supabase
        .from('user_configs')
        .select('*')
        .eq('user_id', this.usuarioId)
        .single();

      if (error || !data) return null;

      return {
        nome: data.nome,
        metaDiaria: data.meta_diaria,
        metaSemanal: data.meta_semanal,
        diasEstudo: data.dias_estudo,
        dataInicio: data.data_inicio,
        nivelInicial: data.nivel_inicial,
      };
    } catch (error) {
      console.error('Erro ao obter configuração:', error);
      return null;
    }
  }

  // ============================================
  // CRONOGRAMA
  // ============================================
  async salvarCronograma(cronograma: DiaEstudo[]): Promise<void> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      // Deletar cronograma antigo
      await supabase
        .from('cronograma')
        .delete()
        .eq('user_id', this.usuarioId);

      // Inserir novo cronograma
      const rows = cronograma.map(dia => ({
        user_id: this.usuarioId,
        dia_numero: dia.numero,
        mes: dia.mes,
        semana: dia.semana,
        fase: dia.fase,
        data: dia.data,
        concluido: dia.concluido,
        tempo_total: dia.tempoTotal,
        tarefas: dia.tarefas,
        titulo_semana: dia.tituloSemana,
      }));

      const { error } = await supabase
        .from('cronograma')
        .insert(rows);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar cronograma:', error);
      throw error;
    }
  }

  async obterCronograma(): Promise<DiaEstudo[]> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const { data, error } = await supabase
        .from('cronograma')
        .select('*')
        .eq('user_id', this.usuarioId)
        .order('dia_numero', { ascending: true });

      if (error || !data) return [];

      return data.map(row => ({
        id: row.id,
        numero: row.dia_numero,
        mes: row.mes,
        semana: row.semana,
        fase: row.fase,
        data: row.data,
        concluido: row.concluido,
        tempoTotal: row.tempo_total,
        tarefas: row.tarefas,
        tituloSemana: row.titulo_semana,
      }));
    } catch (error) {
      console.error('Erro ao obter cronograma:', error);
      return [];
    }
  }

  async atualizarDia(dia: DiaEstudo): Promise<void> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const { error } = await supabase
        .from('cronograma')
        .update({
          concluido: dia.concluido,
          tempo_total: dia.tempoTotal,
          tarefas: dia.tarefas,
        })
        .eq('user_id', this.usuarioId)
        .eq('dia_numero', dia.numero);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar dia:', error);
      throw error;
    }
  }

  // ============================================
  // VOCABULÁRIO
  // ============================================
  async salvarPalavra(palavra: PalavraNova): Promise<void> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const dados: any = {
        user_id: this.usuarioId,
        palavra: palavra.palavra,
        traducao: palavra.traducao,
        exemplo: palavra.exemplo,
        nivel: palavra.nivel,
        data_aprendida: palavra.dataAprendida,
        revisada: palavra.revisada,
        acertos: palavra.acertos,
        erros: palavra.erros,
      };
      
      // Se tem id, é update (upsert), senão é insert
      if (palavra.id) {
        dados.id = palavra.id;
        const { error } = await supabase
          .from('vocabulario')
          .upsert(dados, { onConflict: 'id' });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vocabulario')
          .insert(dados);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Erro ao salvar palavra:', error);
      throw error;
    }
  }

  async obterVocabulario(): Promise<PalavraNova[]> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const { data, error } = await supabase
        .from('vocabulario')
        .select('*')
        .eq('user_id', this.usuarioId)
        .order('data_aprendida', { ascending: false });

      if (error || !data) return [];

      return data.map(row => ({
        id: row.id,
        palavra: row.palavra,
        traducao: row.traducao,
        exemplo: row.exemplo,
        nivel: row.nivel,
        dataAprendida: row.data_aprendida,
        revisada: row.revisada,
        acertos: row.acertos,
        erros: row.erros,
      }));
    } catch (error) {
      console.error('Erro ao obter vocabulário:', error);
      return [];
    }
  }

  async marcarPalavraRevisada(palavraId: string): Promise<void> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      // Fallback: não implementado no StudyService
      return;
    }

    try {
      const { error } = await supabase
        .from('vocabulario')
        .update({ revisada: true })
        .eq('id', palavraId)
        .eq('user_id', this.usuarioId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao marcar palavra como revisada:', error);
      throw error;
    }
  }

  async incrementarAcertos(palavraId: string): Promise<void> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      // Fallback: não implementado no StudyService
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('vocabulario')
        .select('acertos')
        .eq('id', palavraId)
        .eq('user_id', this.usuarioId)
        .single();

      if (fetchError || !data) throw fetchError;

      const { error } = await supabase
        .from('vocabulario')
        .update({ 
          acertos: data.acertos + 1,
          revisada: true 
        })
        .eq('id', palavraId)
        .eq('user_id', this.usuarioId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao incrementar acertos:', error);
      throw error;
    }
  }

  async incrementarErros(palavraId: string): Promise<void> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      // Fallback: não implementado no StudyService
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('vocabulario')
        .select('erros')
        .eq('id', palavraId)
        .eq('user_id', this.usuarioId)
        .single();

      if (fetchError || !data) throw fetchError;

      const { error } = await supabase
        .from('vocabulario')
        .update({ erros: data.erros + 1 })
        .eq('id', palavraId)
        .eq('user_id', this.usuarioId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao incrementar erros:', error);
      throw error;
    }
  }

  async resetarPalavra(palavraId: string): Promise<void> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const { error } = await supabase
        .from('vocabulario')
        .update({
          revisada: false,
          acertos: 0,
          erros: 0,
        })
        .eq('id', palavraId)
        .eq('user_id', this.usuarioId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao resetar palavra:', error);
      throw error;
    }
  }

  async deletarPalavra(palavraId: string): Promise<void> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const { error } = await supabase
        .from('vocabulario')
        .delete()
        .eq('id', palavraId)
        .eq('user_id', this.usuarioId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar palavra:', error);
      throw error;
    }
  }

  // ============================================
  // CHECKS SEMANAIS
  // ============================================
  async salvarCheckSemanal(check: CheckSemanal): Promise<void> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const dados: any = {
        user_id: this.usuarioId,
        semana: check.semana,
        data: check.dataInicio,
        checkpoints: check.checkpoints,
        nota_final: check.minutosRealizados,
        observacoes: check.observacoes || '',
      };
      
      console.log('[SupabaseStudyService] Tentando salvar check com dados:', dados);
      
      if (check.id) {
        dados.id = check.id;
      }
      
      const { data: resultado, error } = await supabase
        .from('checks_semanais')
        .upsert(dados, { onConflict: 'user_id,semana' })
        .select();

      if (error) {
        console.error('[SupabaseStudyService] Erro detalhado do Supabase:', error);
        console.error('[SupabaseStudyService] Mensagem:', error.message);
        console.error('[SupabaseStudyService] Detalhes:', error.details);
        console.error('[SupabaseStudyService] Hint:', error.hint);
        throw error;
      }
      
      console.log('[SupabaseStudyService] Check salvo com sucesso:', resultado);
    } catch (error) {
      console.error('[SupabaseStudyService] Erro ao salvar check semanal:', error);
      throw error;
    }
  }

  async obterChecks(): Promise<CheckSemanal[]> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const { data, error } = await supabase
        .from('checks_semanais')
        .select('*')
        .eq('user_id', this.usuarioId)
        .order('semana', { ascending: true });

      if (error || !data) return [];

      return data.map(row => ({
        id: row.id,
        semana: row.semana,
        dataInicio: row.data,
        dataFim: row.data,
        checkpoints: row.checkpoints,
        minutosRealizados: row.nota_final,
        minutosEsperados: 420,
        evolucaoFala: 'sim',
        palavrasAprendidas: 0,
        observacoes: row.observacoes,
        presenca: 100,
        metaCumprida: true
      }));
    } catch (error) {
      console.error('Erro ao obter checks:', error);
      return [];
    }
  }

  // ============================================
  // PROGRESSO
  // ============================================
  async salvarProgressoTarefa(progresso: ProgressoTarefa): Promise<void> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const dados = {
        user_id: this.usuarioId,
        tarefa_id: progresso.tarefaId,
        dia_numero: progresso.diaNumero || 1,
        status: progresso.status,
        tempo_gasto: progresso.tempoGasto,
        notas: progresso.notas || '',
      };
      
      console.log('[SupabaseStudyService] Salvando progresso tarefa:', dados);
      
      const { error } = await supabase
        .from('progresso_tarefas')
        .upsert(dados, { onConflict: 'user_id,tarefa_id' });

      if (error) {
        console.error('[SupabaseStudyService] Erro ao salvar progresso:', error);
        throw error;
      }
      
      console.log('[SupabaseStudyService] Progresso salvo com sucesso!');
    } catch (error) {
      console.error('[SupabaseStudyService] Erro ao salvar progresso:', error);
      throw error;
    }
  }

  async obterProgressoTarefas(): Promise<ProgressoTarefa[]> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const { data, error } = await supabase
        .from('progresso_tarefas')
        .select('*')
        .eq('user_id', this.usuarioId);

      if (error || !data) return [];

      return data.map(row => ({
        id: row.id,
        tarefaId: row.tarefa_id,
        diaNumero: row.dia_numero,
        status: row.status,
        tempoGasto: row.tempo_gasto,
      }));
    } catch (error) {
      console.error('Erro ao obter progresso:', error);
      return [];
    }
  }

  // ============================================
  // FASES
  // ============================================
  async salvarFases(fases: Fase[]): Promise<void> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const rows = fases.map(fase => ({
        user_id: this.usuarioId,
        numero: fase.numero,
        nome: fase.nome,
        descricao: fase.descricao,
        nivel: fase.nivel,
        mes_inicio: fase.mesInicio,
        mes_fim: fase.mesFim,
        horas_total: fase.horasTotal,
        concluida: fase.concluida,
        progresso: fase.progresso,
      }));

      const { error } = await supabase
        .from('fases')
        .upsert(rows, { onConflict: 'user_id,numero' });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar fases:', error);
      throw error;
    }
  }

  async obterFases(): Promise<Fase[]> {
    if (!isSupabaseConfigured() || !this.usuarioId) {
      throw new Error('Supabase não configurado ou usuário não definido');
    }

    try {
      const { data, error } = await supabase
        .from('fases')
        .select('*')
        .eq('user_id', this.usuarioId)
        .order('numero', { ascending: true });

      if (error || !data) return [];

      return data.map(row => ({
        id: row.id,
        numero: row.numero,
        nome: row.nome,
        descricao: row.descricao,
        nivel: row.nivel,
        mesInicio: row.mes_inicio,
        mesFim: row.mes_fim,
        horasTotal: row.horas_total,
        concluida: row.concluida,
        progresso: row.progresso,
      }));
    } catch (error) {
      console.error('Erro ao obter fases:', error);
      return [];
    }
  }
}

// Export singleton
export default new SupabaseStudyService();
