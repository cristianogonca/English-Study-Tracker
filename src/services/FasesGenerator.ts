import { Fase, NivelDificuldade } from '../types';

export function gerarFases(): Fase[] {
  return [
    {
      numero: 1,
      nome: 'Fase 1: Básico',
      descricao: 'Fundamentos da língua inglesa',
      nivel: NivelDificuldade.BASICO,
      mesInicio: 1,
      mesFim: 4,
      horasTotal: 168, // 4 meses * 7h/semana * 4 semanas = 112h mínimo
      concluida: false,
      progresso: 0,
    },
    {
      numero: 2,
      nome: 'Fase 2: Intermediário',
      descricao: 'Construção de fluência e vocabulário expandido',
      nivel: NivelDificuldade.INTERMEDIARIO,
      mesInicio: 5,
      mesFim: 8,
      horasTotal: 168,
      concluida: false,
      progresso: 0,
    },
    {
      numero: 3,
      nome: 'Fase 3: Avançado',
      descricao: 'Domínio avançado e profissional',
      nivel: NivelDificuldade.AVANCADO,
      mesInicio: 9,
      mesFim: 12,
      horasTotal: 168,
      concluida: false,
      progresso: 0,
    },
  ];
}
