import { useState, useEffect } from 'react';
import { useStudy } from '../contexts/StudyContext';
import { professorService } from '../services/SupabaseProfessorService';
import SupabaseAuthService from '../services/SupabaseAuthService';
import { GuiaEstudosMes, AtividadeSemanal } from '../types';
import './GuiaEstudos.css';

function GuiaEstudos() {
  const { cronograma, config } = useStudy();
  const [mesSelecionado, setMesSelecionado] = useState(1);
  const [guia, setGuia] = useState<GuiaEstudosMes[]>([]);
  const [rotinaSemanal, setRotinaSemanal] = useState<AtividadeSemanal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const usuario = await SupabaseAuthService.getUsuarioAtual();
      if (usuario) {
        const [guiaData, rotinaData] = await Promise.all([
          professorService.buscarGuiaAluno(usuario.id),
          professorService.buscarRotinaSemanal(usuario.id)
        ]);
        setGuia(guiaData);
        setRotinaSemanal(rotinaData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config?.dataInicio && cronograma.length > 0) {
      // Calcular mês atual baseado na data de início
      const hoje = new Date();
      const inicio = new Date(config.dataInicio);
      const diffTime = Math.abs(hoje.getTime() - inicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const mesAtual = Math.min(Math.ceil(diffDays / 30), 12);
      setMesSelecionado(mesAtual);
    }
  }, [config, cronograma]);

  const mesAtual = guia.find(m => m.mes === mesSelecionado);

  if (loading) {
    return (
      <div className="guia-estudos">
        <div className="loading">Loading study guide...</div>
      </div>
    );
  }

  const conteudoMesAtual = mesAtual || {
    mes: mesSelecionado,
    titulo: `Month ${mesSelecionado}`,
    objetivos: [],
    gramatica: [],
    vocabulario: [],
    listening: [],
    speaking: [],
    reading: [],
    writing: [],
    check_final: []
  };

  const getAtividadesDia = (diaSemana: number): AtividadeSemanal | undefined => {
    // Buscar da rotina semanal carregada do banco
    const atividade = rotinaSemanal.find(a => a.diaSemana === diaSemana);
    
    // Fallback para atividades padrão se não houver no banco
    if (!atividade) {
      const atividadesPadrao: AtividadeSemanal[] = [
        { diaSemana: 1, nome: "Gramática + Exercícios", descricao: "Estudar tópico gramatical da semana + fazer exercícios práticos", icone: "📝" },
        { diaSemana: 2, nome: "Vocabulário + Frases", descricao: "Aprender 10 palavras novas + criar frases próprias", icone: "📚" },
        { diaSemana: 3, nome: "Listening + Anotações", descricao: "Ouvir áudio/vídeo + anotar palavras e frases ouvidas", icone: "🎧" },
        { diaSemana: 4, nome: "Reading + Resumo", descricao: "Ler texto em inglês + fazer resumo em 5 linhas", icone: "📖" },
        { diaSemana: 5, nome: "Speaking + Gravação", descricao: "Gravar áudio falando sobre tópico do dia", icone: "🎤" },
        { diaSemana: 6, nome: "Writing", descricao: "Escrever texto ou diálogo sobre tema da semana", icone: "✍️" },
        { diaSemana: 7, nome: "Revisão", descricao: "Revisar tudo da semana + fazer check semanal no app", icone: "✅" }
      ];
      return atividadesPadrao.find(a => a.diaSemana === diaSemana);
    }
    
    return atividade;
  };

  return (
    <div className="guia-estudos">
      <header className="guia-header">
        <h1>📖 Study Guide</h1>
        <p>Complete breakdown of your 12-month plan</p>
      </header>

      {/* Seletor de Mês */}
      <div className="mes-selector">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
          <button
            key={mes}
            className={`mes-btn ${mes === mesSelecionado ? 'active' : ''}`}
            onClick={() => setMesSelecionado(mes)}
          >
            Month {mes}
          </button>
        ))}
      </div>

      {/* Conteúdo do Mês */}
      <div className="conteudo-mes">
        <div className="mes-header">
          <h2>Month {conteudoMesAtual.mes}: {conteudoMesAtual.titulo}</h2>
          <p className="fase-badge">
            {conteudoMesAtual.mes <= 4 ? '🟢 Phase 1 - Basic' : 
             conteudoMesAtual.mes <= 8 ? '🟡 Phase 2 - Intermediate' : 
             '🔵 Phase 3 - Advanced'}
          </p>
        </div>

        {/* Objetivos */}
        <section className="guia-section">
          <h3>🎯 Month Goals</h3>
          <ul>
            {conteudoMesAtual.objetivos.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </section>

        {/* Gramática */}
        <section className="guia-section">
          <h3>📝 Grammar to Master</h3>
          <ul>
            {conteudoMesAtual.gramatica.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <div className="dica-gpt">
            <strong>💡 Activity with GPT:</strong>
            <p>"Explain {conteudoMesAtual.gramatica[1]} in a simple way, with 20 example sentences, and then ask me questions to answer."</p>
          </div>
        </section>

        {/* Vocabulário */}
        <section className="guia-section">
          <h3>📚 Essential Vocabulary</h3>
          <ul>
            {conteudoMesAtual.vocabulario.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <div className="tarefa-diaria">
            <strong>📌c Daily Task (10 minutes):</strong>
            <p>5-10 new words + create 3 sentences using each one</p>
          </div>
        </section>

        {/* Listening */}
        <section className="guia-section">
          <h3>🎧 Listening</h3>
          <ul>
            {conteudoMesAtual.listening.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Speaking */}
        <section className="guia-section">
          <h3>🎤 Speaking</h3>
          <ul>
            {conteudoMesAtual.speaking.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Reading */}
        <section className="guia-section">
          <h3>📖 Reading</h3>
          <ul>
            {conteudoMesAtual.reading.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Writing */}
        <section className="guia-section">
          <h3>✍️ Writing</h3>
          <ul>
            {conteudoMesAtual.writing.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Check Final */}
        <section className="guia-section check-final">
          <h3>✅ Final Check for Month {conteudoMesAtual.mes}</h3>
          <p>You should be able to:</p>
          <ul>
            {conteudoMesAtual.check_final.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Rotina Semanal */}
        <section className="guia-section rotina-semanal">
          <h3>📅 Standard Weekly Routine (1h/day)</h3>
          <div className="dias-semana">
            {Array.from({ length: 7 }, (_, i) => i + 1).map(dia => {
              const atividade = getAtividadesDia(dia);
              if (!atividade) return null;
              return (
                <div key={dia} className="dia-rotina">
                  <div className="dia-numero">{atividade.icone} Dia {dia}</div>
                  <div className="dia-nome">{atividade.nome}</div>
                  <div className="dia-desc">{atividade.descricao}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default GuiaEstudos;
