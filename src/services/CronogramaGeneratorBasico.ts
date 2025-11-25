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

export function gerarCronogramaBasico(dataInicio: Date, duracaoDias: number = 365, metaDiaria: number = 60, diasEstudo: number[] = [1, 2, 3, 4, 5]): DiaEstudo[] {
  const dias: DiaEstudo[] = [];
  const dataBase = new Date(dataInicio);
  const nivel = NivelDificuldade.BASICO;

  let numero = 1; // Contador sequencial de aulas
  let diaCorrente = 0; // Dia corrido desde o início
  
  // Gerar cronograma apenas para os dias da semana selecionados
  while (diaCorrente < duracaoDias) {
    const dataAtual = new Date(dataBase);
    dataAtual.setDate(dataBase.getDate() + diaCorrente);
    const diaSemanaAtual = dataAtual.getDay();
    
    // Verifica se este dia da semana está nos dias de estudo
    if (diasEstudo.includes(diaSemanaAtual)) {
      // Calcular mês e semana baseado no número de aulas (não dias corridos)
      const aulasNoMes = diasEstudo.length * 4; // aulas por mês
      const mes = Math.ceil(numero / aulasNoMes);
      const semana = Math.ceil(numero / diasEstudo.length);
      const fase = 1; // Apenas 1 fase para nível básico

      let tarefas: Tarefa[] = [];
      let tituloSemana = `Week ${semana} - Basic English`;

      // Padrão cíclico com 6 tipos de aula
      const cicloDia = numero % 6;
    
      if (cicloDia === 1) {
        // Gramática
        const duracao1 = Math.round(metaDiaria * 0.5);
        const duracao2 = metaDiaria - duracao1;
        tarefas.push(criarTarefa('Grammar Study', 'Study basic grammar rules and structures', TipoConteudo.GRAMATICA, nivel, duracao1, 1));
        tarefas.push(criarTarefa('Grammar Exercises', 'Complete practice exercises', TipoConteudo.GRAMATICA, nivel, duracao2, 2));
        tituloSemana = `Week ${semana} - Basic Grammar`;
      } else if (cicloDia === 2) {
        // Vocabulário
        const duracaoVocab1 = Math.round(metaDiaria * 0.33);
        const duracaoVocab2 = Math.round(metaDiaria * 0.50);
        const duracaoVocab3 = metaDiaria - duracaoVocab1 - duracaoVocab2;
        tarefas.push(criarTarefa('New Vocabulary', 'Learn 10 new words with examples', TipoConteudo.VOCABULARIO, nivel, duracaoVocab1, 1));
        tarefas.push(criarTarefa('Create Sentences', 'Create 3 sentences with each word', TipoConteudo.VOCABULARIO, nivel, duracaoVocab2, 2));
        tarefas.push(criarTarefa('Flashcard Review', 'Review previous words', TipoConteudo.VOCABULARIO, nivel, duracaoVocab3, 3));
        tituloSemana = `Week ${semana} - Vocabulary Building`;
      } else if (cicloDia === 3) {
        // Listening
        const duracaoListen1 = Math.round(metaDiaria * 0.50);
        const duracaoListen2 = Math.round(metaDiaria * 0.33);
        const duracaoListen3 = metaDiaria - duracaoListen1 - duracaoListen2;
        tarefas.push(criarTarefa('Listen to Dialogue', 'Listen to basic conversation', TipoConteudo.LISTENING, nivel, duracaoListen1, 1));
        tarefas.push(criarTarefa('Note Taking', 'Write down what you heard', TipoConteudo.LISTENING, nivel, duracaoListen2, 2));
        tarefas.push(criarTarefa('Vocabulary from Audio', 'List new words from listening', TipoConteudo.LISTENING, nivel, duracaoListen3, 3));
        tituloSemana = `Week ${semana} - Listening Practice`;
      } else if (cicloDia === 4) {
        // Reading
        const duracaoRead1 = Math.round(metaDiaria * 0.50);
        const duracaoRead2 = Math.round(metaDiaria * 0.33);
        const duracaoRead3 = metaDiaria - duracaoRead1 - duracaoRead2;
        tarefas.push(criarTarefa('Read Text', 'Read short text or story', TipoConteudo.READING, nivel, duracaoRead1, 1));
        tarefas.push(criarTarefa('Summarize', 'Write a summary of what you read', TipoConteudo.READING, nivel, duracaoRead2, 2));
        tarefas.push(criarTarefa('Note New Words', 'List unknown words and meanings', TipoConteudo.READING, nivel, duracaoRead3, 3));
        tituloSemana = `Week ${semana} - Reading Comprehension`;
      } else if (cicloDia === 5) {
        // Speaking
        const duracaoSpeak1 = Math.round(metaDiaria * 0.33);
        const duracaoSpeak2 = Math.round(metaDiaria * 0.50);
        const duracaoSpeak3 = metaDiaria - duracaoSpeak1 - duracaoSpeak2;
        tarefas.push(criarTarefa('Pronunciation Practice', 'Practice pronunciation of key words', TipoConteudo.SPEAKING, nivel, duracaoSpeak1, 1));
        tarefas.push(criarTarefa('Record Yourself', 'Record yourself speaking on a topic', TipoConteudo.SPEAKING, nivel, duracaoSpeak2, 2));
        tarefas.push(criarTarefa('Self-Evaluation', 'Listen and identify areas to improve', TipoConteudo.SPEAKING, nivel, duracaoSpeak3, 3));
        tituloSemana = `Week ${semana} - Speaking Skills`;
      } else { // cicloDia === 0
        // Writing ou Revisão
        const duracaoWrite1 = Math.round(metaDiaria * 0.25);
        const duracaoWrite2 = Math.round(metaDiaria * 0.58);
        const duracaoWrite3 = metaDiaria - duracaoWrite1 - duracaoWrite2;
        tarefas.push(criarTarefa('Plan Your Writing', 'Organize ideas before writing', TipoConteudo.WRITING, nivel, duracaoWrite1, 1));
        tarefas.push(criarTarefa('Write Composition', 'Write about daily routine or topic', TipoConteudo.WRITING, nivel, duracaoWrite2, 2));
        tarefas.push(criarTarefa('Review and Correct', 'Check for errors', TipoConteudo.WRITING, nivel, duracaoWrite3, 3));
        tituloSemana = `Week ${semana} - Writing Practice`;
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
      
      numero++; // Incrementar apenas quando criar uma aula
    }
    
    diaCorrente++; // Sempre incrementar dia corrido
  }

  return dias;
}
