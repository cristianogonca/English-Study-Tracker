import { useState, useEffect } from 'react';
import { useStudy } from '../contexts/StudyContext';
import SupabaseStudyService from '../services/SupabaseStudyService';
import SupabaseAuthService from '../services/SupabaseAuthService';
import { RegistroDiario } from '../types';
import './EstudarHoje.css';

// Chave localStorage para persistir timer
const TIMER_STORAGE_KEY = 'pomodoro_timer_state';

interface TimerState {
  minutos: number;
  segundos: number;
  ativo: boolean;
  pausado: boolean;
  iniciadoEm: number; // timestamp
  userId: string;
  minutosIniciais: number; // Tempo configurado ao iniciar
}

function EstudarHoje() {
  const { config } = useStudy();
  const [minutos, setMinutos] = useState(25);
  const [segundos, setSegundos] = useState(0);
  const [ativo, setAtivo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const [pausas, setPausas] = useState(0);
  const [timestampInicio, setTimestampInicio] = useState<number>(Date.now()); // Guarda quando iniciou
  const [carregouDoStorage, setCarregouDoStorage] = useState(false); // Flag para evitar limpar antes de carregar
  const [minutosIniciais, setMinutosIniciais] = useState(25); // Guarda quanto tempo foi configurado ao iniciar
  const [minutosEstudadosTotal, setMinutosEstudadosTotal] = useState(0); // Acumula tempo estudado nas sessões

  // formulario de registro
  const [conteudoEstudado, setConteudoEstudado] = useState('');
  const [dificuldades, setDificuldades] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [humor, setHumor] = useState<'otimo' | 'bom' | 'regular' | 'ruim'>('bom');

  // Carregar estado do timer do localStorage ao montar
  useEffect(() => {
    const carregarTimerSalvo = async () => {
      const usuario = await SupabaseAuthService.getUsuarioAtual();
      if (!usuario) return;

      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      console.log('🔍 [Timer] localStorage raw:', saved);
      
      if (saved) {
        try {
          const state: TimerState = JSON.parse(saved);
          console.log('📦 [Timer] State parsed:', state);
          
          // Verificar se é do mesmo usuário
          if (state.userId !== usuario.id) {
            console.log('❌ [Timer] Usuário diferente, limpando');
            localStorage.removeItem(TIMER_STORAGE_KEY);
            return;
          }

          // Restaurar minutosIniciais
          if (state.minutosIniciais) {
            setMinutosIniciais(state.minutosIniciais);
          }

          // Calcular tempo decorrido desde que foi salvo
          const agora = Date.now();
          const decorrido = Math.floor((agora - state.iniciadoEm) / 1000); // segundos
          console.log('⏱️ [Timer] Tempo decorrido:', decorrido, 'segundos');
          
          if (state.ativo && !state.pausado) {
            // Recalcular tempo restante baseado no timestamp e minutosIniciais
            const totalSegundosInicial = state.minutosIniciais * 60;
            const totalSegundos = totalSegundosInicial - decorrido;
            console.log('📊 [Timer] Total segundos restantes:', totalSegundos);
            
            if (totalSegundos > 0) {
              const novosMinutos = Math.floor(totalSegundos / 60);
              const novosSegundos = totalSegundos % 60;
              
              console.log('✅ [Timer] Restaurando:', novosMinutos, 'min', novosSegundos, 'seg');
              setMinutos(novosMinutos);
              setSegundos(novosSegundos);
              setAtivo(true);
              setPausado(false);
              setTimestampInicio(state.iniciadoEm); // Restaura timestamp original
            } else {
              // Timer já terminou enquanto estava em outra página
              console.log('⏰ [Timer] Timer terminou durante navegação');
              setMinutos(0);
              setSegundos(0);
              setAtivo(false);
              tocarAlarme();
              localStorage.removeItem(TIMER_STORAGE_KEY);
            }
          } else {
            // Timer estava pausado, restaurar exatamente como estava
            console.log('⏸️ [Timer] Restaurando timer pausado');
            setMinutos(state.minutos);
            setSegundos(state.segundos);
            setAtivo(state.ativo);
            setPausado(state.pausado);
            setTimestampInicio(state.iniciadoEm); // Restaura timestamp
          }
        } catch (error) {
          console.error('❌ [Timer] Erro ao carregar timer salvo:', error);
          localStorage.removeItem(TIMER_STORAGE_KEY);
        }
      } else {
        console.log('ℹ️ [Timer] Nenhum timer salvo encontrado');
      }
      
      // Marca que já tentou carregar do storage
      setCarregouDoStorage(true);
    };

    carregarTimerSalvo();
  }, []);

  // Salvar estado do timer no localStorage sempre que mudar
  useEffect(() => {
    // Só salva/remove DEPOIS de ter carregado o estado inicial
    if (!carregouDoStorage) {
      console.log('⏳ [Timer] Aguardando carregamento do storage...');
      return;
    }

    const salvarTimerState = async () => {
      if (ativo) {
        const usuario = await SupabaseAuthService.getUsuarioAtual();
        if (!usuario) return;

        // Recalcula minutos e segundos baseado no timestamp de início para manter sincronizado
        const agora = Date.now();
        const decorrido = Math.floor((agora - timestampInicio) / 1000);
        const totalSegundos = (minutosIniciais * 60) - decorrido;
        const minutosAtuais = Math.floor(totalSegundos / 60);
        const segundosAtuais = totalSegundos % 60;

        const state: TimerState = {
          minutos: minutosAtuais,
          segundos: segundosAtuais,
          ativo,
          pausado,
          iniciadoEm: timestampInicio, // Usa timestamp fixo do início
          userId: usuario.id,
          minutosIniciais // Salva o tempo configurado
        };
        console.log('💾 [Timer] Salvando state:', state);
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
      } else if (!ativo && !pausado) {
        // Só remove se realmente parou (não se apenas pausou)
        console.log('🗑️ [Timer] Removendo timer do localStorage');
        localStorage.removeItem(TIMER_STORAGE_KEY);
      }
    };

    salvarTimerState();
  }, [ativo, pausado, timestampInicio, carregouDoStorage, minutosIniciais]);

  useEffect(() => {
    let intervalo: any;

    if (ativo && !pausado) {
      intervalo = setInterval(() => {
        // Recalcula baseado no timestamp para manter sincronizado
        const agora = Date.now();
        const decorrido = Math.floor((agora - timestampInicio) / 1000);
        const totalSegundos = (minutosIniciais * 60) - decorrido;
        
        if (totalSegundos <= 0) {
          // timer acabou
          setMinutos(0);
          setSegundos(0);
          setAtivo(false);
          tocarAlarme();
          localStorage.removeItem(TIMER_STORAGE_KEY);
        } else {
          const novosMinutos = Math.floor(totalSegundos / 60);
          const novosSegundos = totalSegundos % 60;
          setMinutos(novosMinutos);
          setSegundos(novosSegundos);
        }
      }, 1000);
    }

    return () => clearInterval(intervalo);
  }, [ativo, pausado, timestampInicio, minutosIniciais]);

  const iniciarTimer = async () => {
    if (!ativo) {
      // TODO: Implementar iniciarSessao via SupabaseStudyService
      // const id = await SupabaseStudyService.iniciarSessao();
      // setSessaoId(id);
      setMinutosIniciais(minutos); // Salva quanto tempo foi configurado
      setTimestampInicio(Date.now()); // Define timestamp do início
      setAtivo(true);
      setPausado(false);
    }
  };

  const pausarTimer = async () => {
    const novoPausado = !pausado;
    setPausado(novoPausado);
    
    // Incrementa pausas quando está pausando (não quando está despausando)
    if (novoPausado) {
      setPausas(pausas + 1);
      console.log('⏸️ [Timer] Pausado - Total de pausas:', pausas + 1);
    } else {
      console.log('▶️ [Timer] Retomado');
    }
    
    if (sessaoId) {
      // TODO: Implementar adicionarPausa via SupabaseStudyService
      // await SupabaseStudyService.adicionarPausa(sessaoId);
    }
  };

  const pararTimer = async () => {
    // PRIMEIRO: Calcula tempo estudado ANTES de resetar os valores
    // Tempo total em segundos que PASSOU (não o que resta!)
    const segundosTotaisInicio = minutosIniciais * 60;
    const segundosTotaisRestantes = minutos * 60 + segundos;
    const segundosDecorridos = segundosTotaisInicio - segundosTotaisRestantes;
    
    // Converte para minutos
    const minutosDecorridos = segundosDecorridos / 60;
    
    // Arredonda: < 1 min = 0, >= 1 min = arredonda pra cima
    let tempoFinal;
    if (minutosDecorridos < 1) {
      tempoFinal = 0;
    } else {
      tempoFinal = Math.ceil(minutosDecorridos);
    }
    
    console.log(`⏹️ [Timer] Cálculo: ${minutosIniciais}min - ${minutos}:${segundos} = ${segundosDecorridos}seg = ${minutosDecorridos.toFixed(2)}min → ${tempoFinal}min`);
    
    // Acumula o tempo estudado nesta sessão
    const novoTotal = minutosEstudadosTotal + tempoFinal;
    setMinutosEstudadosTotal(novoTotal);
    console.log('⏹️ [Timer] Parando - Estudou:', tempoFinal, 'min. Total acumulado:', novoTotal);
    
    // Mostra quanto tempo estudou
    alert(`⏱️ Session completed!\n\n` +
          `Time this session: ${tempoFinal} minute${tempoFinal !== 1 ? 's' : ''}\n` +
          `Total studied today: ${novoTotal} minute${novoTotal !== 1 ? 's' : ''}`);
    
    if (sessaoId) {
      // TODO: Implementar finalizarSessao via SupabaseStudyService
      // await SupabaseStudyService.finalizarSessao(sessaoId, conteudoEstudado);
    }
    
    // DEPOIS: Reseta o timer
    setAtivo(false);
    setPausado(false);
    setMinutos(minutosIniciais); // Volta para o tempo configurado inicialmente
    setSegundos(0);
    setSessaoId(null);
    setPausas(0); // Reseta contador de pausas
    localStorage.removeItem(TIMER_STORAGE_KEY);
  };

  const reiniciarTimer = async () => {
    setMinutos(minutosIniciais); // Volta para o tempo configurado inicialmente
    setSegundos(0);
    setAtivo(false);
    setPausado(false);
    setPausas(0); // Reseta contador de pausas
    if (sessaoId) {
      // TODO: Implementar finalizarSessao via SupabaseStudyService
      // await SupabaseStudyService.finalizarSessao(sessaoId);
      setSessaoId(null);
    }
    localStorage.removeItem(TIMER_STORAGE_KEY);
  };

  const tocarAlarme = () => {
    // som simples de alarme
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfzzHomBSh9y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBQ==');
    audio.play().catch(() => console.log('Alarme silencioso'));
  };

  const salvarRegistro = async () => {
    if (!config) {
      alert('❌ Configuration not loaded');
      return;
    }

    const hoje = new Date().toISOString().split('T')[0];
    
    // Calcular dia correto baseado na data de início
    const hojeParsed = new Date();
    hojeParsed.setHours(0, 0, 0, 0);
    
    // Parse correto da data de início (format: YYYY-MM-DD)
    const [ano, mes, dia] = config.dataInicio.split('-').map(Number);
    const dataInicio = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11
    dataInicio.setHours(0, 0, 0, 0);
    
    const diffTime = hojeParsed.getTime() - dataInicio.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diaNumero = diffDays + 1; // dia 1 = dataInicio

    console.log('[EstudarHoje] Debug cálculo dia:');
    console.log('  - config.dataInicio:', config.dataInicio);
    console.log('  - hoje:', hoje);
    console.log('  - hojeParsed:', hojeParsed);
    console.log('  - dataInicio parsed:', dataInicio);
    console.log('  - diffTime (ms):', diffTime);
    console.log('  - diffDays:', diffDays);
    console.log('  - diaNumero calculado:', diaNumero);

    // Usa o tempo acumulado de todas as sessões do dia
    // Se o timer ainda está rodando, adiciona o tempo atual também
    let minutosEstudados = minutosEstudadosTotal;
    
    if (ativo) {
      // Timer rodando: adiciona tempo da sessão atual
      const segundosTotaisInicio = minutosIniciais * 60;
      const segundosTotaisRestantes = minutos * 60 + segundos;
      const segundosDecorridos = segundosTotaisInicio - segundosTotaisRestantes;
      const minutosDecorridos = segundosDecorridos / 60;
      
      // Arredonda: < 1 min = 0, >= 1 min = arredonda pra cima
      let tempoAtual;
      if (minutosDecorridos < 1) {
        tempoAtual = 0;
      } else {
        tempoAtual = Math.ceil(minutosDecorridos);
      }
      
      minutosEstudados += tempoAtual;
    }
    
    console.log('[EstudarHoje] Minutos estudados:', minutosEstudados);
    console.log('  - Acumulado:', minutosEstudadosTotal);
    console.log('  - Sessão atual:', ativo ? (minutosIniciais - minutos) : 0);
    
    const registro = {
      data: hoje,
      minutosEstudados,
      conteudoEstudado: conteudoEstudado.split(',').map(c => c.trim()).filter(c => c),
      dificuldades: dificuldades.split(',').map(d => d.trim()).filter(d => d),
      palavrasNovas: [], // implementar depois integracao com vocabulario
      observacoes,
      humor
    };
    
    try {
      console.log('[EstudarHoje] Salvando registro diário para dia', diaNumero);
      await SupabaseStudyService.salvarProgressoTarefa({
        tarefaId: `dia_${diaNumero}`,  // USA NUMERO DO DIA, não a data
        diaNumero: diaNumero,
        status: 'concluida',
        tempoGasto: minutosEstudados,
        notas: `${observacoes}\nConteúdo: ${conteudoEstudado}\nDificuldades: ${dificuldades}\nHumor: ${humor}`
      });
      console.log('[EstudarHoje] Registro salvo com sucesso!');
      
      // Marcar o dia como concluído no cronograma
      console.log('[EstudarHoje] Marcando dia como concluído...');
      await SupabaseStudyService.marcarDiaConcluido(diaNumero);
      console.log('[EstudarHoje] Dia marcado como concluído!');
      
      // limpar form
      setConteudoEstudado('');
      setDificuldades('');
      setObservacoes('');
      setHumor('bom');
      alert('✅ Daily log saved successfully!\n🎉 Day marked as completed!');
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      alert('❌ Error saving daily log!');
    }
  };

  const formatarTempo = (min: number, seg: number) => {
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  };

  return (
    <div className="estudar-hoje">
      <header className="page-header">
        <h1>⏱️ Study Today</h1>
        <p>Pomodoro Timer + Daily Log</p>
      </header>

      {/* Timer Pomodoro */}
      <div className="timer-section">
        <div className="timer-display">
          <div className="timer-circle">
            <span className="timer-text">{formatarTempo(minutos, segundos)}</span>
          </div>
        </div>

        <div className="timer-info">
          <p>🔥 Breaks: {pausas}</p>
          {sessaoId && <p>📝 Active Session</p>}
        </div>

        <div className="timer-controls">
          {!ativo ? (
            <button className="btn btn-start" onClick={iniciarTimer}>
              ▶️ Start
            </button>
          ) : (
            <>
              <button className="btn btn-pause" onClick={pausarTimer}>
                {pausado ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button className="btn btn-stop" onClick={pararTimer}>
                ⏹️ Stop
              </button>
              <button className="btn btn-reset" onClick={reiniciarTimer}>
                🔄 Reset
              </button>
            </>
          )}
        </div>

        <div className="timer-presets">
          <button onClick={() => { setMinutos(5); setSegundos(0); setMinutosIniciais(5); }}>5 min</button>
          <button onClick={() => { setMinutos(10); setSegundos(0); setMinutosIniciais(10); }}>10 min</button>
          <button onClick={() => { setMinutos(15); setSegundos(0); setMinutosIniciais(15); }}>15 min</button>
          <button onClick={() => { setMinutos(20); setSegundos(0); setMinutosIniciais(20); }}>20 min</button>
          <button onClick={() => { setMinutos(25); setSegundos(0); setMinutosIniciais(25); }}>25 min</button>
          <button onClick={() => { setMinutos(30); setSegundos(0); setMinutosIniciais(30); }}>30 min</button>
          <button onClick={() => { setMinutos(45); setSegundos(0); setMinutosIniciais(45); }}>45 min</button>
          <button onClick={() => { setMinutos(60); setSegundos(0); setMinutosIniciais(60); }}>60 min</button>
        </div>
      </div>

      {/* Daily Log */}
      <div className="registro-section">
        <h2>📝 Daily Study Log</h2>
        
        <form onSubmit={(e) => { e.preventDefault(); salvarRegistro(); }}>
          <div className="form-group">
            <label>📚 What did you study today?</label>
            <textarea
              value={conteudoEstudado}
              onChange={(e) => setConteudoEstudado(e.target.value)}
              placeholder="Ex: Grammar (Simple Present), Vocabulary (10 house words), Listening (BBC)"
              rows={3}
              required
            />
            <small>Separate topics with commas</small>
          </div>

          <div className="form-group">
            <label>😰 Difficulties encountered</label>
            <textarea
              value={dificuldades}
              onChange={(e) => setDificuldades(e.target.value)}
              placeholder="Ex: TH pronunciation, Difference between Do/Does, Irregular verbs"
              rows={2}
            />
            <small>Optional - separate with commas</small>
          </div>

          <div className="form-group">
            <label>💭 General observations</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="How was your study today? What worked well? What can be improved?"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>😊 How did you feel today?</label>
            <div className="humor-options">
              <button
                type="button"
                className={humor === 'otimo' ? 'active' : ''}
                onClick={() => setHumor('otimo')}
              >
                😄 Great
              </button>
              <button
                type="button"
                className={humor === 'bom' ? 'active' : ''}
                onClick={() => setHumor('bom')}
              >
                🙂 Good
              </button>
              <button
                type="button"
                className={humor === 'regular' ? 'active' : ''}
                onClick={() => setHumor('regular')}
              >
                😐 Okay
              </button>
              <button
                type="button"
                className={humor === 'ruim' ? 'active' : ''}
                onClick={() => setHumor('ruim')}
              >
                😞 Bad
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-save">
            💾 Save Daily Log
          </button>
        </form>
      </div>

      <div className="dicas-section">
        <h3>💡 Study Tips</h3>
        <ul>
          <li>🎯 Use Pomodoro method: 25 min study + 5 min break</li>
          <li>📝 Always note down new words you learn</li>
          <li>🔊 Practice pronunciation out loud</li>
          <li>🎧 Listen to English content daily</li>
          <li>✍️ Write at least a few sentences every day</li>
        </ul>
      </div>
    </div>
  );
}

export default EstudarHoje;
