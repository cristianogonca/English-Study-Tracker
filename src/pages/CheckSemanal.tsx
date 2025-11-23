import { useState, useEffect } from 'react';
import { useStudy } from '../contexts/StudyContext';
import SupabaseStudyService from '../services/SupabaseStudyService';
import { CheckpointSemanal } from '../types';
import './CheckSemanal.css';

function CheckSemanal() {
  const { config } = useStudy();
  const [semana, setSemana] = useState(1);
  const [presenca, setPresenca] = useState(100);
  const [minutosRealizados, setMinutosRealizados] = useState(0);
  const [evolucaoFala, setEvolucaoFala] = useState<'sim' | 'nao' | 'parcial'>('sim');
  const [palavrasAprendidas, setPalavrasAprendidas] = useState(0);
  const [observacoes, setObservacoes] = useState('');

  // checkpoints padrao da semana
  const [checkpoints, setCheckpoints] = useState<CheckpointSemanal[]>([
    { pergunta: 'Did I master this week\'s grammar?', resposta: 'sim', nota: 0 },
    { pergunta: 'Did I practice listening at least 2x?', resposta: 'sim', nota: 0 },
    { pergunta: 'Did I record speaking at least 1x?', resposta: 'sim', nota: 0 },
    { pergunta: 'Did I read texts in English this week?', resposta: 'sim', nota: 0 },
    { pergunta: 'Did I write something in English?', resposta: 'sim', nota: 0 }
  ]);

  useEffect(() => {
    carregarCheck();
  }, [semana]);

  const carregarCheck = async () => {
    try {
      // 1. Buscar check salvo (se existir)
      const checks = await SupabaseStudyService.obterChecks();
      const checkDaSemana = checks.find(c => c.semana === semana);
      
      // 2. Calcular minutos reais da semana no banco
      const minutosReaisDaSemana = await calcularMinutosDaSemana(semana);
      
      // 3. Calcular palavras aprendidas na semana
      const palavrasReaisDaSemana = await calcularPalavrasDaSemana(semana);
      
      if (checkDaSemana) {
        setPresenca(checkDaSemana.presenca || 100);
        setMinutosRealizados(checkDaSemana.minutosRealizados || minutosReaisDaSemana);
        setEvolucaoFala(checkDaSemana.evolucaoFala || 'sim');
        setPalavrasAprendidas(checkDaSemana.palavrasAprendidas || palavrasReaisDaSemana);
        setObservacoes(checkDaSemana.observacoes || '');
        if (checkDaSemana.checkpoints && checkDaSemana.checkpoints.length > 0) {
          setCheckpoints(checkDaSemana.checkpoints);
        }
      } else {
        // Se não existe check salvo, usa os valores reais do banco
        setMinutosRealizados(minutosReaisDaSemana);
        setPalavrasAprendidas(palavrasReaisDaSemana);
        setPresenca(100);
        setEvolucaoFala('sim');
        setObservacoes('');
      }
    } catch (error) {
      // Silencioso: erro esperado quando não há check ainda
    }
  };

  const calcularMinutosDaSemana = async (numeroSemana: number): Promise<number> => {
    try {
      // Calcular dias da semana (dia 1 + 7*(semana-1) até dia 1 + 7*semana - 1)
      const diaInicio = 1 + (numeroSemana - 1) * 7;
      const diaFim = diaInicio + 6;
      
      // Buscar progressos da semana
      const progressos = await SupabaseStudyService.obterProgressoTarefas();
      const progressosDaSemana = progressos.filter(p => 
        p.diaNumero >= diaInicio && p.diaNumero <= diaFim
      );
      
      const minutosTotal = progressosDaSemana.reduce((acc, p) => acc + (p.tempoGasto || 0), 0);
      return minutosTotal;
    } catch (error) {
      console.error('[CheckSemanal] Erro ao calcular minutos da semana:', error);
      return 0;
    }
  };

  const calcularPalavrasDaSemana = async (numeroSemana: number): Promise<number> => {
    try {
      if (!config || !config.dataInicio) return 0;
      
      // Calcular datas da semana
      const { dataInicio, dataFim } = calcularDatasSemana(numeroSemana);
      
      // Buscar vocabulário
      const palavras = await SupabaseStudyService.obterVocabulario();
      
      // Filtrar palavras aprendidas nesta semana
      const palavrasDaSemana = palavras.filter(p => {
        if (!p.dataAprendida) return false;
        const dataPalavra = p.dataAprendida.split('T')[0]; // YYYY-MM-DD
        return dataPalavra >= dataInicio && dataPalavra <= dataFim;
      });
      
      return palavrasDaSemana.length;
    } catch (error) {
      console.error('[CheckSemanal] Erro ao calcular palavras da semana:', error);
      return 0;
    }
  };

  const atualizarCheckpoint = (index: number, resposta: 'sim' | 'nao' | 'parcial') => {
    const novosCheckpoints = [...checkpoints];
    novosCheckpoints[index].resposta = resposta;
    setCheckpoints(novosCheckpoints);
  };

  const atualizarNotaCheckpoint = (index: number, nota: number) => {
    const novosCheckpoints = [...checkpoints];
    novosCheckpoints[index].nota = nota;
    setCheckpoints(novosCheckpoints);
  };

  const calcularDatasSemana = (numeroSemana: number) => {
    // Se não houver config, usa data atual
    let dataInicio = new Date().toISOString().split('T')[0];
    let dataFim = new Date().toISOString().split('T')[0];
    
    if (config && config.dataInicio) {
      const inicio = new Date(config.dataInicio);
      const diasPassados = (numeroSemana - 1) * 7;
      const di = new Date(inicio);
      di.setDate(inicio.getDate() + diasPassados);
      const df = new Date(di);
      df.setDate(di.getDate() + 6);
      dataInicio = di.toISOString().split('T')[0];
      dataFim = df.toISOString().split('T')[0];
    }
    
    return { dataInicio, dataFim };
  };

  const salvarCheck = async () => {
    const { dataInicio, dataFim } = calcularDatasSemana(semana);
    const metaMinutos = 420; // 7 horas
    const metaCumprida = minutosRealizados >= metaMinutos;

    const check = {
      semana,
      dataInicio,
      dataFim,
      presenca,
      metaCumprida,
      minutosRealizados,
      minutosEsperados: metaMinutos,
      evolucaoFala,
      palavrasAprendidas,
      checkpoints,
      observacoes
    };

    try {
      await SupabaseStudyService.salvarCheckSemanal(check);
      alert('✅ Weekly check saved successfully!');
      
      // limpar form
      setSemana(semana + 1);
      setPresenca(100);
      setMinutosRealizados(0);
      setEvolucaoFala('sim');
      setPalavrasAprendidas(0);
      setObservacoes('');
      setCheckpoints([
        { pergunta: 'Did I master this week\'s grammar?', resposta: 'sim', nota: 0 },
        { pergunta: 'Did I practice listening at least 2x?', resposta: 'sim', nota: 0 },
        { pergunta: 'Did I record speaking at least 1x?', resposta: 'sim', nota: 0 },
        { pergunta: 'Did I read texts in English this week?', resposta: 'sim', nota: 0 },
        { pergunta: 'Did I write something in English?', resposta: 'sim', nota: 0 }
      ]);
    } catch (error) {
      console.error('Erro ao salvar check:', error);
      alert('❌ Error saving weekly check!');
    }
  };

  const progressoPresenca = presenca;
  const progressoMeta = Math.round((minutosRealizados / 420) * 100);

  return (
    <div className="check-semanal">
      <header className="page-header">
        <h1>✅ Weekly Check</h1>
        <p>Evaluate your progress and learning for the week</p>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); salvarCheck(); }} className="check-form">
        
        {/* Número da Semana */}
        <div className="semana-selector">
          <label>📅 Week of Year</label>
          <div className="semana-input">
            <button type="button" onClick={() => semana > 1 && setSemana(semana - 1)}>
              ◀️
            </button>
            <input
              type="number"
              value={semana}
              onChange={(e) => setSemana(Number(e.target.value))}
              min="1"
              max="52"
              required
            />
            <button type="button" onClick={() => semana < 52 && setSemana(semana + 1)}>
              ▶️
            </button>
          </div>
          <small>Week {semana} of 52</small>
        </div>

        {/* Presença */}
        <div className="form-section">
          <h2>📊 Attendance</h2>
          <div className="presenca-group">
            <label>What % of days did you study?</label>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={presenca}
                onChange={(e) => setPresenca(Number(e.target.value))}
                className="slider"
              />
              <div className="slider-value">{presenca}%</div>
            </div>
            <div className="presenca-bar">
              <div 
                className="presenca-fill" 
                style={{ width: `${progressoPresenca}%` }}
              />
            </div>
          </div>
        </div>

        {/* Meta de Minutos */}
        <div className="form-section">
          <h2>⏱️ Time Goal</h2>
          <div className="meta-group">
            <label>How many minutes did you study this week?</label>
            <input
              type="number"
              value={minutosRealizados}
              readOnly
              min="0"
              placeholder="Ex: 420"
              style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
            />
            <small>Goal: 420 minutes (7 hours/week)</small>
            
            <div className="meta-bar">
              <div 
                className="meta-fill" 
                style={{ width: `${Math.min(progressoMeta, 100)}%` }}
              >
                {progressoMeta}%
              </div>
            </div>

            {minutosRealizados >= 420 ? (
              <p className="meta-status success">✅ Goal achieved! Congratulations!</p>
            ) : (
              <p className="meta-status warning">
                ⚠️ {420 - minutosRealizados} minutes remaining to reach the goal
              </p>
            )}
          </div>
        </div>

        {/* Evolução na Fala */}
        <div className="form-section">
          <h2>🗣️ Conversation Progress</h2>
          <div className="evolucao-group">
            <label>Did you feel improvement in your speaking this week?</label>
            <div className="radio-options">
              <button
                type="button"
                className={evolucaoFala === 'sim' ? 'active' : ''}
                onClick={() => setEvolucaoFala('sim')}
              >
                ✅ Yes
              </button>
              <button
                type="button"
                className={evolucaoFala === 'parcial' ? 'active' : ''}
                onClick={() => setEvolucaoFala('parcial')}
              >
                🔸 Partial
              </button>
              <button
                type="button"
                className={evolucaoFala === 'nao' ? 'active' : ''}
                onClick={() => setEvolucaoFala('nao')}
              >
                ❌ No
              </button>
            </div>
          </div>
        </div>

        {/* Vocabulário */}
        <div className="form-section">
          <h2>📚 Vocabulary</h2>
          <div className="vocab-group">
            <label>How many new words did you learn?</label>
            <input
              type="number"
              value={palavrasAprendidas}
              readOnly
              min="0"
              placeholder="Ex: 50"
              style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
            />
            <small>Recommended goal: 30-50 words/week</small>
          </div>
        </div>

        {/* Checkpoints */}
        <div className="form-section checkpoints-section">
          <h2>✔️ Weekly Checkpoints</h2>
          <p className="checkpoints-desc">Mark what you managed to do:</p>
          
          {checkpoints.map((checkpoint, index) => (
            <div key={index} className="checkpoint-item">
              <p className="checkpoint-question">{checkpoint.pergunta}</p>
              
              <div className="checkpoint-controls">
                <div className="checkpoint-buttons">
                  <button
                    type="button"
                    className={checkpoint.resposta === 'sim' ? 'active green' : ''}
                    onClick={() => atualizarCheckpoint(index, 'sim')}
                  >
                    ✅ Yes
                  </button>
                  <button
                    type="button"
                    className={checkpoint.resposta === 'parcial' ? 'active yellow' : ''}
                    onClick={() => atualizarCheckpoint(index, 'parcial')}
                  >
                    🔸 Partial
                  </button>
                  <button
                    type="button"
                    className={checkpoint.resposta === 'nao' ? 'active red' : ''}
                    onClick={() => atualizarCheckpoint(index, 'nao')}
                  >
                    ❌ No
                  </button>
                </div>

                {checkpoint.resposta !== 'nao' && (
                  <div className="checkpoint-nota">
                    <label>Score (0-10):</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={checkpoint.nota}
                      onChange={(e) => atualizarNotaCheckpoint(index, Number(e.target.value))}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Observações */}
        <div className="form-section">
          <h2>💭 General Observations</h2>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="How was the week? What worked well? What needs improvement? Any specific difficulties?"
            rows={5}
          />
        </div>

        {/* Resumo */}
        <div className="resumo-section">
          <h3>📊 Week Summary</h3>
          <div className="resumo-grid">
            <div className="resumo-item">
              <span className="resumo-label">Attendance:</span>
              <span className="resumo-value">{presenca}%</span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Minutes:</span>
              <span className="resumo-value">{minutosRealizados} / 420</span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Words:</span>
              <span className="resumo-value">{palavrasAprendidas}</span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Speaking Progress:</span>
              <span className="resumo-value">
                {evolucaoFala === 'sim' ? '✅' : evolucaoFala === 'parcial' ? '🔸' : '❌'}
              </span>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <button type="submit" className="btn-save">
          💾 Save Weekly Check
        </button>
      </form>

      {/* Dicas */}
      <div className="dicas-section">
        <h3>💡 Tips for Next Week</h3>
        <ul>
          <li>🎯 If you didn't meet the goal, redistribute the minutes over the next few days</li>
          <li>📝 Note new words daily in your vocabulary</li>
          <li>🗣️ Practice speaking even alone, record audios</li>
          <li>📚 If any checkpoint was pending, prioritize it next week</li>
          <li>✨ Celebrate your achievements, no matter how small!</li>
        </ul>
      </div>
    </div>
  );
}

export default CheckSemanal;
