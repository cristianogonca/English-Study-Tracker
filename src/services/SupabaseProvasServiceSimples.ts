import { supabase } from '../lib/supabase';
import type { Prova, QuestaoData, RespostaData, ProfessorProvaLista, AlunoProvaLista } from '../types/provas';

export class SupabaseProvasServiceSimples {
  
  // ==================== PROFESSOR ====================
  
  /**
   * Listar todas as provas criadas pelo professor
   */
  async listarProvasProfessor(): Promise<ProfessorProvaLista[]> {
    const { data, error } = await supabase
      .from('professor_provas_lista')
      .select('*')
      .order('data_criacao', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Criar nova prova para um aluno
   */
  async criarProva(alunoId: string, titulo: string, descricao?: string, dataLimite?: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('provas')
      .insert({
        professor_id: user.id,
        aluno_id: alunoId,
        titulo,
        descricao,
        data_limite: dataLimite,
        questoes: [],
        respostas: [],
        status: 'pendente'
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Buscar prova completa (professor ou aluno)
   */
  async buscarProva(provaId: string): Promise<Prova | null> {
    const { data, error } = await supabase
      .from('provas')
      .select('*')
      .eq('id', provaId)
      .single();

    if (error) {
      console.error('Erro ao buscar prova:', error);
      return null;
    }

    return data;
  }

  /**
   * Adicionar questão à prova (professor)
   */
  async adicionarQuestao(provaId: string, questao: Omit<QuestaoData, 'numero'>): Promise<void> {
    const prova = await this.buscarProva(provaId);
    if (!prova) throw new Error('Prova não encontrada');

    const questoes = prova.questoes || [];
    const novaQuestao: QuestaoData = {
      ...questao,
      numero: questoes.length + 1
    };

    const { error } = await supabase
      .from('provas')
      .update({ questoes: [...questoes, novaQuestao] })
      .eq('id', provaId);

    if (error) throw error;
  }

  /**
   * Atualizar questão existente (professor)
   */
  async atualizarQuestao(provaId: string, numero: number, questaoAtualizada: Partial<QuestaoData>): Promise<void> {
    const prova = await this.buscarProva(provaId);
    if (!prova) throw new Error('Prova não encontrada');

    const questoes = prova.questoes || [];
    const index = questoes.findIndex(q => q.numero === numero);
    if (index === -1) throw new Error('Questão não encontrada');

    questoes[index] = { ...questoes[index], ...questaoAtualizada };

    const { error } = await supabase
      .from('provas')
      .update({ questoes })
      .eq('id', provaId);

    if (error) throw error;
  }

  /**
   * Remover questão (professor)
   */
  async removerQuestao(provaId: string, numero: number): Promise<void> {
    const prova = await this.buscarProva(provaId);
    if (!prova) throw new Error('Prova não encontrada');

    let questoes = prova.questoes || [];
    questoes = questoes.filter(q => q.numero !== numero);
    
    // Renumerar questões
    questoes = questoes.map((q, index) => ({ ...q, numero: index + 1 }));

    const { error } = await supabase
      .from('provas')
      .update({ questoes })
      .eq('id', provaId);

    if (error) throw error;
  }

  /**
   * Deletar prova (professor)
   */
  async deletarProva(provaId: string): Promise<void> {
    const { error } = await supabase
      .from('provas')
      .delete()
      .eq('id', provaId);

    if (error) throw error;
  }

  /**
   * Corrigir prova (professor)
   */
  async corrigirProva(
    provaId: string, 
    respostasCorrigidas: RespostaData[], 
    notaFinal: number,
    comentarioGeral?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('provas')
      .update({
        respostas: respostasCorrigidas,
        nota_final: notaFinal,
        comentario_geral: comentarioGeral,
        status: 'corrigida',
        data_correcao: new Date().toISOString()
      })
      .eq('id', provaId);

    if (error) throw error;
  }

  // ==================== ALUNO ====================
  
  /**
   * Listar provas disponíveis para o aluno
   */
  async listarProvasAluno(): Promise<AlunoProvaLista[]> {
    const { data, error } = await supabase
      .from('aluno_provas_lista')
      .select('*')
      .order('data_criacao', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Responder prova (aluno)
   */
  async responderProva(provaId: string, respostas: Omit<RespostaData, 'correta' | 'pontos_obtidos' | 'comentario'>[]): Promise<void> {
    const { error } = await supabase
      .from('provas')
      .update({
        respostas,
        status: 'respondida',
        data_resposta: new Date().toISOString()
      })
      .eq('id', provaId);

    if (error) throw error;
  }

  /**
   * Atualizar resposta individual (aluno - antes de submeter)
   */
  async salvarRascunhoResposta(provaId: string, numeroQuestao: number, resposta: string): Promise<void> {
    const prova = await this.buscarProva(provaId);
    if (!prova) throw new Error('Prova não encontrada');

    let respostas = prova.respostas || [];
    const index = respostas.findIndex(r => r.numero === numeroQuestao);

    if (index === -1) {
      respostas.push({ numero: numeroQuestao, resposta });
    } else {
      respostas[index].resposta = resposta;
    }

    const { error } = await supabase
      .from('provas')
      .update({ respostas })
      .eq('id', provaId);

    if (error) throw error;
  }

  // ==================== UTILS ====================

  /**
   * Listar alunos disponíveis (para professor escolher ao criar prova)
   */
  async listarAlunosDisponiveis(): Promise<Array<{ id: string; nome: string; email: string }>> {
    const { data, error } = await supabase
      .from('professor_alunos_view')
      .select('id, nome, email')
      .order('nome');
    
    if (error) {
      console.error('Erro ao buscar alunos:', error);
      return [];
    }

    return (data || []).map(aluno => ({
      id: aluno.id,
      nome: aluno.nome || aluno.email,
      email: aluno.email || ''
    }));
  }
}

export const provasService = new SupabaseProvasServiceSimples();
