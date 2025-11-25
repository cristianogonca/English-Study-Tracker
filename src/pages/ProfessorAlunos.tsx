import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { professorService } from '../services/SupabaseProfessorService';
import { AlunoView } from '../types';
import './ProfessorAlunos.css';

export default function ProfessorAlunos() {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState<AlunoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    try {
      setLoading(true);
      setErro('');
      
      // Verificar se é professor
      const isProfessor = await professorService.isProfessor();
      if (!isProfessor) {
        setErro('You do not have permission to access this page');
        return;
      }

      const data = await professorService.listarAlunos();
      setAlunos(data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setErro('Error loading student list');
    } finally {
      setLoading(false);
    }
  };

  const alunosFiltrados = alunos.filter(aluno => 
    aluno.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    aluno.email?.toLowerCase().includes(busca.toLowerCase())
  );

  const calcularProgresso = (aluno: AlunoView) => {
    // Se a view retorna progresso_percentual, usa ele (baseado em tempo)
    if (aluno.progresso_percentual !== undefined && aluno.progresso_percentual !== null) {
      return Math.min(100, Math.round(aluno.progresso_percentual));
    }
    // Fallback: calcula baseado em dias concluídos
    if (!aluno.total_dias || aluno.total_dias === 0) return 0;
    return Math.round((aluno.dias_concluidos / aluno.total_dias) * 100);
  };

  if (loading) {
    return (
      <div className="professor-alunos">
        <div className="loading">Loading students...</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="professor-alunos">
        <div className="erro">{erro}</div>
      </div>
    );
  }

  return (
    <div className="professor-alunos">
      <header className="page-header">
        <h1>👨‍🏫 My Students</h1>
        <p>Manage your students' schedule and study guide</p>
      </header>

      <div className="busca-container">
        <input
          type="text"
          placeholder="Search student by name or email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="busca-input"
        />
      </div>

      {alunosFiltrados.length === 0 ? (
        <div className="sem-alunos">
          <p>No students found</p>
        </div>
      ) : (
        <div className="alunos-grid">
          {alunosFiltrados.map((aluno) => (
            <div key={aluno.id} className="aluno-card">
              <div className="aluno-header">
                <h3>{aluno.nome || 'No name'}</h3>
                <span className="aluno-email">{aluno.email}</span>
              </div>

              <div className="aluno-stats">
                <div className="stat">
                  <span className="stat-label">📅 Start:</span>
                  <span className="stat-value">
                    {aluno.data_inicio 
                      ? new Date(aluno.data_inicio).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Not configured'
                    }
                  </span>
                </div>

                <div className="stat">
                  <span className="stat-label">⏱️ Time Studied:</span>
                  <span className="stat-value">
                    {aluno.minutos_estudados 
                      ? `${Math.floor(aluno.minutos_estudados / 60)}h ${aluno.minutos_estudados % 60}min`
                      : '0h 0min'
                    }
                  </span>
                </div>

                <div className="stat">
                  <span className="stat-label">🎯 Weekly Goal:</span>
                  <span className="stat-value">{aluno.horas_semanais || 0}h</span>
                </div>

                <div className="stat">
                  <span className="stat-label">📈 Days:</span>
                  <span className="stat-value">
                    {aluno.dias_concluidos || 0} / {aluno.total_dias || 0}
                  </span>
                </div>

                <div className="stat">
                  <span className="stat-label">📚 Guide:</span>
                  <span className="stat-value">
                    {aluno.meses_guia || 0} / 12 months
                  </span>
                </div>

                <div className="progresso-container">
                  <span className="progresso-label">Overall Progress:</span>
                  <div className="progresso-bar">
                    <div 
                      className="progresso-fill" 
                      style={{ width: `${calcularProgresso(aluno)}%` }}
                    />
                  </div>
                  <span className="progresso-percent">{calcularProgresso(aluno)}%</span>
                </div>
              </div>

              <div className="aluno-actions">
                <button
                  className="btn-action btn-cronograma"
                  onClick={() => navigate(`/professor/cronograma/${aluno.id}`)}
                >
                  📅 Schedule
                </button>
                <button
                  className="btn-action btn-guia"
                  onClick={() => navigate(`/professor/guia/${aluno.id}`)}
                >
                  📚 Study Guide
                </button>
                {/* <button
                  className="btn-action btn-rotina"
                  onClick={() => navigate(`/professor/rotina/${aluno.id}`)}
                >
                  🔄 Weekly Routine
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
