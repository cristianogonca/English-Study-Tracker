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
        setErro('Student not found');
        return;
      }

      setAluno(alunoData);
      setGuia(guiaData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Error loading student data');
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
      alert('Saved successfully!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Error saving changes');
    } finally {
      setSalvando(false);
    }
  };

  const adicionarItem = (campo: keyof typeof formData) => {
    const novoItem = prompt(`Add item in ${campo}:`);
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
        <div className="loading">Loading guide...</div>
      </div>
    );
  }

  if (erro || !aluno) {
    return (
      <div className="professor-guia">
        <button onClick={() => navigate('/professor')} className="btn-voltar-professor">
          ← Back to Student List
        </button>
        <div className="erro">{erro || 'Student not found'}</div>
      </div>
    );
  }

  return (
    <div className="professor-guia">
      <button onClick={() => navigate('/professor')} className="btn-voltar-professor">
        ← Back to Student List
      </button>
      
      <header className="page-header">
        <h1>📚 {aluno.nome}'s Study Guide</h1>
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
            Month {mes}
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
            placeholder="Month title"
          />
          
          {!editando ? (
            <button className="btn-editar" onClick={() => setEditando(true)}>
              ✏️ Edit
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
                Cancel
              </button>
              <button 
                className="btn-salvar" 
                onClick={salvar}
                disabled={salvando}
              >
                {salvando ? 'Saving...' : 'Save'}
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
                    + Add
                  </button>
                )}
              </div>

              <ul className="section-list">
                {formData[secao].length === 0 ? (
                  <li className="empty-message">No items registered</li>
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
