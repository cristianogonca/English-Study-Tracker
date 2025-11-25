import { DiaEstudo, Tarefa, TipoConteudo, NivelDificuldade } from '../types';

// Contador para IDs únicos
let contadorTarefa = 0;

// Helper para criar tarefa
function criarTarefa(
  titulo: string,
  descricao: string,
  tipo: TipoConteudo,
  nivel: NivelDificuldade,
  duracao: number,
  ordem: number
): Tarefa {
  contadorTarefa++;
  return {
    id: `tarefa-avanc-${contadorTarefa}-${Math.random().toString(36).substr(2, 9)}`,
    titulo,
    descricao,
    tipo,
    nivel,
    duracaoEstimada: duracao,
    ordem
  };
}

export function gerarCronogramaAvancado(dataInicio: Date): DiaEstudo[] {
  const dias: DiaEstudo[] = [];
  const dataBase = new Date(dataInicio);
  const nivel = NivelDificuldade.AVANCADO;

  for (let i = 0; i < 365; i++) {
    const numero = i + 1;
    const mes = Math.ceil(numero / 30);
    const semana = Math.ceil(numero / 7);
    const fase = Math.ceil(mes / 4);
    
    const dataAtual = new Date(dataBase);
    dataAtual.setDate(dataBase.getDate() + i);

    let tarefas: Tarefa[] = [];
    let tituloSemana = `Week ${semana} - Advanced English`;

    // Padrão semanal com tarefas detalhadas
    const diaSemana = numero % 7;
    
    if (diaSemana === 1) {
      // Segunda - Gramática Avançada
      tarefas.push(criarTarefa('Complex Grammar', 'Study nuanced grammatical structures', TipoConteudo.GRAMATICA, nivel, 30, 1));
      tarefas.push(criarTarefa('Analyze Usage', 'Analyze grammar usage in authentic texts', TipoConteudo.GRAMATICA, nivel, 30, 2));
      tituloSemana = `Week ${semana} - Advanced Grammar`;
    } else if (diaSemana === 2) {
      // Terça - Vocabulário Especializado
      tarefas.push(criarTarefa('Field-Specific Vocabulary', 'Learn 20+ specialized terms', TipoConteudo.VOCABULARIO, nivel, 25, 1));
      tarefas.push(criarTarefa('Academic Reading', 'Read materials using new vocabulary', TipoConteudo.VOCABULARIO, nivel, 25, 2));
      tarefas.push(criarTarefa('Mind Mapping', 'Create concept maps and associations', TipoConteudo.VOCABULARIO, nivel, 10, 3));
      tituloSemana = `Week ${semana} - Specialized Vocabulary`;
    } else if (diaSemana === 3) {
      // Quarta - Listening Crítico
      tarefas.push(criarTarefa('Academic Listening', 'Listen to lectures or debates', TipoConteudo.LISTENING, nivel, 30, 1));
      tarefas.push(criarTarefa('Detailed Notes', 'Take comprehensive notes', TipoConteudo.LISTENING, nivel, 20, 2));
      tarefas.push(criarTarefa('Language Analysis', 'Analyze language and rhetorical devices used', TipoConteudo.LISTENING, nivel, 10, 3));
      tituloSemana = `Week ${semana} - Critical Listening`;
    } else if (diaSemana === 4) {
      // Quinta - Leitura Acadêmica
      tarefas.push(criarTarefa('Academic Text', 'Read academic article or literature', TipoConteudo.READING, nivel, 40, 1));
      tarefas.push(criarTarefa('Critical Analysis', 'Annotate and analyze structure', TipoConteudo.READING, nivel, 20, 2));
      tituloSemana = `Week ${semana} - Academic Reading`;
    } else if (diaSemana === 5) {
      // Sexta - Speaking Avançado
      tarefas.push(criarTarefa('Complex Topic Prep', 'Research complex topic thoroughly', TipoConteudo.SPEAKING, nivel, 20, 1));
      tarefas.push(criarTarefa('Presentation', 'Record detailed presentation or discussion', TipoConteudo.SPEAKING, nivel, 30, 2));
      tarefas.push(criarTarefa('Self-Critique', 'Detailed analysis of performance', TipoConteudo.SPEAKING, nivel, 10, 3));
      tituloSemana = `Week ${semana} - Advanced Speaking`;
    } else if (diaSemana === 6) {
      // Sábado - Escrita Profissional
      tarefas.push(criarTarefa('Plan Structure', 'Outline detailed essay or article', TipoConteudo.WRITING, nivel, 20, 1));
      tarefas.push(criarTarefa('Professional Writing', 'Write essay, report, or article', TipoConteudo.WRITING, nivel, 40, 2));
      tituloSemana = `Week ${semana} - Professional Writing`;
    } else {
      // Domingo - Integração
      tarefas.push(criarTarefa('Comprehensive Review', 'Review all weekly content', TipoConteudo.REVISAO, nivel, 30, 1));
      tarefas.push(criarTarefa('Integrated Task', 'Complete multi-skill integration task', TipoConteudo.REVISAO, nivel, 20, 2));
      tarefas.push(criarTarefa('Reflection', 'Reflect on progress and set goals', TipoConteudo.REVISAO, nivel, 10, 3));
      tituloSemana = `Week ${semana} - Integration & Mastery`;
    }

    const tempoTotal = tarefas.reduce((acc, t) => acc + t.duracaoEstimada, 0);

    dias.push({
      id: `dia-${numero}`,
      numero,
      mes,
      semana,
      fase,
      data: dataAtual.toISOString().split('T')[0],
      tarefas,
      tempoTotal,
      concluido: false,
      tituloSemana
    });
  }

  return dias;
}
