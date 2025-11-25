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
      // Gramática - 2 tarefas
      const duracao1 = Math.round(metaDiaria * 0.5);
      const duracao2 = metaDiaria - duracao1;
      tarefas.push(criarTarefa('Advanced Grammar', 'Study intermediate grammar structures', TipoConteudo.GRAMATICA, nivel, duracao1, 1));
      tarefas.push(criarTarefa('Complex Exercises', 'Complete advanced practice exercises', TipoConteudo.GRAMATICA, nivel, duracao2, 2));
      tituloSemana = `Week ${semana} - Intermediate Grammar`;
    } else if (cicloDia === 2) {
      // Vocabulário - 3 tarefas
      const duracao1 = Math.round(metaDiaria * 0.33);
      const duracao2 = Math.round(metaDiaria * 0.50);
      const duracao3 = metaDiaria - duracao1 - duracao2;
      tarefas.push(criarTarefa('Specialized Vocabulary', 'Learn 15 topic-specific words', TipoConteudo.VOCABULARIO, nivel, duracao1, 1));
      tarefas.push(criarTarefa('Contextual Usage', 'Use new words in paragraphs', TipoConteudo.VOCABULARIO, nivel, duracao2, 2));
      tarefas.push(criarTarefa('Collocations Practice', 'Study word combinations', TipoConteudo.VOCABULARIO, nivel, duracao3, 3));
      tituloSemana = `Week ${semana} - Vocabulary Expansion`;
    } else if (cicloDia === 3) {
      // Listening - 3 tarefas
      const duracao1 = Math.round(metaDiaria * 0.50);
      const duracao2 = Math.round(metaDiaria * 0.33);
      const duracao3 = metaDiaria - duracao1 - duracao2;
      tarefas.push(criarTarefa('Authentic Listening', 'Listen to TED talks or podcasts', TipoConteudo.LISTENING, nivel, duracao1, 1));
      tarefas.push(criarTarefa('Detailed Summary', 'Summarize main points and details', TipoConteudo.LISTENING, nivel, duracao2, 2));
      tarefas.push(criarTarefa('Discussion Questions', 'Answer comprehension questions', TipoConteudo.LISTENING, nivel, duracao3, 3));
      tituloSemana = `Week ${semana} - Listening Comprehension`;
    } else if (cicloDia === 4) {
      // Reading - 3 tarefas
      const duracao1 = Math.round(metaDiaria * 0.50);
      const duracao2 = Math.round(metaDiaria * 0.33);
      const duracao3 = metaDiaria - duracao1 - duracao2;
      tarefas.push(criarTarefa('Read Article', 'Read intermediate level article or text', TipoConteudo.READING, nivel, duracao1, 1));
      tarefas.push(criarTarefa('Analyze Structure', 'Analyze text organization and vocabulary', TipoConteudo.READING, nivel, duracao2, 2));
      tarefas.push(criarTarefa('Critical Response', 'Write critical analysis', TipoConteudo.READING, nivel, duracao3, 3));
      tituloSemana = `Week ${semana} - Reading Analysis`;
    } else if (cicloDia === 5) {
      // Speaking - 3 tarefas
      const duracao1 = Math.round(metaDiaria * 0.33);
      const duracao2 = Math.round(metaDiaria * 0.50);
      const duracao3 = metaDiaria - duracao1 - duracao2;
      tarefas.push(criarTarefa('Topic Preparation', 'Research and prepare topic to discuss', TipoConteudo.SPEAKING, nivel, duracao1, 1));
      tarefas.push(criarTarefa('Extended Speaking', 'Record 3-5 minute monologue or dialogue', TipoConteudo.SPEAKING, nivel, duracao2, 2));
      tarefas.push(criarTarefa('Detailed Evaluation', 'Analyze fluency and accuracy', TipoConteudo.SPEAKING, nivel, duracao3, 3));
      tituloSemana = `Week ${semana} - Speaking Fluency`;
    } else {
      // Writing - 3 tarefas
      const duracao1 = Math.round(metaDiaria * 0.25);
      const duracao2 = Math.round(metaDiaria * 0.58);
      const duracao3 = metaDiaria - duracao1 - duracao2;
      tarefas.push(criarTarefa('Essay Planning', 'Outline and structure your essay', TipoConteudo.WRITING, nivel, duracao1, 1));
      tarefas.push(criarTarefa('Write Essay', 'Write structured essay or article', TipoConteudo.WRITING, nivel, duracao2, 2));
      tarefas.push(criarTarefa('Edit and Revise', 'Review for coherence and accuracy', TipoConteudo.WRITING, nivel, duracao3, 3));
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
