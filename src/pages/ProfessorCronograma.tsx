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
        setErro('Student not found');
        return;
      }

      setAluno(alunoData);
      setCronograma(cronogramaData);
      console.log('✅ [ProfessorCronograma] Cronograma carregado:', cronogramaData.length, 'dias');
      console.log('📋 Exemplo de dia com tarefas:', cronogramaData.find(d => d.tarefas && d.tarefas.length > 0));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Error loading student data');
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
      alert('Error saving changes');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="professor-cronograma">
        <div className="loading">Loading schedule...</div>
      </div>
    );
  }

  if (erro || !aluno) {
    return (
      <div className="professor-cronograma">
        <button onClick={() => navigate('/professor')} className="btn-voltar-professor">
          ← Back to Student List
        </button>
        <div className="erro">{erro || 'Student not found'}</div>
      </div>
    );
  }

  return (
    <div className="professor-cronograma">
      <button onClick={() => navigate('/professor')} className="btn-voltar-professor">
        ← Back to Student List
      </button>
      
      <header className="page-header">
        <h1>📅 {aluno.nome}'s Schedule</h1>
        <p>{aluno.email}</p>
      </header>

      <div className="mes-selector">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(mes => (
          <button
            key={mes}
            className={`mes-btn ${mesAtual === mes ? 'ativo' : ''}`}
            onClick={() => setMesAtual(mes)}
          >
            Month {mes}
          </button>
        ))}
      </div>

      <div className="dias-grid">
        {diasDoMes.map(dia => (
          <div key={dia.id} className={`dia-card ${dia.concluido ? 'concluido' : ''}`}>
            <div className="dia-header">
              <span className="dia-numero">Day {dia.numero}</span>
              <span className="dia-fase">Phase {dia.fase}</span>
            </div>
            
            <div className="dia-info">
              <p className="dia-semana">Week {dia.semana}</p>
              <p className="dia-titulo">{dia.tituloSemana || 'No title'}</p>
              <p className="dia-tempo">{dia.tempoTotal} min</p>
              {dia.data && (
                <p className="dia-data">{new Date(dia.data).toLocaleDateString('en-US')}</p>
              )}
              {dia.tarefas && dia.tarefas.length > 0 && (
                <div className="dia-tarefas-preview">
                  <p className="tarefas-count">📋 {dia.tarefas.length} task{dia.tarefas.length !== 1 ? 's' : ''}</p>
                </div>
              )}
            </div>

            <button
              className="btn-editar"
              onClick={() => abrirEdicao(dia)}
            >
              ✏️ Edit
            </button>
          </div>
        ))}
      </div>

      {diaEditando && (
        <div className="modal-overlay" onClick={fecharEdicao}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Day {diaEditando.numero}</h2>
            
            <div className="form-group">
              <label>Week Title:</label>
              <input
                type="text"
                value={formData.tituloSemana}
                onChange={(e) => setFormData({ ...formData, tituloSemana: e.target.value })}
                placeholder="Ex: Introduction to Present Simple"
              />
            </div>

            <div className="form-group">
              <label>Total Time (minutes):</label>
              <input
                type="number"
                value={formData.tempoTotal}
                onChange={(e) => setFormData({ ...formData, tempoTotal: parseInt(e.target.value) || 60 })}
                min="15"
                max="240"
              />
            </div>

            <div className="form-group">
              <label>Daily Tasks:</label>
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
                        title="Remove task"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="tarefa-campo">
                      <label>Title:</label>
                      <input
                        type="text"
                        value={tarefa.titulo}
                        onChange={(e) => atualizarTarefa(index, 'titulo', e.target.value)}
                        placeholder="Ex: Alphabet and Pronunciation"
                      />
                    </div>

                    <div className="tarefa-campo">
                      <label>Description:</label>
                      <textarea
                        value={tarefa.descricao}
                        onChange={(e) => atualizarTarefa(index, 'descricao', e.target.value)}
                        placeholder="Ex: Study the English alphabet and basic pronunciation"
                        rows={2}
                      />
                    </div>

                    <div className="tarefa-row">
                      <div className="tarefa-campo">
                        <label>Type:</label>
                        <select
                          value={tarefa.tipo}
                          onChange={(e) => atualizarTarefa(index, 'tipo', e.target.value as TipoConteudo)}
                        >
                          <option value={TipoConteudo.GRAMATICA}>Grammar</option>
                          <option value={TipoConteudo.VOCABULARIO}>Vocabulary</option>
                          <option value={TipoConteudo.LISTENING}>Listening</option>
                          <option value={TipoConteudo.SPEAKING}>Speaking</option>
                          <option value={TipoConteudo.READING}>Reading</option>
                          <option value={TipoConteudo.WRITING}>Writing</option>
                          <option value={TipoConteudo.REVISAO}>Review</option>
                        </select>
                      </div>

                      <div className="tarefa-campo">
                        <label>Duration (min):</label>
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
                + Add Task
              </button>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancelar"
                onClick={fecharEdicao}
                disabled={salvando}
              >
                Cancel
              </button>
              <button
                className="btn-salvar"
                onClick={salvarEdicao}
                disabled={salvando}
              >
                {salvando ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
