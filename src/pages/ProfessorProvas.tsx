import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { provasService } from '../services/SupabaseProvasServiceSimples';
import type { Prova, ProvaQuestao, TipoQuestao } from '../types';
import './ProfessorProvas.css';

export default function ProfessorProvas() {
  const navigate = useNavigate();
  const { provaId } = useParams<{ provaId?: string }>();
  
  const [provas, setProvas] = useState<Prova[]>([]);
  const [provaAtual, setProvaAtual] = useState<Prova | null>(null);
  const [questoes, setQuestoes] = useState<ProvaQuestao[]>([]);
  const [editandoProva, setEditandoProva] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Estados para alunos
  const [alunosDisponiveis, setAlunosDisponiveis] = useState<Array<{ id: string; nome: string; email: string }>>([]);
  const [alunosSelecionados, setAlunosSelecionados] = useState<string[]>([]);

  // Form states
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataDisponivel, setDataDisponivel] = useState('');
  const [dataLimite, setDataLimite] = useState('');
  const [duracaoMinutos, setDuracaoMinutos] = useState('');
  const [peso, setPeso] = useState('1.0');

  useEffect(() => {
    carregarAlunosDisponiveis();
    
    if (provaId === 'nova') {
      setEditandoProva(true);
      setLoading(false);
    } else if (provaId) {
      carregarProva();
    } else {
      carregarProvas();
    }
  }, [provaId]);

  const carregarAlunosDisponiveis = async () => {
    try {
      const alunos = await provasService.listarAlunosDisponiveis();
      console.log('Alunos carregados:', alunos);
      setAlunosDisponiveis(alunos);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    }
  };

  const carregarProvas = async () => {
    try {
      setLoading(true);
      setErro('');
      const data = await provasService.listarProvasProfessor();
      setProvas(data);
    } catch (error: any) {
      console.error('Erro ao carregar provas:', error);
      
      // Verificar se é erro de recursão infinita de política RLS
      if (error?.code === '42P17') {
        setErro('Database configuration error. Please run the SQL fix in Supabase: DROP old policies and CREATE new simplified policies for "provas" table.');
      } else {
        setErro('Error loading tests');
      }
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
      setTitulo(prova.titulo);
      setDescricao(prova.descricao || '');
      setDataDisponivel(prova.data_disponivel?.split('T')[0] || '');
      setDataLimite(prova.data_limite?.split('T')[0] || '');
      setDuracaoMinutos(prova.duracao_minutos?.toString() || '');
      setPeso(prova.peso.toString());

      const questoesData = await provasService.listarQuestoes(provaId);
      setQuestoes(questoesData);

      const alunosIds = await provasService.listarAlunosProva(provaId);
      setAlunosSelecionados(alunosIds);
    } catch (error) {
      console.error('Erro ao carregar prova:', error);
      setErro('Error loading test');
    } finally {
      setLoading(false);
    }
  };

  const toggleAluno = async (alunoId: string) => {
    if (!provaId || provaId === 'nova') {
      // Apenas atualizar estado local se prova ainda não foi salva
      if (alunosSelecionados.includes(alunoId)) {
        setAlunosSelecionados(alunosSelecionados.filter(id => id !== alunoId));
      } else {
        setAlunosSelecionados([...alunosSelecionados, alunoId]);
      }
      return;
    }

    // Se prova já existe, atualizar no banco
    try {
      if (alunosSelecionados.includes(alunoId)) {
        await provasService.removerAlunoProva(provaId, alunoId);
        setAlunosSelecionados(alunosSelecionados.filter(id => id !== alunoId));
      } else {
        await provasService.atribuirAlunoProva(provaId, alunoId);
        setAlunosSelecionados([...alunosSelecionados, alunoId]);
      }
    } catch (error) {
      console.error('Erro ao atribuir/remover aluno:', error);
      alert('❌ Error updating student assignment');
    }
  };

  const salvarProva = async () => {
    if (!titulo.trim()) {
      alert('❌ Please enter a title for the test');
      return;
    }

    try {
      if (provaId && provaId !== 'nova') {
        // Atualizar prova existente
        await provasService.atualizarProva(provaId, {
          titulo,
          descricao,
          data_disponivel: dataDisponivel || undefined,
          data_limite: dataLimite || undefined,
          duracao_minutos: duracaoMinutos ? parseInt(duracaoMinutos) : undefined,
          peso: parseFloat(peso),
        } as Partial<Prova>);
        alert('✅ Test updated successfully!');
        setEditandoProva(false);
      } else {
        // Criar nova prova
        const novaProvaId = await provasService.criarProva({
          titulo,
          descricao,
          data_disponivel: dataDisponivel || undefined,
          data_limite: dataLimite || undefined,
          duracao_minutos: duracaoMinutos ? parseInt(duracaoMinutos) : undefined,
          ativa: true,
          peso: parseFloat(peso),
          professor_id: '', // será preenchido no serviço
        } as Omit<Prova, 'id' | 'data_criacao'>);
        
        // Atribuir alunos selecionados
        for (const alunoId of alunosSelecionados) {
          await provasService.atribuirAlunoProva(novaProvaId, alunoId);
        }
        
        alert('✅ Test created successfully!');
        navigate(`/professor/provas/${novaProvaId}`);
      }
    } catch (error) {
      console.error('Erro ao salvar prova:', error);
      alert('❌ Error saving test');
    }
  };

  const deletarProva = async (id: string) => {
    const confirmar = confirm('⚠️ Delete this test?\n\nThis action cannot be undone!');
    if (!confirmar) return;

    try {
      await provasService.deletarProva(id);
      alert('✅ Test deleted!');
      if (provaId === id) {
        navigate('/professor/provas');
      } else {
        carregarProvas();
      }
    } catch (error) {
      console.error('Erro ao deletar prova:', error);
      alert('❌ Error deleting test');
    }
  };

  const adicionarQuestao = () => {
    const novaQuestao: ProvaQuestao = {
      id: `temp_${Date.now()}`,
      prova_id: provaId || '',
      numero: questoes.length + 1,
      tipo: 'multipla_escolha' as TipoQuestao,
      enunciado: '',
      opcoes: ['A) ', 'B) ', 'C) ', 'D) '],
      pontos: 1,
    };
    setQuestoes([...questoes, novaQuestao]);
  };

  const salvarQuestao = async (questao: ProvaQuestao) => {
    if (!provaId || provaId === 'nova') {
      alert('❌ Save the test before adding questions');
      return;
    }

    try {
      if (questao.id.startsWith('temp_')) {
        // Nova questão
        await provasService.adicionarQuestao(questao);
      } else {
        // Atualizar questão existente
        await provasService.atualizarQuestao(questao.id, questao);
      }
      carregarProva();
    } catch (error) {
      console.error('Erro ao salvar questão:', error);
      alert('❌ Error saving question');
    }
  };

  const deletarQuestao = async (id: string) => {
    const confirmar = confirm('Delete this question?');
    if (!confirmar) return;

    try {
      if (id.startsWith('temp_')) {
        setQuestoes(questoes.filter(q => q.id !== id));
      } else {
        await provasService.deletarQuestao(id);
        carregarProva();
      }
    } catch (error) {
      console.error('Erro ao deletar questão:', error);
      alert('❌ Error deleting question');
    }
  };

  if (loading) {
    return (
      <div className="professor-provas">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Visualização: Criar/Editar Prova
  if (provaId && (editandoProva || provaId === 'nova')) {
    return (
      <div className="professor-provas editar-prova">
        <header className="page-header">
          <h1>📝 {provaId === 'nova' ? 'Create Test' : 'Edit Test'}</h1>
          <button className="btn-voltar" onClick={() => navigate('/professor/provas')}>
            ← Back
          </button>
        </header>

        <div className="form-prova">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="e.g.: Unit 3 Test - Present Perfect"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Instructions or additional information..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Available From</label>
              <input
                type="date"
                value={dataDisponivel}
                onChange={(e) => setDataDisponivel(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Deadline</label>
              <input
                type="date"
                value={dataLimite}
                onChange={(e) => setDataLimite(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={duracaoMinutos}
                onChange={(e) => setDuracaoMinutos(e.target.value)}
                placeholder="Leave empty for no time limit"
              />
            </div>

            <div className="form-group">
              <label>Weight</label>
              <input
                type="number"
                step="0.1"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Assign Students *</label>
            <div className="alunos-selection">
              {alunosDisponiveis.length === 0 ? (
                <p className="no-alunos">No students available</p>
              ) : (
                alunosDisponiveis.map((aluno) => (
                  <label key={aluno.id} className="aluno-checkbox">
                    <input
                      type="checkbox"
                      checked={alunosSelecionados.includes(aluno.id)}
                      onChange={() => toggleAluno(aluno.id)}
                    />
                    <span>{aluno.nome || aluno.email}</span>
                  </label>
                ))
              )}
            </div>
            {alunosSelecionados.length === 0 && (
              <p className="warning-text">⚠️ Select at least one student</p>
            )}
          </div>

          <div className="form-actions">
            <button className="btn-salvar" onClick={salvarProva}>
              ✅ Save Test
            </button>
            {provaId !== 'nova' && (
              <button className="btn-cancelar" onClick={() => setEditandoProva(false)}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {provaId !== 'nova' && (
          <div className="questoes-section">
            <div className="section-header">
              <h2>Questions</h2>
              <button className="btn-adicionar" onClick={adicionarQuestao}>
                + Add Question
              </button>
            </div>

            {questoes.map((questao, index) => (
              <QuestaoEditor
                key={questao.id}
                questao={questao}
                numero={index + 1}
                onSalvar={salvarQuestao}
                onDeletar={() => deletarQuestao(questao.id)}
                onChange={(updated) => {
                  const novasQuestoes = [...questoes];
                  novasQuestoes[index] = updated;
                  setQuestoes(novasQuestoes);
                }}
              />
            ))}

            {questoes.length === 0 && (
              <div className="sem-questoes">
                <p>📝 No questions yet. Click "Add Question" to create the first one.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Visualização: Ver Prova
  if (provaId && provaAtual) {
    return (
      <div className="professor-provas ver-prova">
        <header className="page-header">
          <h1>📝 {provaAtual.titulo}</h1>
          <div className="header-actions">
            <button className="btn-editar" onClick={() => setEditandoProva(true)}>
              ✏️ Edit
            </button>
            <button className="btn-avaliacoes" onClick={() => navigate(`/professor/provas/${provaId}/avaliacoes`)}>
              📊 View Submissions
            </button>
            <button className="btn-voltar" onClick={() => navigate('/professor/provas')}>
              ← Back
            </button>
          </div>
        </header>

        <div className="prova-detalhes">
          {provaAtual.descricao && (
            <p className="descricao">{provaAtual.descricao}</p>
          )}

          <div className="prova-info">
            <div className="info-item">
              <span className="label">📊 Questions:</span>
              <span className="value">{questoes.length}</span>
            </div>
            {provaAtual.duracao_minutos && (
              <div className="info-item">
                <span className="label">⏱️ Duration:</span>
                <span className="value">{provaAtual.duracao_minutos} min</span>
              </div>
            )}
            {provaAtual.data_limite && (
              <div className="info-item">
                <span className="label">📅 Deadline:</span>
                <span className="value">{new Date(provaAtual.data_limite).toLocaleString()}</span>
              </div>
            )}
            <div className="info-item">
              <span className="label">⚖️ Weight:</span>
              <span className="value">{provaAtual.peso}</span>
            </div>
            <div className="info-item">
              <span className="label">Status:</span>
              <span className={`value ${provaAtual.ativa ? 'ativa' : 'inativa'}`}>
                {provaAtual.ativa ? '✅ Active' : '❌ Inactive'}
              </span>
            </div>
          </div>

          <div className="questoes-preview">
            <h3>Questions</h3>
            {questoes.map((questao, index) => (
              <div key={questao.id} className="questao-preview-card">
                <div className="questao-preview-header">
                  <span className="numero">Question {index + 1}</span>
                  <span className="pontos">{questao.pontos} pts</span>
                  <span className="tipo">{questao.tipo.replace('_', ' ')}</span>
                </div>
                <div className="enunciado">{questao.enunciado}</div>
                {questao.opcoes && questao.tipo === 'multipla_escolha' && (
                  <div className="opcoes-preview">
                    {questao.opcoes.map((op, i) => (
                      <div key={i} className="opcao">{op}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Visualização: Lista de Provas
  return (
    <div className="professor-provas">
      <header className="page-header">
        <div>
          <h1>📝 Tests & Exams</h1>
          <p>Create and manage tests for your students</p>
        </div>
        <button className="btn-criar" onClick={() => navigate('/professor/provas/nova')}>
          + Create Test
        </button>
      </header>

      {erro && <div className="erro">{erro}</div>}

      {provas.length === 0 ? (
        <div className="sem-provas">
          <p>📭 No tests created yet</p>
          <button className="btn-criar-grande" onClick={() => navigate('/professor/provas/nova')}>
            Create Your First Test
          </button>
        </div>
      ) : (
        <div className="provas-grid">
          {provas.map((prova) => (
            <div key={prova.id} className="prova-card">
              <div className="prova-header">
                <h3>{prova.titulo}</h3>
                <span className={`status-badge ${prova.ativa ? 'ativa' : 'inativa'}`}>
                  {prova.ativa ? 'Active' : 'Inactive'}
                </span>
              </div>

              {prova.descricao && (
                <p className="descricao">{prova.descricao}</p>
              )}

              <div className="prova-info-mini">
                <span>📅 {new Date(prova.data_criacao).toLocaleDateString()}</span>
                {prova.data_limite && (
                  <span>⏰ Due: {new Date(prova.data_limite).toLocaleDateString()}</span>
                )}
              </div>

              <div className="prova-actions">
                <button
                  className="btn-ver"
                  onClick={() => navigate(`/professor/provas/${prova.id}`)}
                >
                  View
                </button>
                <button
                  className="btn-avaliacoes-mini"
                  onClick={() => navigate(`/professor/provas/${prova.id}/avaliacoes`)}
                >
                  Submissions
                </button>
                <button
                  className="btn-deletar"
                  onClick={() => deletarProva(prova.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para editar questões
function QuestaoEditor({
  questao,
  numero,
  onSalvar,
  onDeletar,
  onChange,
}: {
  questao: ProvaQuestao;
  numero: number;
  onSalvar: (questao: ProvaQuestao) => void;
  onDeletar: () => void;
  onChange: (questao: ProvaQuestao) => void;
}) {
  return (
    <div className="questao-editor">
      <div className="questao-editor-header">
        <span className="numero">Question {numero}</span>
        <button className="btn-deletar-questao" onClick={onDeletar}>
          🗑️ Delete
        </button>
      </div>

      <div className="form-group">
        <label>Question Type</label>
        <select
          value={questao.tipo}
          onChange={(e) => onChange({ ...questao, tipo: e.target.value as TipoQuestao })}
        >
          <option value="multipla_escolha">Multiple Choice</option>
          <option value="verdadeiro_falso">True/False</option>
          <option value="dissertativa">Essay</option>
          <option value="preencher_lacuna">Fill in the Blank</option>
        </select>
      </div>

      <div className="form-group">
        <label>Question Text</label>
        <textarea
          value={questao.enunciado}
          onChange={(e) => onChange({ ...questao, enunciado: e.target.value })}
          placeholder="Write the question..."
          rows={3}
        />
      </div>

      {questao.tipo === 'multipla_escolha' && (
        <div className="form-group">
          <label>Answer Options</label>
          {questao.opcoes?.map((opcao, i) => (
            <input
              key={i}
              type="text"
              value={opcao}
              onChange={(e) => {
                const novasOpcoes = [...(questao.opcoes || [])];
                novasOpcoes[i] = e.target.value;
                onChange({ ...questao, opcoes: novasOpcoes });
              }}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
            />
          ))}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Correct Answer (for automatic grading)</label>
          <input
            type="text"
            value={questao.resposta_correta || ''}
            onChange={(e) => onChange({ ...questao, resposta_correta: e.target.value })}
            placeholder="e.g.: A) ... or true/false"
          />
        </div>

        <div className="form-group" style={{ maxWidth: '150px' }}>
          <label>Points</label>
          <input
            type="number"
            step="0.5"
            value={questao.pontos}
            onChange={(e) => onChange({ ...questao, pontos: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <button className="btn-salvar-questao" onClick={() => onSalvar(questao)}>
        ✅ Save Question
      </button>
    </div>
  );
}
