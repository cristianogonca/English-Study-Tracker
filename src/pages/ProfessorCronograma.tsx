import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { professorService } from '../services/SupabaseProfessorService';
import { DiaEstudo, AlunoView, Tarefa, TipoConteudo, NivelDificuldade } from '../types';
import './ProfessorCronograma.css';

export default function ProfessorCronograma() {
  const { alunoId } = useParams<{ alunoId: string }>();
  const navigate = useNavigate();
  
  const [aluno, setAluno] = useState<AlunoView | null>(null);
  const [cronograma, setCronograma] = useState<DiaEstudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  
  const [mesAtual, setMesAtual] = useState(1);
  const [diaEditando, setDiaEditando] = useState<DiaEstudo | null>(null);
  const [formData, setFormData] = useState({
    tituloSemana: '',
    tempoTotal: 60,
    tarefas: [] as Tarefa[]
  });

  useEffect(() => {
    carregarDados();
  }, [alunoId]);

  const carregarDados = async () => {
    if (!alunoId) return;

    try {
      setLoading(true);
      setErro('');

      const [alunoData, cronogramaData] = await Promise.all([
        professorService.buscarAluno(alunoId),
        professorService.buscarCronogramaAluno(alunoId)
      ]);

      if (!alunoData) {
        setErro('Aluno não encontrado');
        return;
      }

      setAluno(alunoData);
      setCronograma(cronogramaData);
      console.log('✅ [ProfessorCronograma] Cronograma carregado:', cronogramaData.length, 'dias');
      console.log('📋 Exemplo de dia com tarefas:', cronogramaData.find(d => d.tarefas && d.tarefas.length > 0));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados do aluno');
    } finally {
      setLoading(false);
    }
  };

  const diasDoMes = cronograma.filter(dia => dia.mes === mesAtual);

  const getTipoColor = (tipo: TipoConteudo): string => {
    const cores: Record<TipoConteudo, string> = {
      [TipoConteudo.GRAMATICA]: '#6366f1',
      [TipoConteudo.VOCABULARIO]: '#8b5cf6',
      [TipoConteudo.LISTENING]: '#ec4899',
      [TipoConteudo.SPEAKING]: '#f59e0b',
      [TipoConteudo.READING]: '#10b981',
      [TipoConteudo.WRITING]: '#3b82f6',
      [TipoConteudo.REVISAO]: '#6b7280'
    };
    return cores[tipo] || '#6b7280';
  };

  const getTipoLabel = (tipo: TipoConteudo): string => {
    const labels: Record<TipoConteudo, string> = {
      [TipoConteudo.GRAMATICA]: 'gramática',
      [TipoConteudo.VOCABULARIO]: 'vocabulário',
      [TipoConteudo.LISTENING]: 'listening',
      [TipoConteudo.SPEAKING]: 'speaking',
      [TipoConteudo.READING]: 'reading',
      [TipoConteudo.WRITING]: 'writing',
      [TipoConteudo.REVISAO]: 'revisão'
    };
    return labels[tipo] || tipo;
  };

  const abrirEdicao = (dia: DiaEstudo) => {
    console.log('🔍 [ProfessorCronograma] Abrindo edição do dia:', dia);
    console.log('📋 Tarefas do dia:', dia.tarefas);
    setDiaEditando(dia);
    setFormData({
      tituloSemana: dia.tituloSemana || '',
      tempoTotal: dia.tempoTotal,
      tarefas: dia.tarefas || []
    });
  };

  const fecharEdicao = () => {
    setDiaEditando(null);
    setFormData({ tituloSemana: '', tempoTotal: 60, tarefas: [] });
  };

  const adicionarTarefa = () => {
    const novaTarefa: Tarefa = {
      id: `temp-${Date.now()}`,
      titulo: '',
      descricao: '',
      tipo: TipoConteudo.GRAMATICA,
      nivel: NivelDificuldade.BASICO,
      duracaoEstimada: 30,
      ordem: formData.tarefas.length + 1
    };
    
    setFormData({
      ...formData,
      tarefas: [...formData.tarefas, novaTarefa]
    });
  };

  const removerTarefa = (index: number) => {
    setFormData({
      ...formData,
      tarefas: formData.tarefas.filter((_, i) => i !== index)
    });
  };

  const atualizarTarefa = (index: number, campo: keyof Tarefa, valor: any) => {
    const novasTarefas = [...formData.tarefas];
    novasTarefas[index] = { ...novasTarefas[index], [campo]: valor };
    setFormData({ ...formData, tarefas: novasTarefas });
  };

  const salvarEdicao = async () => {
    if (!diaEditando?.id) return;

    try {
      setSalvando(true);
      
      await professorService.atualizarDiaCronograma(diaEditando.id, {
        tituloSemana: formData.tituloSemana,
        tempoTotal: formData.tempoTotal,
        tarefas: formData.tarefas
      });

      // Atualizar no estado local
      setCronograma(prev => 
        prev.map(dia => 
          dia.id === diaEditando.id 
            ? { ...dia, tituloSemana: formData.tituloSemana, tempoTotal: formData.tempoTotal, tarefas: formData.tarefas }
            : dia
        )
      );

      fecharEdicao();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="professor-cronograma">
        <div className="loading">Carregando cronograma...</div>
      </div>
    );
  }

  if (erro || !aluno) {
    return (
      <div className="professor-cronograma">
        <div className="erro">{erro || 'Aluno não encontrado'}</div>
        <button onClick={() => navigate('/professor')} className="btn-voltar">
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="professor-cronograma">
      <header className="page-header">
        <button onClick={() => navigate('/professor')} className="btn-voltar-header">
          ← Voltar
        </button>
        <h1>📅 Cronograma de {aluno.nome}</h1>
        <p>{aluno.email}</p>
      </header>

      <div className="mes-selector">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(mes => (
          <button
            key={mes}
            className={`mes-btn ${mesAtual === mes ? 'ativo' : ''}`}
            onClick={() => setMesAtual(mes)}
          >
            Mês {mes}
          </button>
        ))}
      </div>

      <div className="dias-grid">
        {diasDoMes.map(dia => (
          <div key={dia.id} className={`dia-card ${dia.concluido ? 'concluido' : ''}`}>
            <div className="dia-header">
              <span className="dia-numero">Dia {dia.numero}</span>
              <span className="dia-fase">Fase {dia.fase}</span>
            </div>
            
            <div className="dia-info">
              <p className="dia-semana">Semana {dia.semana}</p>
              <p className="dia-titulo">{dia.tituloSemana || 'Sem título'}</p>
              <p className="dia-tempo">{dia.tempoTotal} min</p>
              {dia.data && (
                <p className="dia-data">{new Date(dia.data).toLocaleDateString('pt-BR')}</p>
              )}
              {dia.tarefas && dia.tarefas.length > 0 && (
                <div className="dia-tarefas-preview">
                  <p className="tarefas-count">📋 {dia.tarefas.length} tarefa{dia.tarefas.length !== 1 ? 's' : ''}</p>
                </div>
              )}
            </div>

            <button
              className="btn-editar"
              onClick={() => abrirEdicao(dia)}
            >
              ✏️ Editar
            </button>
          </div>
        ))}
      </div>

      {diaEditando && (
        <div className="modal-overlay" onClick={fecharEdicao}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Editar Dia {diaEditando.numero}</h2>
            
            <div className="form-group">
              <label>Título da Semana:</label>
              <input
                type="text"
                value={formData.tituloSemana}
                onChange={(e) => setFormData({ ...formData, tituloSemana: e.target.value })}
                placeholder="Ex: Introdução ao Present Simple"
              />
            </div>

            <div className="form-group">
              <label>Tempo Total (minutos):</label>
              <input
                type="number"
                value={formData.tempoTotal}
                onChange={(e) => setFormData({ ...formData, tempoTotal: parseInt(e.target.value) || 60 })}
                min="15"
                max="240"
              />
            </div>

            <div className="form-group">
              <label>Tarefas do Dia:</label>
              <div className="tarefas-lista">
                {formData.tarefas.map((tarefa, index) => (
                  <div key={tarefa.id || index} className="tarefa-card">
                    <div className="tarefa-header">
                      <span className="tarefa-badge" style={{ backgroundColor: getTipoColor(tarefa.tipo) }}>
                        {getTipoLabel(tarefa.tipo)}
                      </span>
                      <button
                        type="button"
                        className="btn-remover-tarefa"
                        onClick={() => removerTarefa(index)}
                        title="Remover tarefa"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="tarefa-campo">
                      <label>Título:</label>
                      <input
                        type="text"
                        value={tarefa.titulo}
                        onChange={(e) => atualizarTarefa(index, 'titulo', e.target.value)}
                        placeholder="Ex: Alfabeto e Pronúncia"
                      />
                    </div>

                    <div className="tarefa-campo">
                      <label>Descrição:</label>
                      <textarea
                        value={tarefa.descricao}
                        onChange={(e) => atualizarTarefa(index, 'descricao', e.target.value)}
                        placeholder="Ex: Estudar o alfabeto inglês e pronúncia básica"
                        rows={2}
                      />
                    </div>

                    <div className="tarefa-row">
                      <div className="tarefa-campo">
                        <label>Tipo:</label>
                        <select
                          value={tarefa.tipo}
                          onChange={(e) => atualizarTarefa(index, 'tipo', e.target.value as TipoConteudo)}
                        >
                          <option value={TipoConteudo.GRAMATICA}>Gramática</option>
                          <option value={TipoConteudo.VOCABULARIO}>Vocabulário</option>
                          <option value={TipoConteudo.LISTENING}>Listening</option>
                          <option value={TipoConteudo.SPEAKING}>Speaking</option>
                          <option value={TipoConteudo.READING}>Reading</option>
                          <option value={TipoConteudo.WRITING}>Writing</option>
                          <option value={TipoConteudo.REVISAO}>Revisão</option>
                        </select>
                      </div>

                      <div className="tarefa-campo">
                        <label>Duração (min):</label>
                        <input
                          type="number"
                          value={tarefa.duracaoEstimada}
                          onChange={(e) => atualizarTarefa(index, 'duracaoEstimada', parseInt(e.target.value) || 30)}
                          min="5"
                          max="120"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-adicionar-tarefa"
                onClick={adicionarTarefa}
              >
                + Adicionar Tarefa
              </button>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancelar"
                onClick={fecharEdicao}
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                className="btn-salvar"
                onClick={salvarEdicao}
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
