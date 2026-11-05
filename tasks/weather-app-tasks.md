# Backlog de Tarefas — Weather App

Tarefas derivadas de [plans/weather-app-plan.md](../plans/weather-app-plan.md) e
rastreáveis a [specs/weather-app-spec.md](../specs/weather-app-spec.md). Cada
tarefa limita sua implementação à camada indicada; componentes e serviços
mantêm testes em tarefas próprias.

## Ordem de execução do backlog

Esta é a ordem canônica de implementação. As seções seguintes são um catálogo
de critérios agrupado por área, não uma sequência alternativa. Uma tarefa só
começa quando todas as dependências listadas em seu detalhamento estiverem
concluídas.

| Fase | Ordem das tarefas |
|---|---|
| Tipos | T-01 |
| Funções puras | T-13, T-15, T-17, T-21 |
| Services | T-04, T-19 |
| Hook | T-10, T-27, T-32 |
| Componentes | T-02, T-06, T-08, T-23, T-25, T-30, T-34 |
| Integração | T-03, T-12, T-29, T-33, T-36 |
| Testes unitários/componentes | T-05, T-07, T-09, T-11, T-14, T-16, T-18, T-20, T-22, T-24, T-26, T-28, T-31, T-35, T-45 |
| Testes integrados | T-40, T-41, T-42, T-43 |
| Hardening e gates finais | T-37, T-38, T-39, T-44 |

## Matriz de rastreabilidade — requisitos funcionais

| Requisito da spec | Tarefas de implementação | Tarefas de verificação |
|---|---|---|
| RF-01 — Buscar cidades | T-04, T-06, T-10, T-12 | T-05, T-07, T-11, T-40, T-42, T-45 |
| RF-02 — Selecionar localidade | T-04, T-08, T-10, T-12, T-27, T-29 | T-05, T-09, T-11, T-28, T-40, T-42 |
| RF-03 — Consultar clima atual | T-13, T-15, T-19, T-23, T-27, T-29, T-33 | T-14, T-16, T-20, T-24, T-28, T-40, T-42 |
| RF-04 — Consultar previsão | T-13, T-15, T-17, T-19, T-25, T-27, T-29, T-33 | T-14, T-16, T-18, T-20, T-26, T-28, T-40, T-42 |
| RF-05 — Alternar temperatura | T-21, T-23, T-25, T-30, T-32, T-33 | T-22, T-24, T-26, T-31, T-41 |
| RF-06 — Usar em dispositivos móveis | T-37, T-38, T-39 | T-40, T-43 |
| RF-07 — Comunicar estado e falhas | T-04, T-10, T-19, T-27, T-34, T-36 | T-05, T-11, T-20, T-28, T-35, T-40, T-42, T-45 |
| RF-08 — Atribuir fonte | T-02, T-03 | T-40, T-43 |

**Lacunas:** nenhum requisito funcional da spec está sem tarefa de
implementação correspondente. RF-01 a RF-08 também têm tarefas de verificação
associadas; os gates gerais de qualidade estão em T-44.

## Prioridade e tamanho relativo

Prioridades: **P0** é necessário para a primeira entrega funcional e demonstrável;
**P1** completa a cobertura de release, falhas e compatibilidade; **P2** é
verificação adicional de baixo risco, sem adiar implementação de requisitos.
Tamanho: **P** pequeno (uma mudança localizada), **M** médio (mais de um caso ou
coordenação simples entre módulos), **G** grande (lógica assíncrona complexa,
integração ampla ou matriz extensa de validação).

| Tarefa | Prioridade | Tamanho |
|---|---:|:---:|
| T-01 | P0 | M |
| T-02 | P0 | P |
| T-03 | P0 | P |
| T-04 | P0 | M |
| T-05 | P0 | M |
| T-06 | P0 | P |
| T-07 | P1 | P |
| T-08 | P0 | P |
| T-09 | P1 | P |
| T-10 | P0 | G |
| T-11 | P1 | M |
| T-12 | P0 | M |
| T-13 | P0 | M |
| T-14 | P2 | M |
| T-15 | P0 | P |
| T-16 | P2 | P |
| T-17 | P0 | G |
| T-18 | P1 | M |
| T-19 | P0 | G |
| T-20 | P0 | G |
| T-21 | P0 | P |
| T-22 | P0 | P |
| T-23 | P0 | M |
| T-24 | P2 | M |
| T-25 | P0 | M |
| T-26 | P2 | M |
| T-27 | P0 | G |
| T-28 | P1 | M |
| T-29 | P0 | M |
| T-30 | P0 | P |
| T-31 | P1 | P |
| T-32 | P0 | P |
| T-33 | P0 | M |
| T-34 | P0 | M |
| T-35 | P1 | M |
| T-36 | P0 | M |
| T-37 | P0 | M |
| T-38 | P0 | M |
| T-39 | P0 | M |
| T-40 | P0 | G |
| T-41 | P1 | M |
| T-42 | P1 | G |
| T-43 | P1 | G |
| T-44 | P1 | M |
| T-45 | P0 | M |

As tarefas P2 são testes unitários/componentes complementares; os mesmos
comportamentos essenciais permanecem cobertos por tarefas P0/P1 integradas.
Elas não representam requisitos funcionais adiados.

## Sequência sugerida em fatias verticais

Cada fatia deve seguir as dependências e o fluxo tipos → funções puras →
services → hook → componentes → integração → testes. As fatias 1 e 2 produzem
valor visível primeiro; endurecimento e validação entre navegadores vêm depois.

| Ordem | Fatia e tarefas | Resultado demonstrável |
|---|---|---|
| 0 | T-01 → T-02 → T-03 | Página inicial em pt-BR, com orientação e atribuição Open-Meteo. |
| 1 | T-04 → T-10; T-06 → T-08; T-12; T-34 → T-36; verificar com T-05, T-07, T-09, T-11 e T-35 | Busca por envio explícito, seleção da localidade, loading/vazio/erro e retry da busca. |
| 2 | T-13 → T-15 → T-17; T-19; T-27; T-23 → T-25; T-29; verificar com T-14, T-16, T-18, T-20, T-24, T-26, T-28 e T-45 | Clima atual e cinco dias exibidos para a localidade selecionada, incluindo dados parciais e estados de erro/empty/loading. |
| 3 | T-21 → T-32 → T-30 → T-33; verificar com T-22, T-31 e T-41 | Celsius/Fahrenheit aplicado a temperaturas atuais e previstas sem nova consulta. |
| 4 | T-37 → T-39; verificar com T-40 em viewport mobile de 375 px e T-42 | Fluxos principais utilizáveis em mobile, com layout sem rolagem horizontal e recuperação de falhas. |
| 5 | Verificar cobertura ampla com T-43; executar T-44 | Validação de viewports/navegadores e gates finais de lint, build e testes. |

## Detalhamento A — Fundação e busca

### Integração intermediária da UI com mock

- Implementar `src/App.tsx`, `src/main.tsx`, `src/styles/index.css` e
  `src/hooks/useMockWeather.ts` conforme a etapa mock do plano.
- Header com marca, SearchBar e UnitToggle; conteúdo exclusivo por estado;
  sucesso com clima atual e cinco dias; rodapé identifica fonte e demonstração.
- Prévia explícita dos cinco estados, busca simulada e retry sem acesso à API.
- Unidade persiste durante loading, erro, vazio e novas buscas; nenhuma segunda
  cópia Fahrenheit dos dados é armazenada.
- Testes cobrem estados, busca, retry, cancelamento e conversão de todos os
  valores; validar lint/build/test. A integração HTTP fica para etapa posterior.

### T-01 — Definir os contratos de domínio

- **Descrição:** Declarar os tipos compartilhados de localidade, clima,
  previsão, unidade e estado de requisição.
- **Critérios de aceite:**
  - Os tipos cobrem `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`,
    `Unit`, estados assíncronos e erros tipados.
  - Valores de clima potencialmente ausentes aceitam `null`; previsão representa
    cinco datas locais.
  - `pnpm exec tsc --noEmit` (ou o type-check configurado no projeto) aceita os
    contratos em TypeScript strict; o módulo não importa React nem contém
    efeitos colaterais.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-02–05, RF-07; CA-02, CA-03b, CA-04a–b, CA-05a–c,
  CA-07c–d.

### T-02 — Criar o componente de atribuição da fonte

- **Descrição:** Implementar um componente isolado para identificar a fonte dos
  dados meteorológicos.
- **Critérios de aceite:**
  - Exibe “Open-Meteo” como link para `https://open-meteo.com/`.
  - Uma consulta por role encontra um link com nome acessível “Open-Meteo” e
    href exato; teste de teclado consegue focá-lo e acioná-lo.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/components/SourceAttribution.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-08; CA-08; RNF-03.

### T-03 — Criar o shell inicial da página

- **Descrição:** Compor a página inicial em pt-BR com orientação para busca e
  atribuição da fonte.
- **Critérios de aceite:**
  - Renderização da página contém a orientação inicial e o link de atribuição.
  - No estado inicial não há cartão de clima nem indicador de loading.
  - A inicialização React existente continua sendo o ponto de entrada da
    aplicação.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-07–08; CA-08; RNF-01, RNF-03.

## Detalhamento B — Serviços e orquestração da busca

### T-04 — Implementar o serviço de geocodificação

- **Descrição:** Consultar a Geocoding API e validar/mapear os resultados para
  localidades do domínio.
- **Critérios de aceite:**
  - Usa HTTPS e `URLSearchParams` com termo aparado, `count=10`, `language=pt` e
    `format=json`, preservando caracteres Unicode.
  - Mapeia identidade, coordenadas, nome, país e região/fuso opcionais.
  - `results` ausente ou lista vazia retorna vazio; `results` de tipo incorreto,
    item sem identidade/coordenadas válidas, falhas de rede/HTTP e JSON inválido
    resultam em erro explícito.
  - A operação aceita cancelamento e tem timeout total de 10 segundos.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/geocodingService.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-01–02, RF-07; CA-01a–b, CA-02, CA-07c; RNF-04,
  RNF-06–07.

### T-05 — Testar geocodificação com fetch mockado

- **Descrição:** Validar parâmetros, mapeamento e falhas do serviço com `fetch`
  simulado.
- **Critérios de aceite:**
  - `fetch` é mockado e nenhuma chamada de rede real ocorre; testes verificam
    URL/parâmetros, Unicode decodificado e saída `City[]`.
  - Cobrem resultado vazio, falhas de rede e HTTP, JSON/estrutura inválidos e
    timeout exatamente aos 10.000 ms, incluindo corpo pendente após headers.
  - Resposta inválida não é convertida silenciosamente em lista vazia.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/geocodingService.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-01–02, RF-07; CA-01a–c, CA-02, CA-07c.

### T-06 — Criar o formulário de busca

- **Descrição:** Implementar o formulário acessível para envio explícito de
  nome de cidade.
- **Critérios de aceite:**
  - Consulta por role encontra o campo pelo nome acessível; botão e Enter enviam
    o valor ao callback.
  - Digitação não chama o callback; envio de valor vazio/apenas espaços não
    chama o callback e apresenta orientação junto ao campo.
  - Após validação, o campo continua editável para nova tentativa.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-01; CA-01a–c; RNF-03.

### T-07 — Testar o formulário de busca

- **Descrição:** Testar rótulo, edição e envio acessível do formulário.
- **Critérios de aceite:**
  - Testes verificam digitação e envio pelo botão e teclado usando interações de
    usuário e roles acessíveis.
  - Digitação isolada e envio vazio/apenas espaços não acionam o callback; o
    envio não vazio o aciona uma vez com o texto inserido.
  - Após erro de validação, o campo segue editável e a orientação permanece
    associada ao campo.
- **Dependências:** T-06.
- **Arquivos prováveis:** `tests/unit/SearchForm.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** RF-01; CA-01a–c; RNF-03.

### T-08 — Criar a lista de localidades

- **Descrição:** Implementar a apresentação e seleção dos resultados de
  geocodificação sem lógica de rede.
- **Critérios de aceite:**
  - Para cada `City` recebida renderiza opção com nome/país; região aparece
    somente quando não vazia.
  - Selecionar cada uma de duas cidades homônimas chama o callback com seu
    objeto/identidade e coordenadas correspondentes.
  - String de nome contendo marcação aparece como texto e não cria elemento
    HTML.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/LocationResults.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-02; CA-02; RNF-03, RNF-06.

### T-09 — Testar a lista de localidades

- **Descrição:** Verificar conteúdo, acessibilidade e seleção de opções.
- **Critérios de aceite:**
  - Testes por roles/localizadores verificam nome, país e presença/ausência da
    região.
  - Com duas opções de rótulo igual, selecionar cada opção chama o callback uma
    vez com ID e coordenadas próprios.
  - Nome contendo `<script>` é texto literal e não cria elemento `script`.
- **Dependências:** T-08.
- **Arquivos prováveis:** `tests/unit/LocationResults.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** RF-02; CA-02; RNF-03, RNF-06.

### T-10 — Orquestrar a busca e seleção no hook

- **Descrição:** Implementar o estado de busca, envio explícito, seleção e
  cancelamento de operações obsoletas.
- **Critérios de aceite:**
  - Termo vazio após `trim()` não chama o serviço; envio válido inicia loading.
  - Busca nova limpa a seleção anterior; resultado vazio preserva o termo e não
    consulta clima.
  - Selecionar uma `City` de sucesso atualiza `selectedCity` com seu ID e
    coordenadas, sem selecionar outra cidade com rótulo igual.
  - Estado observável percorre `loading` para `success`, `empty` ou `error`;
    edição sem envio não altera estado nem chama serviço.
  - Com duas promises controladas resolvidas fora de ordem, somente a busca mais
    recente atualiza resultados, erro ou loading.
  - Retry explícito chama o serviço uma vez com o termo capturado na falha;
    nenhuma chamada é iniciada automaticamente.
  - Hook depende do serviço e não constrói URL nem interpreta JSON.
- **Dependências:** T-01, T-04.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-01–02, RF-07; CA-01a–c, CA-02, CA-07a–b, CA-07d.

### T-11 — Testar a orquestração de busca

- **Descrição:** Cobrir transições, validação, respostas fora de ordem e retry
  da busca no hook.
- **Critérios de aceite:**
  - Asserções de chamadas comprovam zero chamadas para vazio/edição e uma
    chamada por envio válido.
  - Resposta vazia mantém o termo submetido; promise da busca A resolvida depois
    de B não altera resultados/estado de B.
  - Após falha de A e edição do campo, retry usa o termo A exatamente uma vez.
- **Dependências:** T-10.
- **Arquivos prováveis:** `tests/unit/useWeatherSearch.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-01–02, RF-07; CA-01a–c, CA-07b–d.

### T-12 — Conectar a busca à página

- **Descrição:** Ligar o hook de busca ao formulário e à lista de localidades.
- **Critérios de aceite:**
  - Submeter o formulário chama `search` uma vez com o texto atual e as cidades
    de `success` são passadas à lista de resultados.
  - Selecionar uma opção chama a ação do hook com o mesmo ID e coordenadas da
    opção escolhida.
  - Um teste da página confirma que serviços não são chamados diretamente pelos
    componentes de apresentação.
- **Dependências:** T-03, T-06, T-08, T-10.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-01–02; CA-01a–c, CA-02.

## Detalhamento C — Funções puras de data e previsão

### T-13 — Implementar formatação de datas locais

- **Descrição:** Criar funções puras para datas locais e horários no fuso
  informado pela previsão.
- **Critérios de aceite:**
  - Datas são formatadas como `dd/MM/yyyy` e horários em formato de 24 horas
    em pt-BR.
  - Para uma mesma data/hora ISO local, saída corresponde ao calendário/horário
    do fuso passado e não muda ao variar o fuso do ambiente de teste.
  - Funções recebem fuso e referência temporal explicitamente; não leem relógio
    global implicitamente para calcular a data local.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/dateTime.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-03–04; CA-03a, CA-04a; RNF-01.

### T-14 — Testar a formatação de datas

- **Descrição:** Testar formatação e cálculo temporal com fuso e relógio
  controlados.
- **Critérios de aceite:**
  - Com fuso de teste diferente do fuso da cidade, a data local esperada não é
    deslocada; testes cobrem virada de mês/ano e horário de verão.
  - Asserções comparam strings exatas `dd/MM/yyyy` e horário `HH:mm` para
    entradas fixadas.
- **Dependências:** T-13.
- **Arquivos prováveis:** `tests/unit/dateTime.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-03–04; CA-03a, CA-04a; RNF-01.

### T-15 — Mapear códigos meteorológicos WMO

- **Descrição:** Criar uma função pura que mapeia códigos WMO para rótulos em
  pt-BR.
- **Critérios de aceite:**
  - Códigos 0, 1, 2, 3 e 61 retornam, respectivamente, “Céu limpo”,
    “Predominantemente limpo”, “Parcialmente nublado”, “Encoberto” e
    “Chuva fraca”; todos os demais códigos suportados também têm rótulo pt-BR.
  - Código não mapeado e `null` retornam exatamente “Indisponível”.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-03–04; CA-03a–b, CA-04a–b; RNF-01.

### T-16 — Testar o mapeamento WMO

- **Descrição:** Verificar códigos meteorológicos conhecidos e desconhecidos.
- **Critérios de aceite:**
  - Testes comparam os rótulos exatos dos códigos 0, 1, 2, 3 e 61 definidos em
    T-15 e percorrem a tabela para confirmar nenhum rótulo vazio.
  - Código fora da tabela e `null` retornam exatamente “Indisponível”.
- **Dependências:** T-15.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-03–04; CA-03a–b, CA-04a–b.

### T-17 — Normalizar a previsão em cinco datas

- **Descrição:** Implementar função pura que associa séries diárias às datas
  locais esperadas sem inventar ou deslocar valores.
- **Critérios de aceite:**
  - Produz exatamente cinco datas em ordem local, calculadas com fuso e relógio
    de referência explícitos.
  - Para data local de referência 2026-01-10, chaves de saída são exatamente
    2026-01-10 a 2026-01-14.
  - Valores de arrays paralelos permanecem associados ao índice/data de origem;
    lacunas e valores inválidos viram `null`, sem apagar campos válidos
    independentes.
- **Dependências:** T-01, T-13.
- **Arquivos prováveis:** `src/lib/normalizeWeather.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-03–04; CA-03b, CA-04a–b.

### T-18 — Testar normalização de séries diárias

- **Descrição:** Validar a normalização com fixtures de séries completas,
  parciais e inconsistentes.
- **Critérios de aceite:**
  - Teste da data-base 2026-01-10 compara exatamente as cinco chaves de saída;
    fixtures incluem dia ausente no meio, arrays de tamanhos distintos e nulos.
  - Asserções por data comprovam que valores não mudam de índice para preencher
    lacunas.
  - Valor 0 permanece 0; cada entrada sem origem tem campos `null`.
- **Dependências:** T-17.
- **Arquivos prováveis:** `tests/unit/normalizeWeather.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-03–04; CA-03b, CA-04a–b.

## Detalhamento D — Serviço meteorológico e apresentação

### T-19 — Implementar o serviço de previsão

- **Descrição:** Consultar forecast para coordenadas selecionadas e validar a
  resposta da API antes de normalizar.
- **Critérios de aceite:**
  - Uma chamada `GET` HTTPS envia latitude/longitude selecionadas, `current`,
    `daily`, `timezone=auto`, `forecast_days=5`, `temperature_unit=celsius`,
    `wind_speed_unit=kmh` e `timeformat=iso8601`.
  - Resposta não-2xx, JSON inválido, estrutura/fuso inválidos e unidades
    incompatíveis rejeitam com o tipo de erro correspondente, sem relatório de
    sucesso.
  - Campos individuais ausentes/nulos resultam em `null` no campo interno; os
    campos válidos da mesma resposta permanecem intactos.
  - A promise pendente termina como timeout ao atingir 10.000 ms, inclusive
    quando o corpo não termina após os headers; abort/cancelamento não é tratado
    como timeout visível.
- **Dependências:** T-01, T-13, T-17.
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-03–04, RF-07; CA-03a–b, CA-04a–b, CA-07c; RNF-04,
  RNF-06–07.

### T-20 — Testar previsão com fetch mockado

- **Descrição:** Verificar parâmetros, normalização e falhas do serviço com
  `fetch` simulado.
- **Critérios de aceite:**
  - `fetch` é mockado e nenhuma chamada de rede real ocorre; asserções da URL
    conferem coordenadas da localidade selecionada e todos os parâmetros de
    T-19, incluindo campos current/daily.
  - Fixtures confirmam saída `WeatherData` completa e parcial; rejeições são
    verificadas para rede, HTTP 429/500, payload de erro, JSON/estrutura/fuso e
    unidades inválidos.
  - Com timers falsos, a chamada permanece pendente em 9.999 ms e termina por
    timeout em 10.000 ms; corpo pendente após headers é coberto e o signal é
    abortado.
  - Após falha, contagem de chamadas permanece em uma até ação explícita; todos
    os timers são limpos após conclusão ou cancelamento.
- **Dependências:** T-19.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-03–04, RF-07; CA-03a–b, CA-04a–b, CA-07c;
  RNF-04, RNF-07.

### T-21 — Implementar conversão e formatação de temperatura

- **Descrição:** Criar funções puras para derivar temperaturas exibidas de
  valores canônicos em Celsius.
- **Critérios de aceite:**
  - Para entradas `0`, `100` e `-40` °C, valores Fahrenheit não arredondados são
    respectivamente `32`, `212` e `-40`; arredondamento só ocorre na saída.
  - Saída usa uma casa decimal, vírgula decimal pt-BR e sufixo `°C` ou `°F`.
  - Entrada `null` retorna exatamente “Indisponível” em ambas as unidades.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-05; CA-05a–c.

### T-22 — Testar unitariamente conversão de unidade

- **Descrição:** Verificar conversões, arredondamento, unidades e valores
  indisponíveis.
- **Critérios de aceite:**
  - Asserções verificam `0 °C → 32,0 °F`, `100 °C → 212,0 °F`,
    `-40 °C → -40,0 °F` e valor fracionário negativo com conversão antes do
    arredondamento.
  - Asserções comparam strings exatas com uma casa decimal, vírgula pt-BR,
    sufixos `°C`/`°F` e `null → Indisponível`.
- **Dependências:** T-01, T-21.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-05; CA-05a–c.

### T-23 — Criar a apresentação das condições atuais

- **Descrição:** Implementar um componente para os dados atuais de uma
  localidade.
- **Critérios de aceite:**
  - Recebe dados normalizados e unidade por props, sem acessar rede ou estado
    global.
  - Renderização contém nome/país, temperatura, condição, umidade com `%`, vento
    com `km/h`, precipitação com `mm`, pressão com `hPa`, ícone WMO e horário de
    referência local. Precipitação e pressão são opcionais no contrato.
  - Para cada prop nula, renderiza “Indisponível” no campo correspondente e
    mantém visíveis os demais campos não nulos.
- **Dependências:** T-01, T-13, T-15, T-21.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-03, RF-05; CA-03a–b, CA-05a–c; RNF-01, RNF-03.

### T-24 — Testar a apresentação das condições atuais

- **Descrição:** Cobrir conteúdo, dados parciais e interação observável do
  componente atual.
- **Critérios de aceite:**
  - Teste de sucesso verifica texto e unidades exatos para cidade, condição,
    temperatura, umidade, vento, precipitação, pressão e horário; ícone
    decorativo não duplica o anúncio da condição.
  - Fixture com cada campo individualmente nulo verifica “Indisponível” naquele
    campo e preservação dos outros valores.
  - Fixtures Celsius/Fahrenheit conferem a temperatura renderizada pela unidade
    recebida.
- **Dependências:** T-23.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** RF-03, RF-05; CA-03a–b, CA-05a–c.

### T-25 — Criar a apresentação da previsão diária

- **Descrição:** Implementar um componente para a lista de cinco dias de
  previsão.
- **Critérios de aceite:**
  - Recebe previsão normalizada e unidade por props, sem acesso à rede ou estado
    global.
  - DOM contém exatamente cinco entradas em ordem, com data, condição, mínima e
    máxima e probabilidade de chuva em cada uma. Ícones WMO são decorativos,
    acompanhados pela condição textual.
  - Data/campo nulo correspondente exibe “Indisponível”; entradas válidas
    permanecem visíveis.
- **Dependências:** T-01, T-13, T-15, T-17, T-21.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`,
  `src/components/ForecastCard.tsx`, `src/lib/format.ts`
- **Tipo:** UI
- **Rastreabilidade:** RF-04–05; CA-04a–b, CA-05a–c; RNF-01, RNF-03.

### T-26 — Testar a apresentação da previsão diária

- **Descrição:** Verificar número e conteúdo dos dias e apresentação parcial.
- **Critérios de aceite:**
  - Asserções verificam cinco entradas, sua ordem e presença de condição,
    mínima/máxima e probabilidade de chuva (incluindo 0%, 100% e ausências).
  - Fixture parcial verifica “Indisponível” para cada lacuna sem remover dias ou
    valores válidos.
  - Fixtures Celsius/Fahrenheit verificam unidade e valor renderizados em cada
    mínima/máxima.
- **Dependências:** T-25.
- **Arquivos prováveis:** `tests/unit/ForecastList.test.tsx`,
  `tests/unit/ForecastCard.test.tsx`, `tests/unit/format.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-04–05; CA-04a–b, CA-05a–c.

### T-27 — Orquestrar a consulta meteorológica no hook

- **Descrição:** Estender o hook para carregar clima da localidade selecionada,
  manter estados independentes e permitir retry explícito.
- **Critérios de aceite:**
  - Seleção inicia loading e chama o serviço com as coordenadas daquela cidade.
  - Teste do hook observa `weatherState=loading` imediatamente após seleção e
    confere latitude/longitude enviadas ao serviço.
  - Rejeição do serviço mantém `searchState` e resultados de cidade; retry
    chama o serviço uma vez com o mesmo `City`.
  - Com promises A/B controladas e B selecionada antes da resolução de A,
    sucesso/erro/finalização tardios de A não alteram nenhum estado de B.
  - Cancelamento por nova seleção e desmontagem não produz `weatherState=error`.
- **Dependências:** T-10, T-19.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-02–04, RF-07; CA-02, CA-03a–b, CA-04a–b, CA-07c–d.

### T-28 — Testar a orquestração meteorológica no hook

- **Descrição:** Cobrir seleção, concorrência, retry e cancelamento da consulta
  de clima.
- **Critérios de aceite:**
  - Teste com deferred promises resolve A após B e compara estado/resultado de B
    antes e depois da resolução tardia de A.
  - Spy confirma que retry chama uma única vez com os mesmos ID/coordenadas da
    cidade que falhou e nenhuma chamada ocorre antes do retry.
  - Testes cancelam por nova seleção e desmontagem e confirmam ausência de
    atualização ou estado de erro causado pelo cancelamento.
- **Dependências:** T-27.
- **Arquivos prováveis:** `tests/unit/useWeatherSearch.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-02–04, RF-07; CA-07c–d.

### T-29 — Conectar os dados meteorológicos à página

- **Descrição:** Exibir condições atuais e previsão para a localidade selecionada.
- **Critérios de aceite:**
  - Após seleção e sucesso simulado do hook, a página renderiza os componentes
    atual e diário com `WeatherData` da cidade selecionada.
  - Durante loading e erro de clima, as opções de localidade continuam no DOM e
    selecionáveis.
  - Contratos/props da página usam `WeatherData`; nenhum componente recebe o
    payload bruto da Open-Meteo.
- **Dependências:** T-12, T-23, T-25, T-27.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-02–04; CA-02, CA-03a–b, CA-04a–b.

## Detalhamento E — Unidade e estados

### T-30 — Criar o controle de unidade

- **Descrição:** Implementar controle acessível que recebe unidade e callback de
  mudança.
- **Critérios de aceite:**
  - Renderiza opções selecionáveis Celsius e Fahrenheit e expõe qual está ativa
    por estado acessível verificável (`checked`, `pressed` ou equivalente).
  - Testes de interação por teclado conseguem focar cada opção e alterá-la; cada
    controle tem nome acessível distinto.
  - Componente não inicia chamadas de rede nem mantém cópia independente dos
    dados meteorológicos.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-05; CA-05a–c; RNF-03.

### T-31 — Testar o controle de unidade

- **Descrição:** Verificar seleção de Celsius/Fahrenheit e callback acessível.
- **Critérios de aceite:**
  - Asserções por role verificam nomes distintos e estado selecionado inicial e
    depois da interação.
  - Interação por teclado seleciona cada unidade e o callback recebe exatamente
    `"celsius"` ou `"fahrenheit"` uma vez por alteração.
- **Dependências:** T-30.
- **Arquivos prováveis:** `tests/unit/TemperatureUnitToggle.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** RF-05; CA-05a–c; RNF-03.

### T-32 — Manter a unidade no estado do hook

- **Descrição:** Adicionar estado de unidade iniciado em Celsius e preservado
  entre seleções durante a montagem da página.
- **Critérios de aceite:**
  - Renderização inicial do hook retorna `unit="celsius"`; spy confirma zero
    chamadas aos serviços ao mudar somente a unidade.
  - Selecionar outra cidade mantém a unidade atual; desmontar e montar uma nova
    instância retorna `"celsius"`.
  - Deferred promise permite mudar unidade durante loading; após resolução, os
    dados permanecem canônicos em Celsius e a unidade retornada continua atual.
- **Dependências:** T-27.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-05; CA-05a–c.

### T-33 — Conectar unidade à página e aos cartões

- **Descrição:** Passar unidade e ação do hook ao controle e aos componentes de
  clima.
- **Critérios de aceite:**
  - Com fixture de 0 °C, clicar Fahrenheit mostra 32,0 °F na temperatura atual,
    mínima e máxima; voltar a Celsius mostra 0,0 °C.
  - Spy de forecast confirma contagem de chamadas inalterada nas duas mudanças.
  - Unidade do controle e das props dos cartões é a mesma unidade retornada pelo
    hook, sem estado local duplicado na página.
- **Dependências:** T-29, T-30, T-32.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-05; CA-05a–c.

### T-34 — Criar a apresentação de estados e mensagens

- **Descrição:** Implementar componente de mensagem para loading, vazio e erro.
- **Critérios de aceite:**
  - Loading e ausência de resultados usam semântica de status; erro usa alerta.
  - Consulta por role encontra `role=status` para loading/vazio e `role=alert`
    para erro; não há dois anúncios para o mesmo estado.
  - Fixtures de erros `network`, `api`, `timeout` e `invalid-response` produzem
    mensagens pt-BR distintas; status 429 orienta aguardar.
  - Botão de retry tem nome acessível e invoca somente o callback fornecido; não
    agenda outra tentativa por conta própria.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`,
  `src/components/states/ErrorState.tsx`, `src/components/states/EmptyState.tsx`.
  Mensagens específicas de erro vêm da composição por `message`; retry usa
  `onRetry`. Título e dica do vazio são personalizáveis por `title` e `hint`.
- **Tipo:** UI
- **Rastreabilidade:** RF-07; CA-07a–c; RNF-01, RNF-03–04, RNF-07.

### T-35 — Testar mensagens de estado

- **Descrição:** Verificar semântica, textos e callback de retry do componente.
- **Critérios de aceite:**
  - Testes por role confirmam `status` para loading/vazio e `alert` para erro,
    sem duplicação do mesmo anúncio.
  - Casos `network`, `api`, `timeout`, `invalid-response` e HTTP 429 conferem
    mensagens pt-BR específicas e distintas.
  - Clique no retry chama callback uma vez; avanço de timers sem interação não
    produz nova chamada.
- **Dependências:** T-34.
- **Arquivos prováveis:** `tests/unit/States.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** RF-07; CA-07a–c; RNF-03.

### T-36 — Conectar estados e retry à página

- **Descrição:** Ligar os estados de busca e clima às mensagens e ações de
  recuperação.
- **Critérios de aceite:**
  - Loading, vazio e erros de busca/clima são mostrados na região correta.
  - Testes de página acionam falhas separadas e localizam mensagens de busca e
    clima em suas respectivas regiões.
  - Retry de busca envia o termo originalmente submetido; retry de clima envia
    o mesmo ID/coordenadas selecionados na falha.
  - Medição do evento até a primeira renderização do indicador é ≤ 200 ms;
    após falha o indicador some e formulário/opções/retry apropriados continuam
    acionáveis.
- **Dependências:** T-12, T-27, T-34.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-07; CA-07a–c; RNF-03–04, RNF-07.

## Detalhamento F — Testes integrados e hardening

### T-37 — Ajustar responsividade da busca

- **Descrição:** Ajustar formulário e resultados para telas estreitas e nomes
  extensos.
- **Critérios de aceite:**
  - Em 320, 375, 768, 1024, 1440 e 1920 CSS px, formulário e opções podem ser
    usados e `documentElement.scrollWidth <= clientWidth`.
  - Medição no browser confirma área de cada controle interativo ≥ 44 × 44 CSS
    px; navegação por teclado exibe foco visível.
- **Dependências:** T-06, T-08.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`,
  `src/components/LocationResults.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-06; CA-06; RNF-02–03.

### T-38 — Ajustar responsividade dos cartões meteorológicos

- **Descrição:** Ajustar cartões atuais e diários sem perda de campos em
  viewports suportados.
- **Critérios de aceite:**
  - Em 320, 375, 768, 1024, 1440 e 1920 CSS px, todos os campos atuais e cinco
    dias continuam no DOM e legíveis, com rolagem apenas vertical quando
    necessária.
  - Com nomes de localidade/valores longos, `scrollWidth <= clientWidth`.
  - Medição no browser confirma alvos interativos ≥ 44 × 44 CSS px e foco
    visível via teclado.
- **Dependências:** T-23, T-25, T-30.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`,
  `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-06; CA-06; RNF-02–03.

### T-39 — Ajustar layout responsivo da página

- **Descrição:** Ajustar composição e espaçamento do shell da página em
  viewports desktop e mobile.
- **Critérios de aceite:**
  - Em 320, 375, 768, 1024, 1440 e 1920 CSS px, shell completo com sucesso e erro
    satisfaz `documentElement.scrollWidth <= clientWidth`.
  - Todos os controles permanecem no DOM/focáveis; viewport permite rolagem
    vertical até atribuição e previsão completa.
  - Medição no browser confirma alvos interativos ≥ 44 × 44 CSS px; teste por
    teclado confirma foco visível.
- **Dependências:** T-03, T-33, T-36, T-37, T-38.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-06; CA-06; RNF-02–03.

### T-45 — Testar estados loading, erro e vazio na página

- **Descrição:** Testar os componentes integrados da página para os estados de
  carregamento, falha e ausência de resultados com serviços controlados.
- **Critérios de aceite:**
  - Com busca pendente, a página anuncia loading com `role="status"` e mantém o
    formulário disponível.
  - Geocoding sem resultados anuncia estado vazio, mantém o termo editável e
    não renderiza dados meteorológicos.
  - Falha de geocoding e falha de forecast anunciam erro com `role="alert"`,
    removem loading e apresentam retry da operação correspondente.
  - A cada estado, as consultas por role encontram exatamente uma mensagem
    apropriada; retry chama o serviço simulado uma vez com termo/localidade
    original.
- **Dependências:** T-12, T-27, T-34, T-36.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** RF-01–04, RF-07; CA-01c, CA-07a–c; RNF-03–04.

### T-40 — Testar o fluxo principal integrado

- **Descrição:** Validar busca, seleção, consulta atual e previsão com respostas
  interceptadas.
- **Critérios de aceite:**
  - Busca interceptada sem localidades mostra mensagem de ausência, mantém o
    termo editável e não envia requisição de forecast.
  - Interceptação verifica que `"  São Paulo  "` chega à URL como `São Paulo`
    após decodificação e que a busca Unicode retorna as opções da fixture.
  - Selecionar a opção homônima de fixture envia latitude/longitude esperadas;
    a página mostra cidade, temperatura, condição, umidade, vento, horário e
    exatamente as cinco datas esperadas.
  - Com resposta de rede mantida pendente, indicador aparece ≤ 200 ms após
    submissão/seleção; todas as respostas vêm de fixtures interceptadas.
 - O mesmo fluxo principal é executado em viewport mobile de 375 CSS px e
    confirma `documentElement.scrollWidth <= clientWidth`, com busca, seleção e
    previsão acessíveis por rolagem vertical.
- **Dependências:** T-05, T-11, T-12, T-20, T-28, T-29, T-36, T-45.
- **Arquivos prováveis:** `tests/e2e/weather-search.spec.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-01–06, RF-07–08; CA-01a–b, CA-02, CA-03a, CA-04a,
  CA-06, CA-07a–b, CA-08; RNF-02.

### T-41 — Testar alternância de unidade integrada

- **Descrição:** Validar unidade padrão, conversões exibidas e ausência de
  consultas extras no fluxo de página.
- **Critérios de aceite:**
  - Com fixture de 0 °C em todos os campos, fluxo verifica strings `0,0 °C`,
    `32,0 °F` e retorno a `0,0 °C` para valores atuais, mínimas e máximas.
  - Contadores de geocoding e forecast não aumentam ao alternar unidade.
  - Após selecionar outra cidade a unidade ainda é Fahrenheit; após reload volta
    a Celsius.
- **Dependências:** T-22, T-31, T-33.
- **Arquivos prováveis:** `tests/e2e/temperature-unit.spec.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-05; CA-05a–c.

### T-42 — Testar recuperação e concorrência integradas

- **Descrição:** Validar estados vazios, falhas, retry, respostas parciais e
  seleção concorrente ponta a ponta.
- **Critérios de aceite:**
  - Cenários separados verificam geocoding vazio, falha de rede, HTTP e timeout
    aos 10.000 ms; cada caso encerra loading, permite retry explícito e mantém
    chamada única antes do retry.
  - Interceptações atrasam A, selecionam B e liberam A por último; cidade e
    previsão de B permanecem visíveis.
  - Fixtures com campo atual nulo e lacuna diária verificam “Indisponível” e
    valores associados às datas originais.
- **Dependências:** T-05, T-11, T-20, T-28, T-29, T-36.
- **Arquivos prováveis:** `tests/e2e/weather-recovery.spec.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-01–04, RF-07; CA-03b, CA-04b, CA-07b–d.

### T-43 — Testar responsividade e acessibilidade integradas

- **Descrição:** Verificar fluxo utilizável, semântica e dimensões em desktop e
  mobile.
- **Critérios de aceite:**
  - Em 320, 375, 768, 1024, 1440 e 1920 CSS px, fluxo busca/seleção/unidade
    satisfaz `documentElement.scrollWidth <= clientWidth`; conteúdo completo
    segue acessível por rolagem vertical.
  - Teste por teclado alcança e aciona busca, opção, unidade e retry, observa
    foco visível e roles status/alert; cenário mobile executa interação por
    toque e mede alvos ≥ 44 × 44 CSS px.
  - Os cenários essenciais terminam sem falha em Chromium, Firefox e WebKit.
- **Dependências:** T-03, T-12, T-29, T-33, T-36.
- **Arquivos prováveis:** `tests/e2e/weather-responsive.spec.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-06–08; CA-06–08; RNF-02–03, RNF-08.

### T-44 — Executar os gates de qualidade

- **Descrição:** Rodar os comandos de lint, build, testes unitários e E2E após
  integração.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build` e `pnpm test` retornam código 0.
  - Comando Playwright documentado/configurado no `package.json` retorna código
    0 em Chromium, Firefox e WebKit.
  - Inspeção dos testes confirma que chamadas à Open-Meteo são interceptadas ou
    mockadas; a suíte não faz requisições de API ao vivo.
- **Dependências:** T-05, T-07, T-09, T-11, T-14, T-16, T-18, T-20, T-22,
  T-24, T-26, T-28, T-31, T-35, T-37, T-38, T-39, T-40, T-41, T-42, T-43,
  T-45.
- **Arquivos prováveis:** Código e testes das entregas; configuração existente
  somente se necessária.
- **Tipo:** Infra
- **Rastreabilidade:** RF-01–08; CA-01a–c, CA-02, CA-03a–b, CA-04a–b,
  CA-05a–c, CA-06, CA-07a–d, CA-08; RNF-01–08.
