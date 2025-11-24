import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { provasService } from '../services/SupabaseProvasServiceSimples';
import type { Prova, QuestaoData, RespostaData } from '../types/provas';
import './ProfessorProvas.css';

export default function CorrigirProva() {
  const navigate = useNavigate();
  const { provaId } = useParams<{ provaId: string }>();
  
  const [prova, setProva] = useState<Prova | null>(null);
  const [respostasCorrigidas, setRespostasCorrigidas] = useState<RespostaData[]>([]);
  const [comentarioGeral, setComentarioGeral] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarProva();
  }, [provaId]);

  const carregarProva = async () => {
    if (!provaId) return;
    
    try {
      setLoading(true);
      const data = await provasService.buscarProva(provaId);
      if (!data) {
        setErro('Test not found');
        return;
      }
      setProva(data);
      
      // Inicializar respostas corrigidas
      const respostasIniciais: RespostaData[] = data.respostas.map((r: RespostaData) => ({
        ...r,
        correta: r.correta !== undefined ? r.correta : null,
        pontos_obtidos: r.pontos_obtidos || 0,
        comentario: r.comentario || ''
      }));
      setRespostasCorrigidas(respostasIniciais);
      setComentarioGeral(data.comentario_geral || '');
    } catch (error) {
      console.error('Erro ao carregar prova:', error);
      setErro('Error loading test');
    } finally {
      setLoading(false);
    }
  };

  const atualizarResposta = (numero: number, campo: keyof RespostaData, valor: any) => {
    setRespostasCorrigidas(prev => prev.map(r => 
      r.numero === numero ? { ...r, [campo]: valor } : r
    ));
  };

  const corrigirAutomaticamenteMultiplaEscolha = () => {
    if (!prova) return;

    const novasRespostas = respostasCorrigidas.map(r => {
      const questao = prova.questoes.find((q: QuestaoData) => q.numero === r.numero);
      if (questao && questao.tipo === 'multipla_escolha' && questao.resposta_correta) {
        const correta = r.resposta === questao.resposta_correta;
        return {
          ...r,
          correta,
          pontos_obtidos: correta ? questao.pontos : 0
        };
      }
      return r;
    });

    setRespostasCorrigidas(novasRespostas);
    alert('✅ Multiple choice questions graded automatically!');
  };

  const calcularNotaFinal = (): number => {
    return respostasCorrigidas.reduce((total, r) => total + (r.pontos_obtidos || 0), 0);
  };

  const salvarCorrecao = async () => {
    if (!provaId) return;

    const notaFinal = calcularNotaFinal();

    try {
      await provasService.corrigirProva(
        provaId,
        respostasCorrigidas,
        notaFinal,
        comentarioGeral || undefined
      );
      alert('✅ Grading saved successfully!');
      navigate('/professor/provas');
    } catch (error) {
      console.error('Erro ao salvar correção:', error);
      alert('❌ Error saving grading');
    }
  };

  if (loading) {
    return <div className="professor-provas"><div className="loading">Loading...</div></div>;
  }

  if (erro || !prova) {
    return <div className="professor-provas"><div className="erro">{erro || 'Test not found'}</div></div>;
  }

  return (
    <div className="professor-provas corrigir-prova">
      <header className="page-header">
        <h1>✏️ Grade Test: {prova.titulo}</h1>
        <button className="btn-voltar" onClick={() => navigate('/professor/provas')}>
          ← Back
        </button>
      </header>

      <div className="correcao-header">
        <button className="btn-auto-corrigir" onClick={corrigirAutomaticamenteMultiplaEscolha}>
          🤖 Auto-grade Multiple Choice
        </button>
        <div className="nota-total">
          <strong>Total Score:</strong> {calcularNotaFinal().toFixed(2)} points
        </div>
      </div>

      <div className="questoes-correcao">
        {prova.questoes.map((questao: QuestaoData) => {
          const resposta = respostasCorrigidas.find(r => r.numero === questao.numero);
          if (!resposta) return null;

          return (
            <div key={questao.numero} className="questao-correcao-card">
              <div className="questao-header">
                <span className="numero">Question {questao.numero}</span>
                <span className="pontos-max">{questao.pontos} pts</span>
              </div>

              <p className="enunciado"><strong>Q:</strong> {questao.enunciado}</p>

              {questao.tipo === 'multipla_escolha' && questao.opcoes && (
                <div className="opcoes-gabarito">
                  <div className="opcoes-lista">
                    {questao.opcoes.map((opcao, idx) => {
                      const isCorreta = opcao === questao.resposta_correta;
                      const isRespostaAluno = opcao === resposta.resposta;
                      return (
                        <div 
                          key={idx} 
                          className={`opcao-item ${isCorreta ? 'opcao-correta' : ''} ${isRespostaAluno ? 'opcao-aluno' : ''}`}
                        >
                          <span className="opcao-letra">{String.fromCharCode(65 + idx)})</span>
                          <span className="opcao-texto">{opcao}</span>
                          {isCorreta && <span className="badge-correta">✓ Correct</span>}
                          {isRespostaAluno && <span className="badge-aluno">👤 Student chose this</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {questao.tipo === 'dissertativa' && (
                <div className="resposta-aluno">
                  <strong>Student's answer:</strong>
                  <p className="resposta-texto">{resposta.resposta || '(No answer)'}</p>
                </div>
              )}

              <div className="correcao-controles">
                <div className="form-group inline">
                  <label>Correct?</label>
                  <select 
                    value={resposta.correta === null ? '' : resposta.correta ? 'true' : 'false'}
                    onChange={(e) => atualizarResposta(
                      questao.numero, 
                      'correta', 
                      e.target.value === 'true' ? true : e.target.value === 'false' ? false : null
                    )}
                  >
                    <option value="">Not graded</option>
                    <option value="true">✅ Correct</option>
                    <option value="false">❌ Incorrect</option>
                  </select>
                </div>

                <div className="form-group inline">
                  <label>Points:</label>
                  <input
                    type="number"
                    value={resposta.pontos_obtidos || 0}
                    onChange={(e) => atualizarResposta(questao.numero, 'pontos_obtidos', parseFloat(e.target.value) || 0)}
                    min="0"
                    max={questao.pontos}
                    step="0.5"
                  />
                  <span className="de-max">/ {questao.pontos}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Feedback (optional):</label>
                <textarea
                  value={resposta.comentario || ''}
                  onChange={(e) => atualizarResposta(questao.numero, 'comentario', e.target.value)}
                  placeholder="Comment on the student's answer..."
                  rows={2}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="comentario-geral-section">
        <h3>💬 General Feedback (optional)</h3>
        <textarea
          value={comentarioGeral}
          onChange={(e) => setComentarioGeral(e.target.value)}
          placeholder="Overall feedback for the student..."
          rows={4}
        />
      </div>

      <div className="form-actions">
        <button className="btn-primary btn-large" onClick={salvarCorrecao}>
          ✅ Save Grading
        </button>
        <button className="btn-secondary" onClick={() => navigate('/professor/provas')}>
          Cancel
        </button>
      </div>
    </div>
  );
}
