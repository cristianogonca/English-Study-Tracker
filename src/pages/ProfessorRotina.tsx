import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { professorService } from '../services/SupabaseProfessorService';
import { AtividadeSemanal, AlunoView } from '../types';
import './ProfessorRotina.css';

export default function ProfessorRotina() {
  const { alunoId } = useParams<{ alunoId: string }>();
  const navigate = useNavigate();
  
  const [aluno, setAluno] = useState<AlunoView | null>(null);
  const [rotina, setRotina] = useState<AtividadeSemanal[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  useEffect(() => {
    carregarDados();
  }, [alunoId]);

  const carregarDados = async () => {
    if (!alunoId) return;

    try {
      setLoading(true);
      setErro('');

      const [alunoData, rotinaData] = await Promise.all([
        professorService.buscarAluno(alunoId),
        professorService.buscarRotinaSemanal(alunoId)
      ]);

      if (!alunoData) {
        setErro('Student not found');
        return;
      }

      setAluno(alunoData);
      setRotina(rotinaData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Error loading student data');
    } finally {
      setLoading(false);
    }
  };

  const atualizarAtividade = (diaSemana: number, campo: keyof AtividadeSemanal, valor: string) => {
    setRotina(prev => prev.map(atividade => 
      atividade.diaSemana === diaSemana 
        ? { ...atividade, [campo]: valor }
        : atividade
    ));
  };

  const salvar = async () => {
    if (!alunoId) return;

    try {
      setSalvando(true);
      setMensagemSucesso('');
      setErro('');

      // Atualizar cada atividade
      for (const atividade of rotina) {
        if (atividade.id) {
          await professorService.atualizarAtividadeSemanal(atividade.id, {
            nome: atividade.nome,
            descricao: atividade.descricao,
            icone: atividade.icone
          });
        }
      }

      setMensagemSucesso('Weekly routine updated successfully!');
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setMensagemSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar rotina:', error);
      setErro('Error saving weekly routine');
    } finally {
      setSalvando(false);
    }
  };

  const getDiaNome = (dia: number) => {
    const nomes = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return nomes[dia - 1];
  };

  if (loading) {
    return (
      <div className="professor-rotina">
        <div className="loading">Loading weekly routine...</div>
      </div>
    );
  }

  if (erro && !aluno) {
    return (
      <div className="professor-rotina">
        <button onClick={() => navigate('/professor')} className="btn-voltar-professor">
          ← Back to Student List
        </button>
        <div className="erro">{erro}</div>
      </div>
    );
  }

  return (
    <div className="professor-rotina">
      <button onClick={() => navigate('/professor')} className="btn-voltar-professor">
        ← Back to Student List
      </button>
      
      <header className="page-header">
        <h1>📅 {aluno?.nome || 'Student'}'s Weekly Routine</h1>
        <p>{aluno?.email}</p>
      </header>

      {mensagemSucesso && (
        <div className="mensagem-sucesso">
          ✓ {mensagemSucesso}
        </div>
      )}

      {erro && (
        <div className="mensagem-erro">
          ✗ {erro}
        </div>
      )}

      <div className="rotina-grid">
        {rotina.length === 0 ? (
          <div className="sem-rotina">
            <p>No routine configured for this student.</p>
            <p>The default routine will be automatically created on the student's next access.</p>
          </div>
        ) : (
          rotina.map((atividade) => (
            <div key={atividade.diaSemana} className="atividade-card">
              <div className="atividade-header">
                <span className="dia-badge">
                  Day {atividade.diaSemana} - {getDiaNome(atividade.diaSemana)}
                </span>
              </div>

              <div className="atividade-campo">
                <label>Icon:</label>
                <input
                  type="text"
                  value={atividade.icone}
                  onChange={(e) => atualizarAtividade(atividade.diaSemana, 'icone', e.target.value)}
                  placeholder="📝"
                  maxLength={2}
                  className="input-icone"
                />
              </div>

              <div className="atividade-campo">
                <label>Activity Name:</label>
                <input
                  type="text"
                  value={atividade.nome}
                  onChange={(e) => atualizarAtividade(atividade.diaSemana, 'nome', e.target.value)}
                  placeholder="Ex: Grammar + Exercises"
                />
              </div>

              <div className="atividade-campo">
                <label>Description:</label>
                <textarea
                  value={atividade.descricao}
                  onChange={(e) => atualizarAtividade(atividade.diaSemana, 'descricao', e.target.value)}
                  placeholder="Describe the daily activity..."
                  rows={3}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {rotina.length > 0 && (
        <div className="acoes-footer">
          <button 
            onClick={salvar} 
            disabled={salvando}
            className="btn-salvar"
          >
            {salvando ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
