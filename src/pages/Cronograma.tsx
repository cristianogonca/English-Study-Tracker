import { useState, useEffect } from 'react';
import { useStudy } from '../contexts/StudyContext';
import SupabaseStudyService from '../services/SupabaseStudyService';
import { DiaEstudo, Fase, ProgressoTarefa } from '../types';
import './Cronograma.css';

function Cronograma() {
  const { cronograma: cronogramaContext, fases: fasesContext } = useStudy();
  const [cronograma, setCronograma] = useState<DiaEstudo[]>([]);
  const [fases, setFases] = useState<Fase[]>([]);
  const [progressos, setProgressos] = useState<ProgressoTarefa[]>([]);
  const [mesAtual, setMesAtual] = useState(1);
  const [diaSelecionado, setDiaSelecionado] = useState<DiaEstudo | null>(null);
  const [visualizacao, setVisualizacao] = useState<'mes' | 'ano'>('mes');

  useEffect(() => {
    carregarDados();
  }, [cronogramaContext, fasesContext]);

  const carregarDados = async () => {
    setCronograma(cronogramaContext);
    setFases(fasesContext);
    
    try {
      const progressosDados = await SupabaseStudyService.obterProgressoTarefas();
      setProgressos(progressosDados);
    } catch (error) {
      console.error('[Cronograma] Erro ao carregar progressos:', error);
    }
  };

  const diasDoMes = cronograma.filter(dia => dia.mes === mesAtual);

  const calcularProgressoDia = (dia: DiaEstudo): number => {
    // Busca progresso pelo número do dia
    const progressoDia = progressos.find(p => p.diaNumero === dia.numero);
    
    if (progressoDia && progressoDia.tempoGasto > 0) {
      // Calcula % baseado na meta diária (60 minutos = 100%)
      const metaDiaria = 60;
      const percentual = Math.min(Math.round((progressoDia.tempoGasto / metaDiaria) * 100), 100);
      console.log(`[Cronograma] Dia ${dia.numero} - Tempo: ${progressoDia.tempoGasto}min = ${percentual}%`);
      return percentual;
    }
    
    return 0;
  };

  const calcularProgressoMes = (mes: number): number => {
    const diasMes = cronograma.filter(d => d.mes === mes);
    if (diasMes.length === 0) return 0;
    
    const totalProgress = diasMes.reduce((acc, dia) => {
      return acc + calcularProgressoDia(dia);
    }, 0);
    
    return Math.round(totalProgress / diasMes.length);
  };

  const obterFaseDoMes = (mes: number): Fase | undefined => {
    return fases.find(fase => {
      return mes >= fase.mesInicio && mes <= fase.mesFim;
    });
  };

  const getNomeMes = (mes: number): string => {
    // Pegar a data real do primeiro dia deste mês no cronograma
    const primeiroDiaDoMes = cronograma.find(dia => dia.mes === mes);
    if (primeiroDiaDoMes && primeiroDiaDoMes.data) {
      const data = new Date(primeiroDiaDoMes.data);
      return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        .replace(/^\w/, c => c.toUpperCase());
    }
    
    // Fallback para array fixo se não houver data
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1];
  };

  const getCorFase = (fase?: Fase): string => {
    if (!fase) return '#999';
    if (fase.nome.includes('Básico')) return '#38ef7d';
    if (fase.nome.includes('Intermediário')) return '#f7b731';
    if (fase.nome.includes('Avançado')) return '#eb3349';
    return '#667eea';
  };

  const abrirDetalhes = (dia: DiaEstudo) => {
    setDiaSelecionado(dia);
  };

  const fecharDetalhes = () => {
    setDiaSelecionado(null);
  };

  const estatisticas = {
    totalDias: cronograma.length,
    diasConcluidos: cronograma.filter(dia => calcularProgressoDia(dia) === 100).length,
    progressoGeral: Math.round(
      cronograma.reduce((acc, dia) => acc + calcularProgressoDia(dia), 0) / cronograma.length
    )
  };

  return (
    <div className="cronograma">
      <header className="page-header">
        <h1>📅 Cronograma Anual</h1>
        <p>Visualize seu plano de estudos de 12 meses</p>
      </header>

      {/* Estatísticas Gerais */}
      <div className="cronograma-stats">
        <div className="stat-card">
          <span className="stat-icon">📖</span>
          <div className="stat-info">
            <span className="stat-value">{estatisticas.totalDias}</span>
            <span className="stat-label">Total de Dias</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-value">{estatisticas.diasConcluidos}</span>
            <span className="stat-label">Dias Concluídos</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-info">
            <span className="stat-value">{estatisticas.progressoGeral}%</span>
            <span className="stat-label">Progresso Geral</span>
          </div>
        </div>
      </div>

      {/* Fases */}
      <div className="fases-overview">
        <h2>📚 Fases do Currículo</h2>
        <div className="fases-grid">
          {fases.map((fase, index) => (
            <div key={index} className="fase-card" style={{ borderColor: getCorFase(fase) }}>
              <h3>{fase.nome}</h3>
              <p className="fase-periodo">
                Mês {fase.mesInicio} a {fase.mesFim}
              </p>
              <div className="fase-metas">
                <span>⏱️ {fase.horasTotal}h totais</span>
                <span>🎯 7h/semana</span>
              </div>
              <div className="fase-progress-bar">
                <div
                  className="fase-progress-fill"
                  style={{
                    width: `${fase.progresso}%`,
                    background: getCorFase(fase)
                  }}
                />
              </div>
              <p className="fase-progress-text">{fase.progresso}% concluído</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle Visualização */}
      <div className="view-controls">
        <button
          className={visualizacao === 'mes' ? 'active' : ''}
          onClick={() => setVisualizacao('mes')}
        >
          📅 Visualização Mensal
        </button>
        <button
          className={visualizacao === 'ano' ? 'active' : ''}
          onClick={() => setVisualizacao('ano')}
        >
          📆 Visualização Anual
        </button>
      </div>

      {/* Visualização Mensal */}
      {visualizacao === 'mes' && (
        <>
          <div className="mes-selector">
            <button
              onClick={() => mesAtual > 1 && setMesAtual(mesAtual - 1)}
              disabled={mesAtual === 1}
            >
              ◀️
            </button>
            <h2>{getNomeMes(mesAtual)} - Mês {mesAtual}</h2>
            <button
              onClick={() => mesAtual < 12 && setMesAtual(mesAtual + 1)}
              disabled={mesAtual === 12}
            >
              ▶️
            </button>
          </div>

          <div className="mes-info">
            <div className="fase-badge" style={{ background: getCorFase(obterFaseDoMes(mesAtual)) }}>
              {obterFaseDoMes(mesAtual)?.nome || 'Fase não definida'}
            </div>
            <div className="progresso-mes">
              Progresso do mês: <strong>{calcularProgressoMes(mesAtual)}%</strong>
            </div>
          </div>

          <div className="calendario-grid">
            {diasDoMes.map((dia) => {
              const progresso = calcularProgressoDia(dia);
              const fase = obterFaseDoMes(dia.mes);
              
              return (
                <div
                  key={dia.numero}
                  className={`dia-card ${progresso === 100 ? 'concluido' : ''}`}
                  onClick={() => abrirDetalhes(dia)}
                  style={{
                    borderColor: getCorFase(fase)
                  }}
                >
                  <div className="dia-header">
                    <span className="dia-numero">Dia {dia.numero}</span>
                    <span className="dia-semana">Semana {dia.semana}</span>
                  </div>
                  <div className="dia-content">
                    <p className="dia-descricao">{dia.tituloSemana || `Dia ${dia.numero}`}</p>
                    <div className="dia-tarefas-count">
                      {dia.tarefas.length} tarefa{dia.tarefas.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="dia-progress-bar">
                    <div
                      className="dia-progress-fill"
                      style={{
                        width: `${progresso}%`,
                        background: getCorFase(fase)
                      }}
                    />
                  </div>
                  <div className="dia-progress-text">{progresso}%</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Visualização Anual */}
      {visualizacao === 'ano' && (
        <div className="visao-anual">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mes) => {
            const diasMes = cronograma.filter(d => d.mes === mes);
            const progressoMes = calcularProgressoMes(mes);
            const fase = obterFaseDoMes(mes);

            return (
              <div
                key={mes}
                className="mes-card"
                onClick={() => {
                  setMesAtual(mes);
                  setVisualizacao('mes');
                }}
                style={{ borderColor: getCorFase(fase) }}
              >
                <h3>{getNomeMes(mes)}</h3>
                <div className="mes-fase-badge" style={{ background: getCorFase(fase) }}>
                  {fase?.nome.split(' ')[1] || 'N/A'}
                </div>
                <div className="mes-stats">
                  <span>📅 {diasMes.length} dias</span>
                  <span>✅ {diasMes.filter(d => calcularProgressoDia(d) === 100).length} concluídos</span>
                </div>
                <div className="mes-progress-bar">
                  <div
                    className="mes-progress-fill"
                    style={{
                      width: `${progressoMes}%`,
                      background: getCorFase(fase)
                    }}
                  />
                </div>
                <div className="mes-progress-text">{progressoMes}%</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes do Dia */}
      {diaSelecionado && (
        <div className="modal-overlay" onClick={fecharDetalhes}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharDetalhes}>
              ✕
            </button>

            <h2>
              📅 Dia {diaSelecionado.numero} - Semana {diaSelecionado.semana}
            </h2>
            <p className="modal-data">{diaSelecionado.data || 'Não iniciado'}</p>
            <p className="modal-descricao">{diaSelecionado.tituloSemana || `Mês ${diaSelecionado.mes}, Fase ${diaSelecionado.fase}`}</p>

            <div className="modal-fase">
              <strong>Fase:</strong>{' '}
              <span
                style={{
                  color: getCorFase(obterFaseDoMes(diaSelecionado.mes))
                }}
              >
                {obterFaseDoMes(diaSelecionado.mes)?.nome || 'N/A'}
              </span>
            </div>

            <h3>📋 Tarefas do Dia</h3>
            <div className="modal-tarefas">
              {diaSelecionado.tarefas.map((tarefa, index) => {
                const progresso = progressos.find((p: ProgressoTarefa) => p.tarefaId === tarefa.id);

                return (
                  <div
                    key={index}
                    className={`tarefa-item ${progresso?.status === 'concluida' ? 'concluida' : ''}`}
                  >
                    <div className="tarefa-header">
                      <span className="tarefa-tipo">{tarefa.tipo}</span>
                      <span className={`tarefa-status status-${progresso?.status || 'pendente'}`}>
                        {progresso?.status === 'concluida' ? '✅ Concluída' :
                         progresso?.status === 'em_progresso' ? '⏳ Em progresso' :
                         '⚪ Pendente'}
                      </span>
                    </div>
                    <h4>{tarefa.titulo}</h4>
                    <p>{tarefa.descricao}</p>
                    <div className="tarefa-footer">
                      <span>⏱️ {tarefa.duracaoEstimada} min</span>
                      <span className={`tarefa-dificuldade dificuldade-${tarefa.nivel}`}>
                        {tarefa.nivel === 'basico' ? '🟢 Básico' :
                         tarefa.nivel === 'intermediario' ? '🟡 Intermediário' :
                         '🔴 Avançado'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-progress">
              <h3>📊 Progresso do Dia</h3>
              <div className="progress-bar-large">
                <div
                  className="progress-fill-large"
                  style={{
                    width: `${calcularProgressoDia(diaSelecionado)}%`,
                    background: getCorFase(obterFaseDoMes(diaSelecionado.mes))
                  }}
                >
                  {calcularProgressoDia(diaSelecionado)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cronograma;
