import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { provasService } from '../services/SupabaseProvasServiceSimples';
import type { AlunoProvaDisponivel, ProvaQuestao, ProvaResposta } from '../types';
import './AlunoProvas.css';

export default function AlunoProvas() {
  const navigate = useNavigate();
  const { provaId } = useParams<{ provaId?: string }>();
  
  const [provas, setProvas] = useState<AlunoProvaDisponivel[]>([]);
  const [provaAtual, setProvaAtual] = useState<AlunoProvaDisponivel | null>(null);
  const [questoes, setQuestoes] = useState<ProvaQuestao[]>([]);
  const [respostas, setRespostas] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState('');
  const [tempoRestante, setTempoRestante] = useState<number | null>(null);

  useEffect(() => {
    if (provaId) {
      carregarProva();
    } else {
      carregarProvasDisponiveis();
    }
  }, [provaId]);

  // Timer para provas com tempo limite
  useEffect(() => {
    if (tempoRestante === null || tempoRestante <= 0) return;

    const interval = setInterval(() => {
      setTempoRestante(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          finalizarAutomaticamente();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tempoRestante]);

  const carregarProvasDisponiveis = async () => {
    try {
      setLoading(true);
      const data = await provasService.listarProvasDisponiveis();
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
      
      // Buscar detalhes da prova
      const provaData = await provasService.buscarProva(provaId);
      if (!provaData) {
        setErro('Test not found');
        return;
      }

      // Buscar questões
      const questoesData = await provasService.listarQuestoes(provaId);
      setQuestoes(questoesData);

      // Buscar respostas já salvas (se houver)
      const respostasData = await provasService.buscarRespostasAluno(provaId);
      const respostasMap = new Map<string, string>();
      respostasData.forEach(r => respostasMap.set(r.questao_id, r.resposta));
      setRespostas(respostasMap);

      // Verificar se já iniciou (para calcular tempo)
      if (provaData.duracao_minutos) {
        const now = new Date();
        const inicio = provaAtual?.data_inicio ? new Date(provaAtual.data_inicio) : now;
        const tempoDecorrido = Math.floor((now.getTime() - inicio.getTime()) / 1000);
        const tempoTotal = provaData.duracao_minutos * 60;
        setTempoRestante(Math.max(0, tempoTotal - tempoDecorrido));
      }

    } catch (error) {
      console.error('Erro ao carregar prova:', error);
      setErro('Error loading test');
    } finally {
      setLoading(false);
    }
  };

  const iniciarProva = async (prova: AlunoProvaDisponivel) => {
    try {
      await provasService.iniciarProva(prova.prova_id);
      navigate(`/provas/${prova.prova_id}`);
    } catch (error) {
      console.error('Erro ao iniciar prova:', error);
      alert('Error starting test');
    }
  };

  const salvarResposta = async (questaoId: string, resposta: string) => {
    if (!provaId) return;

    // Atualiza localmente
    setRespostas(prev => new Map(prev).set(questaoId, resposta));

    // Salva no banco
    try {
      await provasService.salvarResposta({
        prova_id: provaId,
        aluno_id: '', // será preenchido no serviço
        questao_id: questaoId,
        resposta,
      });
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
    }
  };

  const finalizarProva = async () => {
    if (!provaId) return;

    const confirmar = confirm(
      'Are you sure you want to submit the test?\n\nYou will not be able to change your answers after submission.'
    );

    if (!confirmar) return;

    try {
      setSubmitting(true);
      await provasService.finalizarProva(provaId);
      alert('✅ Test submitted successfully!\n\nWait for your teacher to grade it.');
      navigate('/provas');
    } catch (error) {
      console.error('Erro ao finalizar prova:', error);
      alert('❌ Error submitting test');
    } finally {
      setSubmitting(false);
    }
  };

  const finalizarAutomaticamente = async () => {
    if (!provaId) return;
    
    try {
      await provasService.finalizarProva(provaId);
      alert('⏰ Time is up! Test submitted automatically.');
      navigate('/provas');
    } catch (error) {
      console.error('Erro ao finalizar prova automaticamente:', error);
    }
  };

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string }> = {
      disponivel: { text: 'Available', className: 'badge-disponivel' },
      em_andamento: { text: 'In Progress', className: 'badge-em-andamento' },
      aguardando_avaliacao: { text: 'Awaiting Grading', className: 'badge-aguardando' },
      avaliada: { text: 'Graded', className: 'badge-avaliada' },
      expirada: { text: 'Expired', className: 'badge-expirada' },
      nao_disponivel: { text: 'Not Available Yet', className: 'badge-nao-disponivel' },
    };

    const badge = badges[status] || { text: status, className: '' };
    return <span className={`status-badge ${badge.className}`}>{badge.text}</span>;
  };

  if (loading) {
    return (
      <div className="aluno-provas">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Visualização: Fazendo prova
  if (provaId && questoes.length > 0) {
    return (
      <div className="aluno-provas fazer-prova">
        <header className="page-header">
          <h1>📝 {provaAtual?.titulo || 'Test'}</h1>
          {tempoRestante !== null && (
            <div className={`timer ${tempoRestante < 300 ? 'timer-urgente' : ''}`}>
              ⏱️ {formatarTempo(tempoRestante)}
            </div>
          )}
        </header>

        <div className="questoes-container">
          {questoes.map((questao, index) => (
            <div key={questao.id} className="questao-card">
              <div className="questao-header">
                <span className="questao-numero">Question {index + 1}</span>
                <span className="questao-pontos">{questao.pontos} points</span>
              </div>

              <div className="questao-enunciado">
                {questao.enunciado}
              </div>

              {questao.tipo === 'multipla_escolha' && questao.opcoes && (
                <div className="opcoes-multipla-escolha">
                  {questao.opcoes.map((opcao, idx) => (
                    <label key={idx} className="opcao-radio">
                      <input
                        type="radio"
                        name={`questao_${questao.id}`}
                        value={opcao}
                        checked={respostas.get(questao.id) === opcao}
                        onChange={(e) => salvarResposta(questao.id, e.target.value)}
                      />
                      <span>{opcao}</span>
                    </label>
                  ))}
                </div>
              )}

              {questao.tipo === 'verdadeiro_falso' && (
                <div className="opcoes-verdadeiro-falso">
                  <label className="opcao-radio">
                    <input
                      type="radio"
                      name={`questao_${questao.id}`}
                      value="true"
                      checked={respostas.get(questao.id) === 'true'}
                      onChange={(e) => salvarResposta(questao.id, e.target.value)}
                    />
                    <span>✅ True</span>
                  </label>
                  <label className="opcao-radio">
                    <input
                      type="radio"
                      name={`questao_${questao.id}`}
                      value="false"
                      checked={respostas.get(questao.id) === 'false'}
                      onChange={(e) => salvarResposta(questao.id, e.target.value)}
                    />
                    <span>❌ False</span>
                  </label>
                </div>
              )}

              {(questao.tipo === 'dissertativa' || questao.tipo === 'preencher_lacuna') && (
                <textarea
                  className="resposta-dissertativa"
                  placeholder="Write your answer here..."
                  value={respostas.get(questao.id) || ''}
                  onChange={(e) => salvarResposta(questao.id, e.target.value)}
                  rows={questao.tipo === 'dissertativa' ? 6 : 2}
                />
              )}
            </div>
          ))}
        </div>

        <div className="prova-footer">
          <button
            className="btn-finalizar"
            onClick={finalizarProva}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : '✅ Submit Test'}
          </button>
          <p className="aviso">
            ⚠️ Make sure to answer all questions before submitting. You won't be able to change your answers after submission.
          </p>
        </div>
      </div>
    );
  }

  // Visualização: Lista de provas
  return (
    <div className="aluno-provas">
      <header className="page-header">
        <h1>📝 Tests & Exams</h1>
        <p>Available tests for you to take</p>
      </header>

      {erro && <div className="erro">{erro}</div>}

      {provas.length === 0 ? (
        <div className="sem-provas">
          <p>📭 No tests available at this time</p>
        </div>
      ) : (
        <div className="provas-grid">
          {provas.map((prova) => (
            <div key={prova.prova_id} className="prova-card">
              <div className="prova-header">
                <h3>{prova.titulo}</h3>
                {getStatusBadge(prova.status)}
              </div>

              {prova.descricao && (
                <p className="prova-descricao">{prova.descricao}</p>
              )}

              <div className="prova-info">
                <div className="info-item">
                  <span className="info-label">📊 Questions:</span>
                  <span className="info-value">{prova.total_questoes}</span>
                </div>

                {prova.duracao_minutos && (
                  <div className="info-item">
                    <span className="info-label">⏱️ Duration:</span>
                    <span className="info-value">{prova.duracao_minutos} min</span>
                  </div>
                )}

                {prova.data_limite && (
                  <div className="info-item">
                    <span className="info-label">📅 Deadline:</span>
                    <span className="info-value">
                      {new Date(prova.data_limite).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}

                {prova.nota_total !== undefined && prova.avaliada && (
                  <div className="info-item">
                    <span className="info-label">📈 Grade:</span>
                    <span className="info-value nota">{prova.nota_total}</span>
                  </div>
                )}
              </div>

              <div className="prova-actions">
                {prova.status === 'disponivel' && (
                  <button
                    className="btn-iniciar"
                    onClick={() => iniciarProva(prova)}
                  >
                    Start Test
                  </button>
                )}

                {prova.status === 'em_andamento' && (
                  <button
                    className="btn-continuar"
                    onClick={() => navigate(`/provas/${prova.prova_id}`)}
                  >
                    Continue
                  </button>
                )}

                {prova.status === 'avaliada' && (
                  <button
                    className="btn-ver-resultado"
                    onClick={() => navigate(`/provas/${prova.prova_id}/resultado`)}
                  >
                    View Results
                  </button>
                )}

                {prova.status === 'aguardando_avaliacao' && (
                  <div className="aguardando-text">
                    ⏳ Waiting for teacher's grading
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
