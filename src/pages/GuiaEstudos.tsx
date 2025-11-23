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
  const [rotinaSemanl, setRotinaSemanl] = useState<AtividadeSemanal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarGuia();
  }, []);

  const carregarGuia = async () => {
    try {
      setLoading(true);
      const usuario = await SupabaseAuthService.getUsuarioAtual();
      if (usuario) {
        const guiaData = await professorService.buscarGuiaAluno(usuario.id);
        const rotinaData = await professorService.buscarRotinaSemanal(usuario.id);
        setGuia(guiaData);
        setRotinaSemanl(rotinaData);
      }
    } catch (error) {
      console.error('Erro ao carregar guia:', error);
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
        <div className="loading">Carregando guia de estudos...</div>
      </div>
    );
  }

  const conteudoMesAtual = mesAtual || {
    mes: mesSelecionado,
    titulo: `Mês ${mesSelecionado}`,
    objetivos: [],
    gramatica: [],
    vocabulario: [],
    listening: [],
    speaking: [],
    reading: [],
    writing: [],
    check_final: []
  };

  return (
    <div className="guia-estudos">
      <header className="guia-header">
        <h1>📖 Guia de Estudos</h1>
        <p>Detalhamento completo do seu plano de 12 meses</p>
      </header>

      {/* Seletor de Mês */}
      <div className="mes-selector">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
          <button
            key={mes}
            className={`mes-btn ${mes === mesSelecionado ? 'active' : ''}`}
            onClick={() => setMesSelecionado(mes)}
          >
            Mês {mes}
          </button>
        ))}
      </div>

      {/* Conteúdo do Mês */}
      <div className="conteudo-mes">
        <div className="mes-header">
          <h2>Mês {conteudoMesAtual.mes}: {conteudoMesAtual.titulo}</h2>
          <p className="fase-badge">
            {conteudoMesAtual.mes <= 4 ? '🟢 Fase 1 - Básico' : 
             conteudoMesAtual.mes <= 8 ? '🟡 Fase 2 - Intermediário' : 
             '🔵 Fase 3 - Avançado'}
          </p>
        </div>

        {/* Objetivos */}
        <section className="guia-section">
          <h3>🎯 Objetivos do Mês</h3>
          <ul>
            {conteudoMesAtual.objetivos.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </section>

        {/* Gramática */}
        <section className="guia-section">
          <h3>📝 Gramática a Dominar</h3>
          <ul>
            {conteudoMesAtual.gramatica.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <div className="dica-gpt">
            <strong>💡 Atividade com GPT:</strong>
            <p>"Me explique {conteudoMesAtual.gramatica[1]} de forma simples, com 20 frases de exemplo e depois faça perguntas para eu responder."</p>
          </div>
        </section>

        {/* Vocabulário */}
        <section className="guia-section">
          <h3>📚 Vocabulário Essencial</h3>
          <ul>
            {conteudoMesAtual.vocabulario.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <div className="tarefa-diaria">
            <strong>📌 Tarefa Diária (10 minutos):</strong>
            <p>5-10 palavras novas + criar 3 frases usando cada uma</p>
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
          <h3>✅ Check Final do Mês {conteudoMesAtual.mes}</h3>
          <p>Você deve conseguir:</p>
          <ul>
            {conteudoMesAtual.check_final.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Rotina Semanal */}
        <section className="guia-section rotina-semanal">
          <h3>📅 Rotina Semanal Padrão (1h/dia)</h3>
          <div className="dias-semana">
            {rotinaSemanl.map(atividade => (
              <div key={atividade.dia_semana} className="dia-rotina">
                <div className="dia-numero">{atividade.icone} Dia {atividade.dia_semana}</div>
                <div className="dia-nome">{atividade.nome}</div>
                <div className="dia-desc">{atividade.descricao}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default GuiaEstudos;
