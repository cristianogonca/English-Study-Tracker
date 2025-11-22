import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SupabaseStudyService from '../services/SupabaseStudyService';
import { supabase } from '../lib/supabase';
import { Estatisticas, MetaSemanal } from '../types';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [metaAtual, setMetaAtual] = useState<MetaSemanal | null>(null);
  const jaCarregou = useRef(false);

  useEffect(() => {
    if (!jaCarregou.current) {
      jaCarregou.current = true;
      carregarDados();
    }
  }, []);

  const carregarDados = async () => {
    try {
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
      
      // Meta semanal (simplificada)
      const hoje = new Date();
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
        semana: 1,
        metaMinutos: 420, // 7 horas
        minutosRealizados: minutosRealizadosSemana,
        cumprida: minutosRealizadosSemana >= 420,
        diasRestantes: 7 - hoje.getDay(),
        minutosRealocados: 0,
        status: minutosRealizadosSemana >= 420 ? 'cumprida' : 'em_andamento'
      });
    } catch (error) {
      // Silencioso: valores zerados quando não há dados ainda
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
    }
  };

  // Nunca redireciona para /setup, apenas mostra erro e botão de recarregar
  const handleReconfigurar = async () => {
    if (!confirm('⚠️ ATENÇÃO: Isso vai deletar TODO o seu progresso!\n\nSerá perdido:\n- Cronograma completo\n- Vocabulário aprendido\n- Checks semanais\n- Progresso de tarefas\n- Configurações\n- Fases\n\nDeseja continuar?')) {
      return;
    }

    try {
      const usuario = await supabase.auth.getUser();
      const userId = usuario.data.user?.id;

      if (!userId) {
        alert('❌ Erro: usuário não identificado');
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

      // Verificar se houve erros
      const erros = [r1, r2, r3, r4, r5, r6].filter(r => r.error);
      if (erros.length > 0) {
        console.error('[Reconfigurar] Erros encontrados:', erros.map(e => e.error?.message));
        alert(`❌ Erro ao deletar alguns dados:\n${erros.map(e => e.error?.message).join('\n')}`);
        return;
      }

      console.log('[Reconfigurar] Todos os dados deletados com sucesso!');
      alert('✅ Todos os dados foram deletados! Redirecionando para configuração...');
      
      // Forçar reload completo para limpar cache do Supabase
      window.location.href = '/setup';
    } catch (error) {
      console.error('[Reconfigurar] Erro ao reconfigurar:', error);
      alert('❌ Erro ao deletar dados. Tente novamente.');
    }
  };

  if (!stats) {
    return (
      <div className="loading" style={{color:'red',padding:'2rem'}}>
        Erro ao carregar estatísticas do usuário.<br />
        Tente recarregar ou entrar novamente.<br />
        <button onClick={handleReconfigurar}>Recarregar</button>
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
