// tipos principais do app de ingles

export enum NivelDificuldade {
  BASICO = 'basico',
  INTERMEDIARIO = 'intermediario',
  AVANCADO = 'avancado'
}

export enum TipoConteudo {
  VOCABULARIO = 'vocabulario',
  GRAMATICA = 'gramatica',
  LISTENING = 'listening',
  READING = 'reading',
  SPEAKING = 'speaking',
  WRITING = 'writing',
  REVISAO = 'revisao'
}

export enum StatusTarefa {
  NAO_INICIADA = 'nao_iniciada',
  EM_PROGRESSO = 'em_progresso',
  CONCLUIDA = 'concluida',
  PULADA = 'pulada'
}

export enum DiaSemana {
  SEGUNDA = 1,
  TERCA = 2,
  QUARTA = 3,
  QUINTA = 4,
  SEXTA = 5,
  SABADO = 6,
  DOMINGO = 0
}

// tarefa individual de estudo
export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoConteudo;
  nivel: NivelDificuldade;
  duracaoEstimada: number; // minutos
  ordem: number;
  recursos?: string[];
  observacoes?: string;
}

// dia do cronograma
export interface DiaEstudo {
  id: string;
  numero: number; // dia 1, 2, 3...
  mes: number; // 1-12
  semana: number; // 1-52
  fase: number; // 1, 2 ou 3
  data?: string;
  tarefas: Tarefa[];
  tempoTotal: number;
  concluido: boolean;
  tituloSemana?: string; // "Fundamentos da Língua"
}

// progresso do usuario numa tarefa
export interface ProgressoTarefa {
  id?: string;
  tarefaId: string;
  dia?: number;
  diaNumero?: number;
  status: StatusTarefa;
  dataInicio?: string;
  dataConclusao?: string;
  tempoGasto: number;
  observacoes?: string;
  notas?: string;
  avaliacao?: number; // 1-5, quao dificil foi
}

// sessao de estudo (timer)
export interface SessaoEstudo {
  id: string;
  tarefaId?: string;
  dataInicio: string;
  dataFim?: string;
  duracao: number;
  pausas: number;
  concluida: boolean;
  conteudo?: string; // o que estudou
}

// registro diario de estudo
export interface RegistroDiario {
  id: string;
  data: string;
  minutosEstudados: number;
  conteudoEstudado: string[];
  dificuldades: string[];
  palavrasNovas: string[]; // IDs das palavras
  observacoes?: string;
  humor?: 'otimo' | 'bom' | 'regular' | 'ruim';
}

// palavra nova aprendida
export interface PalavraNova {
  id?: string;
  palavra: string;
  traducao: string;
  exemplo?: string;
  dataAprendida: string;
  revisada: boolean;
  acertos: number;
  erros: number;
  nivel: NivelDificuldade;
}

// checkpoint dentro do check semanal
export interface CheckpointSemanal {
  pergunta: string;
  resposta: 'sim' | 'nao' | 'parcial';
  nota?: number;
}

// check semanal
export interface CheckSemanal {
  id?: string;
  semana: number;
  dataInicio: string;
  dataFim: string;
  presenca: number; // percentual 0-100
  metaCumprida: boolean;
  minutosRealizados: number;
  minutosEsperados: number;
  evolucaoFala: 'sim' | 'nao' | 'parcial';
  palavrasAprendidas: number;
  checkpoints: CheckpointSemanal[];
  observacoes?: string;
}

// meta semanal automatica
export interface MetaSemanal {
  id: string;
  semana: number;
  metaMinutos: number;
  minutosRealizados: number;
  cumprida: boolean;
  diasRestantes: number;
  minutosRealocados: number;
  status: 'em_andamento' | 'cumprida' | 'atrasada' | 'realocada';
}

// fase do cronograma
export interface Fase {
  id: string;
  numero: number;
  nome: string;
  descricao: string;
  nivel: NivelDificuldade;
  mesInicio: number;
  mesFim: number;
  horasTotal: number;
  concluida: boolean;
  progresso: number;
}

// estatisticas gerais
export interface Estatisticas {
  diasEstudados: number;
  tempoTotalMinutos: number;
  horasAcumuladas: number;
  tarefasConcluidas: number;
  tarefasPendentes: number;
  sequenciaAtual: number;
  melhorSequencia: number;
  ultimoEstudo?: string;
  mediaMinutosDia: number;
  palavrasAprendidas: number;
  checkpointsConcluidos: number;
  faseAtual: number;
  progressoFaseAtual: number;
}

// config do usuario
export interface ConfigUsuario {
  nome: string;
  metaDiaria: number; // minutos por dia
  metaSemanal: number; // minutos por semana
  horaLembrete?: string;
  diasEstudo: DiaSemana[];
  dataInicio: string;
  nivelInicial: NivelDificuldade;
  duracaoPrograma?: number; // dias totais do programa (padrão 365)
}

// usuario do sistema
export interface Usuario {
  id: string;
  email: string;
  senha: string;
  nome: string;
  dataCriacao: string;
  ultimoAcesso: string;
  role?: 'aluno' | 'professor' | 'admin'; // NOVO: role do usuário
}

// sessao de autenticacao
export interface SessaoAuth {
  usuarioId: string;
  email: string;
  nome: string;
  dataLogin: string;
  role?: 'aluno' | 'professor' | 'admin'; // NOVO: role na sessão
}

// NOVO: Guia de estudos mensal (editável por professor)
export interface GuiaEstudosMes {
  id?: string;
  user_id?: string;
  mes: number; // 1-12
  titulo: string;
  objetivos: string[];
  gramatica: string[];
  vocabulario: string[];
  listening: string[];
  speaking: string[];
  reading: string[];
  writing: string[];
  check_final: string[];
  criado_em?: string;
  atualizado_em?: string;
}

// NOVO: View de alunos para professor
export interface AlunoView {
  id: string;
  nome: string;
  email: string;
  data_inicio?: string;
  nivel_alvo?: string;
  horas_semanais?: number;
  total_dias: number;
  dias_concluidos: number;
  meses_guia: number;
  minutos_estudados?: number;
  progresso_percentual?: number; // Progresso baseado em tempo estudado vs esperado
}

// ============================================
// SISTEMA DE PROVAS/TESTES
// ============================================

export enum TipoQuestao {
  MULTIPLA_ESCOLHA = 'multipla_escolha',
  DISSERTATIVA = 'dissertativa',
  VERDADEIRO_FALSO = 'verdadeiro_falso',
  PREENCHER_LACUNA = 'preencher_lacuna'
}

export enum StatusProva {
  NAO_INICIADA = 'nao_iniciada',
  DISPONIVEL = 'disponivel',
  EM_ANDAMENTO = 'em_andamento',
  AGUARDANDO_AVALIACAO = 'aguardando_avaliacao',
  AVALIADA = 'avaliada',
  EXPIRADA = 'expirada',
  NAO_DISPONIVEL = 'nao_disponivel'
}

export interface Prova {
  id: string;
  professor_id: string;
  titulo: string;
  descricao?: string;
  data_criacao: string;
  data_disponivel?: string;
  data_limite?: string;
  duracao_minutos?: number;
  ativa: boolean;
  peso: number;
}

export interface ProvaQuestao {
  id: string;
  prova_id: string;
  numero: number;
  tipo: TipoQuestao;
  enunciado: string;
  opcoes?: string[]; // Para múltipla escolha
  resposta_correta?: string;
  pontos: number;
}

export interface ProvaResposta {
  id?: string;
  prova_id: string;
  aluno_id: string;
  questao_id: string;
  resposta: string;
  correta?: boolean | null;
  pontos_obtidos?: number;
  comentario_professor?: string;
}

export interface ProvaSubmissao {
  id?: string;
  prova_id: string;
  aluno_id: string;
  data_inicio: string;
  data_submissao?: string;
  nota_total?: number;
  pontos_totais?: number;
  pontos_possiveis?: number;
  avaliada: boolean;
  comentario_geral?: string;
}

export interface AlunoProvaDisponivel {
  prova_id: string;
  titulo: string;
  descricao?: string;
  data_disponivel?: string;
  data_limite?: string;
  duracao_minutos?: number;
  peso: number;
  submissao_id?: string;
  data_inicio?: string;
  data_submissao?: string;
  nota_total?: number;
  avaliada: boolean;
  status: StatusProva;
  total_questoes: number;
}

export interface ProfessorProvaSubmissao {
  submissao_id: string;
  prova_id: string;
  prova_titulo: string;
  data_limite?: string;
  aluno_id: string;
  aluno_nome: string;
  aluno_email: string;
  data_inicio?: string;
  data_submissao?: string;
  nota_total?: number;
  pontos_totais?: number;
  pontos_possiveis?: number;
  avaliada: boolean;
  comentario_geral?: string;
  status: string;
}

// NOVO: Rotina Semanal Padrão (7 dias)
export interface AtividadeSemanal {
  id?: string;
  diaSemana: number; // 1-7 (segunda a domingo)
  nome: string;
  descricao: string;
  icone: string;
}
