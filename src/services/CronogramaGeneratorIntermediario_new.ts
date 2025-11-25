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
    id: `tarefa-inter-${contadorTarefa}-${Math.random().toString(36).substr(2, 9)}`,
    titulo,
    descricao,
    tipo,
    nivel,
    duracaoEstimada: duracao,
    ordem
  };
}

export function gerarCronogramaIntermediario(dataInicio: Date, duracaoDias: number = 365, metaDiaria: number = 60, diasEstudo: number[] = [1, 2, 3, 4, 5]): DiaEstudo[] {
  const dias: DiaEstudo[] = [];
  const dataBase = new Date(dataInicio);
  const nivel = NivelDificuldade.INTERMEDIARIO;

  let numero = 1;
  let diaCorrente = 0;
  
  while (diaCorrente < duracaoDias) {
    const dataAtual = new Date(dataBase);
    dataAtual.setDate(dataBase.getDate() + diaCorrente);
    const diaSemanaAtual = dataAtual.getDay();
    
    if (diasEstudo.includes(diaSemanaAtual)) {
      const aulasNoMes = diasEstudo.length * 4;
      const mes = Math.ceil(numero / aulasNoMes);
      const semana = Math.ceil(numero / diasEstudo.length);
      const fase = 1;

      let tarefas: Tarefa[] = [];
      let tituloSemana = `Week ${semana} - Intermediate English`;

      const cicloDia = numero % 6;
    
      if (cicloDia === 1) {
        tarefas.push(criarTarefa('Advanced Grammar', 'Study intermediate grammar structures', TipoConteudo.GRAMATICA, nivel, 30, 1));
        tarefas.push(criarTarefa('Complex Exercises', 'Complete advanced practice exercises', TipoConteudo.GRAMATICA, nivel, 30, 2));
        tituloSemana = `Week ${semana} - Intermediate Grammar`;
      } else if (cicloDia === 2) {
        tarefas.push(criarTarefa('Specialized Vocabulary', 'Learn 15 topic-specific words', TipoConteudo.VOCABULARIO, nivel, 20, 1));
        tarefas.push(criarTarefa('Contextual Usage', 'Use new words in paragraphs', TipoConteudo.VOCABULARIO, nivel, 30, 2));
        tarefas.push(criarTarefa('Collocations Practice', 'Study word combinations', TipoConteudo.VOCABULARIO, nivel, 10, 3));
        tituloSemana = `Week ${semana} - Vocabulary Expansion`;
      } else if (cicloDia === 3) {
        tarefas.push(criarTarefa('Authentic Listening', 'Listen to TED talks or podcasts', TipoConteudo.LISTENING, nivel, 30, 1));
        tarefas.push(criarTarefa('Detailed Summary', 'Summarize main points and details', TipoConteudo.LISTENING, nivel, 20, 2));
        tarefas.push(criarTarefa('Discussion Questions', 'Answer comprehension questions', TipoConteudo.LISTENING, nivel, 10, 3));
        tituloSemana = `Week ${semana} - Listening Comprehension`;
      } else if (cicloDia === 4) {
        tarefas.push(criarTarefa('Read Article', 'Read intermediate level article or text', TipoConteudo.READING, nivel, 30, 1));
        tarefas.push(criarTarefa('Analyze Structure', 'Analyze text organization and vocabulary', TipoConteudo.READING, nivel, 20, 2));
        tarefas.push(criarTarefa('Critical Response', 'Write critical analysis', TipoConteudo.READING, nivel, 10, 3));
        tituloSemana = `Week ${semana} - Reading Analysis`;
      } else if (cicloDia === 5) {
        tarefas.push(criarTarefa('Topic Preparation', 'Research and prepare topic to discuss', TipoConteudo.SPEAKING, nivel, 20, 1));
        tarefas.push(criarTarefa('Extended Speaking', 'Record 3-5 minute monologue or dialogue', TipoConteudo.SPEAKING, nivel, 30, 2));
        tarefas.push(criarTarefa('Detailed Evaluation', 'Analyze fluency and accuracy', TipoConteudo.SPEAKING, nivel, 10, 3));
        tituloSemana = `Week ${semana} - Speaking Fluency`;
      } else {
        tarefas.push(criarTarefa('Essay Planning', 'Outline and structure your essay', TipoConteudo.WRITING, nivel, 15, 1));
        tarefas.push(criarTarefa('Write Essay', 'Write structured essay or article', TipoConteudo.WRITING, nivel, 35, 2));
        tarefas.push(criarTarefa('Edit and Revise', 'Review for coherence and accuracy', TipoConteudo.WRITING, nivel, 10, 3));
        tituloSemana = `Week ${semana} - Writing Development`;
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
      
      numero++;
    }
    
    diaCorrente++;
  }

  return dias;
}
