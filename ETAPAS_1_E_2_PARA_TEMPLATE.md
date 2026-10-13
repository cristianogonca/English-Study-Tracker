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


## 2 FUNDAMENTAÇÃO TEÓRICA

### 2.1 APRENDIZAGEM ON-LINE PLANEJADA E MEDIAÇÃO PEDAGÓGICA

A aprendizagem on-line não pode ser compreendida apenas como a disponibilização de conteúdos em um ambiente digital. A modalidade envolve decisões sobre objetivos de aprendizagem, ritmo das atividades, papel do professor, formas de interação, avaliação e suporte oferecido ao estudante. Means, Bakia e Murphy (2014) destacam que experiências on-line podem assumir configurações distintas conforme essas decisões. Logo, uma ferramenta tecnológica precisa estar associada a uma proposta pedagógica, pois seus recursos somente fazem sentido quando ajudam a organizar atividades e interações coerentes com os objetivos do processo de ensino e aprendizagem.

Essa distinção ganhou maior visibilidade durante a pandemia de COVID-19. Hodges et al. (2020) denominam de ensino remoto emergencial a mudança temporária para meios alternativos de oferta educacional ocorrida em uma situação de crise. Os autores diferenciam esse movimento de uma experiência de aprendizagem on-line planejada, que demanda tempo, desenho instrucional e organização de suportes ao estudante. Para a presente pesquisa, essa contribuição evita tratar a aula por videoconferência como uma solução completa para o ensino remoto: a comunicação síncrona é importante, mas precisa ser articulada a atividades realizadas entre os encontros.

A UNESCO (2023) também destaca que a tecnologia educacional deve ser analisada segundo seu propósito, seu contexto de uso e suas condições de implementação. O uso de sistemas digitais pode contribuir para acesso, qualidade e gestão educacional, mas não produz tais efeitos de forma automática. Aspectos como infraestrutura, preparação dos docentes, governança e adequação aos usuários interferem no resultado. Essa perspectiva é relevante porque a plataforma proposta não é apresentada como substituta da aula particular ou do professor, mas como recurso de apoio ao planejamento, ao acompanhamento e à continuidade das atividades de estudo.

No contexto de aulas particulares remotas de inglês, a mediação pedagógica compreende o que ocorre durante a aula e o que se desenvolve nos intervalos entre os encontros. O professor precisa orientar o aluno sobre metas, materiais, exercícios, revisões e próximas atividades; o aluno, por sua vez, precisa recuperar essas orientações e registrar o que realizou. Quando tais elementos ficam separados em mensagens, planilhas, arquivos e diferentes aplicativos, a continuidade do acompanhamento depende de esforço adicional de ambos. Assim, o conceito de aprendizagem on-line planejada sustenta a necessidade de uma plataforma que integre informações relevantes para o percurso individual, sem reduzir a relação pedagógica a indicadores numéricos.

### 2.2 AUTORREGULAÇÃO, ENGAJAMENTO E CONTINUIDADE DAS ATIVIDADES

O estudo de uma língua adicional exige participação ativa do estudante em atividades que se estendem além do horário formal da aula. Zimmerman (2002) caracteriza a autorregulação da aprendizagem como um processo no qual o estudante participa ativamente por meio de planejamento, monitoramento e reflexão sobre suas próprias ações. Esse conceito não significa que o aluno estuda isoladamente ou sem orientação docente. Ao contrário, metas claras, acompanhamento e devolutivas podem criar condições para que o estudante compreenda o que precisa fazer, acompanhe seu percurso e ajuste suas estratégias.

No recorte deste trabalho, planejamento, monitoramento e reflexão podem ser apoiados por recursos digitais como cronograma individual, guia de estudos, registro de sessões, lista de tarefas e visualização de progresso. Esses recursos não comprovam que houve aprendizagem linguística apenas por registrarem uma atividade. Eles funcionam como evidências do percurso de estudo e podem oferecer ao professor elementos para ajustar orientações futuras. Essa distinção é essencial: o sistema proposto pretende organizar e tornar visível o acompanhamento pedagógico, enquanto a aferição de proficiência em inglês demandaria instrumentos linguísticos específicos e um estudo de maior duração.

O engajamento na aprendizagem on-line depende de fatores que ultrapassam a existência de uma plataforma. Limbu (2025), em revisão sistemática de 32 estudos sobre aprendizagem on-line durante a pandemia, identificou fatores relacionados ao estudante, ao professor, ao desenho do curso e à tecnologia. Entre os elementos destacados estão motivação, autoeficácia, interação professor-aluno, presença docente, organização, atividades de aprendizagem e utilidade percebida das ferramentas. O resultado reforça que um ambiente digital precisa ser percebido como compreensível e relevante para as tarefas que o usuário realiza; uma interface que apenas acumula recursos tende a não resolver problemas de continuidade.

Para aulas particulares remotas de inglês, a continuidade pode ser entendida como a manutenção de um fio condutor entre aula, tarefas, materiais, prática individual, avaliação e próxima orientação docente. Essa continuidade é afetada por fatores pessoais, como rotina e motivação, mas também por fatores de organização do processo. A plataforma investigada não pretende atribuir a si a responsabilidade por reter alunos ou eliminar desistências. Seu papel proposto é diminuir a fragmentação de informações e tornar o planejamento compartilhado mais acessível para professor e aluno. Essa delimitação torna a proposta avaliável por evidências observáveis de uso, em vez de promessas amplas sobre desempenho ou permanência.

### 2.3 INTERAÇÃO, AVALIAÇÃO FORMATIVA E FEEDBACK NO ENSINO DE INGLÊS ON-LINE

Em ambientes educacionais mediados por tecnologia, a interação pode ocorrer entre estudante e conteúdo, estudante e professor e entre estudantes. Bernard et al. (2009), em meta-análise sobre tratamentos de interação em educação a distância, discutem a relevância dessas modalidades para os resultados educacionais. Embora o presente estudo se concentre em aulas particulares e não tenha como foco a interação entre pares, a distinção contribui para organizar a proposta: materiais, guias e tarefas apoiam a relação do aluno com o conteúdo; cronogramas, registros e avaliações apoiam o acompanhamento entre aluno e professor.

A avaliação formativa é outra base central para compreender o problema investigado. Shute (2008) define o feedback formativo como informação comunicada ao estudante com a finalidade de modificar seu pensamento ou comportamento para favorecer a aprendizagem. Portanto, a avaliação não se limita a atribuir uma nota ao final de uma atividade. Quando articulada a objetivos e devolutivas, ela pode fornecer elementos para que o estudante reconheça suas dificuldades e para que o professor adapte as atividades seguintes. A qualidade desse processo depende do sentido pedagógico da devolutiva, e não somente da digitalização de uma prova ou questionário.

No ensino de inglês, atividades avaliativas podem oferecer ao professor indícios sobre dificuldades em vocabulário, estruturas gramaticais, leitura, escrita ou compreensão de conteúdos trabalhados. Esses indícios precisam ser interpretados dentro do contexto de cada estudante, pois um resultado isolado não descreve integralmente sua competência linguística. Na plataforma proposta, o recurso de provas e correção será compreendido como uma forma de organizar atividades avaliativas e seus registros. Ele deverá permitir que professor e aluno retomem respostas e resultados, mantendo a avaliação ligada ao planejamento individual e aos materiais utilizados.

Wijaya (2022), ao analisar 20 estudos sobre avaliação formativa on-line em contextos de inglês como língua estrangeira, identificou benefícios associados a esse tipo de prática e apontou a necessidade de considerar suas limitações em diferentes contextos. Kristiyanti, Santosa e Pratiwi (2021) observaram, em pesquisa com estudantes de inglês, que a praticidade de ferramentas simples foi percebida positivamente, enquanto a falta de feedback reduziu o interesse dos participantes na avaliação on-line. Esses resultados fundamentam a necessidade de tratar o módulo de avaliação como parte de um ciclo de acompanhamento, que envolve atividade, registro, correção e devolutiva, e não como um componente independente.

### 2.4 USABILIDADE E QUALIDADE PERCEBIDA EM SISTEMAS EDUCACIONAIS

Uma plataforma destinada a apoiar professores e alunos precisa permitir que os usuários realizem tarefas com compreensão e esforço adequado. A ISO 9241-11 (2018) define usabilidade como o grau em que usuários específicos podem usar um sistema para atingir objetivos específicos com eficácia, eficiência e satisfação em determinado contexto de uso. Eficácia se relaciona ao alcance correto dos objetivos; eficiência considera os recursos empregados, como tempo e esforço; satisfação corresponde à percepção do usuário sobre a experiência. Esses três elementos são diretamente aplicáveis ao problema deste estudo, pois a centralização só será útil se os recursos puderem ser utilizados de modo claro pelos dois perfis de usuário.

O questionário System Usability Scale, proposto por Brooke (1996), é uma escala breve para captar a percepção geral de usabilidade de um sistema. Embora um escore isolado não explique todos os problemas de interface, ele pode ser combinado com observação de tarefas e comentários dos participantes. A avaliação planejada não se limitará a perguntar se o usuário gostou da plataforma. Ela verificará se tarefas representativas, como localizar um cronograma, registrar uma atividade, acessar material, criar uma avaliação ou consultar resultados, podem ser executadas pelos usuários previstos.

A avaliação de usabilidade também precisa reconhecer diferenças entre os papéis de professor e aluno. O professor necessita localizar alunos, acompanhar registros, ajustar planejamentos e fornecer devolutivas; o aluno necessita compreender prioridades, acessar materiais e visualizar seu percurso. Um fluxo eficiente para um perfil pode não ser adequado ao outro. Por esse motivo, a plataforma proposta prevê cenários distintos de uso e apresentará dados de taxa de conclusão, tempo de execução, erros, pedidos de ajuda, SUS e comentários qualitativos. As medidas não avaliam a proficiência em inglês, mas avaliam se a ferramenta efetivamente apoia as tarefas de acompanhamento para as quais foi projetada.

Salihagic e Akay (2022) investigaram percepção, engajamento e satisfação de estudantes de inglês diante da aprendizagem on-line durante a pandemia. O estudo reforça que a experiência do estudante deve ser considerada para além do acesso técnico a uma plataforma. Em conjunto, os conceitos de usabilidade, engajamento e avaliação formativa permitem analisar a proposta de forma equilibrada: a plataforma precisa ser utilizável, estar conectada a necessidades pedagógicas e apoiar interações que deem continuidade ao estudo entre as aulas.

Em síntese, a fundamentação apresenta quatro dimensões que orientam a pesquisa: planejamento da aprendizagem on-line, autorregulação e continuidade, interação e avaliação formativa, e usabilidade. Esses conceitos permitem compreender por que a dispersão de informações pode dificultar o acompanhamento de aulas particulares remotas de inglês e definem critérios para avaliar a proposta. Com essa base, a próxima seção examina pesquisas anteriores para identificar quais dimensões já foram investigadas e quais limites permanecem no estado da arte.

## 3 TRABALHOS RELACIONADOS

### 3.1 CRITÉRIOS DE ESCOLHA DOS TRABALHOS

Os trabalhos relacionados foram selecionados para aproximar a revisão do problema e do objetivo geral definidos neste estudo. Foram considerados estudos que abordam aprendizagem on-line de inglês, avaliação formativa digital, percepção e engajamento de estudantes ou acompanhamento pedagógico em ambientes virtuais. As buscas foram planejadas nas bases Google Scholar, Portal de Periódicos CAPES, Scopus e IEEE Xplore, utilizando combinações dos descritores: "online English learning", "online formative assessment", "EFL online learning", "student engagement", "learning platform usability", "ensino remoto de inglês" e "avaliação formativa on-line".

Foram priorizados artigos revisados por pares publicados entre 2021 e 2025, com inclusão de referências anteriores apenas quando necessárias para sustentar conceitos básicos. Os critérios de inclusão foram: descrição explícita de contexto, participantes ou corpus; apresentação de método; resultados relacionados à aprendizagem, avaliação, engajamento, percepção ou uso de tecnologia; e pertinência ao ensino de inglês ou ao acompanhamento em ambientes on-line. Foram excluídos textos duplicados, publicações sem método identificável e estudos cuja relação com o problema investigado fosse apenas superficial. A seleção comparativa desta etapa reuniu cinco estudos diretamente situados no ensino de inglês on-line.

### 3.2 SÍNTESE ANALÍTICA DOS ESTUDOS SELECIONADOS

Os estudos de Wijaya (2022), Kristiyanti, Santosa e Pratiwi (2021) e Lisyowati, Wiyaka e Prastikawati (2021) convergem ao tratar a avaliação formativa como elemento relevante no ensino de inglês on-line. Wijaya (2022) realizou análise documental de 20 estudos publicados entre 2020 e 2022 e sintetizou benefícios e limitações da avaliação formativa digital em contextos de inglês como língua estrangeira. O estudo oferece uma visão ampla, mas trabalha com evidências secundárias e não avalia diretamente uma plataforma ou um fluxo de acompanhamento individual.

Kristiyanti, Santosa e Pratiwi (2021) adotaram método misto, com survey aplicado a 215 estudantes e entrevistas com oito participantes, para investigar percepções sobre avaliação formativa on-line em inglês. Os resultados relataram percepção positiva sobre ferramentas simples e apontaram a ausência de feedback como uma limitação para o interesse dos estudantes. Lisyowati, Wiyaka e Prastikawati (2021), por sua vez, conduziram pesquisa qualitativa com dois professores de inglês, utilizando questionário e entrevista semiestruturada. Os docentes associaram a avaliação formativa on-line ao monitoramento do progresso e ao planejamento de aulas futuras. Em conjunto, os dois estudos mostram perspectivas complementares: a do aluno, centrada na experiência com a avaliação, e a do professor, centrada no uso das informações para acompanhamento.

Salihagic e Akay (2022) investigaram percepção, engajamento e satisfação de alunos de inglês em duas escolas internacionais durante a transição para a aprendizagem on-line. O trabalho amplia o debate ao demonstrar que a avaliação da experiência não deve se restringir a resultados de atividades, incluindo a percepção dos estudantes sobre o processo. Yunita (2023), em meta-análise de pesquisas sobre educação em inglês on-line na pandemia, reuniu estudos publicados entre janeiro de 2020 e abril de 2022 e descreveu benefícios e desafios dessa modalidade. Os dois artigos situam o projeto em um quadro mais amplo de aprendizagem on-line, mas não focalizam uma ferramenta integrada para o acompanhamento continuado de uma relação individual entre professor particular e aluno.

### 3.3 ANÁLISE COMPARATIVA

**Tabela 1 - Comparação dos trabalhos relacionados**

| Autor/ano | Objetivo e contexto | Método e evidências | Principais contribuições e limitações | Relação com este trabalho |
| --- | --- | --- | --- | --- |
| Wijaya (2022) | Avaliação formativa em EFL durante a pandemia. | Análise de 20 estudos. | Mapeia benefícios e limites; não valida uma plataforma. | Sustenta avaliação e feedback. |
| Kristiyanti, Santosa e Pratiwi (2021) | Percepção discente sobre avaliação em inglês. | Survey com 215 estudantes e 8 entrevistas. | Ferramentas simples e feedback são relevantes. | Apoia avaliação integrada à devolutiva. |
| Lisyowati, Wiyaka e Prastikawati (2021) | Concepções docentes sobre avaliação on-line. | Estudo qualitativo com 2 professores. | Avaliação apoia monitoramento e planejamento. | Sustenta o acompanhamento pelo professor. |
| Salihagic e Akay (2022) | Experiência discente no inglês on-line. | Estudo em duas escolas internacionais. | Considera percepção, engajamento e satisfação. | Justifica avaliar a experiência do aluno. |
| Yunita (2023) | Educação em inglês on-line na pandemia. | Meta-análise de estudos de 2020 a 2022. | Reúne benefícios e desafios; não avalia solução específica. | Situa a proposta no ensino on-line. |

Fonte: elaborado pelo autor (2026).

### 3.4 CONSTRUÇÃO DA LACUNA E POSICIONAMENTO DO TRABALHO

A análise comparativa evidencia que a literatura selecionada reconhece a importância da avaliação formativa, do feedback, do engajamento e da experiência do estudante em atividades de inglês on-line. Os estudos de Kristiyanti, Santosa e Pratiwi (2021) e Lisyowati, Wiyaka e Prastikawati (2021) mostram, respectivamente, que estudantes valorizam ferramentas compreensíveis e feedback, enquanto professores utilizam informações avaliativas para monitorar o progresso e planejar aulas. Entretanto, seus contextos são escolares, suas abordagens focalizam avaliação formativa e não descrevem uma plataforma que integre, para a relação professor particular-aluno, planejamento individual, materiais, registros de estudo, progresso e avaliação.

Também se observa que Wijaya (2022) e Yunita (2023) oferecem sínteses relevantes sobre avaliação formativa e ensino de inglês on-line, mas não realizam validação de uma solução integrada com tarefas de usuários de aulas particulares remotas. Salihagic e Akay (2022) incorporam percepção, engajamento e satisfação, dimensões importantes para esta pesquisa, mas não abordam especificamente a continuidade do acompanhamento entre aulas nem a interação operacional entre os papéis de professor e aluno. A lacuna, portanto, não é a inexistência de pesquisas sobre inglês on-line; é a ausência, no conjunto analisado, de estudos que integrem essas dimensões em uma plataforma voltada ao acompanhamento individual e que avaliem seu uso com métricas observáveis.

O presente trabalho se posiciona como uma pesquisa aplicada que propõe uma plataforma de interligação para professores particulares remotos de inglês e seus alunos. Sua contribuição pretendida não é afirmar superioridade sobre outras formas de ensino nem substituir a mediação docente. O estudo busca integrar dimensões tratadas separadamente pela literatura: planejamento individual, continuidade das atividades, acesso a materiais, registro de estudo, visualização de progresso, avaliação e feedback. Essa integração responde ao problema da fragmentação de informações entre diferentes ferramentas e é coerente com o objetivo geral de apoiar o acompanhamento pedagógico remoto.

O posicionamento será aprofundado por uma avaliação inicial baseada em cenários de professor e aluno. A qualidade da proposta será analisada por taxa de conclusão de tarefas, tempo de execução, erros ou pedidos de ajuda, escore SUS e comentários dos participantes. Essas evidências permitirão verificar se a integração planejada é utilizável no contexto delimitado. Desse modo, a lacuna identificada conduz diretamente à metodologia: não basta propor funcionalidades; será necessário observar se elas apoiam, de forma compreensível e eficiente, as tarefas de acompanhamento pedagógico que motivaram o estudo.


# REFERÊNCIAS

BERNARD, Robert M. et al. A meta-analysis of three types of interaction treatments in distance education. *Review of Educational Research*, v. 79, n. 3, p. 1243-1289, 2009. DOI: 10.3102/0034654309333844.
BROOKE, John. SUS: a "quick and dirty" usability scale. In: JORDAN, Patrick W. et al. (ed.). **Usability evaluation in industry**. London: Taylor & Francis, 1996. p. 189-194.
EF EDUCATION FIRST. **EF English Proficiency Index 2025: Brazil**. 2025. Disponível em: <https://www.ef.com/Gwen/epi/regions/latin-america/brazil/>. Acesso em: 12 set. 2026.
HODGES, Charles et al. The difference between emergency remote teaching and online learning. **EDUCAUSE Review**, 27 mar. 2020. Disponível em: <https://er.educause.edu/articles/2020/3/the-difference-between-emergency-remote-teaching-and-online-learning>. Acesso em: 12 set. 2026.
INTERNATIONAL ORGANIZATION FOR STANDARDIZATION. **ISO 9241-11:2018: Ergonomics of human-system interaction - Part 11: Usability: Definitions and concepts**. Geneva: ISO, 2018.
KRISTIYANTI, Komang Lisna; SANTOSA, Made Hery; PRATIWI, Ni Putu Astiti. Students' perception towards the implementation of online formative assessment in English learning. *SAGA: Journal of English Language Teaching and Applied Linguistics*, v. 2, n. 2, p. 101-112, 2021. DOI: 10.21460/saga.2021.22.83.
LIMBU, Yam. Factors associated with student engagement in online learning during COVID-19 pandemic: a systematic review. **Online Learning**, v. 29, n. 1, 2025. DOI: 10.24059/olj.v29i1.4221.
LISYOWATI, Wanda; WIYAKA, Wiyaka; PRASTIKAWATI, Entika Fani. English teachers' conceptions of formative assessment in online teaching. *Language Circle: Journal of Language and Literature*, v. 16, n. 1, p. 177-186, 2021. DOI: 10.15294/lc.v16i1.29998.
MEANS, Barbara; BAKIA, Marianne; MURPHY, Robert. **Learning online: what research tells us about whether, when and how**. New York: Routledge, 2014.
SALIHAGIC, Selma; AKAY, Ceylani. Perception, engagement and satisfaction of English language learners with online learning during Covid-19 pandemic. **European Journal of Education**, v. 5, n. 2, p. 34-50, 2022. DOI: 10.2478/ejed-2022-0003.
SHUTE, Valerie J. Focus on formative feedback. *Review of Educational Research*, v. 78, n. 1, p. 153-189, 2008. DOI: 10.3102/0034654307313795.
UNESCO. **Global education monitoring report, 2023: technology in education: a tool on whose terms?** Paris: UNESCO, 2023. DOI: 10.54676/UZQV8501.
WIJAYA, Kristian Florensio. The utilities of online formative assessment in Indonesian EFL learning contexts during Covid-19 era. *Journal of Foreign Language Teaching and Learning*, v. 7, n. 2, p. 178-198, 2022. DOI: 10.18196/ftl.v7i2.14249.
YUNITA, Ratna. The effects of online learning on English language education during the COVID-19 pandemic: a meta-analysis. *Journal of English Language Teaching and Learning*, v. 4, n. 2, p. 84-97, 2023. DOI: 10.18860/jetle.v4i2.20617.
ZIMMERMAN, Barry J. Becoming a self-regulated learner: an overview. *Theory Into Practice*, v. 41, n. 2, p. 64-70, 2002. DOI: 10.1207/S15430421TIP4102_2.
