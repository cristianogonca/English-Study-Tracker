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
   * Criar guia inicial completo para um aluno (baseado na duração do programa)
   */
  async criarGuiaInicial(userId: string, duracaoDias: number = 365): Promise<void> {
    // Verificar se já existe guia para este usuário
    const { data: guiaExistente } = await supabase
      .from('guia_estudos')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (guiaExistente && guiaExistente.length > 0) {
      console.log('[criarGuiaInicial] Guia já existe para o usuário, pulando criação');
      return; // Já existe, não precisa criar
    }

    // Calcular quantos meses criar baseado na duração (arredondar para cima)
    const mesesNecessarios = Math.ceil(duracaoDias / 30);
    console.log(`[criarGuiaInicial] Criando guia para ${duracaoDias} dias = ${mesesNecessarios} meses`);

    // Pegar apenas os meses necessários do guia base
    const guiaInicial = GUIA_BASE_12_MESES.slice(0, mesesNecessarios).map(mes => ({
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
   * Buscar rotina semanal do aluno (7 dias)
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
    
    return (data || []).map(atividade => ({
      id: atividade.id,
      diaSemana: atividade.dia_semana,
      nome: atividade.nome,
      descricao: atividade.descricao,
      icone: atividade.icone || '📝'
    }));
  }

  /**
   * Atualizar uma atividade da rotina semanal
   */
  async atualizarAtividadeSemanal(
    atividadeId: string,
    updates: {
      nome?: string;
      descricao?: string;
      icone?: string;
    }
  ): Promise<void> {
    const updateData: any = {};
    
    if (updates.nome !== undefined) updateData.nome = updates.nome;
    if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
    if (updates.icone !== undefined) updateData.icone = updates.icone;
    
    const { error } = await supabase
      .from('rotina_semanal')
      .update(updateData)
      .eq('id', atividadeId);
    
    if (error) {
      console.error('Erro ao atualizar atividade semanal:', error);
      throw new Error('Não foi possível atualizar atividade');
    }
  }

  /**
   * Criar rotina semanal inicial (base padrão) - apenas para os dias selecionados
   */
  async criarRotinaSemanalInicial(userId: string, diasEstudo: number[] = [1,2,3,4,5,6,0]): Promise<void> {
    // Verificar se já existe rotina para este usuário
    const { data: rotinaExistente } = await supabase
      .from('rotina_semanal')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (rotinaExistente && rotinaExistente.length > 0) {
      console.log('[criarRotinaSemanalInicial] Rotina já existe para o usuário, pulando criação');
      return; // Já existe, não precisa criar
    }

    console.log(`[criarRotinaSemanalInicial] Criando rotina para os dias: ${diasEstudo.join(', ')}`);

    const atividadesBase: AtividadeSemanal[] = [
      { diaSemana: 1, nome: "Gramática + Exercícios", descricao: "Estudar tópico gramatical da semana + fazer exercícios práticos", icone: "📝" },
      { diaSemana: 2, nome: "Vocabulário + Frases", descricao: "Aprender 10 palavras novas + criar frases próprias", icone: "📚" },
      { diaSemana: 3, nome: "Listening + Anotações", descricao: "Ouvir áudio/vídeo + anotar palavras e frases ouvidas", icone: "🎧" },
      { diaSemana: 4, nome: "Reading + Resumo", descricao: "Ler texto em inglês + fazer resumo em 5 linhas", icone: "📖" },
      { diaSemana: 5, nome: "Speaking + Gravação", descricao: "Gravar áudio falando sobre tópico do dia", icone: "🎤" },
      { diaSemana: 6, nome: "Writing", descricao: "Escrever texto ou diálogo sobre tema da semana", icone: "✍️" },
      { diaSemana: 7, nome: "Revisão", descricao: "Revisar tudo da semana + fazer check semanal no app", icone: "✅" }
    ];

    // Converter domingo de 0 para 7 para compatibilidade com o banco
    const diasConvertidos = diasEstudo.map(dia => dia === 0 ? 7 : dia);

    // Filtrar apenas os dias selecionados pelo usuário
    const atividadesFiltradas = atividadesBase.filter(atividade => 
      diasConvertidos.includes(atividade.diaSemana)
    );

    const rows = atividadesFiltradas.map(atividade => ({
      user_id: userId,
      dia_semana: atividade.diaSemana,
      nome: atividade.nome,
      descricao: atividade.descricao,
      icone: atividade.icone
    }));

    if (rows.length === 0) {
      console.warn('[criarRotinaSemanalInicial] Nenhum dia de estudo selecionado, não criando rotina');
      return;
    }

    const { error } = await supabase
      .from('rotina_semanal')
      .insert(rows);
    
    if (error) {
      console.error('Erro ao criar rotina semanal:', error);
      throw new Error('Não foi possível criar rotina semanal');
    }
  }
}

export const professorService = new SupabaseProfessorService();
