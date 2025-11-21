import {
  DiaEstudo,
  ProgressoTarefa,
  SessaoEstudo,
  RegistroDiario,
  PalavraNova,
  CheckSemanal,
  MetaSemanal,
  Fase,
  Estatisticas,
  ConfigUsuario,
  NivelDificuldade,
  StatusTarefa,
  Tarefa
} from '../types';
import AuthService from './AuthService';

// chaves do localStorage (agora com prefixo de usuario)
const getKeys = (usuarioId: string) => ({
  CRONOGRAMA: `english_tracker_${usuarioId}_cronograma`,
  PROGRESSO: `english_tracker_${usuarioId}_progresso`,
  SESSOES: `english_tracker_${usuarioId}_sessoes`,
  REGISTROS: `english_tracker_${usuarioId}_registros`,
  VOCABULARIO: `english_tracker_${usuarioId}_vocabulario`,
  CHECKS: `english_tracker_${usuarioId}_checks`,
  METAS: `english_tracker_${usuarioId}_metas`,
  FASES: `english_tracker_${usuarioId}_fases`,
  CONFIG: `english_tracker_${usuarioId}_config`
});

class StudyService {
  // obter usuario logado
  private getUsuarioId(): string {
    const sessao = AuthService.getSessao();
    if (!sessao) throw new Error('Usuario nao autenticado');
    return sessao.usuarioId;
  }

  private getKeys() {
    return getKeys(this.getUsuarioId());
  }

  // ========== CRONOGRAMA ==========
  
  getCronograma(): DiaEstudo[] {
    const dados = localStorage.getItem(this.getKeys().CRONOGRAMA);
    return dados ? JSON.parse(dados) : [];
  }

  salvarCronograma(cronograma: DiaEstudo[]): void {
    localStorage.setItem(this.getKeys().CRONOGRAMA, JSON.stringify(cronograma));
  }

  getDiaPorNumero(numero: number): DiaEstudo | undefined {
    const cronograma = this.getCronograma();
    return cronograma.find(dia => dia.numero === numero);
  }

  getDiasPorMes(mes: number): DiaEstudo[] {
    const cronograma = this.getCronograma();
    return cronograma.filter(dia => dia.mes === mes);
  }

  getDiasPorSemana(semana: number): DiaEstudo[] {
    const cronograma = this.getCronograma();
    return cronograma.filter(dia => dia.semana === semana);
  }

  marcarDiaConcluido(numero: number): void {
    const cronograma = this.getCronograma();
    const dia = cronograma.find(d => d.numero === numero);
    if (dia) {
      dia.concluido = true;
      dia.data = new Date().toISOString();
      this.salvarCronograma(cronograma);
    }
  }

  // ========== PROGRESSO ==========

  getProgresso(): ProgressoTarefa[] {
    const dados = localStorage.getItem(this.getKeys().PROGRESSO);
    return dados ? JSON.parse(dados) : [];
  }

  salvarProgresso(progresso: ProgressoTarefa[]): void {
    localStorage.setItem(this.getKeys().PROGRESSO, JSON.stringify(progresso));
  }

  iniciarTarefa(tarefaId: string): void {
    const progresso = this.getProgresso();
    const prog = progresso.find(p => p.tarefaId === tarefaId);
    
    if (prog) {
      prog.status = StatusTarefa.EM_PROGRESSO;
      prog.dataInicio = new Date().toISOString();
    } else {
      progresso.push({
        id: this.gerarId(),
        tarefaId,
        status: StatusTarefa.EM_PROGRESSO,
        dataInicio: new Date().toISOString(),
        tempoGasto: 0
      });
    }
    
    this.salvarProgresso(progresso);
  }

  concluirTarefa(tarefaId: string, tempoGasto: number, avaliacao?: number): void {
    const progresso = this.getProgresso();
    const prog = progresso.find(p => p.tarefaId === tarefaId);
    
    if (prog) {
      prog.status = StatusTarefa.CONCLUIDA;
      prog.dataConclusao = new Date().toISOString();
      prog.tempoGasto = tempoGasto;
      prog.avaliacao = avaliacao;
      this.salvarProgresso(progresso);
    }
  }

  // ========== SESSÕES ==========

  getSessoes(): SessaoEstudo[] {
    const dados = localStorage.getItem(this.getKeys().SESSOES);
    return dados ? JSON.parse(dados) : [];
  }

  salvarSessoes(sessoes: SessaoEstudo[]): void {
    localStorage.setItem(this.getKeys().SESSOES, JSON.stringify(sessoes));
  }

  iniciarSessao(tarefaId?: string): string {
    const sessoes = this.getSessoes();
    const novaSessao: SessaoEstudo = {
      id: this.gerarId(),
      tarefaId,
      dataInicio: new Date().toISOString(),
      duracao: 0,
      pausas: 0,
      concluida: false
    };
    
    sessoes.push(novaSessao);
    this.salvarSessoes(sessoes);
    return novaSessao.id;
  }

  finalizarSessao(sessaoId: string, conteudo?: string): void {
    const sessoes = this.getSessoes();
    const sessao = sessoes.find(s => s.id === sessaoId);
    
    if (sessao) {
      sessao.dataFim = new Date().toISOString();
      sessao.concluida = true;
      sessao.conteudo = conteudo;
      
      // calcular duracao em minutos
      const inicio = new Date(sessao.dataInicio).getTime();
      const fim = new Date(sessao.dataFim).getTime();
      sessao.duracao = Math.floor((fim - inicio) / 60000);
      
      this.salvarSessoes(sessoes);
    }
  }

  adicionarPausa(sessaoId: string): void {
    const sessoes = this.getSessoes();
    const sessao = sessoes.find(s => s.id === sessaoId);
    
    if (sessao) {
      sessao.pausas++;
      this.salvarSessoes(sessoes);
    }
  }

  // ========== REGISTROS DIÁRIOS ==========

  getRegistros(): RegistroDiario[] {
    const dados = localStorage.getItem(this.getKeys().REGISTROS);
    return dados ? JSON.parse(dados) : [];
  }

  salvarRegistros(registros: RegistroDiario[]): void {
    localStorage.setItem(this.getKeys().REGISTROS, JSON.stringify(registros));
  }

  adicionarRegistro(registro: Omit<RegistroDiario, 'id'>): void {
    const registros = this.getRegistros();
    registros.push({
      ...registro,
      id: this.gerarId()
    });
    this.salvarRegistros(registros);
  }

  getRegistroPorData(data: string): RegistroDiario | undefined {
    const registros = this.getRegistros();
    return registros.find(r => r.data === data);
  }

  // ========== VOCABULÁRIO ==========

  getVocabulario(): PalavraNova[] {
    const dados = localStorage.getItem(this.getKeys().VOCABULARIO);
    return dados ? JSON.parse(dados) : [];
  }

  salvarVocabulario(palavras: PalavraNova[]): void {
    localStorage.setItem(this.getKeys().VOCABULARIO, JSON.stringify(palavras));
  }

  adicionarPalavra(palavra: Omit<PalavraNova, 'id' | 'acertos' | 'erros' | 'revisada'>): void {
    const vocabulario = this.getVocabulario();
    vocabulario.push({
      ...palavra,
      id: this.gerarId(),
      acertos: 0,
      erros: 0,
      revisada: false
    });
    this.salvarVocabulario(vocabulario);
  }

  marcarPalavraRevisada(palavraId: string, acertou: boolean): void {
    const vocabulario = this.getVocabulario();
    const palavra = vocabulario.find(p => p.id === palavraId);
    
    if (palavra) {
      palavra.revisada = true;
      if (acertou) {
        palavra.acertos++;
      } else {
        palavra.erros++;
      }
      this.salvarVocabulario(vocabulario);
    }
  }

  getPalavrasPorNivel(nivel: NivelDificuldade): PalavraNova[] {
    return this.getVocabulario().filter(p => p.nivel === nivel);
  }

  getPalavrasNaoRevisadas(): PalavraNova[] {
    return this.getVocabulario().filter(p => !p.revisada);
  }

  resetarPalavra(palavraId: string): void {
    const vocabulario = this.getVocabulario();
    const palavra = vocabulario.find(p => p.id === palavraId);
    
    if (palavra) {
      palavra.revisada = false;
      palavra.acertos = 0;
      palavra.erros = 0;
      this.salvarVocabulario(vocabulario);
    }
  }

  deletarPalavra(palavraId: string): void {
    const vocabulario = this.getVocabulario();
    const novoVocabulario = vocabulario.filter(p => p.id !== palavraId);
    this.salvarVocabulario(novoVocabulario);
  }

  // ========== CHECKS SEMANAIS ==========

  getChecks(): CheckSemanal[] {
    const dados = localStorage.getItem(this.getKeys().CHECKS);
    return dados ? JSON.parse(dados) : [];
  }

  salvarChecks(checks: CheckSemanal[]): void {
    localStorage.setItem(this.getKeys().CHECKS, JSON.stringify(checks));
  }

  adicionarCheck(check: Omit<CheckSemanal, 'id'>): void {
    const checks = this.getChecks();
    checks.push({
      ...check,
      id: this.gerarId()
    });
    this.salvarChecks(checks);
  }

  getCheckPorSemana(semana: number): CheckSemanal | undefined {
    const checks = this.getChecks();
    return checks.find(c => c.semana === semana);
  }

  // ========== METAS SEMANAIS ==========

  getMetas(): MetaSemanal[] {
    const dados = localStorage.getItem(this.getKeys().METAS);
    return dados ? JSON.parse(dados) : [];
  }

  salvarMetas(metas: MetaSemanal[]): void {
    localStorage.setItem(this.getKeys().METAS, JSON.stringify(metas));
  }

  getMetaAtual(): MetaSemanal | undefined {
    const semanaAtual = this.getSemanaAtual();
    return this.getMetas().find(m => m.semana === semanaAtual);
  }

  atualizarMetaSemanal(semana: number, minutosRealizados: number): void {
    const metas = this.getMetas();
    let meta = metas.find(m => m.semana === semana);
    
    if (!meta) {
      // criar nova meta
      meta = {
        id: this.gerarId(),
        semana,
        metaMinutos: 420, // 7h por semana
        minutosRealizados: 0,
        cumprida: false,
        diasRestantes: 7,
        minutosRealocados: 0,
        status: 'em_andamento'
      };
      metas.push(meta);
    }
    
    meta.minutosRealizados = minutosRealizados;
    meta.cumprida = minutosRealizados >= meta.metaMinutos;
    meta.status = meta.cumprida ? 'cumprida' : 'em_andamento';
    
    this.salvarMetas(metas);
  }

  realocarMinutos(semana: number, diasRestantes: number): void {
    const metas = this.getMetas();
    const meta = metas.find(m => m.semana === semana);
    
    if (meta && diasRestantes > 0) {
      const minutosRestantes = meta.metaMinutos - meta.minutosRealizados;
      meta.minutosRealocados = Math.ceil(minutosRestantes / diasRestantes);
      meta.diasRestantes = diasRestantes;
      meta.status = 'realocada';
      
      this.salvarMetas(metas);
    }
  }

  // ========== FASES ==========

  getFases(): Fase[] {
    const dados = localStorage.getItem(this.getKeys().FASES);
    if (dados) {
      return JSON.parse(dados);
    }
    
    // criar fases padrao se nao existir
    const fasesPadrao: Fase[] = [
      {
        id: 'fase-1',
        numero: 1,
        nome: 'Básico',
        descricao: 'Fundamentos da língua inglesa',
        nivel: NivelDificuldade.BASICO,
        mesInicio: 1,
        mesFim: 4,
        horasTotal: 120,
        concluida: false,
        progresso: 0
      },
      {
        id: 'fase-2',
        numero: 2,
        nome: 'Intermediário',
        descricao: 'Fluência e narrativa complexa',
        nivel: NivelDificuldade.INTERMEDIARIO,
        mesInicio: 5,
        mesFim: 8,
        horasTotal: 120,
        concluida: false,
        progresso: 0
      },
      {
        id: 'fase-3',
        numero: 3,
        nome: 'Avançado',
        descricao: 'Proficiência e refinamento',
        nivel: NivelDificuldade.AVANCADO,
        mesInicio: 9,
        mesFim: 12,
        horasTotal: 125,
        concluida: false,
        progresso: 0
      }
    ];
    
    this.salvarFases(fasesPadrao);
    return fasesPadrao;
  }

  salvarFases(fases: Fase[]): void {
    localStorage.setItem(this.getKeys().FASES, JSON.stringify(fases));
  }

  atualizarProgressoFase(numeroFase: number, progresso: number): void {
    const fases = this.getFases();
    const fase = fases.find(f => f.numero === numeroFase);
    
    if (fase) {
      fase.progresso = progresso;
      fase.concluida = progresso >= 100;
      this.salvarFases(fases);
    }
  }

  // ========== CONFIG ==========

  getConfig(): ConfigUsuario | null {
    const dados = localStorage.getItem(this.getKeys().CONFIG);
    return dados ? JSON.parse(dados) : null;
  }

  salvarConfig(config: ConfigUsuario): void {
    localStorage.setItem(this.getKeys().CONFIG, JSON.stringify(config));
  }

  // ========== ESTATÍSTICAS ==========

  calcularEstatisticas(): Estatisticas {
    const registros = this.getRegistros();
    const progresso = this.getProgresso();
    const vocabulario = this.getVocabulario();
    const checks = this.getChecks();
    const config = this.getConfig();
    
    // dias estudados
    const diasEstudados = registros.length;
    
    // tempo total
    const tempoTotalMinutos = registros.reduce((acc, r) => acc + r.minutosEstudados, 0);
    const horasAcumuladas = Math.floor(tempoTotalMinutos / 60);
    
    // tarefas
    const tarefasConcluidas = progresso.filter(p => p.status === StatusTarefa.CONCLUIDA).length;
    const tarefasPendentes = progresso.filter(p => p.status === StatusTarefa.NAO_INICIADA).length;
    
    // sequencia
    const { sequenciaAtual, melhorSequencia } = this.calcularSequencia(registros);
    
    // ultimo estudo
    const ultimoRegistro = registros.length > 0 
      ? registros[registros.length - 1].data 
      : undefined;
    
    // media
    const mediaMinutosDia = diasEstudados > 0 
      ? Math.round(tempoTotalMinutos / diasEstudados) 
      : 0;
    
    // vocabulario
    const palavrasAprendidas = vocabulario.length;
    
    // checkpoints
    const checkpointsConcluidos = checks.length;
    
    // fase atual
    const faseAtual = this.getFaseAtual();
    const progressoFaseAtual = faseAtual ? faseAtual.progresso : 0;
    
    return {
      diasEstudados,
      tempoTotalMinutos,
      horasAcumuladas,
      tarefasConcluidas,
      tarefasPendentes,
      sequenciaAtual,
      melhorSequencia,
      ultimoEstudo: ultimoRegistro,
      mediaMinutosDia,
      palavrasAprendidas,
      checkpointsConcluidos,
      faseAtual: faseAtual?.numero || 1,
      progressoFaseAtual
    };
  }

  private calcularSequencia(registros: RegistroDiario[]): { sequenciaAtual: number; melhorSequencia: number } {
    if (registros.length === 0) {
      return { sequenciaAtual: 0, melhorSequencia: 0 };
    }
    
    // ordenar por data
    const ordenados = [...registros].sort((a, b) => 
      new Date(a.data).getTime() - new Date(b.data).getTime()
    );
    
    let sequenciaAtual = 1;
    let melhorSequencia = 1;
    let sequenciaTemp = 1;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    for (let i = 1; i < ordenados.length; i++) {
      const dataAnterior = new Date(ordenados[i - 1].data);
      const dataAtual = new Date(ordenados[i].data);
      
      dataAnterior.setHours(0, 0, 0, 0);
      dataAtual.setHours(0, 0, 0, 0);
      
      const diferencaDias = Math.floor(
        (dataAtual.getTime() - dataAnterior.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (diferencaDias === 1) {
        sequenciaTemp++;
        if (sequenciaTemp > melhorSequencia) {
          melhorSequencia = sequenciaTemp;
        }
      } else {
        sequenciaTemp = 1;
      }
    }
    
    // verificar se a sequencia atual ainda ta ativa
    const ultimaData = new Date(ordenados[ordenados.length - 1].data);
    ultimaData.setHours(0, 0, 0, 0);
    
    const diferencaUltimo = Math.floor(
      (hoje.getTime() - ultimaData.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    sequenciaAtual = diferencaUltimo <= 1 ? sequenciaTemp : 0;
    
    return { sequenciaAtual, melhorSequencia };
  }

  private getFaseAtual(): Fase | undefined {
    const config = this.getConfig();
    if (!config) return undefined;
    
    const dataInicio = new Date(config.dataInicio);
    const hoje = new Date();
    
    const mesesPassados = Math.floor(
      (hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24 * 30)
    ) + 1;
    
    const fases = this.getFases();
    return fases.find(f => mesesPassados >= f.mesInicio && mesesPassados <= f.mesFim);
  }

  private getSemanaAtual(): number {
    const config = this.getConfig();
    if (!config) return 1;
    
    const dataInicio = new Date(config.dataInicio);
    const hoje = new Date();
    
    const diferencaDias = Math.floor(
      (hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return Math.floor(diferencaDias / 7) + 1;
  }

  // ========== UTILITÁRIOS ==========

  private gerarId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  limparTodosDados(): void {
    const keys = this.getKeys();
    Object.values(keys).forEach(key => localStorage.removeItem(key));
  }
}

export default new StudyService();
