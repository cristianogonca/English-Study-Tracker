import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { professorService } from '../services/SupabaseProfessorService';
import { DiaEstudo, AlunoView } from '../types';
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
    tempoTotal: 60
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
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados do aluno');
    } finally {
      setLoading(false);
    }
  };

  const diasDoMes = cronograma.filter(dia => dia.mes === mesAtual);

  const abrirEdicao = (dia: DiaEstudo) => {
    setDiaEditando(dia);
    setFormData({
      tituloSemana: dia.tituloSemana || '',
      tempoTotal: dia.tempoTotal
    });
  };

  const fecharEdicao = () => {
    setDiaEditando(null);
    setFormData({ tituloSemana: '', tempoTotal: 60 });
  };

  const salvarEdicao = async () => {
    if (!diaEditando?.id) return;

    try {
      setSalvando(true);
      
      await professorService.atualizarDiaCronograma(diaEditando.id, {
        tituloSemana: formData.tituloSemana,
        tempoTotal: formData.tempoTotal
      });

      // Atualizar no estado local
      setCronograma(prev => 
        prev.map(dia => 
          dia.id === diaEditando.id 
            ? { ...dia, ...formData }
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
