import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../contexts/StudyContext';
import SupabaseStudyService from '../services/SupabaseStudyService';
import { supabase } from '../lib/supabase';
import { Estatisticas, MetaSemanal } from '../types';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { fases } = useStudy();
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [metaAtual, setMetaAtual] = useState<MetaSemanal | null>(null);
  const [carregando, setCarregando] = useState(true);
  const jaCarregou = useRef(false);

  useEffect(() => {
    if (!jaCarregou.current) {
      jaCarregou.current = true;
      carregarDados();
    }
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      // Buscar configuração do usuário para pegar a meta semanal
      const config = await SupabaseStudyService.obterConfiguracao();
      const metaSemanalConfig = config?.metaSemanal || 420;
      
      // Buscar dados das tabelas
      const progressos = await SupabaseStudyService.obterProgressoTarefas();
      const palavras = await SupabaseStudyService.obterVocabulario();
      const checks = await SupabaseStudyService.obterChecks();
      
      // Calcular estatísticas
      const tempoTotalMinutos = progressos.reduce((acc, p) => acc + (p.tempoGasto || 0), 0);
      const horasAcumuladas = Math.floor(tempoTotalMinutos / 60);
      const diasEstudados = progressos.length;
      const mediaMinutosDia = diasEstudados > 0 ? Math.round(tempoTotalMinutos / diasEstudados) : 0;
      
      // Calcular sequência (dias consecutivos)
      const datasOrdenadas = progressos
        .map(p => p.tarefaId.replace('registro_', ''))
        .sort()
        .reverse();
      
      let sequenciaAtual = 0;
      let melhorSequencia = 0;
      let sequenciaTemp = 0;
      
      for (let i = 0; i < datasOrdenadas.length; i++) {
        const dataAtual = new Date(datasOrdenadas[i]);
        const dataAnterior = i > 0 ? new Date(datasOrdenadas[i - 1]) : null;
        
        if (i === 0) {
          sequenciaTemp = 1;
          const hoje = new Date().toISOString().split('T')[0];
          if (datasOrdenadas[0] === hoje) {
            sequenciaAtual = 1;
          }
        } else if (dataAnterior) {
          const diffDias = Math.round((dataAnterior.getTime() - dataAtual.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDias === 1) {
            sequenciaTemp++;
            if (i === 1) sequenciaAtual = sequenciaTemp;
          } else {
            melhorSequencia = Math.max(melhorSequencia, sequenciaTemp);
            sequenciaTemp = 1;
          }
        }
      }
      melhorSequencia = Math.max(melhorSequencia, sequenciaTemp, sequenciaAtual);
      
      // Último estudo
      const ultimoEstudo = datasOrdenadas.length > 0 ? datasOrdenadas[0] : null;
      
      setStats({
        sequenciaAtual,
        melhorSequencia,
        horasAcumuladas,
        tempoTotalMinutos,
        diasEstudados,
        mediaMinutosDia,
        palavrasAprendidas: palavras.length,
        tarefasConcluidas: progressos.filter(p => p.status === 'concluida').length,
        tarefasPendentes: 0,
        faseAtual: 1,
        progressoFaseAtual: 0,
        checkpointsConcluidos: checks.length,
        ultimoEstudo,
      });
      
      // Meta semanal - calcular número da semana baseado na data de início
      const hoje = new Date();
      
      // Calcular semana do programa baseado na data de início
      let numeroSemana = 1;
      if (config?.dataInicio) {
        const dataInicio = new Date(config.dataInicio);
        const diffDias = Math.floor((hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
        numeroSemana = Math.max(1, Math.ceil((diffDias + 1) / 7));
      }
      
      // Calcular início da semana atual do calendário (para filtrar progressos)
      const inicioDaSemana = new Date(hoje);
      inicioDaSemana.setDate(hoje.getDate() - hoje.getDay());
      const inicioSemanaStr = inicioDaSemana.toISOString().split('T')[0];
      
      const progressosDaSemana = progressos.filter(p => {
        const dataProgresso = p.tarefaId.replace('registro_', '');
        return dataProgresso >= inicioSemanaStr;
      });
      
      const minutosRealizadosSemana = progressosDaSemana.reduce((acc, p) => acc + (p.tempoGasto || 0), 0);
      
      setMetaAtual({
        id: '1',
        semana: numeroSemana,
        metaMinutos: metaSemanalConfig,
        minutosRealizados: minutosRealizadosSemana,
        cumprida: minutosRealizadosSemana >= metaSemanalConfig,
        diasRestantes: 7 - hoje.getDay(),
        minutosRealocados: 0,
        status: minutosRealizadosSemana >= metaSemanalConfig ? 'cumprida' : 'em_andamento'
      });
    } catch (error) {
      // Log apenas para debug - identifica problema real
      if (progressos.length > 0 || palavras.length > 0 || checks.length > 0) {
        console.warn('[Dashboard] Erro inesperado com dados existentes:', error);
      }
      // Valores zerados como fallback
      setStats({
        sequenciaAtual: 0,
        melhorSequencia: 0,
        horasAcumuladas: 0,
        tempoTotalMinutos: 0,
        diasEstudados: 0,
        mediaMinutosDia: 0,
        palavrasAprendidas: 0,
        tarefasConcluidas: 0,
        tarefasPendentes: 0,
        faseAtual: 1,
        progressoFaseAtual: 0,
        checkpointsConcluidos: 0,
        ultimoEstudo: null,
      });
      setMetaAtual(null);
    } finally {
      setCarregando(false);
    }
  };

  // Nunca redireciona para /setup, apenas mostra erro e botão de recarregar
  const handleReconfigurar = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL your progress!\n\nYou will lose:\n- Complete schedule\n- Learned vocabulary\n- Weekly checks\n- Task progress\n- Settings\n- Phases\n\nDo you want to continue?')) {
      return;
    }

    try {
      const usuario = await supabase.auth.getUser();
      const userId = usuario.data.user?.id;

      if (!userId) {
        alert('❌ Error: user not identified');
        return;
      }

      console.log('[Reconfigurar] Deletando dados do usuário:', userId);

      // Deletar cada tabela individualmente com log
      console.log('[Reconfigurar] Deletando user_configs...');
      const r1 = await supabase.from('user_configs').delete().eq('user_id', userId);
      console.log('[Reconfigurar] user_configs:', r1.error ? `ERRO: ${r1.error.message}` : `OK - ${r1.count || 0} linhas deletadas`);

      console.log('[Reconfigurar] Deletando cronograma...');
      const r2 = await supabase.from('cronograma').delete().eq('user_id', userId);
      console.log('[Reconfigurar] cronograma:', r2.error ? `ERRO: ${r2.error.message}` : `OK - ${r2.count || 0} linhas deletadas`);

      console.log('[Reconfigurar] Deletando vocabulario...');
      const r3 = await supabase.from('vocabulario').delete().eq('user_id', userId);
      console.log('[Reconfigurar] vocabulario:', r3.error ? `ERRO: ${r3.error.message}` : `OK - ${r3.count || 0} linhas deletadas`);

      console.log('[Reconfigurar] Deletando checks_semanais...');
      const r4 = await supabase.from('checks_semanais').delete().eq('user_id', userId);
      console.log('[Reconfigurar] checks_semanais:', r4.error ? `ERRO: ${r4.error.message}` : `OK - ${r4.count || 0} linhas deletadas`);

      console.log('[Reconfigurar] Deletando progresso_tarefas...');
      const r5 = await supabase.from('progresso_tarefas').delete().eq('user_id', userId);
      console.log('[Reconfigurar] progresso_tarefas:', r5.error ? `ERRO: ${r5.error.message}` : `OK - ${r5.count || 0} linhas deletadas`);

      console.log('[Reconfigurar] Deletando fases...');
      const r6 = await supabase.from('fases').delete().eq('user_id', userId);
      console.log('[Reconfigurar] fases:', r6.error ? `ERRO: ${r6.error.message}` : `OK - ${r6.count || 0} linhas deletadas`);

      console.log('[Reconfigurar] Deletando guia_estudos...');
      const r7 = await supabase.from('guia_estudos').delete().eq('user_id', userId);
      console.log('[Reconfigurar] guia_estudos:', r7.error ? `ERRO: ${r7.error.message}` : `OK - ${r7.count || 0} linhas deletadas`);

      console.log('[Reconfigurar] Deletando rotina_semanal...');
      const r8 = await supabase.from('rotina_semanal').delete().eq('user_id', userId);
      console.log('[Reconfigurar] rotina_semanal:', r8.error ? `ERRO: ${r8.error.message}` : `OK - ${r8.count || 0} linhas deletadas`);

      // Verificar se houve erros
      const erros = [r1, r2, r3, r4, r5, r6, r7, r8].filter(r => r.error);
      if (erros.length > 0) {
        console.error('[Reconfigurar] Erros encontrados:', erros.map(e => e.error?.message));
        alert(`❌ Error deleting some data:\n${erros.map(e => e.error?.message).join('\n')}`);
        return;
      }

      console.log('[Reconfigurar] Todos os dados deletados com sucesso!');
      alert('✅ All data has been deleted! Redirecting to setup...');
      
      // Forçar reload completo para limpar cache do Supabase
      window.location.href = '/setup';
    } catch (error) {
      console.error('[Reconfigurar] Erro ao reconfigurar:', error);
      alert('❌ Error deleting data. Try again.');
    }
  };

  // Mostra loading enquanto carrega
  if (carregando) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading statistics...
      </div>
    );
  }

  // Só mostra erro se NÃO está carregando E stats é null
  if (!carregando && !stats) {
    return (
      <div className="loading" style={{color:'red',padding:'2rem'}}>
        Error loading user statistics.<br />
        Try reloading or logging in again.<br />
        <button onClick={handleReconfigurar}>Reload</button>
      </div>
    );
  }

  const progressoMeta = metaAtual 
    ? Math.round((metaAtual.minutosRealizados / metaAtual.metaMinutos) * 100)
    : 0;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📚 Dashboard</h1>
        <p>Track your English learning progress</p>
      </header>

      <div className="stats-grid">
        {/* Card: Streak */}
        <div className="stat-card streak">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Current Streak</h3>
            <p className="stat-value">{stats.sequenciaAtual} days</p>
            <span className="stat-subtitle">Best: {stats.melhorSequencia} days</span>
          </div>
        </div>

        {/* Card: Hours Studied */}
        <div className="stat-card hours">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Total Hours</h3>
            <p className="stat-value">{stats.horasAcumuladas}h</p>
            <span className="stat-subtitle">{stats.tempoTotalMinutos} minutes</span>
          </div>
        </div>

        {/* Card: Days Studied */}
        <div className="stat-card days">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Days Studied</h3>
            <p className="stat-value">{stats.diasEstudados}</p>
            <span className="stat-subtitle">Average: {stats.mediaMinutosDia} min/day</span>
          </div>
        </div>

        {/* Card: Vocabulary */}
        <div className="stat-card vocab">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <h3>Words Learned</h3>
            <p className="stat-value">{stats.palavrasAprendidas}</p>
            <span className="stat-subtitle">Vocabulary growing!</span>
          </div>
        </div>

        {/* Card: Tasks */}
        <div className="stat-card tasks">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Tasks Completed</h3>
            <p className="stat-value">{stats.tarefasConcluidas}</p>
            <span className="stat-subtitle">{stats.tarefasPendentes} pending</span>
          </div>
        </div>

        {/* Card: Current Phase */}
        <div className="stat-card phase">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Current Phase</h3>
            <p className="stat-value">Phase {stats.faseAtual}</p>
            <span className="stat-subtitle">{stats.progressoFaseAtual}% complete</span>
          </div>
        </div>
      </div>

      {/* Weekly Goal */}
      {metaAtual && (
        <div className="meta-semanal">
          <h2>📊 Week {metaAtual.semana} Goal</h2>
          <div className="meta-content">
            <div className="meta-info">
              <p><strong>Goal:</strong> {metaAtual.metaMinutos} minutes ({Math.round(metaAtual.metaMinutos / 60 * 10) / 10} hours)</p>
              <p><strong>Completed:</strong> {metaAtual.minutosRealizados} minutes</p>
              <p><strong>Remaining:</strong> {metaAtual.metaMinutos - metaAtual.minutosRealizados} minutes</p>
              {metaAtual.minutosRealocados > 0 && (
                <p className="realocado"><strong>Reallocated:</strong> {metaAtual.minutosRealocados} min/day</p>
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
              {metaAtual.status === 'cumprida' && '✅ Completed'}
              {metaAtual.status === 'em_andamento' && '🔄 In progress'}
              {metaAtual.status === 'atrasada' && '⚠️ Delayed'}
              {metaAtual.status === 'realocada' && '📌 Reallocated'}
            </div>
          </div>
        </div>
      )}

      {/* Progress by Phase */}
      <div className="fases-progress">
        <h2>🎓 Progress by Phase</h2>
        <div className="fases-grid">
          {fases.map((fase) => (
            <div 
              key={fase.numero} 
              className={`fase-card ${stats.faseAtual === fase.numero ? 'active' : ''}`}
            >
              <h3>Phase {fase.numero}: {fase.nivel}</h3>
              <p>Months {fase.mesInicio}-{fase.mesFim} • {fase.horasTotal} hours</p>
              <div className="fase-bar">
                <div 
                  className="fase-fill" 
                  style={{ 
                    width: stats.faseAtual > fase.numero ? '100%' : 
                           stats.faseAtual === fase.numero ? `${stats.progressoFaseAtual}%` : '0%' 
                  }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>

      {/* Last Study */}
      {stats.ultimoEstudo && (
        <div className="ultimo-estudo">
          <p>📆 Last study: {new Date(stats.ultimoEstudo).toLocaleDateString('en-US')}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
