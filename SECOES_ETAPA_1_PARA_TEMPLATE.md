# UNIVERSIDADE DO VALE DO RIO DOS SINOS (UNISINOS)

## UNIDADE ACADÊMICA DE GRADUAÇÃO

## CURSO DE ANÁLISE E DESENVOLVIMENTO DE SISTEMAS

**CRISTIANO GONÇALVES**

# USO DE PLATAFORMA WEB PARA ACOMPANHAMENTO DE AULAS PARTICULARES REMOTAS DE INGLÊS

**GLORINHA**

**2026**

**CRISTIANO GONÇALVES**

# USO DE PLATAFORMA WEB PARA ACOMPANHAMENTO DE AULAS PARTICULARES REMOTAS DE INGLÊS

Artigo apresentado como requisito parcial para obtenção do título de Tecnólogo em Análise e Desenvolvimento de Sistemas pelo curso de Análise e Desenvolvimento de Sistemas da Universidade do Vale do Rio dos Sinos (UNISINOS).

Orientador(a): Prof. Vinicius Bischoff

Glorinha

2026

# USO DE PLATAFORMA WEB PARA ACOMPANHAMENTO DE AULAS PARTICULARES REMOTAS DE INGLÊS

# USE OF A WEB PLATFORM FOR MONITORING REMOTE PRIVATE ENGLISH LESSONS

Cristiano Gonçalves

# RESUMO

Este trabalho apresenta a proposta de uma plataforma web para apoiar o acompanhamento pedagógico de aulas particulares remotas de inglês. O estudo parte do problema da fragmentação de informações e atividades entre ferramentas distintas de videoconferência, comunicação, compartilhamento de materiais, planejamento e avaliação, situação que pode dificultar a continuidade do acompanhamento entre professor e aluno. O objetivo geral é desenvolver e avaliar uma plataforma de interligação que centralize planejamento individual, materiais, tarefas, registros de estudo, visualização de progresso e avaliações. A pesquisa contempla a fundamentação teórica da proposta, o levantamento de requisitos, o desenvolvimento da plataforma e sua avaliação por meio de testes funcionais e de usabilidade com professores e alunos. Espera-se que a plataforma contribua para organizar o percurso individual de estudo e apoiar a mediação pedagógica entre os encontros remotos, sem substituir o papel do professor ou atribuir ao sistema, isoladamente, ganhos de proficiência linguística.

**Palavras-chave:** ensino remoto; língua inglesa; acompanhamento pedagógico; plataforma web; usabilidade.

# ABSTRACT

This paper presents the proposal of a web platform to support the pedagogical monitoring of remote private English lessons. The study addresses the fragmentation of information and activities across separate tools for videoconferencing, communication, material sharing, planning, and assessment, which can hinder continuous monitoring between teacher and student. The overall objective is to develop and evaluate an integrated platform that centralizes individual planning, materials, tasks, study records, progress visualization, and assessments. The research encompasses the theoretical foundation of the proposal, requirements elicitation, platform development, and evaluation through functional tests and usability assessment with teachers and students. The platform is expected to contribute to organizing the individual study path and supporting pedagogical mediation between remote meetings, without replacing the teacher's role or attributing language-proficiency gains to the system alone.

**Key-words:** remote learning; English language; pedagogical monitoring; web platform; usability.

# 1 INTRODUÇÃO

As tecnologias digitais passaram a ocupar papel mais visível na organização das atividades educacionais, especialmente a partir das mudanças provocadas pela pandemia de COVID-19. A UNESCO (2023) observa que esse período fortaleceu a relação entre tecnologia e educação, mas ressalta que resultados adequados dependem de condições como acesso, preparação docente e uso orientado por objetivos pedagógicos. Dessa forma, a simples transferência de uma aula para uma ferramenta digital não garante, por si só, continuidade, interação ou acompanhamento efetivo da aprendizagem.

No debate sobre ensino remoto, Hodges et al. (2020) diferenciam a resposta emergencial adotada durante a pandemia de uma experiencia de aprendizagem on-line planejada. Segundo os autores, a educação on-line de qualidade requer desenho instrucional, definição de atividades, formas de interação e mecanismos de suporte ao estudante. Essa distinção é importante para as aulas particulares de inglês, pois a videoconferência atende ao encontro síncrono, mas não organiza automaticamente as atividades realizadas antes e depois da aula.

O ensino de inglês constitui um contexto relevante para essa discussão. Como indicador de contexto, o EF English Proficiency Index 2025 atribuiu ao Brasil 482 pontos, abaixo da média global de 488 pontos apresentada pelo índice (EF EDUCATION FIRST, 2025). O indicador deve ser interpretado com cautela, pois se baseia em participantes voluntários de um teste on-line e não representa toda a população brasileira. Ainda assim, ele reforça a pertinência de investigar recursos que apoiem o ensino de inglês de forma acessível, organizada e adequada a diferentes rotinas.

Embora as aulas remotas ampliem a flexibilidade de horários e localização, professor e aluno podem depender de ferramentas distintas para comunicação, materiais, tarefas, planejamento e avaliação. Essa dispersão tende a dificultar a visualização conjunta do percurso de estudo: o professor pode ter dificuldade para identificar tarefas pendentes e ajustar o planejamento, enquanto o aluno pode perder clareza sobre metas, materiais e atividades de continuidade. A revisão sistemática de Limbu (2025), composta por 32 estudos, identificou que organização, interação professor-aluno, desenho das atividades e utilidade percebida da tecnologia estão associados ao engajamento na aprendizagem on-line. Portanto, torna-se pertinente investigar uma proposta que integre esses elementos sem substituir a mediação pedagógica do professor.

Este trabalho delimita-se ao desenvolvimento e à avaliação de uma plataforma web de interligação entre professores particulares de inglês que ministram aulas remotas e seus alunos. Denominada **English Study Tracker**, a proposta reúne planejamento individual, cronograma, guia de estudos, compartilhamento de materiais, registro de sessões, acompanhamento de progresso e avaliações. O trabalho contempla a fundamentação teórica da proposta, o levantamento de requisitos, o desenvolvimento da plataforma e sua avaliação por meio de testes funcionais e de usabilidade com usuários representativos.

# 1.1 PROBLEMA E QUESTão DE PESQUISA

Em aulas particulares remotas de inglês, a interação síncrona costuma ocorrer por ferramentas de videoconferência, enquanto tarefas, arquivos, dúvidas, registros de estudo e avaliações podem circular em outros ambientes digitais. Essa distribuição de informações em canais independentes dificulta a continuidade do acompanhamento entre as aulas. Como consequência, o professor pode ter visão limitada sobre o que foi planejado e executado por cada aluno, e o aluno pode enfrentar dificuldade para localizar materiais, compreender prioridades e acompanhar sua própria evolução.

O problema de pesquisa consiste, portanto, na falta de uma estrutura integrada para apoiar o acompanhamento pedagógico contínuo entre professores particulares de inglês e alunos em aulas remotas. A pergunta que orienta o projeto é: **em que medida uma plataforma web integrada permite que professores particulares de inglês e seus alunos realizem tarefas de acompanhamento pedagógico remoto com eficácia, eficiência e satisfação?**

A resposta será investigada por taxa de conclusão de tarefas, tempo de execução, erros ou pedidos de ajuda, escore do questionário SUS e comentários dos participantes. A eficácia, a eficiência e a satisfação serão consideradas conforme a definição de usabilidade da ISO 9241-11 (2018), e o SUS será utilizado como instrumento de percepção geral de usabilidade (BROOKE, 1996). O estudo não buscara afirmar que a plataforma, isoladamente, aumenta a fluência em inglês ou reduz evasão, pois tais conclusões exigiriam acompanhamento longitudinal e um desenho de pesquisa diferente.

# 1.2 OBJETIVO GERAL

O objetivo geral deste trabalho é desenvolver e avaliar uma plataforma web de interligação para apoiar o acompanhamento pedagógico de aulas particulares remotas de inglês. A proposta deverá centralizar planejamento individual, materiais, tarefas, registros de estudo, visualização de progresso e avaliações, oferecendo recursos adequados aos perfis de professor e aluno.

A avaliação verificara se os fluxos prioritários podem ser concluídos com eficácia, eficiência e satisfação. Essa relação entre objetivo e método permite que a qualidade da plataforma seja discutida com evidências de uso, sem antecipar resultados ainda não coletados.

# 1.3 OBJETIVOS ESPECÍFICOS

Para atingir o objetivo geral, os objetivos específicos foram organizados de forma encadeada, articulando investigação, desenvolvimento do artefato e produção de evidências. Cada objetivo possui uma forma prevista de verificação, garantindo correspondência entre o que se pretende realizar e a maneira de avaliar o resultado.

1. Levantar requisitos funcionais e não funcionais para o acompanhamento de aulas particulares remotas de inglês, com base na literatura e no contexto de uso definido.

- Comprovação prevista: matriz de requisitos com fonte, prioridade e critério de aceite.

2. Analisar trabalhos relacionados para identificar recursos, métricas de avaliação e lacunas em plataformas de aprendizagem ou acompanhamento de inglês on-line.

- Comprovação prevista: matriz comparativa de estudos, com contexto, método, evidencias, limitações e contribuição para a proposta.

3. Definir cenários de uso, instrumentos e critérios de avaliação para a plataforma.

- Comprovação prevista: roteiro de tarefas para professor e aluno, formulário de observação e questionário SUS planejados.

4. Desenvolver a plataforma com autenticação, perfis de professor e aluno, cronograma individual, materiais, registros de estudo, indicadores de progresso e avaliações.

- Comprovação prevista: requisitos implementados e testes funcionais aprovados para cada fluxo prioritário.

5. Validar o funcionamento dos fluxos prioritários da plataforma em cenários de professor e aluno.

- Comprovação prevista: percentual de casos de teste aprovados, defeitos identificados e taxa de correção dos defeitos prioritários.

6. Avaliar a usabilidade da plataforma com usuários representativos.

- Comprovação prevista: taxa de conclusão das tarefas, tempo de execução, erros, pedidos de ajuda, escore SUS e comentários qualitativos dos participantes.

# 1.4 JUSTIFICATIVA

A relevância pratica deste estudo decorre da necessidade de dar continuidade ao acompanhamento pedagógico em aulas particulares de inglês realizadas a distância. A videoconferência viabiliza o encontro entre professor e aluno, mas não oferece, necessariamente, uma visão integrada de planejamento, tarefas, materiais, registros e avaliações. Uma plataforma de interligação pode apoiar o professor na organização do percurso individual e auxiliar o aluno a compreender o que precisa estudar, revisar ou entregar entre os encontros.

A proposta também se justifica pela necessidade de combinar flexibilidade com acompanhamento. A aprendizagem on-line envolve decisões sobre ritmo, interação, papel do professor, atividades e formas de avaliação, não sendo equivalente a mera disponibilização de conteúdos digitais (MEANS; BAKIA; MURPHY, 2014). Desse modo, a plataforma não é concebida como substituta da aula ou do professor. Ela é concebida como recurso de apoio a mediação pedagógica, conectando as atividades síncronas e assíncronas que compõem o processo de estudo.

Do ponto de vista científico, estudos recentes mostram que a experiencia de aprendizagem on-line deve ser analisada considerando engajamento, percepção e satisfação dos estudantes. Salihagic e Akay (2022), ao investigarem estudantes de inglês durante a pandemia, examinaram esses elementos no processo de transição para atividades on-line. Limbu (2025) também demonstra que fatores relacionados ao estudante, ao professor, ao desenho do curso e a tecnologia influenciam o engajamento. Contudo, esses estudos não avaliam especificamente uma plataforma integrada para o acompanhamento longitudinal da relação entre professor particular remoto de inglês e aluno.

O diferencial proposto está em reunir, no mesmo ambiente, recursos para planejamento, execução, acompanhamento e avaliação, com visões e permissões distintas para professor e aluno. A contribuição esperada é apresentar uma plataforma integrada e evidências sobre seu funcionamento e sua usabilidade em tarefas representativas. Assim, o estudo se mostra tecnologicamente viável, academicamente fundamentado e potencialmente útil para professores e alunos que buscam maior continuidade no acompanhamento de aulas remotas de inglês.

# REFERÊNCIAS

EF EDUCATION FIRST. **EF English Proficiency Index 2025: Brazil**. 2025. Disponível em: <https://www.ef.com/Gwen/epi/regions/latin-america/brazil/>. Acesso em: 12 set. 2026.

BROOKE, John. SUS: a "quick and dirty" usability scale. In: JORDAN, Patrick W. et al. (ed.). **Usability evaluation in industry**. London: Taylor & Francis, 1996. p. 189-194.

HODGES, Charles et al. The difference between emergency remote teaching and online learning. **EDUCAUSE Review**, 27 mar. 2020. Disponível em: <https://er.educause.edu/articles/2020/3/the-difference-between-emergency-remote-teaching-and-online-learning>. Acesso em: 12 set. 2026.

INTERNATIONAL ORGANIZATION FOR STANDARDIZATION. **ISO 9241-11:2018: Ergonomics of human-system interaction - Part 11: Usability: Definitions and concepts**. Geneva: ISO, 2018.

LIMBU, Yam. Factors associated with student engagement in online learning during COVID-19 pandemic: a systematic review. **Online Learning**, v. 29, n. 1, 2025. DOI: 10.24059/olj.v29i1.4221.

MEANS, Barbara; BAKIA, Marianne; MURPHY, Robert. **Learning online: what research tells us about whether, when and how**. New York: Routledge, 2014.

SALIHAGIC, Selma; AKAY, Ceylani. Perception, engagement and satisfaction of English language learners with online learning during Covid-19 pandemic. **European Journal of Education**, v. 5, n. 2, p. 34-50, 2022. DOI: 10.2478/ejed-2022-0003.

UNESCO. **Global education monitoring report, 2023: technology in education: a tool on whose terms?** Paris: UNESCO, 2023. DOI: 10.54676/UZQV8501.
