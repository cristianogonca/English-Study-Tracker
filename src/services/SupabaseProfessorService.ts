import { supabase } from '../lib/supabase';
import { AlunoView, GuiaEstudosMes, DiaEstudo, AtividadeSemanal } from '../types';
import { GUIA_BASE_12_MESES } from './GuiaBase';

export class SupabaseProfessorService {
  
  // ==================== ALUNOS ====================
  
  /**
   * Listar todos os alunos (apenas professores/admin)
   */
  async listarAlunos(): Promise<AlunoView[]> {
    const { data, error } = await supabase
      .from('professor_alunos_view')
      .select('*')
      .order('nome');
    
    if (error) {
      console.error('Erro ao listar alunos:', error);
      throw new Error('Não foi possível listar alunos');
    }
    
    return data || [];
  }

  /**
   * Buscar detalhes de um aluno específico
   */
  async buscarAluno(userId: string): Promise<AlunoView | null> {
    const { data, error } = await supabase
      .from('professor_alunos_view')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar aluno:', error);
      return null;
    }
    
    return data;
  }

  // ==================== CRONOGRAMA ====================
  
  /**
   * Buscar cronograma completo do aluno (365 dias)
   */
  async buscarCronogramaAluno(userId: string): Promise<DiaEstudo[]> {
    const { data, error } = await supabase
      .from('cronograma')
      .select('*')
      .eq('user_id', userId)
      .order('dia_numero');
    
    if (error) {
      console.error('Erro ao buscar cronograma:', error);
      throw new Error('Não foi possível buscar cronograma do aluno');
    }
    
    console.log('🔍 [SupabaseProfessorService] Dados brutos do banco:', data?.slice(0, 3));
    
    const resultado = (data || []).map(dia => ({
      id: dia.id,
      numero: dia.dia_numero,
      mes: dia.mes,
      semana: dia.semana,
      fase: dia.fase,
      data: dia.data,
      tarefas: dia.tarefas || [],
      tempoTotal: dia.tempo_total || 60,
      concluido: dia.concluido || false,
      tituloSemana: dia.titulo_semana
    }));
    
    console.log('✅ [SupabaseProfessorService] Dados mapeados:', resultado.slice(0, 3));
    
    return resultado;
  }

  /**
   * Atualizar um dia do cronograma
   */
  async atualizarDiaCronograma(
    diaId: string, 
    updates: {
      tituloSemana?: string;
      tarefas?: any[];
      tempoTotal?: number;
    }
  ): Promise<void> {
    const updateData: any = {};
    
    if (updates.tituloSemana !== undefined) {
      updateData.titulo_semana = updates.tituloSemana;
    }
    if (updates.tarefas !== undefined) {
      updateData.tarefas = updates.tarefas;
    }
    if (updates.tempoTotal !== undefined) {
      updateData.tempo_total = updates.tempoTotal;
    }
    
    const { error } = await supabase
      .from('cronograma')
      .update(updateData)
      .eq('id', diaId);
    
    if (error) {
      console.error('Erro ao atualizar dia do cronograma:', error);
      throw new Error('Não foi possível atualizar o dia do cronograma');
    }
  }

  /**
   * Atualizar múltiplos dias do cronograma (batch)
   */
  async atualizarDiasCronograma(
    updates: Array<{ id: string; tituloSemana?: string; tarefas?: any[]; tempoTotal?: number }>
  ): Promise<void> {
    const promises = updates.map(update => 
      this.atualizarDiaCronograma(update.id, {
        tituloSemana: update.tituloSemana,
        tarefas: update.tarefas,
        tempoTotal: update.tempoTotal
      })
    );

    await Promise.all(promises);
  }

  // ==================== GUIA DE ESTUDOS ====================
  
  /**
   * Buscar guia de estudos do aluno (12 meses)
   */
  async buscarGuiaAluno(userId: string): Promise<GuiaEstudosMes[]> {
    const { data, error } = await supabase
      .from('guia_estudos')
      .select('*')
      .eq('user_id', userId)
      .order('mes');
    
    if (error) {
      console.error('Erro ao buscar guia:', error);
      throw new Error('Não foi possível buscar guia do aluno');
    }
    
    return data || [];
  }

  /**
   * Buscar um mês específico do guia
   */
  async buscarMesGuia(userId: string, mes: number): Promise<GuiaEstudosMes | null> {
    const { data, error } = await supabase
      .from('guia_estudos')
      .select('*')
      .eq('user_id', userId)
      .eq('mes', mes)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Não encontrado, retorna null
        return null;
      }
      console.error('Erro ao buscar mês do guia:', error);
      throw new Error('Não foi possível buscar mês do guia');
    }
    
    return data;
  }

  /**
   * Criar ou atualizar um mês do guia
   */
  async salvarMesGuia(userId: string, mes: number, dados: Omit<GuiaEstudosMes, 'id' | 'user_id' | 'mes' | 'criado_em' | 'atualizado_em'>): Promise<void> {
    const { error } = await supabase
      .from('guia_estudos')
      .upsert({
        user_id: userId,
        mes,
        titulo: dados.titulo,
        objetivos: dados.objetivos,
        gramatica: dados.gramatica,
        vocabulario: dados.vocabulario,
        listening: dados.listening,
        speaking: dados.speaking,
        reading: dados.reading,
        writing: dados.writing,
        check_final: dados.check_final
      }, {
        onConflict: 'user_id,mes'
      });
    
    if (error) {
      console.error('Erro ao salvar mês do guia:', error);
      throw new Error('Não foi possível salvar mês do guia');
    }
  }

  /**
   * Deletar um mês do guia
   */
  async deletarMesGuia(userId: string, mes: number): Promise<void> {
    const { error } = await supabase
      .from('guia_estudos')
      .delete()
      .eq('user_id', userId)
      .eq('mes', mes);
    
    if (error) {
      console.error('Erro ao deletar mês do guia:', error);
      throw new Error('Não foi possível deletar mês do guia');
    }
  }

  /**
   * Criar guia inicial completo para um aluno (12 meses com conteúdo rico)
   */
  async criarGuiaInicial(userId: string): Promise<void> {
    const guiaInicial = GUIA_BASE_12_MESES.map(mes => ({
      user_id: userId,
      mes: mes.mes,
      titulo: mes.titulo,
      objetivos: mes.objetivos,
      gramatica: mes.gramatica,
      vocabulario: mes.vocabulario,
      listening: mes.listening,
      speaking: mes.speaking,
      reading: mes.reading,
      writing: mes.writing,
      check_final: mes.checkFinal
    }));

    const { error } = await supabase
      .from('guia_estudos')
      .insert(guiaInicial);
    
    if (error) {
      console.error('Erro ao criar guia inicial:', error);
      throw new Error('Não foi possível criar guia inicial');
    }
  }

  // ==================== PERFIL DO PROFESSOR ====================

  /**
   * Verificar se o usuário atual é professor ou admin
   */
  async isProfessor(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data, error } = await supabase
      .from('users_profile')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Erro ao verificar role:', error);
      return false;
    }

    return data?.role === 'professor' || data?.role === 'admin';
  }

  /**
   * Buscar role do usuário atual
   */
  async getRoleUsuario(): Promise<'aluno' | 'professor' | 'admin' | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('users_profile')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar role:', error);
      return null;
    }

    return data?.role || 'aluno';
  }

  // ==================== ROTINA SEMANAL ====================
  
  /**
   * Criar rotina semanal padrão para um aluno
   */
  async criarRotinaSemanal(userId: string): Promise<void> {
    const rotinaBase: AtividadeSemanal[] = [
      { dia_semana: 1, nome: "Gramática + Exercícios", descricao: "Estudar tópico gramatical da semana + fazer exercícios práticos", icone: "📝" },
      { dia_semana: 2, nome: "Vocabulário + Frases", descricao: "Aprender 10 palavras novas + criar frases próprias", icone: "📚" },
      { dia_semana: 3, nome: "Listening + Anotações", descricao: "Ouvir áudio/vídeo + anotar palavras e frases ouvidas", icone: "🎧" },
      { dia_semana: 4, nome: "Reading + Resumo", descricao: "Ler texto em inglês + fazer resumo em 5 linhas", icone: "📖" },
      { dia_semana: 5, nome: "Speaking + Gravação", descricao: "Gravar áudio falando sobre tópico do dia", icone: "🎤" },
      { dia_semana: 6, nome: "Writing", descricao: "Escrever texto ou diálogo sobre tema da semana", icone: "✍️" },
      { dia_semana: 7, nome: "Revisão", descricao: "Revisar tudo da semana + fazer check semanal no app", icone: "✅" }
    ];

    const rows = rotinaBase.map(ativ => ({
      user_id: userId,
      dia_semana: ativ.dia_semana,
      nome: ativ.nome,
      descricao: ativ.descricao,
      icone: ativ.icone
    }));

    const { error } = await supabase
      .from('rotina_semanal')
      .insert(rows);

    if (error) {
      console.error('Erro ao criar rotina semanal:', error);
      throw new Error('Não foi possível criar rotina semanal');
    }
  }

  /**
   * Buscar rotina semanal de um aluno
   */
  async buscarRotinaSemanal(userId: string): Promise<AtividadeSemanal[]> {
    const { data, error } = await supabase
      .from('rotina_semanal')
      .select('*')
      .eq('user_id', userId)
      .order('dia_semana');

    if (error) {
      console.error('Erro ao buscar rotina semanal:', error);
      throw new Error('Não foi possível buscar rotina semanal');
    }

    return (data || []).map(row => ({
      id: row.id,
      user_id: row.user_id,
      dia_semana: row.dia_semana,
      nome: row.nome,
      descricao: row.descricao,
      icone: row.icone
    }));
  }

  /**
   * Atualizar uma atividade da rotina semanal
   */
  async atualizarAtividadeSemanal(
    atividadeId: string,
    updates: { nome?: string; descricao?: string; icone?: string }
  ): Promise<void> {
    const { error } = await supabase
      .from('rotina_semanal')
      .update(updates)
      .eq('id', atividadeId);

    if (error) {
      console.error('Erro ao atualizar atividade semanal:', error);
      throw new Error('Não foi possível atualizar atividade');
    }
  }
}

export const professorService = new SupabaseProfessorService();
