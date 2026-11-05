# Backlog de Tarefas — Weather App

Tarefas derivadas de [plans/weather-app-plan.md](../plans/weather-app-plan.md) e
rastreáveis a [specs/weather-app-spec.md](../specs/weather-app-spec.md). Os
arquivos listados são prováveis; seguir as convenções já adotadas no repositório
para localizar testes e estilos.

## Entrega 1 — Fundação e contratos

### T-01 — Definir os contratos de domínio

- **Descrição:** Criar os tipos compartilhados para localidade, unidade,
  condições atuais, dias previstos, relatório meteorológico e estados/erros de
  requisição.
- **Critérios de aceite:**
  - Contratos representam os campos definidos no plano, incluindo temperaturas,
    códigos e demais valores meteorológicos anuláveis.
  - A previsão representa cinco datas locais ordenadas e a unidade é restrita a
    Celsius ou Fahrenheit.
  - Os tipos não importam React nem executam lógica.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-02–05, RF-07; CA-02, CA-03b, CA-04a–b, CA-05a–c,
  CA-07c–d.

### T-02 — Montar a estrutura inicial da página

- **Descrição:** Compor o shell da aplicação em pt-BR, a orientação inicial e a
  identificação da Open-Meteo como fonte.
- **Critérios de aceite:**
  - `App` compõe a página e a inicialização React continua funcionando.
  - O estado inicial orienta a pessoa a buscar uma cidade, sem exibir clima
    fictício ou indicador de carregamento.
  - “Open-Meteo” é um link para `https://open-meteo.com/`.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/App.tsx`, `src/main.tsx`,
  `src/components/SourceAttribution.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-07–08; CA-08; RNF-01, RNF-03.

## Entrega 2 — Busca e seleção de localidades

### T-03 — Implementar o serviço de geocodificação

- **Descrição:** Consultar a Open-Meteo Geocoding API e validar/mapear sua
  resposta para localidades do domínio.
- **Critérios de aceite:**
  - A URL HTTPS é montada com `URLSearchParams`, `count=10`, `language=pt` e
    `format=json`; o termo enviado é aparado sem perder Unicode.
  - Resultados válidos são mapeados para cidade, país, região opcional,
    coordenadas, identidade e fuso opcional.
  - Resultado sem correspondências é distinto de resposta inválida; falhas de
    rede, HTTP e JSON/estrutura inválidos são erros explícitos.
  - A chamada tem timeout total de 10 segundos e aceita cancelamento.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/geocodingService.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-01–02, RF-07; CA-01a–b, CA-02, CA-07c; RNF-04,
  RNF-06–07.

### T-04 — Testar o serviço de geocodificação

- **Descrição:** Cobrir contrato, codificação da busca, validação e falhas do
  serviço sem acessar a API ao vivo.
- **Critérios de aceite:**
  - Testes verificam URL/parâmetros, Unicode após decodificação, mapeamento e
    identidade de resultados.
  - Resposta vazia válida, HTTP não bem-sucedido, falha de rede, JSON inválido e
    timeout são exercitados e classificados corretamente.
  - Resposta inválida nunca é convertida silenciosamente em lista vazia.
- **Dependências:** T-03.
- **Arquivos prováveis:** `tests/unit/geocodingService.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-01–02, RF-07; CA-01a–c, CA-02, CA-07c.

### T-05 — Criar os componentes de busca e resultados

- **Descrição:** Implementar formulário de busca e opções de localidade com
  seleção acessível e sem efeitos de rede nos componentes.
- **Critérios de aceite:**
  - Formulário tem rótulo acessível, envia por botão e teclado e mantém o texto
    editável; a validação de vazio pode ser apresentada junto ao campo.
  - Cada resultado mostra cidade e país, inclui região apenas quando disponível
    e permite selecionar a opção correta mesmo entre rótulos iguais.
  - Texto retornado pela API é apresentado como texto, nunca interpretado como
    HTML.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`,
  `src/components/LocationResults.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-01–02; CA-01a–c, CA-02; RNF-03, RNF-06.

### T-06 — Orquestrar a busca no hook

- **Descrição:** Implementar busca explícita, seleção, estados assíncronos e
  cancelamento/invalidação de operações obsoletas; conectar a busca à página.
- **Critérios de aceite:**
  - Digitar não inicia requisição; envio aparado inicia carregamento, e envio
    vazio não chama o serviço.
  - Busca válida limpa seleção e clima anteriores; resultados vazios preservam
    o termo para edição e não iniciam consulta meteorológica.
  - Nova busca cancela ou invalida a anterior; somente a operação vigente pode
    atualizar estado ou encerrar seu carregamento.
  - Componentes recebem dados e callbacks; não chamam serviços diretamente.
- **Dependências:** T-02, T-03, T-05.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`, `src/App.tsx`
- **Tipo:** Data
- **Rastreabilidade:** RF-01–02, RF-07; CA-01a–c, CA-02, CA-07a–b, CA-07d.

### T-07 — Testar busca, estados e componentes

- **Descrição:** Validar interações acessíveis e transições da busca com
  serviços simulados.
- **Critérios de aceite:**
  - Testes verificam busca vazia sem chamada, envio explícito, estado de
    carregamento, resultado vazio e seleção por identidade/coordenadas.
  - Conteúdo, mensagens, labels e callbacks são testados por roles e interações
    de usuário.
  - Uma resposta antiga não altera a busca mais recente; retry, quando
    disponível, usa o termo associado à falha.
- **Dependências:** T-05, T-06.
- **Arquivos prováveis:** `tests/unit/useWeatherSearch.test.ts`,
  `tests/unit/SearchForm.test.tsx`, `tests/unit/LocationResults.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** RF-01–02, RF-07; CA-01a–c, CA-02, CA-07a–b, CA-07d;
  RNF-03.

## Entrega 3 — Dados meteorológicos e previsão

### T-08 — Normalizar clima, códigos e datas locais

- **Descrição:** Criar funções puras para mapear códigos WMO, tratar datas no
  fuso da localidade e normalizar séries diárias para o modelo interno.
- **Critérios de aceite:**
  - Normalização preserva os valores válidos, representa ausências como `null`
    e produz exatamente cinco datas locais ordenadas.
  - Lacunas em arrays paralelos não deslocam valores de outras datas nem
    produzem valores inventados.
  - Cálculo de dias usa o fuso e calendário local, incluindo virada de mês/ano e
    horário de verão; códigos WMO desconhecidos têm fallback explícito.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/normalizeWeather.ts`,
  `src/lib/weatherCode.ts`, `src/lib/dateTime.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-03–04; CA-03a–b, CA-04a–b; RNF-01.

### T-09 — Testar normalização, códigos e datas

- **Descrição:** Cobrir funções puras com relógio de referência e fuso
  determinísticos.
- **Critérios de aceite:**
  - Testes verificam exatamente cinco datas em ordem, dia ausente no meio,
    arrays desiguais, campos nulos e temperaturas iguais a zero.
  - Testes cobrem código WMO conhecido e desconhecido, data local diferente da
    máquina, virada de calendário e horário de verão.
  - Formatação resulta em `dd/MM/yyyy` e horário de 24 horas sem deslocar datas
    ISO locais.
- **Dependências:** T-08.
- **Arquivos prováveis:** `tests/unit/normalizeWeather.test.ts`,
  `tests/unit/weatherCode.test.ts`, `tests/unit/dateTime.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-03–04; CA-03b, CA-04a–b; RNF-01.

### T-10 — Implementar o serviço de previsão

- **Descrição:** Consultar condições atuais e previsão diária para a localidade
  selecionada, validar a resposta e entregar `WeatherData`.
- **Critérios de aceite:**
  - Uma chamada HTTPS usa coordenadas selecionadas, campos current/daily
    definidos no plano, `timezone=auto`, `forecast_days=5`, Celsius, km/h e
    formato ISO.
  - O serviço valida status, JSON, estrutura essencial, fuso e unidades antes
    de normalizar; falhas são explícitas e tipadas.
  - Campos individuais ausentes ou nulos permanecem indisponíveis sem invalidar
    campos válidos; aplica timeout total de 10 segundos e cancelamento.
- **Dependências:** T-01, T-08.
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-03–04, RF-07; CA-03a–b, CA-04a–b, CA-07c;
  RNF-04, RNF-06–07.

### T-11 — Testar o serviço meteorológico

- **Descrição:** Simular a fronteira HTTP para verificar parâmetros, contratos,
  validação e erros do serviço.
- **Critérios de aceite:**
  - Testes verificam coordenadas, parâmetros current/daily, unidades, fuso,
    horizonte de cinco dias e saída normalizada.
  - Sucesso parcial, HTTP 429/500, falha de rede, JSON/estrutura/fuso/unidades
    inválidos e timeout são cobertos.
  - Timeout inclui corpo pendente após headers, aborta a chamada e limpa timers;
    não há retry automático nem dados fictícios.
- **Dependências:** T-10.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-03–04, RF-07; CA-03a–b, CA-04a–b, CA-07c;
  RNF-04, RNF-07.

### T-12 — Exibir condições atuais e previsão diária

- **Descrição:** Criar cartões de condições atuais e de previsão com os dados
  normalizados.
- **Critérios de aceite:**
  - Condições atuais exibem localidade, temperatura, condição, umidade, vento e
    horário local recebido da fonte.
  - Previsão exibe exatamente cinco datas e, em cada uma, condição, mínima e
    máxima.
  - Todo campo ausente é identificado como “Indisponível”; não é exibido como
    zero nem substituído por dado de outra data/cidade.
- **Dependências:** T-01, T-08.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`,
  `src/components/DailyForecast.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-03–04; CA-03a–b, CA-04a–b; RNF-01, RNF-03.

### T-13 — Integrar consulta meteorológica ao hook

- **Descrição:** Orquestrar clima da localidade selecionada, retry e estados
  independentes da busca; conectar os cartões à página.
- **Critérios de aceite:**
  - Selecionar uma localidade consulta suas coordenadas e mostra loading sem
    remover opções de cidade.
  - Erro de clima não apaga resultados de busca; retry explícito repete a mesma
    cidade sem repetição automática.
  - Seleção nova cancela/invalida operações anteriores; resposta, erro ou
    finalização obsoletos não substituem o estado vigente.
  - Valores internos permanecem em Celsius e a seleção da unidade não dispara
    uma nova consulta.
- **Dependências:** T-06, T-10, T-12.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`, `src/App.tsx`
- **Tipo:** Data
- **Rastreabilidade:** RF-02–04, RF-07; CA-02, CA-03a–b, CA-04a–b, CA-07a,
  CA-07c–d.

### T-14 — Testar estados e concorrência do clima

- **Descrição:** Testar transições do hook e isolamento entre seleção, falha,
  retry, carregamento e desmontagem.
- **Critérios de aceite:**
  - Promessas controladas confirmam que uma seleção antiga resolvida por último
    não altera sucesso, erro ou loading da seleção atual.
  - Retry repete a mesma cidade e não há retry automático; busca e clima mantêm
    estados independentes.
  - Desmontagem/cancelamento não apresenta erro visível nem permite atualização
    obsoleta; mudança de unidade durante loading é respeitada.
- **Dependências:** T-13.
- **Arquivos prováveis:** `tests/unit/useWeatherSearch.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-02–04, RF-07; CA-07c–d; casos parciais de CA-03b e
  CA-04b.

## Entrega 4 — Unidade de temperatura e experiência responsiva

### T-15 — Implementar conversão e formatação de temperatura

- **Descrição:** Criar funções puras para derivar e apresentar temperaturas
  Celsius/Fahrenheit sem alterar os valores canônicos.
- **Critérios de aceite:**
  - Celsius é mantido como valor interno; Fahrenheit usa `C × 9/5 + 32` antes
    do arredondamento.
  - Valores são formatados em pt-BR com uma casa decimal e unidade correta;
    `null` resulta em “Indisponível”.
  - Conversão de zero, negativos e valores fracionários não os transforma em
    zero por coerção nem converte valor previamente arredondado.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-05; CA-05a–c.

### T-16 — Adicionar alternância de unidade

- **Descrição:** Criar controle acessível para alternar Celsius/Fahrenheit e
  aplicar a preferência a todas as temperaturas exibidas.
- **Critérios de aceite:**
  - Unidade inicial é Celsius; todas as temperaturas atuais e previstas usam a
    unidade selecionada.
  - Alternar unidade não inicia requisição; preferência permanece entre cidades
    na página e volta a Celsius após recarregar.
  - Controle tem nome acessível, opera por teclado e mostra foco visível.
- **Dependências:** T-12, T-13, T-15.
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`,
  `src/App.tsx`, componentes de clima
- **Tipo:** UI
- **Rastreabilidade:** RF-05; CA-05a–c; RNF-03.

### T-17 — Testar conversão e alternância de unidade

- **Descrição:** Cobrir funções de temperatura e comportamento observável do
  controle em componentes e página.
- **Critérios de aceite:**
  - Testes verificam `0 °C → 32,0 °F`, extremos/valores fracionários,
    arredondamento, formatação pt-BR e nulo indisponível.
  - Temperaturas atuais, mínimas e máximas mudam juntas ao alternar; voltar a
    Celsius não depende de novo request.
  - Preferência é mantida ao trocar cidade e reinicia em Celsius numa nova
    montagem.
- **Dependências:** T-16.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`,
  `tests/unit/TemperatureUnitToggle.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** RF-05; CA-05a–c.

### T-18 — Padronizar status, erros e recuperação acessível

- **Descrição:** Apresentar estados idle/loading/empty/error/success e ações de
  retry de busca e clima com mensagens distintas e semânticas.
- **Critérios de aceite:**
  - Carregamento e ausência de resultados usam `role="status"`; erros usam
    `role="alert"` sem anúncios duplicados.
  - Mensagens em pt-BR distinguem falha de rede/API, timeout e resposta inválida;
    429 orienta aguardar sem agendar retry.
  - Loading é apresentado em até 200 ms; falhas encerram o loading e oferecem
    retry explícito da mesma operação, preservando controles de recuperação.
  - Campos e dias parciais mostram “Indisponível” sem apagar valores válidos.
- **Dependências:** T-06, T-13.
- **Arquivos prováveis:** `src/components/StatusMessage.tsx`,
  `src/App.tsx`, `src/hooks/useWeatherSearch.ts`
- **Tipo:** UI
- **Rastreabilidade:** RF-07; CA-03b, CA-04b, CA-07a–c; RNF-01, RNF-03–04,
  RNF-07.

### T-19 — Testar mensagens e recuperação de estados

- **Descrição:** Verificar estados e ações da UI por roles acessíveis e callbacks.
- **Critérios de aceite:**
  - Testes cobrem idle, loading, empty, erro de busca, erro de clima e sucesso
    parcial, incluindo os roles e mensagens definidos.
  - Botões de retry acionam o callback correto; vazio mantém a consulta
    editável e não apresenta clima fictício.
  - Texto externo com marcação é exibido literalmente e não cria elementos
    HTML.
- **Dependências:** T-18.
- **Arquivos prováveis:** `tests/unit/StatusMessage.test.tsx`,
  `tests/unit/App.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** RF-01, RF-03–04, RF-07; CA-01c, CA-03b, CA-04b,
  CA-07a–c; RNF-03, RNF-06.

### T-20 — Ajustar layout responsivo e controles de toque

- **Descrição:** Aplicar o tema e ajustar formulário, resultados e cartões aos
  viewports suportados, preservando acessibilidade.
- **Critérios de aceite:**
  - Busca, seleção, previsão e alternância de unidade permanecem utilizáveis em
    320, 375, 768, 1024, 1440 e 1920 px.
  - Em cada largura, `document.documentElement.scrollWidth` não excede
    `clientWidth`; conteúdo pode continuar por rolagem vertical.
  - Controles têm alvos de pelo menos 44 × 44 CSS px, foco visível e não perdem
    conteúdo com nomes longos ou mensagens de erro.
- **Dependências:** T-05, T-12, T-16, T-18.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/*.tsx`,
  estilos Tailwind existentes
- **Tipo:** UI
- **Rastreabilidade:** RF-06; CA-06; RNF-02–03.

## Entrega 5 — Fluxos integrados e validação final

### T-21 — Cobrir fluxos integrados e viewports com E2E

- **Descrição:** Validar a experiência ponta a ponta com respostas HTTP
  determinísticas interceptadas, sem depender da API ao vivo.
- **Critérios de aceite:**
  - Fluxo principal cobre busca Unicode/aparada, seleção por coordenadas,
    condições atuais e cinco datas locais.
  - Fluxos cobrem alternância de unidade sem novas chamadas, busca vazia,
    falha/timeout e retry explícito, resposta parcial e seleção concorrente.
  - Verifica loading até 200 ms, timeout aos 10 segundos, ausência de rolagem
    horizontal nas seis larguras definidas e controles acionáveis.
  - Fluxos essenciais rodam em Chromium, Firefox e WebKit; modo mobile inclui
    emulação de toque.
- **Dependências:** T-04, T-07, T-09, T-11, T-14, T-17, T-19, T-20.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`,
  fixtures de `tests/e2e/`, configuração Playwright existente
- **Tipo:** Test
- **Rastreabilidade:** RF-01–08; CA-01a–c, CA-02, CA-03a–b, CA-04a–b,
  CA-05a–c, CA-06, CA-07a–d, CA-08; RNF-02–04, RNF-08.

### T-22 — Executar os gates de qualidade do projeto

- **Descrição:** Rodar os comandos de lint, build e testes depois da integração e
  resolver falhas relacionadas às entregas deste backlog.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build` e `pnpm test` terminam com sucesso.
  - A suíte Playwright configurada no repositório termina com sucesso.
  - Nenhum teste depende de disponibilidade ao vivo da Open-Meteo.
- **Dependências:** T-21.
- **Arquivos prováveis:** arquivos alterados em `src/` e `tests/`; configuração
  de testes somente se necessária
- **Tipo:** Infra
- **Rastreabilidade:** RF-01–08; CA-01a–c, CA-02, CA-03a–b, CA-04a–b,
  CA-05a–c, CA-06, CA-07a–d, CA-08; RNF-01–08.
