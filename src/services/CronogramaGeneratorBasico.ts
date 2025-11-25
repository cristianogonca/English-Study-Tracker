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
    id: `tarefa-basico-${contadorTarefa}-${Math.random().toString(36).substr(2, 9)}`,
    titulo,
    descricao,
    tipo,
    nivel,
    duracaoEstimada: duracao,
    ordem
  };
}

export function gerarCronogramaBasico(dataInicio: Date): DiaEstudo[] {
  const dias: DiaEstudo[] = [];
  const dataBase = new Date(dataInicio);
  const nivel = NivelDificuldade.BASICO;

  for (let i = 0; i < 365; i++) {
    const numero = i + 1;
    const mes = Math.ceil(numero / 30);
    const semana = Math.ceil(numero / 7);
    const fase = Math.ceil(mes / 4);
    
    const dataAtual = new Date(dataBase);
    dataAtual.setDate(dataBase.getDate() + i);

    let tarefas: Tarefa[] = [];
    let tituloSemana = `Week ${semana} - Basic English`;

    // Padrão semanal com tarefas detalhadas
    const diaSemana = numero % 7;
    
    if (diaSemana === 1) {
      // Segunda - Gramática
      tarefas.push(criarTarefa('Grammar Study', 'Study basic grammar rules and structures', TipoConteudo.GRAMATICA, nivel, 30, 1));
      tarefas.push(criarTarefa('Grammar Exercises', 'Complete practice exercises', TipoConteudo.GRAMATICA, nivel, 30, 2));
      tituloSemana = `Week ${semana} - Basic Grammar`;
    } else if (diaSemana === 2) {
      // Terça - Vocabulário
      tarefas.push(criarTarefa('New Vocabulary', 'Learn 10 new words with examples', TipoConteudo.VOCABULARIO, nivel, 20, 1));
      tarefas.push(criarTarefa('Create Sentences', 'Create 3 sentences with each word', TipoConteudo.VOCABULARIO, nivel, 30, 2));
      tarefas.push(criarTarefa('Flashcard Review', 'Review previous words', TipoConteudo.VOCABULARIO, nivel, 10, 3));
      tituloSemana = `Week ${semana} - Vocabulary Building`;
    } else if (diaSemana === 3) {
      // Quarta - Listening
      tarefas.push(criarTarefa('Listen to Dialogue', 'Listen to basic conversation', TipoConteudo.LISTENING, nivel, 30, 1));
      tarefas.push(criarTarefa('Note Taking', 'Write down what you heard', TipoConteudo.LISTENING, nivel, 20, 2));
      tarefas.push(criarTarefa('Vocabulary from Audio', 'List new words from listening', TipoConteudo.LISTENING, nivel, 10, 3));
      tituloSemana = `Week ${semana} - Listening Practice`;
    } else if (diaSemana === 4) {
      // Quinta - Reading
      tarefas.push(criarTarefa('Read Text', 'Read short text or story', TipoConteudo.READING, nivel, 30, 1));
      tarefas.push(criarTarefa('Summarize', 'Write a summary of what you read', TipoConteudo.READING, nivel, 20, 2));
      tarefas.push(criarTarefa('Note New Words', 'List unknown words and meanings', TipoConteudo.READING, nivel, 10, 3));
      tituloSemana = `Week ${semana} - Reading Comprehension`;
    } else if (diaSemana === 5) {
      // Sexta - Speaking
      tarefas.push(criarTarefa('Pronunciation Practice', 'Practice pronunciation of key words', TipoConteudo.SPEAKING, nivel, 20, 1));
      tarefas.push(criarTarefa('Record Yourself', 'Record yourself speaking on a topic', TipoConteudo.SPEAKING, nivel, 30, 2));
      tarefas.push(criarTarefa('Self-Evaluation', 'Listen and identify areas to improve', TipoConteudo.SPEAKING, nivel, 10, 3));
      tituloSemana = `Week ${semana} - Speaking Skills`;
    } else if (diaSemana === 6) {
      // Sábado - Writing
      tarefas.push(criarTarefa('Plan Your Writing', 'Organize ideas before writing', TipoConteudo.WRITING, nivel, 15, 1));
      tarefas.push(criarTarefa('Write Composition', 'Write about daily routine or topic', TipoConteudo.WRITING, nivel, 35, 2));
      tarefas.push(criarTarefa('Review and Correct', 'Check for errors', TipoConteudo.WRITING, nivel, 10, 3));
      tituloSemana = `Week ${semana} - Writing Practice`;
    } else {
      // Domingo - Revisão
      tarefas.push(criarTarefa('Weekly Review', 'Review all content from the week', TipoConteudo.REVISAO, nivel, 40, 1));
      tarefas.push(criarTarefa('Self-Assessment', 'Take quiz on weekly topics', TipoConteudo.REVISAO, nivel, 20, 2));
      tituloSemana = `Week ${semana} - Weekly Review`;
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
