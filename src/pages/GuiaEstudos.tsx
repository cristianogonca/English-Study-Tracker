import { useState, useEffect } from 'react';
import { useStudy } from '../contexts/StudyContext';
import { professorService } from '../services/SupabaseProfessorService';
import SupabaseAuthService from '../services/SupabaseAuthService';
import { GuiaEstudosMes } from '../types';
import './GuiaEstudos.css';

function GuiaEstudos() {
  const { cronograma, config } = useStudy();
  const [mesSelecionado, setMesSelecionado] = useState(1);
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [guia, setGuia] = useState<GuiaEstudosMes[]>([]);
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
        setGuia(guiaData);
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

  const diasDoMes = cronograma.filter(dia => dia.mes === mesSelecionado);

  const getAtividadesDia = (diaSemana: number) => {
    const atividades = [
      { dia: 1, nome: "Gramática + Exercícios", descricao: "Estudar tópico gramatical da semana + fazer exercícios práticos", icone: "📝" },
      { dia: 2, nome: "Vocabulário + Frases", descricao: "Aprender 10 palavras novas + criar frases próprias", icone: "📚" },
      { dia: 3, nome: "Listening + Anotações", descricao: "Ouvir áudio/vídeo + anotar palavras e frases ouvidas", icone: "🎧" },
      { dia: 4, nome: "Reading + Resumo", descricao: "Ler texto em inglês + fazer resumo em 5 linhas", icone: "📖" },
      { dia: 5, nome: "Speaking + Gravação", descricao: "Gravar áudio falando sobre tópico do dia", icone: "🎤" },
      { dia: 6, nome: "Writing", descricao: "Escrever texto ou diálogo sobre tema da semana", icone: "✍️" },
      { dia: 7, nome: "Revisão", descricao: "Revisar tudo da semana + fazer check semanal no app", icone: "✅" }
    ];
    
    return atividades[diaSemana - 1];
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
            onClick={() => {
              setMesSelecionado(mes);
              setDiaSelecionado(null);
            }}
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
            {Array.from({ length: 7 }, (_, i) => i + 1).map(dia => {
              const atividade = getAtividadesDia(dia);
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

        {/* Calendário do Mês */}
        <section className="guia-section">
          <h3>📆 Dias do Mês {mesSelecionado}</h3>
          <div className="calendario-mes">
            {diasDoMes.map(dia => (
              <div
                key={dia.numero}
                className={`dia-card ${dia.concluido ? 'concluido' : ''}`}
                onClick={() => setDiaSelecionado(dia.numero)}
              >
                <div className="dia-numero">Dia {dia.numero}</div>
                <div className="dia-data">{dia.data?.split('T')[0]}</div>
                {dia.concluido && <span className="check">✓</span>}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal de Detalhes do Dia */}
      {diaSelecionado && (
        <div className="modal-overlay" onClick={() => setDiaSelecionado(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDiaSelecionado(null)}>✕</button>
            <h2>Dia {diaSelecionado} - Detalhes</h2>
            {(() => {
              const dia = cronograma.find(d => d.numero === diaSelecionado);
              if (!dia) return null;
              
              const diaSemana = ((diaSelecionado - 1) % 7) + 1;
              const atividade = getAtividadesDia(diaSemana);
              
              return (
                <>
                  <p><strong>Data:</strong> {dia.data?.split('T')[0]}</p>
                  <p><strong>Semana:</strong> {dia.semana}</p>
                  <p><strong>Fase:</strong> {dia.fase}</p>
                  
                  <div className="atividade-destaque">
                    <h3>{atividade.icone} {atividade.nome}</h3>
                    <p>{atividade.descricao}</p>
                  </div>

                  <div className="conteudo-dia">
                    <h4>📋 Conteúdo Sugerido:</h4>
                    {diaSemana === 1 && (
                      <ul>
                        <li>Estude a gramática principal do mês</li>
                        <li>Faça exercícios práticos</li>
                        <li>Use GPT para tirar dúvidas</li>
                      </ul>
                    )}
                    {diaSemana === 2 && (
                      <ul>
                        <li>Adicione 10 palavras no app</li>
                        <li>Crie 3 frases com cada palavra</li>
                        <li>Pratique pronúncia</li>
                      </ul>
                    )}
                    {diaSemana === 3 && (
                      <ul>
                        <li>Assista vídeo/áudio em inglês</li>
                        <li>Anote palavras reconhecidas</li>
                        <li>Liste palavras novas</li>
                      </ul>
                    )}
                    {diaSemana === 4 && (
                      <ul>
                        <li>Leia um texto em inglês</li>
                        <li>Faça resumo em 5 linhas</li>
                        <li>Destaque palavras úteis</li>
                      </ul>
                    )}
                    {diaSemana === 5 && (
                      <ul>
                        <li>Grave áudio falando sobre tópico</li>
                        <li>Ouça e identifique erros</li>
                        <li>Grave novamente se necessário</li>
                      </ul>
                    )}
                    {diaSemana === 6 && (
                      <ul>
                        <li>Escreva texto sobre tema da semana</li>
                        <li>Revise com GPT</li>
                        <li>Corrija erros apontados</li>
                      </ul>
                    )}
                    {diaSemana === 7 && (
                      <ul>
                        <li>Revise tudo da semana</li>
                        <li>Faça Check Semanal no app</li>
                        <li>Planeje próxima semana</li>
                      </ul>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default GuiaEstudos;
