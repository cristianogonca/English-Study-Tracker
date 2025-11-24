// ============================================
// SISTEMA DE PROVAS/TESTES - SIMPLIFICADO
// ============================================

export enum TipoQuestao {
  MULTIPLA_ESCOLHA = 'multipla_escolha',
  DISSERTATIVA = 'dissertativa'
}

export enum StatusProva {
  PENDENTE = 'pendente',
  RESPONDIDA = 'respondida',
  CORRIGIDA = 'corrigida'
}

// Estrutura de questão dentro do JSON
export interface QuestaoData {
  numero: number;
  tipo: TipoQuestao;
  enunciado: string;
  opcoes?: string[]; // Para múltipla escolha
  resposta_correta?: string; // Gabarito (professor vê)
  pontos: number;
}

// Estrutura de resposta dentro do JSON
export interface RespostaData {
  numero: number;
  resposta: string;
  correta?: boolean; // null = não corrigida, true/false = corrigida
  pontos_obtidos?: number;
  comentario?: string; // Feedback do professor
}

// Tabela principal
export interface Prova {
  id: string;
  professor_id: string;
  aluno_id: string;
  titulo: string;
  descricao?: string;
  data_criacao: string;
  data_limite?: string;
  questoes: QuestaoData[];
  respostas: RespostaData[];
  status: StatusProva;
  data_resposta?: string;
  data_correcao?: string;
  nota_final?: number;
  comentario_geral?: string;
}

// View para professor (lista de provas dos alunos)
export interface ProfessorProvaLista {
  id: string;
  titulo: string;
  descricao?: string;
  data_criacao: string;
  data_limite?: string;
  status: StatusProva;
  nota_final?: number;
  aluno_id: string;
  aluno_nome: string;
  aluno_email: string;
  total_questoes: number;
  status_texto: string;
}

// View para aluno (suas provas)
export interface AlunoProvaLista {
  id: string;
  titulo: string;
  descricao?: string;
  data_criacao: string;
  data_limite?: string;
  status: StatusProva;
  nota_final?: number;
  comentario_geral?: string;
  total_questoes: number;
  status_texto: string;
}
