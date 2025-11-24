import { DiaEstudo } from '../types';

export function gerarCronogramaAvancado(dataInicio: Date): DiaEstudo[] {
  const dias: DiaEstudo[] = [];
  const dataBase = new Date(dataInicio);

  for (let i = 0; i < 365; i++) {
    const numero = i + 1;
    const mes = Math.ceil(numero / 30);
    const semana = Math.ceil(numero / 7);
    const fase = Math.ceil(mes / 4);
    
    const dataAtual = new Date(dataBase);
    dataAtual.setDate(dataBase.getDate() + i);

    let tarefas: string[] = [];
    let tempoTotal = 60;
    let tituloSemana = `Week ${semana} - Advanced English`;

    // Padrão avançado para todos os dias (por enquanto igual)
    if (numero % 7 === 1) {
      tarefas = ['📚 Vocabulary Study', '🎧 Listening Practice', '📖 Reading Exercise'];
      tituloSemana = `Week ${semana} - Advanced Vocabulary`;
    } else if (numero % 7 === 2) {
      tarefas = ['✍️ Grammar Practice', '🗣️ Speaking Exercise', '📝 Writing Activity'];
      tituloSemana = `Week ${semana} - Advanced Grammar`;
    } else if (numero % 7 === 3) {
      tarefas = ['📚 New Words', '🎧 Audio Comprehension', '💬 Conversation Practice'];
      tituloSemana = `Week ${semana} - Communication Skills`;
    } else if (numero % 7 === 4) {
      tarefas = ['📖 Text Reading', '✍️ Grammar Review', '🎯 Pronunciation'];
      tituloSemana = `Week ${semana} - Reading & Pronunciation`;
    } else if (numero % 7 === 5) {
      tarefas = ['🗣️ Dialogue Practice', '📝 Short Writing', '🎧 Listening'];
      tituloSemana = `Week ${semana} - Active Practice`;
    } else if (numero % 7 === 6) {
      tarefas = ['📚 Vocabulary Review', '✍️ Exercise Practice', '🎬 Video Activity'];
      tituloSemana = `Week ${semana} - Review & Media`;
    } else {
      tarefas = ['🔄 Weekly Review', '📊 Self-Assessment', '🎯 Next Week Prep'];
      tituloSemana = `Week ${semana} - Weekly Review`;
    }

    dias.push({
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
