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
        setErro('Você não tem permissão para acessar esta página');
        return;
      }

      const data = await professorService.listarAlunos();
      setAlunos(data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setErro('Erro ao carregar lista de alunos');
    } finally {
      setLoading(false);
    }
  };

  const alunosFiltrados = alunos.filter(aluno => 
    aluno.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    aluno.email?.toLowerCase().includes(busca.toLowerCase())
  );

  const calcularProgresso = (aluno: AlunoView) => {
    if (!aluno.total_dias || aluno.total_dias === 0) return 0;
    return Math.round((aluno.dias_concluidos / aluno.total_dias) * 100);
  };

  if (loading) {
    return (
      <div className="professor-alunos">
        <div className="loading">Carregando alunos...</div>
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
        <h1>👨‍🏫 Meus Alunos</h1>
        <p>Gerencie o cronograma e guia de estudos dos seus alunos</p>
      </header>

      <div className="busca-container">
        <input
          type="text"
          placeholder="Buscar aluno por nome ou email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="busca-input"
        />
      </div>

      {alunosFiltrados.length === 0 ? (
        <div className="sem-alunos">
          <p>Nenhum aluno encontrado</p>
        </div>
      ) : (
        <div className="alunos-grid">
          {alunosFiltrados.map((aluno) => (
            <div key={aluno.id} className="aluno-card">
              <div className="aluno-header">
                <h3>{aluno.nome || 'Sem nome'}</h3>
                <span className="aluno-email">{aluno.email}</span>
              </div>

              <div className="aluno-stats">
                <div className="stat">
                  <span className="stat-label">Início:</span>
                  <span className="stat-value">
                    {aluno.data_inicio 
                      ? new Date(aluno.data_inicio).toLocaleDateString('pt-BR')
                      : 'Não configurado'
                    }
                  </span>
                </div>

                <div className="stat">
                  <span className="stat-label">Meta Diária:</span>
                  <span className="stat-value">{aluno.meta_diaria || 0}h</span>
                </div>

                <div className="stat">
                  <span className="stat-label">Meta Semanal:</span>
                  <span className="stat-value">{aluno.meta_semanal || 0}h</span>
                </div>

                <div className="stat">
                  <span className="stat-label">Progresso:</span>
                  <span className="stat-value">
                    {aluno.dias_concluidos || 0} / {aluno.total_dias || 0} dias
                  </span>
                </div>

                <div className="progresso-bar">
                  <div 
                    className="progresso-fill" 
                    style={{ width: `${calcularProgresso(aluno)}%` }}
                  />
                </div>
                <span className="progresso-percent">{calcularProgresso(aluno)}%</span>
              </div>

              <div className="aluno-actions">
                <button
                  className="btn-action btn-cronograma"
                  onClick={() => navigate(`/professor/cronograma/${aluno.id}`)}
                >
                  📅 Cronograma
                </button>
                <button
                  className="btn-action btn-guia"
                  onClick={() => navigate(`/professor/guia/${aluno.id}`)}
                >
                  📚 Guia de Estudos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
