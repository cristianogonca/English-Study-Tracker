import { useState, useEffect } from 'react';
import { useStudy } from '../contexts/StudyContext';
import SupabaseStudyService from '../services/SupabaseStudyService';
import { RegistroDiario } from '../types';
import './EstudarHoje.css';

function EstudarHoje() {
  const { config } = useStudy();
  const [minutos, setMinutos] = useState(25);
  const [segundos, setSegundos] = useState(0);
  const [ativo, setAtivo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const [pausas, setPausas] = useState(0);

  // formulario de registro
  const [conteudoEstudado, setConteudoEstudado] = useState('');
  const [dificuldades, setDificuldades] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [humor, setHumor] = useState<'otimo' | 'bom' | 'regular' | 'ruim'>('bom');

  useEffect(() => {
    let intervalo: any;

    if (ativo && !pausado) {
      intervalo = setInterval(() => {
        if (segundos === 0) {
          if (minutos === 0) {
            // timer acabou
            setAtivo(false);
            tocarAlarme();
          } else {
            setMinutos(minutos - 1);
            setSegundos(59);
          }
        } else {
          setSegundos(segundos - 1);
        }
      }, 1000);
    }

    return () => clearInterval(intervalo);
  }, [ativo, pausado, minutos, segundos]);

  const iniciarTimer = async () => {
    if (!ativo) {
      // TODO: Implementar iniciarSessao via SupabaseStudyService
      // const id = await SupabaseStudyService.iniciarSessao();
      // setSessaoId(id);
      setAtivo(true);
      setPausado(false);
    }
  };

  const pausarTimer = async () => {
    setPausado(!pausado);
    if (!pausado && sessaoId) {
      // TODO: Implementar adicionarPausa via SupabaseStudyService
      // await SupabaseStudyService.adicionarPausa(sessaoId);
      setPausas(pausas + 1);
    }
  };

  const pararTimer = async () => {
    if (sessaoId) {
      // TODO: Implementar finalizarSessao via SupabaseStudyService
      // await SupabaseStudyService.finalizarSessao(sessaoId, conteudoEstudado);
    }
    setAtivo(false);
    setPausado(false);
    setMinutos(25);
    setSegundos(0);
    setSessaoId(null);
  };

  const reiniciarTimer = async () => {
    setMinutos(25);
    setSegundos(0);
    setAtivo(false);
    setPausado(false);
    if (sessaoId) {
      // TODO: Implementar finalizarSessao via SupabaseStudyService
      // await SupabaseStudyService.finalizarSessao(sessaoId);
      setSessaoId(null);
    }
  };

  const tocarAlarme = () => {
    // som simples de alarme
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfzzHomBSh9y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBSl+y/HajDwKF2K36+uhUhELTKXh8bllGgU2jdXxxH0pBQ==');
    audio.play().catch(() => console.log('Alarme silencioso'));
  };

  const salvarRegistro = async () => {
    if (!config) {
      alert('❌ Configuração não carregada');
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

    // Calcula tempo estudado baseado no timer Pomodoro
    // Se o timer está rodando, conta o tempo decorrido
    // Por padrão, um Pomodoro completo é 25 minutos
    const tempoTotal = 25 - minutos + (segundos > 0 ? 1 : 0);
    const minutosEstudados = Math.max(tempoTotal, 0);
    
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
        tarefaId: `registro_${hoje}`,
        diaNumero: diaNumero,
        status: 'concluida',
        tempoGasto: minutosEstudados,
        notas: `${observacoes}\nConteúdo: ${conteudoEstudado}\nDificuldades: ${dificuldades}\nHumor: ${humor}`
      });
      console.log('[EstudarHoje] Registro salvo com sucesso!');
      
      // limpar form
      setConteudoEstudado('');
      setDificuldades('');
      setObservacoes('');
      setHumor('bom');
      alert('✅ Registro diário salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      alert('❌ Erro ao salvar registro diário!');
    }
  };

  const formatarTempo = (min: number, seg: number) => {
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  };

  return (
    <div className="estudar-hoje">
      <header className="page-header">
        <h1>⏱️ Estudar Hoje</h1>
        <p>Timer Pomodoro + Registro Diário</p>
      </header>

      {/* Timer Pomodoro */}
      <div className="timer-section">
        <div className="timer-display">
          <div className="timer-circle">
            <span className="timer-text">{formatarTempo(minutos, segundos)}</span>
          </div>
        </div>

        <div className="timer-info">
          <p>🔥 Pausas: {pausas}</p>
          {sessaoId && <p>📝 Sessão ativa</p>}
        </div>

        <div className="timer-controls">
          {!ativo ? (
            <button className="btn btn-start" onClick={iniciarTimer}>
              ▶️ Iniciar
            </button>
          ) : (
            <>
              <button className="btn btn-pause" onClick={pausarTimer}>
                {pausado ? '▶️ Continuar' : '⏸️ Pausar'}
              </button>
              <button className="btn btn-stop" onClick={pararTimer}>
                ⏹️ Parar
              </button>
              <button className="btn btn-reset" onClick={reiniciarTimer}>
                🔄 Reiniciar
              </button>
            </>
          )}
        </div>

        <div className="timer-presets">
          <button onClick={() => { setMinutos(25); setSegundos(0); }}>25 min</button>
          <button onClick={() => { setMinutos(15); setSegundos(0); }}>15 min</button>
          <button onClick={() => { setMinutos(5); setSegundos(0); }}>5 min</button>
        </div>
      </div>

      {/* Registro Diário */}
      <div className="registro-section">
        <h2>📝 Registro Diário de Estudo</h2>
        
        <form onSubmit={(e) => { e.preventDefault(); salvarRegistro(); }}>
          <div className="form-group">
            <label>📚 O que você estudou hoje?</label>
            <textarea
              value={conteudoEstudado}
              onChange={(e) => setConteudoEstudado(e.target.value)}
              placeholder="Ex: Gramática (Simple Present), Vocabulário (10 palavras sobre casa), Listening (BBC)"
              rows={3}
              required
            />
            <small>Separe os tópicos por vírgula</small>
          </div>

          <div className="form-group">
            <label>😰 Dificuldades encontradas</label>
            <textarea
              value={dificuldades}
              onChange={(e) => setDificuldades(e.target.value)}
              placeholder="Ex: Pronúncia de TH, Diferença entre Do/Does, Verbos irregulares"
              rows={2}
            />
            <small>Opcional - separe por vírgula</small>
          </div>

          <div className="form-group">
            <label>💭 Observações gerais</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Como foi o estudo hoje? O que funcionou bem? O que pode melhorar?"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>😊 Como você se sentiu hoje?</label>
            <div className="humor-options">
              <button
                type="button"
                className={humor === 'otimo' ? 'active' : ''}
                onClick={() => setHumor('otimo')}
              >
                😄 Ótimo
              </button>
              <button
                type="button"
                className={humor === 'bom' ? 'active' : ''}
                onClick={() => setHumor('bom')}
              >
                🙂 Bom
              </button>
              <button
                type="button"
                className={humor === 'regular' ? 'active' : ''}
                onClick={() => setHumor('regular')}
              >
                😐 Regular
              </button>
              <button
                type="button"
                className={humor === 'ruim' ? 'active' : ''}
                onClick={() => setHumor('ruim')}
              >
                😞 Ruim
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-save">
            💾 Salvar Registro Diário
          </button>
        </form>
      </div>

      <div className="dicas-section">
        <h3>💡 Dicas para o Estudo</h3>
        <ul>
          <li>🎯 Use o método Pomodoro: 25 min estudo + 5 min pausa</li>
          <li>📝 Anote sempre palavras novas que aprender</li>
          <li>🔊 Pratique a pronúncia em voz alta</li>
          <li>🎧 Ouça conteúdo em inglês diariamente</li>
          <li>✍️ Escreva pelo menos algumas frases todo dia</li>
        </ul>
      </div>
    </div>
  );
}

export default EstudarHoje;
