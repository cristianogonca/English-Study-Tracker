import { supabase } from '../lib/supabase';
import type {
  Prova,
  ProvaQuestao,
  ProvaResposta,
  ProvaSubmissao,
  AlunoProvaDisponivel,
  ProfessorProvaSubmissao,
} from '../types';

export class SupabaseProvasService {
  
  // ==================== PROFESSOR: GERENCIAR PROVAS ====================
  
  /**
   * Criar nova prova
   */
  async criarProva(prova: Omit<Prova, 'id' | 'data_criacao'>): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('provas')
      .insert({
        professor_id: user.id,
        titulo: prova.titulo,
        descricao: prova.descricao,
        data_disponivel: prova.data_disponivel,
        data_limite: prova.data_limite,
        duracao_minutos: prova.duracao_minutos,
        ativa: prova.ativa,
        peso: prova.peso,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Listar provas do professor
   */
  async listarProvasProfessor(): Promise<Prova[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('provas')
      .select('*')
      .eq('professor_id', user.id)
      .order('data_criacao', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar prova por ID
   */
  async buscarProva(provaId: string): Promise<Prova | null> {
    const { data, error } = await supabase
      .from('provas')
      .select('*')
      .eq('id', provaId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Atualizar prova
   */
  async atualizarProva(provaId: string, updates: Partial<Prova>): Promise<void> {
    const { error } = await supabase
      .from('provas')
      .update(updates)
      .eq('id', provaId);

    if (error) throw error;
  }

  /**
   * Deletar prova
   */
  async deletarProva(provaId: string): Promise<void> {
    const { error } = await supabase
      .from('provas')
      .delete()
      .eq('id', provaId);

    if (error) throw error;
  }

  // ==================== PROFESSOR: GERENCIAR QUESTÕES ====================
  
  /**
   * Adicionar questão à prova
   */
  async adicionarQuestao(questao: Omit<ProvaQuestao, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('prova_questoes')
      .insert({
        prova_id: questao.prova_id,
        numero: questao.numero,
        tipo: questao.tipo,
        enunciado: questao.enunciado,
        opcoes: questao.opcoes,
        resposta_correta: questao.resposta_correta,
        pontos: questao.pontos,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Listar questões de uma prova
   */
  async listarQuestoes(provaId: string): Promise<ProvaQuestao[]> {
    const { data, error } = await supabase
      .from('prova_questoes')
      .select('*')
      .eq('prova_id', provaId)
      .order('numero');

    if (error) throw error;
    return data || [];
  }

  /**
   * Atualizar questão
   */
  async atualizarQuestao(questaoId: string, updates: Partial<ProvaQuestao>): Promise<void> {
    const { error } = await supabase
      .from('prova_questoes')
      .update(updates)
      .eq('id', questaoId);

    if (error) throw error;
  }

  /**
   * Deletar questão
   */
  async deletarQuestao(questaoId: string): Promise<void> {
    const { error } = await supabase
      .from('prova_questoes')
      .delete()
      .eq('id', questaoId);

    if (error) throw error;
  }

  // ==================== PROFESSOR: GERENCIAR ALUNOS DA PROVA ====================
  
  /**
   * Atribuir prova a um aluno
   */
  async atribuirAlunoProva(provaId: string, alunoId: string): Promise<void> {
    const { error } = await supabase
      .from('prova_alunos')
      .insert({
        prova_id: provaId,
        aluno_id: alunoId,
      });

    if (error) throw error;
  }

  /**
   * Remover atribuição de aluno
   */
  async removerAlunoProva(provaId: string, alunoId: string): Promise<void> {
    const { error } = await supabase
      .from('prova_alunos')
      .delete()
      .eq('prova_id', provaId)
      .eq('aluno_id', alunoId);

    if (error) throw error;
  }

  /**
   * Listar alunos atribuídos a uma prova
   */
  async listarAlunosProva(provaId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('prova_alunos')
      .select('aluno_id')
      .eq('prova_id', provaId);

    if (error) throw error;
    return (data || []).map(item => item.aluno_id);
  }

  /**
   * Listar todos os alunos disponíveis
   */
  async listarAlunosDisponiveis(): Promise<Array<{ id: string; nome: string; email: string }>> {
    // Usar a mesma view que ProfessorAlunos usa
    const { data, error } = await supabase
      .from('professor_alunos_view')
      .select('id, nome, email')
      .order('nome');
    
    if (error) {
      console.error('Erro ao buscar alunos:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn('Nenhum aluno encontrado');
      return [];
    }

    console.log('Alunos encontrados:', data.length);
    return data.map(aluno => ({
      id: aluno.id,
      nome: aluno.nome || aluno.email,
      email: aluno.email || ''
    }));
  }

  // ==================== ALUNO: VER PROVAS DISPONÍVEIS ====================
  
  /**
   * Listar provas disponíveis para o aluno
   */
  async listarProvasDisponiveis(): Promise<AlunoProvaDisponivel[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('aluno_provas_disponiveis')
      .select('*')
      .eq('aluno_id', user.id)
      .order('data_limite', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Erro ao buscar provas:', error);
      throw error;
    }
    
    console.log('Provas disponíveis para aluno:', data);
    return data || [];
  }

  /**
   * Iniciar prova (criar submissão)
   */
  async iniciarProva(provaId: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('prova_submissoes')
      .insert({
        prova_id: provaId,
        aluno_id: user.id,
        data_inicio: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Salvar resposta do aluno
   */
  async salvarResposta(resposta: Omit<ProvaResposta, 'id'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('prova_respostas')
      .upsert({
        prova_id: resposta.prova_id,
        aluno_id: user.id,
        questao_id: resposta.questao_id,
        resposta: resposta.resposta,
      }, {
        onConflict: 'prova_id,aluno_id,questao_id'
      });

    if (error) throw error;
  }

  /**
   * Finalizar prova (submeter)
   */
  async finalizarProva(provaId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('prova_submissoes')
      .update({
        data_submissao: new Date().toISOString(),
      })
      .eq('prova_id', provaId)
      .eq('aluno_id', user.id);

    if (error) throw error;
  }

  /**
   * Buscar respostas do aluno para uma prova
   */
  async buscarRespostasAluno(provaId: string): Promise<ProvaResposta[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('prova_respostas')
      .select('*')
      .eq('prova_id', provaId)
      .eq('aluno_id', user.id);

    if (error) throw error;
    return data || [];
  }

  // ==================== PROFESSOR: AVALIAR PROVAS ====================
  
  /**
   * Listar submissões de uma prova
   */
  async listarSubmissoes(provaId: string): Promise<ProfessorProvaSubmissao[]> {
    const { data, error } = await supabase
      .from('professor_provas_submissoes')
      .select('*')
      .eq('prova_id', provaId)
      .order('data_submissao', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar respostas de um aluno específico
   */
  async buscarRespostasAlunoProva(provaId: string, alunoId: string): Promise<ProvaResposta[]> {
    const { data, error } = await supabase
      .from('prova_respostas')
      .select('*')
      .eq('prova_id', provaId)
      .eq('aluno_id', alunoId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Avaliar resposta (dar nota e feedback)
   */
  async avaliarResposta(
    respostaId: string,
    correta: boolean,
    pontos_obtidos: number,
    comentario?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('prova_respostas')
      .update({
        correta,
        pontos_obtidos,
        comentario_professor: comentario,
      })
      .eq('id', respostaId);

    if (error) throw error;
  }

  /**
   * Finalizar avaliação da prova (calcular nota final)
   */
  async finalizarAvaliacao(
    submissaoId: string,
    nota_total: number,
    pontos_totais: number,
    pontos_possiveis: number,
    comentario_geral?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('prova_submissoes')
      .update({
        nota_total,
        pontos_totais,
        pontos_possiveis,
        avaliada: true,
        comentario_geral,
      })
      .eq('id', submissaoId);

    if (error) throw error;
  }
}

export const provasService = new SupabaseProvasService();
