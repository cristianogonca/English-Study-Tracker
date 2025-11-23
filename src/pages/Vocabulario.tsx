import { useState, useEffect } from 'react';
import SupabaseStudyService from '../services/SupabaseStudyService';
import { PalavraNova } from '../types';
import './Vocabulario.css';

function Vocabulario() {
  const [palavras, setPalavras] = useState<PalavraNova[]>([]);
  const [filtro, setFiltro] = useState<'todas' | 'revisadas' | 'nao-revisadas'>('todas');
  const [modoVisualizacao, setModoVisualizacao] = useState<'lista' | 'flashcard'>('lista');
  const [indexFlashcard, setIndexFlashcard] = useState(0);
  const [mostrarTraducao, setMostrarTraducao] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form para adicionar nova palavra
  const [novaPalavra, setNovaPalavra] = useState<{
    palavra: string;
    traducao: string;
    exemplo: string;
    nivel: 'basico' | 'intermediario' | 'avancado';
  }>({
    palavra: '',
    traducao: '',
    exemplo: '',
    nivel: 'basico'
  });

  useEffect(() => {
    carregarPalavras();
  }, []);

  const carregarPalavras = async () => {
    try {
      const todasPalavras = await SupabaseStudyService.obterVocabulario();
      setPalavras(todasPalavras);
    } catch (error) {
      setPalavras([]);
    }
  };

  const adicionarPalavra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaPalavra.palavra || !novaPalavra.traducao) {
      alert('⚠️ Fill in word and translation!');
      return;
    }
    try {
      await SupabaseStudyService.salvarPalavra({
        ...novaPalavra,
        dataAprendida: new Date().toISOString(),
        revisada: false,
        acertos: 0,
        erros: 0
      });
      setNovaPalavra({
        palavra: '',
        traducao: '',
        exemplo: '',
        nivel: 'basico'
      });
      await carregarPalavras();
      alert('✅ Word added successfully!');
    } catch (error) {
      alert('Error adding word!');
    }
  };

  const marcarRevisada = async (palavraId: string, acertou: boolean) => {
    try {
      if (acertou) {
        await SupabaseStudyService.incrementarAcertos(palavraId);
      } else {
        await SupabaseStudyService.incrementarErros(palavraId);
      }
      await carregarPalavras();
    } catch (error) {}
  };

  const resetarPalavra = async (palavraId: string) => {
    if (confirm('Reset hits and misses for this word?')) {
      try {
        await SupabaseStudyService.resetarPalavra(palavraId);
        await carregarPalavras();
      } catch (error) {}
    }
  };

  const deletarPalavra = async (palavraId: string) => {
    if (confirm('⚠️ Delete this word permanently?')) {
      try {
        await SupabaseStudyService.deletarPalavra(palavraId);
        await carregarPalavras();
      } catch (error) {}
    }
  };

  const proximoFlashcard = () => {
    if (indexFlashcard < palavrasFiltradas.length - 1) {
      setIndexFlashcard(indexFlashcard + 1);
      setMostrarTraducao(false);
    }
  };

  const anteriorFlashcard = () => {
    if (indexFlashcard > 0) {
      setIndexFlashcard(indexFlashcard - 1);
      setMostrarTraducao(false);
    }
  };

  const revelarTraducao = () => {
    setMostrarTraducao(true);
  };

  const palavrasFiltradas = palavras
    .filter(p => {
      if (filtro === 'revisadas') return p.revisada;
      if (filtro === 'nao-revisadas') return !p.revisada;
      return true;
    })
    .filter(p => {
      if (!searchTerm) return true;
      return (
        p.palavra.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.traducao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const stats = {
    total: palavras.length,
    revisadas: palavras.filter(p => p.revisada).length,
    naoRevisadas: palavras.filter(p => !p.revisada).length,
    basico: palavras.filter(p => p.nivel === 'basico').length,
    intermediario: palavras.filter(p => p.nivel === 'intermediario').length,
    avancado: palavras.filter(p => p.nivel === 'avancado').length
  };

  return (
    <div className="vocabulario">
      <header className="page-header">
        <h1>📚 Vocabulary</h1>
        <p>Organize and review your learned words</p>
      </header>

      {/* Estatísticas */}
      <div className="vocab-stats">
        <div className="stat-card">
          <span className="stat-icon">📖</span>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-value">{stats.revisadas}</span>
            <span className="stat-label">Reviewed</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <div className="stat-info">
            <span className="stat-value">{stats.naoRevisadas}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🟢</span>
          <div className="stat-info">
            <span className="stat-value">{stats.basico}</span>
            <span className="stat-label">Basic</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🟡</span>
          <div className="stat-info">
            <span className="stat-value">{stats.intermediario}</span>
            <span className="stat-label">Intermediate</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔴</span>
          <div className="stat-info">
            <span className="stat-value">{stats.avancado}</span>
            <span className="stat-label">Advanced</span>
          </div>
        </div>
      </div>

      {/* Formulário Adicionar Palavra */}
      <div className="add-word-section">
        <h2>➕ Add New Word</h2>
        <form onSubmit={adicionarPalavra} className="add-word-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Word in English"
              value={novaPalavra.palavra}
              onChange={(e) => setNovaPalavra({ ...novaPalavra, palavra: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Translation in Portuguese"
              value={novaPalavra.traducao}
              onChange={(e) => setNovaPalavra({ ...novaPalavra, traducao: e.target.value })}
              required
            />
          </div>
          <input
            type="text"
            placeholder="Context or example (optional)"
            value={novaPalavra.exemplo}
            onChange={(e) => setNovaPalavra({ ...novaPalavra, exemplo: e.target.value })}
          />
          <div className="nivel-selector">
            <label>Level:</label>
            <button
              type="button"
              className={novaPalavra.nivel === 'basico' ? 'active' : ''}
              onClick={() => setNovaPalavra({ ...novaPalavra, nivel: 'basico' })}
            >
              🟢 Basic
            </button>
            <button
              type="button"
              className={novaPalavra.nivel === 'intermediario' ? 'active' : ''}
              onClick={() => setNovaPalavra({ ...novaPalavra, nivel: 'intermediario' })}
            >
              🟡 Intermediate
            </button>
            <button
              type="button"
              className={novaPalavra.nivel === 'avancado' ? 'active' : ''}
              onClick={() => setNovaPalavra({ ...novaPalavra, nivel: 'avancado' })}
            >
              🔴 Advanced
            </button>
          </div>
          <button type="submit" className="btn-add">
            ➕ Add Word
          </button>
        </form>
      </div>

      {/* Controles */}
      <div className="vocab-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search word..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={filtro === 'todas' ? 'active' : ''}
            onClick={() => setFiltro('todas')}
          >
            📖 All ({stats.total})
          </button>
          <button
            className={filtro === 'revisadas' ? 'active' : ''}
            onClick={() => setFiltro('revisadas')}
          >
            ✅ Reviewed ({stats.revisadas})
          </button>
          <button
            className={filtro === 'nao-revisadas' ? 'active' : ''}
            onClick={() => setFiltro('nao-revisadas')}
          >
            ⏳ Pending ({stats.naoRevisadas})
          </button>
        </div>

        <div className="view-toggle">
          <button
            className={modoVisualizacao === 'lista' ? 'active' : ''}
            onClick={() => setModoVisualizacao('lista')}
          >
            📋 List
          </button>
          <button
            className={modoVisualizacao === 'flashcard' ? 'active' : ''}
            onClick={() => {
              setModoVisualizacao('flashcard');
              setIndexFlashcard(0);
              setMostrarTraducao(false);
            }}
          >
            🎴 Flashcards
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      {modoVisualizacao === 'lista' ? (
        <div className="words-list">
          {palavrasFiltradas.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No words found</p>
              <small>Add words or adjust filters</small>
            </div>
          ) : (
            palavrasFiltradas.map((palavra, index) => (
              <div key={index} className={`word-card ${palavra.revisada ? 'revisada' : ''}`}>
                <div className="word-header">
                  <div className="word-main">
                    <h3>{palavra.palavra}</h3>
                    <p className="word-translation">{palavra.traducao}</p>
                  </div>
                  <span className={`word-nivel nivel-${palavra.nivel}`}>
                    {palavra.nivel === 'basico' ? '🟢' : palavra.nivel === 'intermediario' ? '🟡' : '🔴'}
                  </span>
                </div>

                {palavra.exemplo && (
                  <p className="word-context">
                    <em>"{palavra.exemplo}"</em>
                  </p>
                )}

                <div className="word-stats">
                  <span>📅 {new Date(palavra.dataAprendida).toLocaleDateString('en-US')}</span>
                  <span>🔄 Reviews: {palavra.acertos + palavra.erros}</span>
                  {(palavra.acertos + palavra.erros) > 0 && (
                    <span>
                      ✅ {palavra.acertos} | ❌ {palavra.erros}
                    </span>
                  )}
                </div>

                <div className="word-actions-list">
                  <button
                    className="btn-reset"
                    onClick={() => resetarPalavra(palavra.id)}
                    title="Reset hits and misses"
                  >
                    🔄 Reset
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => deletarPalavra(palavra.id)}
                    title="Delete word"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flashcard-container">
          {palavrasFiltradas.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No words to review</p>
            </div>
          ) : (
            <>
              <div className="flashcard-progress">
                {indexFlashcard + 1} / {palavrasFiltradas.length}
              </div>

              <div className={`flashcard ${mostrarTraducao ? 'flipped' : ''}`}>
                <div className="flashcard-front">
                  <div className="flashcard-nivel">
                    {palavrasFiltradas[indexFlashcard].nivel === 'basico' ? '🟢' : 
                     palavrasFiltradas[indexFlashcard].nivel === 'intermediario' ? '🟡' : '🔴'}
                  </div>
                  <h2>{palavrasFiltradas[indexFlashcard].palavra}</h2>
                  {!mostrarTraducao && (
                    <button className="btn-reveal" onClick={revelarTraducao}>
                      🔍 Reveal Translation
                    </button>
                  )}
                </div>

                {mostrarTraducao && (
                  <div className="flashcard-back">
                    <p className="flashcard-translation">
                      {palavrasFiltradas[indexFlashcard].traducao}
                    </p>
                    {palavrasFiltradas[indexFlashcard].exemplo && (
                      <p className="flashcard-example">
                        <em>"{palavrasFiltradas[indexFlashcard].exemplo}"</em>
                      </p>
                    )}
                    
                    {/* Estatísticas de acertos/erros */}
                    {palavrasFiltradas[indexFlashcard].acertos + palavrasFiltradas[indexFlashcard].erros > 0 && (
                      <div className="flashcard-stats">
                        <span>✅ {palavrasFiltradas[indexFlashcard].acertos} correct</span>
                        <span>❌ {palavrasFiltradas[indexFlashcard].erros} wrong</span>
                      </div>
                    )}
                    
                    <div className="flashcard-actions">
                      <button
                        className="btn-acerto"
                        onClick={() => {
                          marcarRevisada(palavrasFiltradas[indexFlashcard].id, true);
                          proximoFlashcard();
                        }}
                      >
                        <span className="btn-icon">✅</span>
                        <span className="btn-text">I got it</span>
                      </button>
                      <button
                        className="btn-erro"
                        onClick={() => {
                          marcarRevisada(palavrasFiltradas[indexFlashcard].id, false);
                          proximoFlashcard();
                        }}
                      >
                        <span className="btn-icon">❌</span>
                        <span className="btn-text">I missed</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flashcard-navigation">
                <button
                  onClick={anteriorFlashcard}
                  disabled={indexFlashcard === 0}
                  className="btn-nav"
                >
                  ◀️ Previous
                </button>
                <button
                  onClick={proximoFlashcard}
                  disabled={indexFlashcard === palavrasFiltradas.length - 1}
                  className="btn-nav"
                >
                  Next ▶️
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Vocabulario;
