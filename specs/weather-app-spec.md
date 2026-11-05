# Especificação de Produto — Weather App

## Overview

O Weather App é uma aplicação web em português do Brasil para consultar as
condições meteorológicas atuais e a previsão de cinco dias de uma cidade. O
usuário pesquisa e seleciona uma localidade, consulta seus dados e alterna a
unidade de temperatura entre Celsius e Fahrenheit. A experiência deve ser
utilizável em dispositivos móveis e desktops.

Os dados meteorológicos e de localização serão obtidos da Open-Meteo, sem
exigir chave de API. A aplicação não exige autenticação nem mantém dados de
usuário em servidor. A unidade inicial é Celsius (°C), e a previsão compreende
o dia local atual e os quatro dias locais seguintes.

## Functional Requirements

- **RF-01 — Buscar cidades:** a aplicação deve permitir que o usuário pesquise
  uma cidade pelo nome e escolha uma localidade correspondente antes de
  consultar o clima. A busca deve usar o serviço de geocodificação da
  Open-Meteo.
- **RF-02 — Desambiguar resultados:** quando houver localidades homônimas ou
  semelhantes, a aplicação deve apresentar informações de região administrativa
  (quando disponível) e país para que o usuário possa distinguir os resultados.
- **RF-03 — Consultar clima atual:** para a cidade escolhida, a aplicação deve
  apresentar temperatura, condição meteorológica, umidade relativa e velocidade
  do vento, identificando a localidade consultada.
- **RF-04 — Consultar previsão de cinco dias:** para a cidade escolhida, a
  aplicação deve apresentar a previsão diária do dia local atual e dos quatro
  dias locais seguintes, com condição meteorológica e temperaturas mínima e
  máxima de cada dia.
- **RF-05 — Alternar unidade de temperatura:** o usuário deve poder alternar
  entre Celsius (°C) e Fahrenheit (°F). A unidade selecionada deve ser aplicada
  às temperaturas do clima atual e da previsão.
- **RF-06 — Usar em dispositivos móveis:** a aplicação deve permitir realizar
  busca, seleção de cidade, consulta do clima e alternância de unidade em
  dispositivos móveis, com interface adaptável ao tamanho da tela.
- **RF-07 — Comunicar estados da consulta:** a aplicação deve informar quando
  estiver buscando dados e apresentar uma mensagem compreensível quando a
  busca não retornar cidade ou quando os dados meteorológicos não puderem ser
  carregados.

## User Stories

- **RF-01:** Como pessoa que consulta o clima de diferentes cidades, quero
  pesquisar e selecionar uma cidade pelo nome para consultar as condições da
  localidade desejada.
- **RF-02:** Como pessoa que encontrou cidades com nomes iguais ou semelhantes,
  quero distinguir os resultados pelo país e pela região quando disponível para
  selecionar a localidade correta.
- **RF-03:** Como pessoa que precisa saber as condições de uma cidade agora,
  quero consultar o clima atual da localidade selecionada para decidir como me
  preparar.
- **RF-04:** Como pessoa que planeja os próximos dias, quero consultar a
  previsão diária de cinco dias para antecipar as condições esperadas.
- **RF-05:** Como pessoa que prefere temperaturas em Fahrenheit, quero alternar
  a unidade entre Fahrenheit e Celsius para interpretar os valores na unidade
  que prefiro.
- **RF-06:** Como pessoa que consulta o clima pelo celular, quero usar busca,
  consulta e alternância de unidade em uma interface adaptada à tela para
  acessar as funções principais em mobilidade.
- **RF-07:** Como pessoa que está buscando uma cidade ou carregando dados,
  quero receber indicação de carregamento, resultados vazios ou falhas para
  entender o estado da consulta e saber como continuar.

## Acceptance Criteria

- **CA-01 (RF-01)**
  - **Given** a aplicação está aberta e o campo de busca está disponível
  - **When** o usuário envia um nome de cidade não vazio
  - **Then** a aplicação solicita resultados ao serviço de geocodificação da
    Open-Meteo e apresenta os resultados recebidos como opções selecionáveis
  - **When** o usuário seleciona um resultado
  - **Then** a consulta meteorológica é feita usando as coordenadas da
    localidade selecionada
- **CA-02 (RF-02)**
  - **Given** a busca retornou pelo menos duas localidades com o mesmo nome
  - **When** os resultados são exibidos
  - **Then** cada opção mostra o nome da cidade e o país e, se fornecida pela
    fonte, a região administrativa
  - **When** o usuário seleciona uma dessas opções
  - **Then** a localidade usada na consulta corresponde à opção selecionada
- **CA-03 (RF-03)**
  - **Given** o usuário selecionou uma cidade e a resposta de clima atual
    contém temperatura, condição meteorológica, umidade relativa e velocidade
    do vento
  - **When** a consulta termina com sucesso
  - **Then** a tela identifica a cidade e apresenta os quatro valores recebidos,
    incluindo a unidade da temperatura
- **CA-04 (RF-04)**
  - **Given** a cidade selecionada tem como data local atual 2026-01-10 e a
    resposta contém previsões para essa data e as quatro seguintes
  - **When** a consulta de previsão termina com sucesso
  - **Then** a tela apresenta exatamente cinco entradas, com as datas locais de
    2026-01-10 a 2026-01-14, cada uma contendo condição meteorológica e
    temperaturas mínima e máxima com unidade
- **CA-05 (RF-05)**
  - **Given** a tela apresenta temperaturas e a unidade inicial é Celsius
  - **When** o usuário seleciona Fahrenheit
  - **Then** a unidade exibida nas temperaturas atual, mínima e máxima passa a
    ser °F
  - **When** o usuário seleciona Celsius
  - **Then** a unidade exibida em todas essas temperaturas passa a ser °C
- **CA-06 (RF-06)**
  - **Given** a aplicação está aberta em uma viewport com 320 px de largura e
    dados meteorológicos carregados
  - **When** o usuário usa a busca, seleciona uma cidade e alterna a unidade
  - **Then** os controles e dados permanecem utilizáveis, e a largura de
    rolagem horizontal do documento não excede a largura da viewport
- **CA-07 (RF-07)**
  - **Given** uma chamada de busca ou consulta meteorológica foi iniciada e
    ainda não recebeu resposta
  - **When** a chamada permanece pendente
  - **Then** a interface exibe um indicador de carregamento correspondente à
    operação
  - **Given** uma busca terminou com zero resultados
  - **When** a resposta vazia é apresentada
  - **Then** a interface informa que nenhuma cidade foi encontrada
  - **Given** uma chamada de busca ou consulta meteorológica falhou
  - **When** a falha é apresentada
  - **Then** a interface informa que não foi possível obter os dados e oferece
    uma ação de nova tentativa

## Non-Functional Requirements

- **RNF-01 — Idioma:** textos da interface, mensagens de erro, datas e
  informações destinadas ao usuário devem usar português do Brasil (pt-BR).
- **RNF-02 — Responsividade:** a interface deve adaptar seu layout a viewports
  de 320 px a 1920 px de largura, sem exigir rolagem horizontal para usar as
  funções principais.
- **RNF-03 — Acessibilidade:** controles devem ser operáveis por teclado e
  possuir nome acessível; estados de carregamento e mensagens de erro devem ser
  expostos semanticamente. O produto deve buscar conformidade WCAG 2.2 nível AA.
- **RNF-04 — Desempenho percebido:** em uma conexão funcional e com as respostas
  da Open-Meteo disponíveis, busca e consulta meteorológica devem apresentar
  estado de carregamento em até 200 ms após a ação do usuário. Não se estabelece
  limite para o tempo de resposta dos serviços externos.
- **RNF-05 — Privacidade:** nenhuma conta deve ser necessária e nenhum dado de
  usuário ou preferência deve ser persistido em servidor. A busca por cidade
  deve depender de ação explícita do usuário, sem solicitar localização do
  dispositivo.
- **RNF-06 — Dependência externa:** a aplicação deve usar a Open-Meteo sem
  solicitar chave de API ao usuário. Disponibilidade e atualização dos dados
  dependem dos serviços da Open-Meteo.

## Edge Cases

- A consulta de busca está vazia ou contém apenas espaços: não executar chamada
  de geocodificação e solicitar que o usuário informe uma cidade.
- A busca não encontra correspondências: apresentar o estado vazio definido em
  CA-07 e permitir uma nova consulta.
- Há cidades com o mesmo nome, com ou sem região administrativa disponível:
  manter os resultados distinguíveis pelo país e, quando disponível, pela
  região.
- O serviço de geocodificação ou meteorológico está indisponível, retorna erro
  ou não responde: comunicar a falha e permitir nova tentativa, sem apresentar
  dados como se fossem atuais.
- A fonte não fornece um dos campos meteorológicos esperados: indicar que o
  valor não está disponível, sem substituir por zero ou por um valor inventado.
- Uma previsão diária está incompleta para uma data: preservar a data e
  identificar os campos ausentes, sem alterar silenciosamente o intervalo de
  cinco dias.
- O usuário troca de cidade enquanto uma chamada anterior ainda está pendente:
  os dados apresentados devem corresponder à cidade selecionada mais
  recentemente.
- A mudança de unidade ocorre antes de todos os dados carregarem: todos os
  valores de temperatura, inclusive os carregados posteriormente, devem seguir
  a unidade atualmente selecionada.
- Uma localidade não possui informação de região administrativa: permitir sua
  identificação pelo nome e país, sem exibir um campo regional vazio como se
  fosse informação disponível.

## Assumptions

- A busca é iniciada por envio explícito de um nome de cidade; sugestões
  enquanto o usuário digita não são necessárias nesta versão.
- A identificação de resultado usa o nome retornado pela Open-Meteo, país e,
  quando disponível, região administrativa.
- “Cinco dias” significa o dia local atual da cidade mais os quatro dias
  seguintes, conforme a decisão registrada em `discovery.md`.
- A previsão é diária, não horária. O fuso horário da localidade determina as
  datas usadas para o intervalo.
- A unidade padrão é °C. Somente temperaturas alternam entre °C e °F; umidade
  permanece em percentual, velocidade do vento em km/h e precipitação, se
  apresentada futuramente, em mm.
- A unidade escolhida permanece durante a sessão atual, mas sua persistência
  após fechar ou recarregar a aplicação não é garantida nesta versão.
- A aplicação é web e responsiva; não há requisito de criar aplicativos nativos
  para Android ou iOS.
- A Open-Meteo fornece campos adequados para as informações mínimas definidas
  para clima atual e previsão. A disponibilidade real de cada campo deve ser
  tratada conforme os casos de borda.

## Risks

- **R-01 — Busca ambígua:** resultados sem dados de região suficientes podem
  dificultar a identificação da localidade correta; país e nome são exibidos
  sempre que fornecidos e região é incluída quando disponível.
- **R-02 — Disponibilidade e qualidade dos dados:** indisponibilidade, atraso,
  cobertura ou limitações da Open-Meteo afetam diretamente as consultas; a
  aplicação deve tornar falhas visíveis, mas não pode garantir a qualidade da
  fonte.
- **R-03 — Diferenças de fuso horário:** interpretar datas no fuso do
  dispositivo em vez do fuso da cidade pode produzir o intervalo diário
  incorreto.
- **R-04 — Compatibilidade móvel não delimitada:** tamanhos, sistemas
  operacionais e navegadores específicos ainda não foram acordados; o critério
  atual cobre largura de viewport, não uma matriz de dispositivos.
- **R-05 — Escopo de unidades:** converter apenas temperaturas pode divergir da
  expectativa de quem espera alternância de outras grandezas; esta especificação
  limita a alternância a temperaturas.
- **R-06 — Acessibilidade sem validação definida:** a meta WCAG 2.2 AA exige
  validação específica que não foi detalhada no briefing.

## Out of Scope

- Aplicativos nativos para Android ou iOS.
- Autenticação, contas, perfis, favoritos sincronizados ou persistência de dados
  do usuário em servidor.
- Localização automática por GPS ou endereço IP.
- Alertas meteorológicos, notificações, mapas, radar ou informações climáticas
  históricas.
- Previsões horárias ou períodos intradiários.
- Suporte a idiomas além de português do Brasil.
- Garantias próprias de precisão, cobertura, atualização ou disponibilidade
  além do que a Open-Meteo oferece.
- Alternância de unidades para grandezas que não sejam temperatura.

## Open Questions

1. Qual é a matriz mínima de navegadores, sistemas operacionais e dispositivos
   móveis que deve ser oficialmente suportada?
2. A unidade escolhida deve persistir após fechar/recarregar a aplicação? Se
   sim, a persistência local no dispositivo é aceitável?
3. Há requisitos específicos de cobertura geográfica, frequência de atualização
   ou disponibilidade dos dados da Open-Meteo?
4. Além das informações mínimas definidas nesta especificação, quais campos
   devem ser apresentados no clima atual e na previsão (por exemplo,
   sensação térmica, precipitação ou probabilidade de chuva)?
5. A interface deve apresentar alguma outra grandeza em unidade alternável ou
   manter as unidades não relacionadas à temperatura fixas como definido nas
   suposições?
6. A meta WCAG 2.2 AA deve ser critério obrigatório de aceite? Há tecnologias
   assistivas ou necessidades de acessibilidade prioritárias para validar?
7. Existem metas mensuráveis de desempenho percebido além da indicação de
   carregamento em até 200 ms, ou requisitos de disponibilidade do produto?
