import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { provasService } from '../services/SupabaseProvasServiceSimples';
import type { AlunoProvaLista, Prova, QuestaoData, RespostaData } from '../types/provas';
import './AlunoProvas.css';

export default function AlunoProvasNovo() {
  const navigate = useNavigate();
  const { provaId } = useParams<{ provaId?: string }>();
  
  const [provas, setProvas] = useState<AlunoProvaLista[]>([]);
  const [provaAtual, setProvaAtual] = useState<Prova | null>(null);
  const [respostas, setRespostas] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (provaId) {
      carregarProva();
    } else {
      carregarProvas();
    }
  }, [provaId]);

  const carregarProvas = async () => {
    try {
      setLoading(true);
      const data = await provasService.listarProvasAluno();
      setProvas(data);
    } catch (error) {
      console.error('Erro ao carregar provas:', error);
      setErro('Error loading tests');
    } finally {
      setLoading(false);
    }
  };

  const carregarProva = async () => {
    if (!provaId) return;
    
    try {
      setLoading(true);
      const prova = await provasService.buscarProva(provaId);
      if (!prova) {
        setErro('Test not found');
        return;
      }
      setProvaAtual(prova);
      
      // Carregar respostas existentes
      const respostasMap = new Map<number, string>();
      prova.respostas.forEach((r: RespostaData) => {
        respostasMap.set(r.numero, r.resposta);
      });
      setRespostas(respostasMap);
    } catch (error) {
      console.error('Erro ao carregar prova:', error);
      setErro('Error loading test');
    } finally {
      setLoading(false);
    }
  };

  const handleResposta = (numeroQuestao: number, resposta: string) => {
    const novasRespostas = new Map(respostas);
    novasRespostas.set(numeroQuestao, resposta);
    setRespostas(novasRespostas);
  };

  const submeterProva = async () => {
    if (!provaId || !provaAtual) return;

    // Verificar se todas as questões foram respondidas
    const totalQuestoes = provaAtual.questoes.length;
    if (respostas.size < totalQuestoes) {
      if (!confirm(`⚠️ You have only answered ${respostas.size} out of ${totalQuestoes} questions. Submit anyway?`)) {
        return;
      }
    }

    try {
      const respostasArray: Omit<RespostaData, 'correta' | 'pontos_obtidos' | 'comentario'>[] = [];
      provaAtual.questoes.forEach((q: QuestaoData) => {
        respostasArray.push({
          numero: q.numero,
          resposta: respostas.get(q.numero) || ''
        });
      });

      await provasService.responderProva(provaId, respostasArray);
      alert('✅ Test submitted successfully! Wait for your teacher to grade it.');
      navigate('/provas');
    } catch (error) {
      console.error('Erro ao submeter prova:', error);
      alert('❌ Error submitting test');
    }
  };

  if (loading) {
    return <div className="aluno-provas"><div className="loading">Loading...</div></div>;
  }

  if (erro) {
    return <div className="aluno-provas"><div className="erro">{erro}</div></div>;
  }

  // Visualizar/responder prova
  if (provaId && provaAtual) {
    const podeResponder = provaAtual.status === 'pendente';
    const foiCorrigida = provaAtual.status === 'corrigida';

    return (
      <div className="aluno-provas">
        <header className="page-header">
          <h1>📝 {provaAtual.titulo}</h1>
          <button className="btn-voltar" onClick={() => navigate('/provas')}>
            ← Back
          </button>
        </header>

        <div className="prova-detalhes">
          {provaAtual.descricao && <p className="descricao">{provaAtual.descricao}</p>}
          
          <div className="prova-info">
            <div className="info-item">
              <span className="label">Status:</span>
              <span className={`value status-${provaAtual.status}`}>
                {provaAtual.status === 'pendente' && '📝 Answer the test'}
                {provaAtual.status === 'respondida' && '⏳ Waiting for correction'}
                {provaAtual.status === 'corrigida' && '✅ Graded'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Questions:</span>
              <span className="value">{provaAtual.questoes.length}</span>
            </div>
            {foiCorrigida && provaAtual.nota_final !== null && (
              <div className="info-item">
                <span className="label">📈 Your Grade:</span>
                <span className="value grade">{provaAtual.nota_final}</span>
              </div>
            )}
          </div>

          {foiCorrigida && provaAtual.comentario_geral && (
            <div className="comentario-geral">
              <h3>📋 Teacher's Feedback:</h3>
              <p>{provaAtual.comentario_geral}</p>
            </div>
          )}

          <div className="questoes-section">
            {provaAtual.questoes.map((questao: QuestaoData, index: number) => {
              const respostaAluno = respostas.get(questao.numero) || '';
              const respostaCorrigida = foiCorrigida ? provaAtual.respostas.find((r: RespostaData) => r.numero === questao.numero) : null;

              return (
                <div key={questao.numero} className="questao-card">
                  <div className="questao-header">
                    <span className="numero">Question {questao.numero}</span>
                    <span className="pontos">{questao.pontos} pts</span>
                    {respostaCorrigida && (
                      <span className={`resultado ${respostaCorrigida.correta ? 'correta' : 'incorreta'}`}>
                        {respostaCorrigida.correta ? '✅' : '❌'} {respostaCorrigida.pontos_obtidos || 0} pts
                      </span>
                    )}
                  </div>

                  <p className="enunciado">{questao.enunciado}</p>

                  {questao.tipo === 'multipla_escolha' && questao.opcoes ? (
                    <div className="opcoes">
                      {questao.opcoes.map((opcao, idx) => {
                        const isCorreta = questao.resposta_correta === opcao;
                        const isRespostaAluno = respostaAluno === opcao;
                        const mostrarGabarito = foiCorrigida;
                        
                        return (
                          <label 
                            key={idx} 
                            className={`opcao 
                              ${isRespostaAluno ? 'opcao-selecionada' : ''} 
                              ${mostrarGabarito && isCorreta ? 'opcao-correta' : ''} 
                              ${mostrarGabarito && isRespostaAluno && !isCorreta ? 'opcao-incorreta' : ''}
                            `.trim()}
                          >
                            <input
                              type="radio"
                              name={`questao-${questao.numero}`}
                              value={opcao}
                              checked={respostaAluno === opcao}
                              onChange={(e) => handleResposta(questao.numero, e.target.value)}
                              disabled={!podeResponder}
                            />
                            <span className="opcao-texto">
                              <strong>{String.fromCharCode(65 + idx)})</strong> {opcao}
                            </span>
                            {mostrarGabarito && isCorreta && (
                              <span className="badge-correta-aluno">✓ Correct</span>
                            )}
                            {mostrarGabarito && isRespostaAluno && !isCorreta && (
                              <span className="badge-sua-resposta">Your answer</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <textarea
                      className="resposta-dissertativa"
                      value={respostaAluno}
                      onChange={(e) => handleResposta(questao.numero, e.target.value)}
                      placeholder={podeResponder ? "Write your answer here..." : ""}
                      rows={5}
                      disabled={!podeResponder}
                    />
                  )}

                  {respostaCorrigida?.comentario && (
                    <div className="comentario-professor">
                      <strong>💬 Teacher's comment:</strong>
                      <p>{respostaCorrigida.comentario}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {podeResponder && (
            <div className="form-actions">
              <button className="btn-primary btn-large" onClick={submeterProva}>
                ✅ Submit Test
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Lista de provas
  return (
    <div className="aluno-provas">
      <header className="page-header">
        <h1>📝 My Tests</h1>
      </header>

      <div className="provas-lista">
        {provas.length === 0 ? (
          <div className="sem-provas">
            <p>No tests available yet.</p>
          </div>
        ) : (
          <div className="provas-grid">
            {provas.map(prova => (
              <div key={prova.id} className={`prova-card status-${prova.status}`}>
                <div className="prova-card-header">
                  <h3>{prova.titulo}</h3>
                  <span className={`status status-${prova.status}`}>
                    {prova.status_texto}
                  </span>
                </div>
                
                {prova.descricao && (
                  <p className="descricao">{prova.descricao}</p>
                )}

                <div className="prova-card-info">
                  <p><strong>Questions:</strong> {prova.total_questoes}</p>
                  {prova.data_limite && (
                    <p><strong>Deadline:</strong> {new Date(prova.data_limite).toLocaleDateString()}</p>
                  )}
                  {prova.nota_final !== null && (
                    <p className="nota"><strong>Grade:</strong> {prova.nota_final}</p>
                  )}
                </div>

                <div className="prova-card-actions">
                  <button 
                    className={`btn-${prova.status === 'pendente' ? 'fazer' : 'ver'}`}
                    onClick={() => navigate(`/provas/${prova.id}`)}
                  >
                    {prova.status === 'pendente' && '✏️ Answer'}
                    {prova.status === 'respondida' && '👁️ View'}
                    {prova.status === 'corrigida' && '📊 View Results'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
