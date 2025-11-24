import { DiaEstudo, Tarefa, TipoConteudo, NivelDificuldade } from '../types';
import { gerarCronogramaBasico } from './CronogramaGeneratorBasico';
import { gerarCronogramaIntermediario } from './CronogramaGeneratorIntermediario';
import { gerarCronogramaAvancado } from './CronogramaGeneratorAvancado';

// gerador de cronograma completo de 365 dias baseado no nível
export function gerarCronogramaCompleto(
  dataInicio: string = new Date().toISOString().split('T')[0],
  nivel: NivelDificuldade = NivelDificuldade.BASICO
): DiaEstudo[] {
  console.log('🗓️ Gerando cronograma com data de início:', dataInicio, 'Nível:', nivel);
  
  // Parse correto da data (formato YYYY-MM-DD)
  const [ano, mes, dia] = dataInicio.split('-').map(Number);
  const dataBase = new Date(ano, mes - 1, dia);
  dataBase.setHours(0, 0, 0, 0);
  
  console.log('📅 Data base convertida:', dataBase.toLocaleDateString('pt-BR'));

  // Selecionar gerador baseado no nível
  switch (nivel) {
    case NivelDificuldade.BASICO:
      return gerarCronogramaBasico(dataBase);
    case NivelDificuldade.INTERMEDIARIO:
      return gerarCronogramaIntermediario(dataBase);
    case NivelDificuldade.AVANCADO:
      return gerarCronogramaAvancado(dataBase);
    default:
      return gerarCronogramaBasico(dataBase);
  }
}

// Mantém a função antiga para compatibilidade (usa cronograma detalhado)
export function gerarCronogramaDetalhadoCompleto(dataInicio: string = new Date().toISOString().split('T')[0]): DiaEstudo[] {
  console.log('🗓️ Gerando cronograma com data de início:', dataInicio);
  const cronograma: DiaEstudo[] = [];
  let diaNumero = 1;
  
  // Parse correto da data (formato YYYY-MM-DD)
  const [ano, mes, dia] = dataInicio.split('-').map(Number);
  const dataBase = new Date(ano, mes - 1, dia);
  dataBase.setHours(0, 0, 0, 0);
  
  console.log('📅 Data base convertida:', dataBase.toLocaleDateString('pt-BR'));

  // MES 1 - FUNDAMENTOS ABSOLUTOS
  adicionarDiasMes1(cronograma, diaNumero, dataBase);
  diaNumero += 30;

  // MES 2 - CONSTRUCAO DE FRASES
  adicionarDiasMes2(cronograma, diaNumero, dataBase);
  diaNumero += 30;

  // MES 3 - ACAO E MOVIMENTO
  adicionarDiasMes3(cronograma, diaNumero, dataBase);
  diaNumero += 30;

  // MES 4 - PASSADO
  adicionarDiasMes4(cronograma, diaNumero, dataBase);
  diaNumero += 30;

  // MES 5 - FLUENCIA E NARRATIVA
  adicionarDiasMes5(cronograma, diaNumero, dataBase);
  diaNumero += 30;

  // MES 6 - EXPERIENCIAS E REALIDADE
  adicionarDiasMes6(cronograma, diaNumero, dataBase);
  diaNumero += 30;

  // MES 7 - DEBATES E OPINIOES
  adicionarDiasMes7(cronograma, diaNumero, dataBase);
  diaNumero += 31;

  // MES 8 - INGLES PROFISSIONAL
  adicionarDiasMes8(cronograma, diaNumero, dataBase);
  diaNumero += 31;

  // MES 9 - ESTRUTURA AVANCADA
  adicionarDiasMes9(cronograma, diaNumero, dataBase);
  diaNumero += 30;

  // MES 10 - ESCRITA REAL
  adicionarDiasMes10(cronograma, diaNumero, dataBase);
  diaNumero += 31;

  // MES 11 - INTERPRETACAO PROFUNDA
  adicionarDiasMes11(cronograma, diaNumero, dataBase);
  diaNumero += 30;

  // MES 12 - CONSOLIDACAO
  adicionarDiasMes12(cronograma, diaNumero, dataBase);

  return cronograma;
}

// helper para criar tarefa
function criarTarefa(
  titulo: string,
  descricao: string,
  tipo: TipoConteudo,
  nivel: NivelDificuldade,
  duracao: number,
  ordem: number
): Tarefa {
  return {
    id: `tarefa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    titulo,
    descricao,
    tipo,
    nivel,
    duracaoEstimada: duracao,
    ordem
  };
}

// helper para criar dia
function criarDia(
  numero: number,
  mes: number,
  semana: number,
  fase: number,
  tarefas: Tarefa[],
  dataBase: Date,
  tituloSemana?: string
): DiaEstudo {
  const tempoTotal = tarefas.reduce((acc, t) => acc + t.duracaoEstimada, 0);
  
  // calcular data real do dia
  const dataReal = new Date(dataBase);
  dataReal.setDate(dataBase.getDate() + (numero - 1));
  
  return {
    id: `dia-${numero}`,
    numero,
    mes,
    semana,
    fase,
    data: dataReal.toISOString().split('T')[0],
    tarefas,
    tempoTotal,
    concluido: false,
    tituloSemana
  };
}

// ========== MES 1 - FUNDAMENTOS ==========
function adicionarDiasMes1(cronograma: DiaEstudo[], inicio: number, dataBase: Date): void {
  const nivel = NivelDificuldade.BASICO;
  const mes = 1;
  const fase = 1;

  // Semana 1 - Alfabeto e Verb To Be
  for (let i = 0; i < 7; i++) {
    const semana = Math.floor((inicio + i - 1) / 7) + 1;
    const tarefas: Tarefa[] = [];
    
    if (i === 0) { // Dia 1 - Gramática
      tarefas.push(criarTarefa('Alfabeto e Pronúncia', 'Estudar o alfabeto inglês e pronúncia básica', TipoConteudo.GRAMATICA, nivel, 30, 1));
      tarefas.push(criarTarefa('Verb To Be - Afirmativa', 'Estudar a forma afirmativa do verbo to be', TipoConteudo.GRAMATICA, nivel, 30, 2));
    } else if (i === 1) { // Dia 2 - Vocabulário
      tarefas.push(criarTarefa('Saudações', 'Aprender 10 formas de cumprimento', TipoConteudo.VOCABULARIO, nivel, 20, 1));
      tarefas.push(criarTarefa('Criar Frases', 'Criar 3 frases com cada saudação', TipoConteudo.VOCABULARIO, nivel, 40, 2));
    } else if (i === 2) { // Dia 3 - Listening
      tarefas.push(criarTarefa('BBC Learning English', 'Ouvir diálogos simples nível 1', TipoConteudo.LISTENING, nivel, 30, 1));
      tarefas.push(criarTarefa('Anotar Palavras', 'Listar 10 palavras reconhecidas', TipoConteudo.LISTENING, nivel, 30, 2));
    } else if (i === 3) { // Dia 4 - Reading
      tarefas.push(criarTarefa('Ler Diálogo Simples', 'Ler pequeno diálogo de apresentação', TipoConteudo.READING, nivel, 30, 1));
      tarefas.push(criarTarefa('Resumir Texto', 'Fazer resumo em 4 linhas', TipoConteudo.READING, nivel, 30, 2));
    } else if (i === 4) { // Dia 5 - Speaking
      tarefas.push(criarTarefa('Gravar Apresentação', 'Se apresentar em inglês (nome, idade)', TipoConteudo.SPEAKING, nivel, 20, 1));
      tarefas.push(criarTarefa('Praticar Pronúncia', 'Repetir frases em voz alta', TipoConteudo.SPEAKING, nivel, 40, 2));
    } else if (i === 5) { // Dia 6 - Writing
      tarefas.push(criarTarefa('Escrever About Me', 'Escrever 5 frases sobre você', TipoConteudo.WRITING, nivel, 60, 1));
    } else { // Dia 7 - Revisão
      tarefas.push(criarTarefa('Revisar Semana', 'Revisar todo conteúdo da semana 1', TipoConteudo.REVISAO, nivel, 40, 1));
      tarefas.push(criarTarefa('Testar Conhecimento', 'Fazer exercícios de fixação', TipoConteudo.REVISAO, nivel, 20, 2));
    }
    
    cronograma.push(criarDia(inicio + i, mes, semana, fase, tarefas, dataBase, 'Fundamentos da Língua'));
  }

  // Semanas 2-4 seguem modelo similar com tópicos diferentes
  for (let semana = 2; semana <= 4; semana++) {
    for (let dia = 0; dia < 7; dia++) {
      const numero = inicio + ((semana - 1) * 7) + dia;
      const semanaNum = Math.floor((numero - 1) / 7) + 1;
      const tarefas: Tarefa[] = [];
      
      // Padrão semanal: Gramática, Vocab, Listening, Reading, Speaking, Writing, Revisão
      if (dia === 0) {
        tarefas.push(criarTarefa('Gramática da Semana', 'Estudar pronomes e artigos', TipoConteudo.GRAMATICA, nivel, 60, 1));
      } else if (dia === 1) {
        tarefas.push(criarTarefa('Vocabulário Diário', 'Aprender 10 palavras novas', TipoConteudo.VOCABULARIO, nivel, 60, 1));
      } else if (dia === 2) {
        tarefas.push(criarTarefa('Prática de Listening', 'Ouvir e anotar palavras', TipoConteudo.LISTENING, nivel, 60, 1));
      } else if (dia === 3) {
        tarefas.push(criarTarefa('Leitura Guiada', 'Ler texto curto e resumir', TipoConteudo.READING, nivel, 60, 1));
      } else if (dia === 4) {
        tarefas.push(criarTarefa('Prática Oral', 'Gravar audio respondendo perguntas', TipoConteudo.SPEAKING, nivel, 60, 1));
      } else if (dia === 5) {
        tarefas.push(criarTarefa('Escrita Criativa', 'Escrever sobre rotina', TipoConteudo.WRITING, nivel, 60, 1));
      } else {
        tarefas.push(criarTarefa('Revisão Semanal', 'Revisar e consolidar aprendizado', TipoConteudo.REVISAO, nivel, 60, 1));
      }
      
      cronograma.push(criarDia(numero, mes, semanaNum, fase, tarefas, dataBase, `Semana ${semana} - Básico`));
    }
  }
}

// ========== MES 2 - CONSTRUCAO DE FRASES ==========
function adicionarDiasMes2(cronograma: DiaEstudo[], inicio: number, dataBase: Date): void {
  const nivel = NivelDificuldade.BASICO;
  const mes = 2;
  const fase = 1;

  for (let semana = 1; semana <= 4; semana++) {
    for (let dia = 0; dia < 7; dia++) {
      const numero = inicio + ((semana - 1) * 7) + dia;
      const semanaNum = Math.floor((numero - 1) / 7) + 1;
      const tarefas: Tarefa[] = [];
      
      if (dia === 0) {
        tarefas.push(criarTarefa('Simple Present', 'Estudar Simple Present todas as pessoas', TipoConteudo.GRAMATICA, nivel, 60, 1));
      } else if (dia === 1) {
        tarefas.push(criarTarefa('Vocabulário: Casa', 'Aprender palavras sobre casa e móveis', TipoConteudo.VOCABULARIO, nivel, 60, 1));
      } else if (dia === 2) {
        tarefas.push(criarTarefa('Listening: Rotina', 'Ouvir diálogos sobre rotina diária', TipoConteudo.LISTENING, nivel, 60, 1));
      } else if (dia === 3) {
        tarefas.push(criarTarefa('Reading: Descrições', 'Ler textos descritivos de casas', TipoConteudo.READING, nivel, 60, 1));
      } else if (dia === 4) {
        tarefas.push(criarTarefa('Speaking: Minha Casa', 'Descrever sua casa em inglês', TipoConteudo.SPEAKING, nivel, 60, 1));
      } else if (dia === 5) {
        tarefas.push(criarTarefa('Writing: Daily Routine', 'Escrever sobre sua rotina completa', TipoConteudo.WRITING, nivel, 60, 1));
      } else {
        tarefas.push(criarTarefa('Revisão Semanal', 'Consolidar Simple Present e vocabulário', TipoConteudo.REVISAO, nivel, 60, 1));
      }
      
      cronograma.push(criarDia(numero, mes, semanaNum, fase, tarefas, dataBase, 'Construção de Frases'));
    }
  }

  // adicionar 2 dias extras para completar 30
  for (let i = 0; i < 2; i++) {
    const numero = inicio + 28 + i;
    const semanaNum = Math.floor((numero - 1) / 7) + 1;
    const tarefas = [criarTarefa('Revisão Mensal', 'Revisar todo o mês 2', TipoConteudo.REVISAO, nivel, 60, 1)];
    cronograma.push(criarDia(numero, mes, semanaNum, fase, tarefas, dataBase, 'Revisão Mês 2'));
  }
}

// ========== MES 3 - ACAO E MOVIMENTO ==========
function adicionarDiasMes3(cronograma: DiaEstudo[], inicio: number, dataBase: Date): void {
  const nivel = NivelDificuldade.BASICO;
  const mes = 3;
  const fase = 1;

  for (let semana = 1; semana <= 4; semana++) {
    for (let dia = 0; dia < 7; dia++) {
      const numero = inicio + ((semana - 1) * 7) + dia;
      const semanaNum = Math.floor((numero - 1) / 7) + 1;
      const tarefas: Tarefa[] = [];
      
      if (dia === 0) {
        tarefas.push(criarTarefa('Present Continuous', 'Estudar Present Continuous', TipoConteudo.GRAMATICA, nivel, 60, 1));
      } else if (dia === 1) {
        tarefas.push(criarTarefa('Vocabulário: Ações', 'Verbos de ação do dia a dia', TipoConteudo.VOCABULARIO, nivel, 60, 1));
      } else if (dia === 2) {
        tarefas.push(criarTarefa('Listening: Ações', 'Ouvir pessoas descrevendo ações', TipoConteudo.LISTENING, nivel, 60, 1));
      } else if (dia === 3) {
        tarefas.push(criarTarefa('Reading: Histórias', 'Ler histórias com ações', TipoConteudo.READING, nivel, 60, 1));
      } else if (dia === 4) {
        tarefas.push(criarTarefa('Speaking: O que está fazendo', 'Descrever ações acontecendo agora', TipoConteudo.SPEAKING, nivel, 60, 1));
      } else if (dia === 5) {
        tarefas.push(criarTarefa('Writing: Diálogo', 'Escrever diálogo de restaurante', TipoConteudo.WRITING, nivel, 60, 1));
      } else {
        tarefas.push(criarTarefa('Revisão Semanal', 'Can/Must + Present Continuous', TipoConteudo.REVISAO, nivel, 60, 1));
      }
      
      cronograma.push(criarDia(numero, mes, semanaNum, fase, tarefas, dataBase, 'Ação e Movimento'));
    }
  }

  for (let i = 0; i < 2; i++) {
    const numero = inicio + 28 + i;
    const semanaNum = Math.floor((numero - 1) / 7) + 1;
    const tarefas = [criarTarefa('Revisão Mensal', 'Revisar todo o mês 3', TipoConteudo.REVISAO, nivel, 60, 1)];
    cronograma.push(criarDia(numero, mes, semanaNum, fase, tarefas, dataBase, 'Revisão Mês 3'));
  }
}

// ========== MES 4 - PASSADO ==========
function adicionarDiasMes4(cronograma: DiaEstudo[], inicio: number, dataBase: Date): void {
  const nivel = NivelDificuldade.BASICO;
  const mes = 4;
  const fase = 1;

  for (let semana = 1; semana <= 4; semana++) {
    for (let dia = 0; dia < 7; dia++) {
      const numero = inicio + ((semana - 1) * 7) + dia;
      const semanaNum = Math.floor((numero - 1) / 7) + 1;
      const tarefas: Tarefa[] = [];
      
      if (dia === 0) {
        tarefas.push(criarTarefa('Past Simple', 'Verbos regulares e irregulares', TipoConteudo.GRAMATICA, nivel, 60, 1));
      } else if (dia === 1) {
        tarefas.push(criarTarefa('Vocabulário: Viagem', 'Palavras sobre viagem e experiências', TipoConteudo.VOCABULARIO, nivel, 60, 1));
      } else if (dia === 2) {
        tarefas.push(criarTarefa('Listening: Histórias', 'Ouvir relatos no passado', TipoConteudo.LISTENING, nivel, 60, 1));
      } else if (dia === 3) {
        tarefas.push(criarTarefa('Reading: Biografias', 'Ler biografias simples', TipoConteudo.READING, nivel, 60, 1));
      } else if (dia === 4) {
        tarefas.push(criarTarefa('Speaking: Último fim de semana', 'Contar o que fez no fim de semana', TipoConteudo.SPEAKING, nivel, 60, 1));
      } else if (dia === 5) {
        tarefas.push(criarTarefa('Writing: My Last Weekend', 'Escrever sobre último fim de semana', TipoConteudo.WRITING, nivel, 60, 1));
      } else {
        tarefas.push(criarTarefa('Revisão Semanal', 'Consolidar Past Simple', TipoConteudo.REVISAO, nivel, 60, 1));
      }
      
      cronograma.push(criarDia(numero, mes, semanaNum, fase, tarefas, dataBase, 'Passado'));
    }
  }

  for (let i = 0; i < 2; i++) {
    const numero = inicio + 28 + i;
    const semanaNum = Math.floor((numero - 1) / 7) + 1;
    const tarefas = [criarTarefa('Revisão Fase 1', 'Revisar toda a Fase 1 - Básico', TipoConteudo.REVISAO, nivel, 60, 1)];
    cronograma.push(criarDia(numero, mes, semanaNum, fase, tarefas, dataBase, 'Revisão Fase 1'));
  }
}

// ========== MES 5-12 (aplicar mesmo padrão) ==========
function adicionarDiasMes5(cronograma: DiaEstudo[], inicio: number, dataBase: Date): void {
  adicionarMesPadrao(cronograma, inicio, 5, 2, NivelDificuldade.INTERMEDIARIO, 'Fluência e Narrativa', 30, dataBase);
}

function adicionarDiasMes6(cronograma: DiaEstudo[], inicio: number, dataBase: Date): void {
  adicionarMesPadrao(cronograma, inicio, 6, 2, NivelDificuldade.INTERMEDIARIO, 'Experiências e Realidade', 30, dataBase);
}

function adicionarDiasMes7(cronograma: DiaEstudo[], inicio: number, dataBase: Date): void {
  adicionarMesPadrao(cronograma, inicio, 7, 2, NivelDificuldade.INTERMEDIARIO, 'Debates e Opiniões', 31, dataBase);
}

function adicionarDiasMes8(cronograma: DiaEstudo[], inicio: number, dataBase: Date): void {
  adicionarMesPadrao(cronograma, inicio, 8, 2, NivelDificuldade.INTERMEDIARIO, 'Inglês Profissional', 31, dataBase);
}

function adicionarDiasMes9(cronograma: DiaEstudo[], inicio: number, dataBase: Date): void {
  adicionarMesPadrao(cronograma, inicio, 9, 3, NivelDificuldade.AVANCADO, 'Estrutura Avançada', 30, dataBase);
}

function adicionarDiasMes10(cronograma: DiaEstudo[], inicio: number, dataBase: Date): void {
  adicionarMesPadrao(cronograma, inicio, 10, 3, NivelDificuldade.AVANCADO, 'Escrita Real', 31, dataBase);
}

function adicionarDiasMes11(cronograma: DiaEstudo[], inicio: number, dataBase: Date): void {
  adicionarMesPadrao(cronograma, inicio, 11, 3, NivelDificuldade.AVANCADO, 'Interpretação Profunda', 30, dataBase);
}

function adicionarDiasMes12(cronograma: DiaEstudo[], inicio: number, dataBase: Date): void {
  adicionarMesPadrao(cronograma, inicio, 12, 3, NivelDificuldade.AVANCADO, 'Consolidação Final', 35, dataBase);
}

// funcao generica para meses 5-12
function adicionarMesPadrao(
  cronograma: DiaEstudo[],
  inicio: number,
  mes: number,
  fase: number,
  nivel: NivelDificuldade,
  tema: string,
  totalDias: number,
  dataBase: Date
): void {
  const semanas = Math.floor(totalDias / 7);
  const diasExtras = totalDias % 7;

  for (let semana = 1; semana <= semanas; semana++) {
    for (let dia = 0; dia < 7; dia++) {
      const numero = inicio + ((semana - 1) * 7) + dia;
      const semanaNum = Math.floor((numero - 1) / 7) + 1;
      const tarefas: Tarefa[] = [];
      
      // padrao semanal mantido
      if (dia === 0) {
        tarefas.push(criarTarefa('Gramática Avançada', 'Estudar tópico gramatical do mês', TipoConteudo.GRAMATICA, nivel, 60, 1));
      } else if (dia === 1) {
        tarefas.push(criarTarefa('Vocabulário Especializado', 'Aprender vocabulário do tema', TipoConteudo.VOCABULARIO, nivel, 60, 1));
      } else if (dia === 2) {
        tarefas.push(criarTarefa('Listening Avançado', 'Ouvir conteúdo autêntico', TipoConteudo.LISTENING, nivel, 60, 1));
      } else if (dia === 3) {
        tarefas.push(criarTarefa('Reading Complexo', 'Ler artigos e textos complexos', TipoConteudo.READING, nivel, 60, 1));
      } else if (dia === 4) {
        tarefas.push(criarTarefa('Speaking Fluente', 'Praticar fluência e naturalidade', TipoConteudo.SPEAKING, nivel, 60, 1));
      } else if (dia === 5) {
        tarefas.push(criarTarefa('Writing Avançado', 'Escrever textos estruturados', TipoConteudo.WRITING, nivel, 60, 1));
      } else {
        tarefas.push(criarTarefa('Revisão Semanal', 'Consolidar aprendizado da semana', TipoConteudo.REVISAO, nivel, 60, 1));
      }
      
      cronograma.push(criarDia(numero, mes, semanaNum, fase, tarefas, dataBase, tema));
    }
  }

  // adicionar dias extras
  for (let i = 0; i < diasExtras; i++) {
    const numero = inicio + (semanas * 7) + i;
    const semanaNum = Math.floor((numero - 1) / 7) + 1;
    const tarefas = [criarTarefa('Revisão Extra', `Revisar conteúdo do mês ${mes}`, TipoConteudo.REVISAO, nivel, 60, 1)];
    cronograma.push(criarDia(numero, mes, semanaNum, fase, tarefas, dataBase, tema));
  }
}
