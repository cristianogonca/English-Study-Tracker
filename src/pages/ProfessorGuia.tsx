import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { professorService } from '../services/SupabaseProfessorService';
import { GuiaEstudosMes, AlunoView } from '../types';
import './ProfessorGuia.css';

export default function ProfessorGuia() {
  const { alunoId } = useParams<{ alunoId: string }>();
  const navigate = useNavigate();
  
  const [aluno, setAluno] = useState<AlunoView | null>(null);
  const [guia, setGuia] = useState<GuiaEstudosMes[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  
  const [mesAtual, setMesAtual] = useState(1);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    objetivos: [] as string[],
    gramatica: [] as string[],
    vocabulario: [] as string[],
    listening: [] as string[],
    speaking: [] as string[],
    reading: [] as string[],
    writing: [] as string[],
    check_final: [] as string[]
  });

  useEffect(() => {
    carregarDados();
  }, [alunoId]);

  useEffect(() => {
    const mesData = guia.find(g => g.mes === mesAtual);
    if (mesData) {
      setFormData({
        titulo: mesData.titulo,
        objetivos: mesData.objetivos || [],
        gramatica: mesData.gramatica || [],
        vocabulario: mesData.vocabulario || [],
        listening: mesData.listening || [],
        speaking: mesData.speaking || [],
        reading: mesData.reading || [],
        writing: mesData.writing || [],
        check_final: mesData.check_final || []
      });
    } else {
      setFormData({
        titulo: `Mês ${mesAtual}`,
        objetivos: [],
        gramatica: [],
        vocabulario: [],
        listening: [],
        speaking: [],
        reading: [],
        writing: [],
        check_final: []
      });
    }
  }, [mesAtual, guia]);

  const carregarDados = async () => {
    if (!alunoId) return;

    try {
      setLoading(true);
      setErro('');

      const [alunoData, guiaData] = await Promise.all([
        professorService.buscarAluno(alunoId),
        professorService.buscarGuiaAluno(alunoId)
      ]);

      if (!alunoData) {
        setErro('Aluno não encontrado');
        return;
      }

      setAluno(alunoData);
      setGuia(guiaData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados do aluno');
    } finally {
      setLoading(false);
    }
  };

  const salvar = async () => {
    if (!alunoId) return;

    try {
      setSalvando(true);

      await professorService.salvarMesGuia(alunoId, mesAtual, formData);

      // Atualizar estado local
      setGuia(prev => {
        const existe = prev.find(g => g.mes === mesAtual);
        if (existe) {
          return prev.map(g => 
            g.mes === mesAtual 
              ? { ...g, ...formData }
              : g
          );
        } else {
          return [...prev, { 
            id: crypto.randomUUID(), 
            user_id: alunoId, 
            mes: mesAtual, 
            ...formData,
            criado_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
          }];
        }
      });

      setEditando(false);
      alert('Salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações');
    } finally {
      setSalvando(false);
    }
  };

  const adicionarItem = (campo: keyof typeof formData) => {
    const novoItem = prompt(`Adicionar item em ${campo}:`);
    if (novoItem) {
      setFormData(prev => ({
        ...prev,
        [campo]: [...(prev[campo] as string[]), novoItem]
      }));
    }
  };

  const removerItem = (campo: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [campo]: (prev[campo] as string[]).filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="professor-guia">
        <div className="loading">Carregando guia...</div>
      </div>
    );
  }

  if (erro || !aluno) {
    return (
      <div className="professor-guia">
        <div className="erro">{erro || 'Aluno não encontrado'}</div>
        <button onClick={() => navigate('/professor')} className="btn-voltar">
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="professor-guia">
      <header className="page-header">
        <button onClick={() => navigate('/professor')} className="btn-voltar-header">
          ← Voltar
        </button>
        <h1>📚 Guia de Estudos de {aluno.nome}</h1>
        <p>{aluno.email}</p>
      </header>

      <div className="mes-selector">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(mes => (
          <button
            key={mes}
            className={`mes-btn ${mesAtual === mes ? 'ativo' : ''}`}
            onClick={() => {
              setMesAtual(mes);
              setEditando(false);
            }}
          >
            Mês {mes}
          </button>
        ))}
      </div>

      <div className="guia-content">
        <div className="content-header">
          <input
            type="text"
            className="titulo-input"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            disabled={!editando}
            placeholder="Título do mês"
          />
          
          {!editando ? (
            <button className="btn-editar" onClick={() => setEditando(true)}>
              ✏️ Editar
            </button>
          ) : (
            <div className="btn-group">
              <button 
                className="btn-cancelar" 
                onClick={() => {
                  setEditando(false);
                  carregarDados();
                }}
                disabled={salvando}
              >
                Cancelar
              </button>
              <button 
                className="btn-salvar" 
                onClick={salvar}
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}
        </div>

        <div className="sections-grid">
          {(['objetivos', 'gramatica', 'vocabulario', 'listening', 'speaking', 'reading', 'writing', 'check_final'] as const).map(secao => (
            <div key={secao} className="section-card">
              <div className="section-header">
                <h3>{secao.charAt(0).toUpperCase() + secao.slice(1).replace('_', ' ')}</h3>
                {editando && (
                  <button 
                    className="btn-add"
                    onClick={() => adicionarItem(secao)}
                  >
                    + Adicionar
                  </button>
                )}
              </div>

              <ul className="section-list">
                {formData[secao].length === 0 ? (
                  <li className="empty-message">Nenhum item cadastrado</li>
                ) : (
                  formData[secao].map((item, index) => (
                    <li key={index} className="section-item">
                      <span>{item}</span>
                      {editando && (
                        <button
                          className="btn-remove"
                          onClick={() => removerItem(secao, index)}
                        >
                          ×
                        </button>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
