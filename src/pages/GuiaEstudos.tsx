import { useState, useEffect } from 'react';
import { useStudy } from '../contexts/StudyContext';
import './GuiaEstudos.css';

interface ConteudoMes {
  mes: number;
  titulo: string;
  objetivos: string[];
  gramatica: string[];
  vocabulario: string[];
  listening: string[];
  speaking: string[];
  reading: string[];
  writing: string[];
  checkFinal: string[];
}

function GuiaEstudos() {
  const { cronograma, config } = useStudy();
  const [mesSelecionado, setMesSelecionado] = useState(1);
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);

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

  const conteudoMeses: ConteudoMes[] = [
    {
      mes: 1,
      titulo: "Fundamentos Absolutos",
      objetivos: [
        "Conhecer a estrutura mínima do inglês",
        "Formar frases simples conscientes",
        "Conseguir se apresentar e responder perguntas básicas"
      ],
      gramatica: [
        "Alfabeto + pronúncia",
        "Verb to be (am/is/are): afirmativa, negativa, pergunta",
        "Pronomes pessoais e possessivos",
        "Artigos (a/an/the)",
        "Plural",
        "Introdução ao Simple Present",
        "Estrutura básica de frase (S + V + C)"
      ],
      vocabulario: [
        "Saudações (greetings)",
        "Países e nacionalidades",
        "Profissões",
        "Números (0-100)",
        "Cores",
        "Itens do dia a dia",
        "Meta: 5-10 palavras novas por dia"
      ],
      listening: [
        "📻 BBC Learning English - Level 1",
        "📻 VOA Learning English - Beginner",
        "🎯 Meta: compreender 50-70% dos diálogos",
        "✅ Tarefa: Listar 10 palavras reconhecidas e 5 novas"
      ],
      speaking: [
        "🎤 Gravações sugeridas:",
        "- Who are you?",
        "- What do you do?",
        "- Where are you from?",
        "💡 Com GPT: 'Finja ser um entrevistador e faça perguntas simples'"
      ],
      reading: [
        "📖 Pequenas biografias",
        "📖 Diálogos simples (60-120 palavras)",
        "✅ Tarefa: Resumir em 4 linhas"
      ],
      writing: [
        "✍️ Tema Fixo: 'About me'",
        "🎯 Meta Final do Mês: 10-12 linhas",
        "💡 Revisão com GPT: 'Corrija meu texto e explique cada erro'"
      ],
      checkFinal: [
        "Se apresentar por 1 minuto",
        "Entender e responder perguntas simples com 'to be'",
        "Ler pequenos textos com 60-120 palavras",
        "Vocabulário: ~150 palavras"
      ]
    },
    {
      mes: 2,
      titulo: "Construção de Frases",
      objetivos: [
        "Falar sobre casa, rotina e localização",
        "Dominar Simple Present completo",
        "Expandir vocabulário para 300+ palavras"
      ],
      gramatica: [
        "This / That / These / Those",
        "There is / There are",
        "Have / Have got",
        "Preposições de lugar (in, on, at, under, behind)",
        "Simple Present completo (todas as pessoas + Do/Does)"
      ],
      vocabulario: [
        "Casa e cômodos (house, bedroom, kitchen, bathroom)",
        "Móveis (furniture)",
        "Cidade (city, street, park, mall)",
        "Compras (shopping)",
        "Itens pessoais",
        "Verbos comuns da rotina (wake up, brush, eat, work, sleep)"
      ],
      listening: [
        "📻 Oxford Picture Dictionary listening",
        "📻 Diálogos no YouTube (Easy English)",
        "✅ Tarefa: Identificar 3 frases completas e reescrever"
      ],
      speaking: [
        "🎤 Gravações sugeridas:",
        "- Descreva sua casa",
        "- Explique seu quarto",
        "- Fale sua rotina completa",
        "💡 Dica: Falar lentamente, com clareza"
      ],
      reading: [
        "📖 Anúncios de imóveis",
        "📖 Descrições de cidades",
        "✅ Tarefa: Destacar 15 palavras úteis"
      ],
      writing: [
        "✍️ Tema: 'My daily routine'",
        "🎯 Meta: 12-20 linhas"
      ],
      checkFinal: [
        "Descrever sua casa e rotina completa",
        "Fazer perguntas e responder em Present Simple",
        "Vocabulário: ~300 palavras"
      ]
    },
    {
      mes: 3,
      titulo: "Ação e Movimento",
      objetivos: [
        "Descrever o que está acontecendo agora",
        "Expressar habilidades e obrigações",
        "Vocabulário: 450+ palavras"
      ],
      gramatica: [
        "Present Continuous (am/is/are + verb-ing)",
        "Can / Can't (habilidade)",
        "Must / Mustn't (obrigação)",
        "Adverbs of frequency (always, usually, sometimes, never)"
      ],
      vocabulario: [
        "Verbos do dia a dia (cooking, cleaning, studying, working)",
        "Comida (food categories)",
        "Restaurantes (ordering, menu)",
        "Esportes (sports, activities)",
        "Transportes (car, bus, train, plane)",
        "Meta: 150 novas palavras no mês"
      ],
      listening: [
        "📻 Diálogos de restaurante e loja",
        "📻 Vídeos com ações acontecendo",
        "✅ Tarefa: Identificar verbos em -ing, registrar 10 frases"
      ],
      speaking: [
        "🎤 Tópicos:",
        "- Peça comida em restaurante",
        "- Explique o que outra pessoa está fazendo",
        "- Conte sua agenda do dia"
      ],
      reading: [
        "📖 Pequenas histórias e diálogos"
      ],
      writing: [
        "✍️ Tema: 'Ordering food'",
        "🎯 Objetivo: Criar diálogos completos"
      ],
      checkFinal: [
        "Falar atividades que estão acontecendo agora",
        "Expressar o que pode/precisa fazer",
        "Vocabulário: ~450 palavras"
      ]
    },
    {
      mes: 4,
      titulo: "Passado",
      objetivos: [
        "Contar histórias no passado",
        "Comparar coisas",
        "Se expressar com clareza sobre experiências",
        "Vocabulário: 600+ palavras"
      ],
      gramatica: [
        "Past Simple (regular e irregular)",
        "Wh- questions completas (What, Where, When, Why, Who, How)",
        "Comparatives (bigger, more expensive)",
        "Superlatives (the biggest, the most expensive)",
        "Too / Enough"
      ],
      vocabulario: [
        "Viagem (travel, trip, journey)",
        "Relatos (experiences)",
        "Experiências pessoais",
        "Datas e eventos (calendar, dates, years)",
        "Meta: 150 novas palavras"
      ],
      listening: [
        "📻 Histórias simples no passado",
        "📻 Relatos de viagem",
        "✅ Meta: Identificar 20 verbos no passado por semana"
      ],
      speaking: [
        "🎤 Tópicos:",
        "- Conte seu último final de semana",
        "- Compare duas coisas (carros, cidades, lugares)",
        "- Relate uma experiência marcante"
      ],
      reading: [
        "📖 Biografias simples",
        "📖 Aventuras curtas (short stories)"
      ],
      writing: [
        "✍️ Tema: 'My last weekend'",
        "🎯 Meta: 150 palavras"
      ],
      checkFinal: [
        "Contar uma história real em inglês",
        "Criar comparações com clareza",
        "Usar Simple Present, Present Continuous e Past Simple",
        "Vocabulário: ~600 palavras",
        "✨ Nível A2 (CEFR)"
      ]
    },
    {
      mes: 5,
      titulo: "Fluência e Narrativa",
      objetivos: [
        "Conectar ideias com fluidez",
        "Criar histórias mais longas",
        "Falar de planos futuros",
        "Vocabulário: 750+ palavras"
      ],
      gramatica: [
        "🔹 Future (Will / Going to)",
        "🔹 Past Continuous (was/were + verb-ing)",
        "🔹 Conectores: First, then, after that, finally",
        "🔹 Meanwhile, suddenly, before, after, when, while"
      ],
      vocabulario: [
        "📚 Estudos (education, learning)",
        "📚 Projetos (planning, goals)",
        "📚 Tecnologia (computer, internet, app)",
        "📚 Profissões avançadas"
      ],
      listening: [
        "📻 Pequenas entrevistas reais",
        "📻 TED-Ed simple talks"
      ],
      speaking: [
        "🎤 Objetivos para o ano",
        "🎤 História com começo, meio e fim",
        "🎤 Planos de fim de semana"
      ],
      reading: [
        "📖 Artigos sobre tecnologia",
        "📖 Histórias narrativas"
      ],
      writing: [
        "✍️ Tema: 'My goals for this year'",
        "🎯 Meta: 200 palavras"
      ],
      checkFinal: [
        "Narrar histórias completas com conectores",
        "Falar sobre planos futuros",
        "Vocabulário: ~750 palavras"
      ]
    },
    {
      mes: 6,
      titulo: "Experiências e Realidade",
      objetivos: [
        "Relatar fatos da vida",
        "Usar Present Perfect",
        "Vocabulário: 900+ palavras"
      ],
      gramatica: [
        "🔹 Present Perfect (have/has + past participle)",
        "🔹 Since / For",
        "🔹 Just / Already / Yet",
        "🔹 Ever / Never"
      ],
      vocabulario: [
        "📚 Notícias (news, events)",
        "📚 Eventos (achievements, milestones)",
        "📚 Life experiences"
      ],
      listening: [
        "📻 Entrevistas sobre experiências",
        "📻 Relatos de conquistas"
      ],
      speaking: [
        "🎤 Places visited",
        "🎤 Achievements",
        "🎤 Life milestones"
      ],
      reading: [
        "📖 Biografias",
        "📖 Histórias inspiradoras"
      ],
      writing: [
        "✍️ Tema: 'My life experiences'",
        "🎯 Meta: 250 palavras"
      ],
      checkFinal: [
        "Falar sobre sua vida com naturalidade",
        "Diferenciar Past Simple e Present Perfect",
        "Vocabulário: ~900 palavras"
      ]
    },
    {
      mes: 7,
      titulo: "Debates e Opiniões",
      objetivos: [
        "Defender ideias",
        "Concordar / discordar",
        "Argumentar com lógica",
        "Vocabulário: 1050+ palavras"
      ],
      gramatica: [
        "🔹 Zero Conditional (if + present, present)",
        "🔹 First Conditional (if + present, will)",
        "🔹 Second Conditional (if + past, would)",
        "🔹 Conectores: although, however, therefore"
      ],
      vocabulario: [
        "📚 Debate (debate, argument, opinion)",
        "📚 Opiniões (agree, disagree, point of view)",
        "📚 Situações do cotidiano"
      ],
      listening: [
        "📻 Debates simples",
        "📻 Discussões sobre temas atuais"
      ],
      speaking: [
        "🎤 School uniforms",
        "🎤 Remote work",
        "🎤 Social media",
        "🎤 Debates de 3-5 minutos"
      ],
      reading: [
        "📖 Artigos de opinião",
        "📖 Textos argumentativos"
      ],
      writing: [
        "✍️ Ensaio Opinativo",
        "🎯 Meta: 200-250 palavras"
      ],
      checkFinal: [
        "Debater e justificar ponto de vista",
        "Usar condicionais",
        "Vocabulário: ~1050 palavras"
      ]
    },
    {
      mes: 8,
      titulo: "Inglês Profissional",
      objetivos: [
        "Língua para trabalho",
        "Reuniões e apresentações",
        "Reportar resultados",
        "Vocabulário: 1200+ palavras"
      ],
      gramatica: [
        "🔹 Relative Clauses (who, which, that, where)",
        "🔹 Past Perfect (had + past participle)",
        "🔹 Estrutura formal",
        "🔹 Reported Speech (basics)"
      ],
      vocabulario: [
        "📚 Reuniões (meeting, agenda, minutes)",
        "📚 Relatórios (report, data, analysis)",
        "📚 Negócios (business, contract, deal)"
      ],
      listening: [
        "📻 Reuniões de trabalho",
        "📻 Apresentações profissionais"
      ],
      speaking: [
        "🎤 Reunião de equipe",
        "🎤 Apresentação de projeto",
        "🎤 Status report"
      ],
      reading: [
        "📖 E-mails profissionais",
        "📖 Relatórios empresariais"
      ],
      writing: [
        "✍️ E-mails profissionais",
        "✍️ Comunicações formais"
      ],
      checkFinal: [
        "Atuar em ambiente profissional",
        "Escrever e-mails formais",
        "Vocabulário: ~1200 palavras",
        "✨ Nível B1/B2 (CEFR)"
      ]
    },
    {
      mes: 9,
      titulo: "Estrutura Avançada",
      objetivos: [
        "Dominar estruturas avançadas",
        "Refinar clareza e precisão",
        "Vocabulário: 1400+ palavras"
      ],
      gramatica: [
        "🔹 Passive Voice (todas as formas)",
        "🔹 Mixed Conditionals",
        "🔹 Idioms and Phrasal Verbs",
        "🔹 Advanced connectors"
      ],
      vocabulario: [
        "📚 Expressões idiomáticas (50 principais)",
        "📚 Phrasal verbs (100 principais)",
        "📚 Vocabulário técnico"
      ],
      listening: [
        "📻 Áudios avançados",
        "📻 Podcasts em inglês"
      ],
      speaking: [
        "🎤 Apresentação: 5 minutos",
        "🎤 Tema profissional/acadêmico"
      ],
      reading: [
        "📖 Textos complexos",
        "📖 Artigos acadêmicos"
      ],
      writing: [
        "✍️ Meta: 250-300 palavras",
        "✍️ Temas complexos"
      ],
      checkFinal: [
        "Usar voz passiva naturalmente",
        "Aplicar idioms em contexto",
        "Vocabulário: ~1400 palavras"
      ]
    },
    {
      mes: 10,
      titulo: "Escrita Real",
      objetivos: [
        "Dominar escrita acadêmica",
        "Estruturar textos complexos",
        "Vocabulário: 1600+ palavras"
      ],
      gramatica: [
        "🔹 Estrutura de Essay",
        "🔹 Introdução (hook + thesis)",
        "🔹 Argumentos (body paragraphs)",
        "🔹 Conclusão (summary + final thought)"
      ],
      vocabulario: [
        "📚 Vocabulário acadêmico",
        "📚 Conectores formais",
        "📚 Expressões para argumentação"
      ],
      listening: [
        "📻 Palestras acadêmicas",
        "📻 TED Talks completos"
      ],
      speaking: [
        "🎤 Apresentações formais",
        "🎤 Defesa de argumentos"
      ],
      reading: [
        "📖 Essays modelo",
        "📖 Artigos acadêmicos"
      ],
      writing: [
        "✍️ Meta: 300-400 palavras/semana",
        "✍️ Foco em coesão e coerência"
      ],
      checkFinal: [
        "Escrever essays estruturados",
        "Argumentar com clareza",
        "Vocabulário: ~1600 palavras"
      ]
    },
    {
      mes: 11,
      titulo: "Interpretação Profunda",
      objetivos: [
        "Ler textos grandes",
        "Captar nuances",
        "Vocabulário: 1800+ palavras"
      ],
      gramatica: [
        "🔹 Revisão geral",
        "🔹 Foco em nuances",
        "🔹 Registro formal vs informal"
      ],
      vocabulario: [
        "📚 Textos jornalísticos",
        "📚 Termos acadêmicos",
        "📚 Análise crítica"
      ],
      listening: [
        "📻 Documentários",
        "📻 Noticiários internacionais"
      ],
      speaking: [
        "🎤 Discussões sobre textos",
        "🎤 Análise crítica"
      ],
      reading: [
        "📖 Artigos: 400-600 palavras",
        "📖 The Guardian, BBC News",
        "📖 TED transcripts"
      ],
      writing: [
        "✍️ Resumos críticos",
        "✍️ Análises textuais"
      ],
      checkFinal: [
        "Ler textos complexos",
        "Captar intenções do autor",
        "Vocabulário: ~1800 palavras"
      ]
    },
    {
      mes: 12,
      titulo: "Consolidação",
      objetivos: [
        "Falar com naturalidade",
        "Escrever com precisão",
        "Vocabulário: 2000+ palavras"
      ],
      gramatica: [
        "🔹 Revisão completa",
        "🔹 Refinamento",
        "🔹 Preparação para exames (IELTS/TOEFL)"
      ],
      vocabulario: [
        "📚 Consolidação total",
        "📚 Revisão phrasal verbs e idioms",
        "📚 Meta: 2000 palavras total"
      ],
      listening: [
        "📻 Listening tests (IELTS/TOEFL)",
        "📻 Variedade de sotaques"
      ],
      speaking: [
        "🎤 Speaking tests",
        "🎤 Apresentação final: 10 minutos"
      ],
      reading: [
        "📖 Reading comprehension tests",
        "📖 Textos longos e complexos"
      ],
      writing: [
        "✍️ Writing tasks (exam style)",
        "✍️ Projeto Final: 500 palavras"
      ],
      checkFinal: [
        "Comunicar-se com confiança",
        "Escrever textos complexos",
        "Compreender áudio e texto",
        "Vocabulário: ~2000 palavras",
        "✨ Nível B2/C1 (CEFR)"
      ]
    }
  ];

  const conteudoMesAtual = conteudoMeses.find(c => c.mes === mesSelecionado) || conteudoMeses[0];
  const diasDoMes = cronograma.filter(d => d.mes === mesSelecionado);

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
            {conteudoMesAtual.checkFinal.map((item, i) => (
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
