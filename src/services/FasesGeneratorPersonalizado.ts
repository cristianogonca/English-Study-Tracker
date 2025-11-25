import { Fase, NivelDificuldade } from '../types';

export function gerarFasePersonalizada(
  nivel: NivelDificuldade, 
  duracaoDias: number, 
  metaDiaria: number = 60
): Fase[] {
  // Calcular horas totais baseado na duração e meta diária
  const minutosTotal = duracaoDias * metaDiaria;
  const horasTotal = Math.round(minutosTotal / 60);
  
  return [
    {
      numero: 1,
      nome: `Fase Única: ${nivel}`,
      descricao: `Programa personalizado para o nível ${nivel}`,
      nivel,
      mesInicio: 1,
      mesFim: Math.ceil(duracaoDias / 30),
      horasTotal,
      concluida: false,
      progresso: 0,
    }
  ];
}
