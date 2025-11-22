import { useEffect, useState } from 'react';
import StudyService from '../services/StudyService';
import { Estatisticas, MetaSemanal } from '../types';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [metaAtual, setMetaAtual] = useState<MetaSemanal | null>(null);

  useEffect(() => {
    carregarDados();
      // Log para depuração
      console.log('[Dashboard] useEffect chamado');
  }, []);

  const carregarDados = () => {
    const estatisticas = StudyService.calcularEstatisticas();
    const meta = StudyService.getMetaAtual();
      console.log('[Dashboard] Estatísticas carregadas:', estatisticas);
      console.log('[Dashboard] Meta semanal carregada:', meta);
    
    setStats(estatisticas);
    setMetaAtual(meta || null);
  };

      console.error('[Dashboard] stats está nulo ou inválido!');
  const handleReconfigurar = () => {
      return <div className="loading" style={{color:'red',padding:'2rem'}}>
        Erro ao carregar estatísticas do usuário.<br />
        Tente reconfigurar ou entrar novamente.<br />
        <button onClick={()=>window.location.reload()}>Recarregar</button>
      </div>;
    if (confirm('⚠️ ATENÇÃO: Isso vai APAGAR todos os seus dados de estudo e voltar para a configuração inicial. Deseja continuar?')) {
      StudyService.limparTodosDados();
      window.location.href = '/setup';
    }
  };

  if (!stats) {
    return <div className="loading">Carregando...</div>;
  }

  const progressoMeta = metaAtual 
    ? Math.round((metaAtual.minutosRealizados / metaAtual.metaMinutos) * 100)
    : 0;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📚 Dashboard</h1>
        <p>Acompanhe seu progresso nos estudos de inglês</p>
      </header>

      <div className="stats-grid">
        {/* Card: Sequência */}
        <div className="stat-card streak">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Sequência Atual</h3>
            <p className="stat-value">{stats.sequenciaAtual} dias</p>
            <span className="stat-subtitle">Melhor: {stats.melhorSequencia} dias</span>
          </div>
        </div>

        {/* Card: Horas Estudadas */}
        <div className="stat-card hours">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Horas Acumuladas</h3>
            <p className="stat-value">{stats.horasAcumuladas}h</p>
            <span className="stat-subtitle">{stats.tempoTotalMinutos} minutos</span>
          </div>
        </div>

        {/* Card: Dias Estudados */}
        <div className="stat-card days">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Dias Estudados</h3>
            <p className="stat-value">{stats.diasEstudados}</p>
            <span className="stat-subtitle">Média: {stats.mediaMinutosDia} min/dia</span>
          </div>
        </div>

        {/* Card: Vocabulário */}
        <div className="stat-card vocab">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <h3>Palavras Aprendidas</h3>
            <p className="stat-value">{stats.palavrasAprendidas}</p>
            <span className="stat-subtitle">Vocabulário crescendo!</span>
          </div>
        </div>

        {/* Card: Tarefas */}
        <div className="stat-card tasks">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Tarefas Concluídas</h3>
            <p className="stat-value">{stats.tarefasConcluidas}</p>
            <span className="stat-subtitle">{stats.tarefasPendentes} pendentes</span>
          </div>
        </div>

        {/* Card: Fase Atual */}
        <div className="stat-card phase">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Fase Atual</h3>
            <p className="stat-value">Fase {stats.faseAtual}</p>
            <span className="stat-subtitle">{stats.progressoFaseAtual}% completo</span>
          </div>
        </div>
      </div>

      {/* Meta Semanal */}
      {metaAtual && (
        <div className="meta-semanal">
          <h2>📊 Meta da Semana {metaAtual.semana}</h2>
          <div className="meta-content">
            <div className="meta-info">
              <p><strong>Meta:</strong> {metaAtual.metaMinutos} minutos (7 horas)</p>
              <p><strong>Realizado:</strong> {metaAtual.minutosRealizados} minutos</p>
              <p><strong>Faltam:</strong> {metaAtual.metaMinutos - metaAtual.minutosRealizados} minutos</p>
              {metaAtual.minutosRealocados > 0 && (
                <p className="realocado"><strong>Realocado:</strong> {metaAtual.minutosRealocados} min/dia</p>
              )}
            </div>
            
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(progressoMeta, 100)}%` }}
              >
                {progressoMeta}%
              </div>
            </div>
            
            <div className={`status-badge ${metaAtual.status}`}>
              {metaAtual.status === 'cumprida' && '✅ Cumprida'}
              {metaAtual.status === 'em_andamento' && '🔄 Em andamento'}
              {metaAtual.status === 'atrasada' && '⚠️ Atrasada'}
              {metaAtual.status === 'realocada' && '📌 Realocada'}
            </div>
          </div>
        </div>
      )}

      {/* Progresso por Fase */}
      <div className="fases-progress">
        <h2>🎓 Progresso por Fase</h2>
        <div className="fases-grid">
          <div className={`fase-card ${stats.faseAtual === 1 ? 'active' : ''}`}>
            <h3>Fase 1: Básico</h3>
            <p>Meses 1-4 • 120 horas</p>
            <div className="fase-bar">
              <div 
                className="fase-fill" 
                style={{ width: stats.faseAtual > 1 ? '100%' : stats.faseAtual === 1 ? `${stats.progressoFaseAtual}%` : '0%' }}
              />
            </div>
          </div>
          
          <div className={`fase-card ${stats.faseAtual === 2 ? 'active' : ''}`}>
            <h3>Fase 2: Intermediário</h3>
            <p>Meses 5-8 • 120 horas</p>
            <div className="fase-bar">
              <div 
                className="fase-fill" 
                style={{ width: stats.faseAtual > 2 ? '100%' : stats.faseAtual === 2 ? `${stats.progressoFaseAtual}%` : '0%' }}
              />
            </div>
          </div>
          
          <div className={`fase-card ${stats.faseAtual === 3 ? 'active' : ''}`}>
            <h3>Fase 3: Avançado</h3>
            <p>Meses 9-12 • 125 horas</p>
            <div className="fase-bar">
              <div 
                className="fase-fill" 
                style={{ width: stats.faseAtual === 3 ? `${stats.progressoFaseAtual}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Checks Semanais */}
      <div className="checks-info">
        <h2>✔️ Checks Semanais Completos</h2>
        <p className="checks-count">{stats.checkpointsConcluidos} semanas avaliadas</p>
      </div>

      {/* Último Estudo */}
      {stats.ultimoEstudo && (
        <div className="ultimo-estudo">
          <p>📆 Último estudo: {new Date(stats.ultimoEstudo).toLocaleDateString('pt-BR')}</p>
        </div>
      )}

      {/* Botão Reconfigurar */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          onClick={handleReconfigurar}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#ff5252'}
          onMouseOut={(e) => e.currentTarget.style.background = '#ff6b6b'}
        >
          ⚙️ Reconfigurar Plano de Estudos
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
