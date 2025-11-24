import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { provasService } from '../services/SupabaseProvasServiceSimples';
import type { ProfessorProvaLista, Prova, QuestaoData, TipoQuestao } from '../types/provas';
import './ProfessorProvas.css';

export default function ProfessorProvasNovo() {
  const navigate = useNavigate();
  const { provaId } = useParams<{ provaId?: string }>();
  
  const [provas, setProvas] = useState<ProfessorProvaLista[]>([]);
  const [provaAtual, setProvaAtual] = useState<Prova | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  
  // Criar nova prova
  const [alunosDisponiveis, setAlunosDisponiveis] = useState<Array<{ id: string; nome: string; email: string }>>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataLimite, setDataLimite] = useState('');
  
  // Adicionar questão
  const [tipoQuestao, setTipoQuestao] = useState<TipoQuestao>('multipla_escolha' as TipoQuestao);
  const [enunciado, setEnunciado] = useState('');
  const [opcoes, setOpcoes] = useState<string[]>(['', '', '', '']);
  const [respostaCorreta, setRespostaCorreta] = useState('');
  const [pontos, setPontos] = useState('10');

  useEffect(() => {
    if (provaId && provaId !== 'nova') {
      carregarProva();
    } else {
      carregarProvas();
      carregarAlunos();
    }
  }, [provaId]);

  const carregarProvas = async () => {
    try {
      setLoading(true);
      const data = await provasService.listarProvasProfessor();
      setProvas(data);
    } catch (error) {
      console.error('Erro ao carregar provas:', error);
      setErro('Error loading tests');
    } finally {
      setLoading(false);
    }
  };

  const carregarAlunos = async () => {
    try {
      const alunos = await provasService.listarAlunosDisponiveis();
      setAlunosDisponiveis(alunos);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    }
  };

  const carregarProva = async () => {
    if (!provaId || provaId === 'nova') return;
    
    try {
      setLoading(true);
      const prova = await provasService.buscarProva(provaId);
      if (!prova) {
        setErro('Test not found');
        return;
      }
      setProvaAtual(prova);
    } catch (error) {
      console.error('Erro ao carregar prova:', error);
      setErro('Error loading test');
    } finally {
      setLoading(false);
    }
  };

  const criarProva = async () => {
    if (!titulo.trim() || !alunoSelecionado) {
      alert('❌ Please enter title and select a student');
      return;
    }

    try {
      const novaProvaId = await provasService.criarProva(
        alunoSelecionado,
        titulo,
        descricao || undefined,
        dataLimite || undefined
      );
      alert('✅ Test created successfully!');
      navigate(`/professor/provas/${novaProvaId}`);
    } catch (error) {
      console.error('Erro ao criar prova:', error);
      alert('❌ Error creating test');
    }
  };

  const adicionarQuestao = async () => {
    if (!provaId || !enunciado.trim()) {
      alert('❌ Please enter the question text');
      return;
    }

    if (tipoQuestao === 'multipla_escolha' && opcoes.some(op => !op.trim())) {
      alert('❌ Please fill all options');
      return;
    }

    if (tipoQuestao === 'multipla_escolha' && !respostaCorreta) {
      alert('❌ Please select the correct answer');
      return;
    }

    try {
      await provasService.adicionarQuestao(provaId, {
        tipo: tipoQuestao,
        enunciado,
        opcoes: tipoQuestao === 'multipla_escolha' ? opcoes : undefined,
        resposta_correta: tipoQuestao === 'multipla_escolha' ? respostaCorreta : undefined,
        pontos: parseFloat(pontos)
      });
      
      // Limpar form
      setEnunciado('');
      setOpcoes(['', '', '', '']);
      setRespostaCorreta('');
      setPontos('10');
      
      alert('✅ Question added!');
      carregarProva();
    } catch (error) {
      console.error('Erro ao adicionar questão:', error);
      alert('❌ Error adding question');
    }
  };

  const removerQuestao = async (numero: number) => {
    if (!provaId) return;
    if (!confirm('⚠️ Delete this question?')) return;

    try {
      await provasService.removerQuestao(provaId, numero);
      alert('✅ Question removed!');
      carregarProva();
    } catch (error) {
      console.error('Erro ao remover questão:', error);
      alert('❌ Error removing question');
    }
  };

  const deletarProva = async (id: string) => {
    if (!confirm('⚠️ Delete this test? This action cannot be undone!')) return;

    try {
      await provasService.deletarProva(id);
      alert('✅ Test deleted!');
      carregarProvas();
    } catch (error) {
      console.error('Erro ao deletar prova:', error);
      alert('❌ Error deleting test');
    }
  };

  const irParaCorrecao = (id: string) => {
    navigate(`/professor/provas/${id}/corrigir`);
  };

  if (loading) {
    return <div className="professor-provas"><div className="loading">Loading...</div></div>;
  }

  if (erro) {
    return <div className="professor-provas"><div className="erro">{erro}</div></div>;
  }

  // Visualizar prova existente
  if (provaId && provaAtual) {
    return (
      <div className="professor-provas">
        <header className="page-header">
          <h1>📝 {provaAtual.titulo}</h1>
          <button className="btn-voltar" onClick={() => navigate('/professor/provas')}>
            ← Back
          </button>
        </header>

        <div className="prova-detalhes">
          {provaAtual.descricao && <p className="descricao">{provaAtual.descricao}</p>}
          
          <div className="prova-info">
            <div className="info-item">
              <span className="label">Status:</span>
              <span className={`value status-${provaAtual.status}`}>
                {provaAtual.status === 'pendente' && '⏳ Pending'}
                {provaAtual.status === 'respondida' && '📝 Answered'}
                {provaAtual.status === 'corrigida' && '✅ Graded'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">📊 Questions:</span>
              <span className="value">{provaAtual.questoes.length}</span>
            </div>
            {provaAtual.nota_final !== null && (
              <div className="info-item">
                <span className="label">📈 Final Grade:</span>
                <span className="value">{provaAtual.nota_final}</span>
              </div>
            )}
          </div>

          {provaAtual.status === 'respondida' && (
            <button className="btn-primary" onClick={() => irParaCorrecao(provaAtual.id)}>
              ✏️ Grade Test
            </button>
          )}

          <div className="questoes-section">
            <h2>Questions</h2>
            
            {provaAtual.questoes.length === 0 && (
              <p className="sem-questoes">No questions yet. Add questions below.</p>
            )}

            {provaAtual.questoes.map((questao: QuestaoData) => (
              <div key={questao.numero} className="questao-card">
                <div className="questao-header">
                  <span className="numero">Question {questao.numero}</span>
                  <span className="pontos">{questao.pontos} pts</span>
                  <button className="btn-deletar-mini" onClick={() => removerQuestao(questao.numero)}>
                    🗑️
                  </button>
                </div>
                <p className="enunciado">{questao.enunciado}</p>
                {questao.tipo === 'multipla_escolha' && questao.opcoes && (
                  <div className="opcoes">
                    {questao.opcoes.map((opcao, idx) => (
                      <div key={idx} className={`opcao ${questao.resposta_correta === opcao ? 'correta' : ''}`}>
                        {String.fromCharCode(65 + idx)}) {opcao}
                        {questao.resposta_correta === opcao && ' ✓'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {provaAtual.status === 'pendente' && (
            <div className="adicionar-questao-section">
              <h3>➕ Add Question</h3>
              
              <div className="form-group">
                <label>Question Type:</label>
                <select value={tipoQuestao} onChange={(e) => setTipoQuestao(e.target.value as TipoQuestao)}>
                  <option value="multipla_escolha">Multiple Choice</option>
                  <option value="dissertativa">Essay</option>
                </select>
              </div>

              <div className="form-group">
                <label>Question Text:</label>
                <textarea
                  value={enunciado}
                  onChange={(e) => setEnunciado(e.target.value)}
                  placeholder="Enter the question..."
                  rows={3}
                />
              </div>

              {tipoQuestao === 'multipla_escolha' && (
                <>
                  <div className="form-group">
                    <label>Options:</label>
                    {opcoes.map((opcao, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={opcao}
                        onChange={(e) => {
                          const novasOpcoes = [...opcoes];
                          novasOpcoes[idx] = e.target.value;
                          setOpcoes(novasOpcoes);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      />
                    ))}
                  </div>

                  <div className="form-group">
                    <label>Correct Answer:</label>
                    <select value={respostaCorreta} onChange={(e) => setRespostaCorreta(e.target.value)}>
                      <option value="">Select...</option>
                      {opcoes.map((opcao, idx) => opcao && (
                        <option key={idx} value={opcao}>{String.fromCharCode(65 + idx)}) {opcao}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Points:</label>
                <input
                  type="number"
                  value={pontos}
                  onChange={(e) => setPontos(e.target.value)}
                  min="0"
                  step="0.5"
                />
              </div>

              <button className="btn-primary" onClick={adicionarQuestao}>
                ➕ Add Question
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Listar provas
  return (
    <div className="professor-provas">
      <header className="page-header">
        <h1>📝 Tests & Exams</h1>
        <button className="btn-criar" onClick={() => navigate('/professor/provas/nova')}>
          ➕ Create Test
        </button>
      </header>

      {provaId === 'nova' ? (
        // Criar nova prova
        <div className="criar-prova-section">
          <h2>Create New Test</h2>
          
          <div className="form-group">
            <label>Student:</label>
            <select value={alunoSelecionado} onChange={(e) => setAlunoSelecionado(e.target.value)}>
              <option value="">Select a student...</option>
              {alunosDisponiveis.map(aluno => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Test Title:</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="e.g., Unit 1 Test"
            />
          </div>

          <div className="form-group">
            <label>Description (optional):</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Test instructions..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Deadline (optional):</label>
            <input
              type="datetime-local"
              value={dataLimite}
              onChange={(e) => setDataLimite(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button className="btn-primary" onClick={criarProva}>
              ✅ Create Test
            </button>
            <button className="btn-secondary" onClick={() => navigate('/professor/provas')}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // Lista de provas
        <div className="provas-lista">
          {provas.length === 0 ? (
            <div className="sem-provas">
              <p>No tests yet. Create your first one!</p>
            </div>
          ) : (
            <div className="provas-grid">
              {provas.map(prova => (
                <div key={prova.id} className="prova-card">
                  <div className="prova-card-header">
                    <h3>{prova.titulo}</h3>
                    <span className={`status status-${prova.status}`}>
                      {prova.status_texto}
                    </span>
                  </div>
                  
                  <div className="prova-card-info">
                    <p><strong>Student:</strong> {prova.aluno_nome}</p>
                    <p><strong>Questions:</strong> {prova.total_questoes}</p>
                    {prova.nota_final !== null && (
                      <p><strong>Grade:</strong> {prova.nota_final}</p>
                    )}
                  </div>

                  <div className="prova-card-actions">
                    <button className="btn-ver" onClick={() => navigate(`/professor/provas/${prova.id}`)}>
                      👁️ View
                    </button>
                    {prova.status === 'respondida' && (
                      <button className="btn-corrigir" onClick={() => irParaCorrecao(prova.id)}>
                        ✏️ Grade
                      </button>
                    )}
                    <button className="btn-deletar" onClick={() => deletarProva(prova.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
