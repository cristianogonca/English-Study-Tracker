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

export function gerarCronogramaAvancado(dataInicio: Date, duracaoDias: number = 365, metaDiaria: number = 60, diasEstudo: number[] = [1, 2, 3, 4, 5]): DiaEstudo[] {
  const dias: DiaEstudo[] = [];
  const dataBase = new Date(dataInicio);
  const nivel = NivelDificuldade.AVANCADO;

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
      let tituloSemana = `Week ${semana} - Advanced English`;

      const cicloDia = numero % 6;
    
      if (cicloDia === 1) {
      // Gramática - 2 tarefas
      const duracao1 = Math.round(metaDiaria * 0.5);
      const duracao2 = metaDiaria - duracao1;
      tarefas.push(criarTarefa('Complex Grammar', 'Study nuanced grammatical structures', TipoConteudo.GRAMATICA, nivel, duracao1, 1));
      tarefas.push(criarTarefa('Analyze Usage', 'Analyze grammar usage in authentic texts', TipoConteudo.GRAMATICA, nivel, duracao2, 2));
      tituloSemana = `Week ${semana} - Advanced Grammar`;
    } else if (cicloDia === 2) {
      // Vocabulário - 3 tarefas
      const duracao1 = Math.round(metaDiaria * 0.42);
      const duracao2 = Math.round(metaDiaria * 0.42);
      const duracao3 = metaDiaria - duracao1 - duracao2;
      tarefas.push(criarTarefa('Field-Specific Vocabulary', 'Learn 20+ specialized terms', TipoConteudo.VOCABULARIO, nivel, duracao1, 1));
      tarefas.push(criarTarefa('Academic Reading', 'Read materials using new vocabulary', TipoConteudo.VOCABULARIO, nivel, duracao2, 2));
      tarefas.push(criarTarefa('Mind Mapping', 'Create concept maps and associations', TipoConteudo.VOCABULARIO, nivel, duracao3, 3));
      tituloSemana = `Week ${semana} - Specialized Vocabulary`;
    } else if (cicloDia === 3) {
      // Listening - 3 tarefas
      const duracao1 = Math.round(metaDiaria * 0.50);
      const duracao2 = Math.round(metaDiaria * 0.33);
      const duracao3 = metaDiaria - duracao1 - duracao2;
      tarefas.push(criarTarefa('Academic Listening', 'Listen to lectures or documentaries', TipoConteudo.LISTENING, nivel, duracao1, 1));
      tarefas.push(criarTarefa('Critical Analysis', 'Analyze arguments and perspectives', TipoConteudo.LISTENING, nivel, duracao2, 2));
      tarefas.push(criarTarefa('Note Organization', 'Create structured notes', TipoConteudo.LISTENING, nivel, duracao3, 3));
      tituloSemana = `Week ${semana} - Academic Listening`;
    } else if (cicloDia === 4) {
      // Reading - 3 tarefas
      const duracao1 = Math.round(metaDiaria * 0.50);
      const duracao2 = Math.round(metaDiaria * 0.33);
      const duracao3 = metaDiaria - duracao1 - duracao2;
      tarefas.push(criarTarefa('Complex Text', 'Read academic or professional text', TipoConteudo.READING, nivel, duracao1, 1));
      tarefas.push(criarTarefa('Deep Analysis', 'Analyze style, tone, and arguments', TipoConteudo.READING, nivel, duracao2, 2));
      tarefas.push(criarTarefa('Research Notes', 'Document insights and references', TipoConteudo.READING, nivel, duracao3, 3));
      tituloSemana = `Week ${semana} - Critical Reading`;
    } else if (cicloDia === 5) {
      // Speaking - 3 tarefas
      const duracao1 = Math.round(metaDiaria * 0.33);
      const duracao2 = Math.round(metaDiaria * 0.50);
      const duracao3 = metaDiaria - duracao1 - duracao2;
      tarefas.push(criarTarefa('Presentation Prep', 'Prepare structured presentation', TipoConteudo.SPEAKING, nivel, duracao1, 1));
      tarefas.push(criarTarefa('Advanced Speaking', 'Record detailed presentation or debate', TipoConteudo.SPEAKING, nivel, duracao2, 2));
      tarefas.push(criarTarefa('Professional Feedback', 'Self-evaluate like a professional', TipoConteudo.SPEAKING, nivel, duracao3, 3));
      tituloSemana = `Week ${semana} - Professional Speaking`;
    } else {
      // Writing - 3 tarefas
      const duracao1 = Math.round(metaDiaria * 0.33);
      const duracao2 = Math.round(metaDiaria * 0.50);
      const duracao3 = metaDiaria - duracao1 - duracao2;
      tarefas.push(criarTarefa('Research & Outline', 'Research topic and create detailed outline', TipoConteudo.WRITING, nivel, duracao1, 1));
      tarefas.push(criarTarefa('Academic Writing', 'Write academic essay or professional article', TipoConteudo.WRITING, nivel, duracao2, 2));
      tarefas.push(criarTarefa('Peer Review', 'Review with critical eye', TipoConteudo.WRITING, nivel, duracao3, 3));
      tituloSemana = `Week ${semana} - Advanced Writing`;
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
