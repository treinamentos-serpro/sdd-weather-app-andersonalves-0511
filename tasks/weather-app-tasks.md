# Backlog de Tarefas — Weather App

Tarefas derivadas de [plans/weather-app-plan.md](../plans/weather-app-plan.md) e
rastreáveis a [specs/weather-app-spec.md](../specs/weather-app-spec.md). Cada
tarefa limita sua implementação à camada indicada; componentes e serviços
mantêm testes em tarefas próprias.

## Entrega 1 — Fundação e contratos

### T-01 — Definir os contratos de domínio

- **Descrição:** Declarar os tipos compartilhados de localidade, clima,
  previsão, unidade e estado de requisição.
- **Critérios de aceite:**
  - Os tipos cobrem `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`,
    `Unit`, estados assíncronos e erros tipados.
  - Valores de clima potencialmente ausentes aceitam `null`; previsão representa
    cinco datas locais.
  - O módulo não importa React nem contém efeitos colaterais.
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
  - O link tem nome acessível e pode ser acionado por teclado.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/components/SourceAttribution.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-08; CA-08; RNF-03.

### T-03 — Criar o shell inicial da página

- **Descrição:** Compor a página inicial em pt-BR com orientação para busca e
  atribuição da fonte.
- **Critérios de aceite:**
  - A aplicação monta o componente de atribuição dentro da página.
  - A tela inicial orienta a busca sem apresentar dados fictícios ou spinner.
  - A inicialização React existente continua sendo o ponto de entrada da
    aplicação.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-07–08; CA-08; RNF-01, RNF-03.

## Entrega 2 — Busca e seleção de localidades

### T-04 — Implementar o serviço de geocodificação

- **Descrição:** Consultar a Geocoding API e validar/mapear os resultados para
  localidades do domínio.
- **Critérios de aceite:**
  - Usa HTTPS e `URLSearchParams` com termo aparado, `count=10`, `language=pt` e
    `format=json`, preservando caracteres Unicode.
  - Mapeia identidade, coordenadas, nome, país e região/fuso opcionais.
  - Distingue resposta válida sem resultados de resposta inválida e erros de
    rede/HTTP/JSON.
  - A operação aceita cancelamento e tem timeout total de 10 segundos.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/geocodingService.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-01–02, RF-07; CA-01a–b, CA-02, CA-07c; RNF-04,
  RNF-06–07.

### T-05 — Testar o serviço de geocodificação

- **Descrição:** Validar parâmetros, mapeamento e falhas do serviço com `fetch`
  simulado.
- **Critérios de aceite:**
  - Testes verificam URL/parâmetros, Unicode decodificado e saída `City[]`.
  - Cobrem resultado vazio, falhas de rede e HTTP, JSON/estrutura inválidos e
    timeout.
  - Resposta inválida não é convertida silenciosamente em lista vazia.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/geocodingService.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-01–02, RF-07; CA-01a–c, CA-02, CA-07c.

### T-06 — Criar o formulário de busca

- **Descrição:** Implementar o formulário acessível para envio explícito de
  nome de cidade.
- **Critérios de aceite:**
  - Campo tem rótulo acessível e o formulário pode ser enviado por botão ou
    teclado.
  - Digitar não inicia requisição; o valor permanece editável e é enviado ao
    callback do formulário.
  - Há suporte visual para mensagem de validação de busca vazia.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-01; CA-01a–c; RNF-03.

### T-07 — Testar o formulário de busca

- **Descrição:** Testar rótulo, edição e envio acessível do formulário.
- **Critérios de aceite:**
  - Testes verificam digitação e envio pelo botão e teclado usando interações de
    usuário e roles acessíveis.
  - Digitação isolada não aciona o callback de envio.
  - A mensagem de validação pode ser apresentada sem impedir a edição do campo.
- **Dependências:** T-06.
- **Arquivos prováveis:** `tests/unit/SearchForm.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** RF-01; CA-01a–c; RNF-03.

### T-08 — Criar a lista de localidades

- **Descrição:** Implementar a apresentação e seleção dos resultados de
  geocodificação sem lógica de rede.
- **Critérios de aceite:**
  - Cada opção mostra nome e país e inclui região somente quando fornecida.
  - Opções homônimas permanecem selecionáveis individualmente por identidade,
    não somente pelo rótulo.
  - Conteúdo retornado é texto e não é interpretado como HTML.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/LocationResults.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-02; CA-02; RNF-03, RNF-06.

### T-09 — Testar a lista de localidades

- **Descrição:** Verificar conteúdo, acessibilidade e seleção de opções.
- **Critérios de aceite:**
  - Testes verificam nome, país e região opcional, incluindo região ausente.
  - Opções com rótulos iguais acionam callbacks distintos para suas localidades.
  - Texto semelhante a marcação é exibido literalmente.
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
  - Somente a busca vigente atualiza resultados, erros ou loading; edição sem
    envio não inicia operação.
  - Retry explícito repete o termo enviado associado à falha, sem repetir
    automaticamente.
  - Hook depende do serviço e não constrói URL nem interpreta JSON.
- **Dependências:** T-01, T-04.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-01–02, RF-07; CA-01a–c, CA-02, CA-07a–b, CA-07d.

### T-11 — Testar a orquestração de busca

- **Descrição:** Cobrir transições, validação, respostas fora de ordem e retry
  da busca no hook.
- **Critérios de aceite:**
  - Busca vazia e edição sem envio não chamam o serviço.
  - Resultados vazios preservam o termo; busca nova invalida resposta anterior.
  - Retry repete o termo enviado associado à falha, mesmo após edição posterior.
- **Dependências:** T-10.
- **Arquivos prováveis:** `tests/unit/useWeatherSearch.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-01–02, RF-07; CA-01a–c, CA-07b–d.

### T-12 — Conectar a busca à página

- **Descrição:** Ligar o hook de busca ao formulário e à lista de localidades.
- **Critérios de aceite:**
  - Envio do formulário chama a ação de busca; resultados válidos são exibidos
    como opções selecionáveis.
  - A seleção chama a ação do hook com a localidade selecionada.
  - Componentes não chamam serviços diretamente.
- **Dependências:** T-03, T-06, T-08, T-10.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-01–02; CA-01a–c, CA-02.

## Entrega 3 — Datas, códigos e normalização meteorológica

### T-13 — Implementar formatação de datas locais

- **Descrição:** Criar funções puras para datas locais e horários no fuso
  informado pela previsão.
- **Critérios de aceite:**
  - Datas são formatadas como `dd/MM/yyyy` e horários em formato de 24 horas
    em pt-BR.
  - Datas ISO locais não são reinterpretadas como UTC nem deslocadas pelo fuso
    do dispositivo.
  - Funções recebem explicitamente o fuso e a referência temporal necessários.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/dateTime.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-03–04; CA-03a, CA-04a; RNF-01.

### T-14 — Testar a formatação de datas

- **Descrição:** Testar formatação e cálculo temporal com fuso e relógio
  controlados.
- **Critérios de aceite:**
  - Cobrem data local diferente da máquina, virada de mês/ano e transição de
    horário de verão.
  - Confirmam `dd/MM/yyyy`, horário de 24 horas e ausência de deslocamento de
    datas ISO locais.
- **Dependências:** T-13.
- **Arquivos prováveis:** `tests/unit/dateTime.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-03–04; CA-03a, CA-04a; RNF-01.

### T-15 — Mapear códigos meteorológicos WMO

- **Descrição:** Criar uma função pura que mapeia códigos WMO para rótulos em
  pt-BR.
- **Critérios de aceite:**
  - Códigos definidos pelo produto retornam descrições em pt-BR.
  - Código desconhecido ou nulo tem representação explícita de indisponibilidade.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCode.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-03–04; CA-03a–b, CA-04a–b; RNF-01.

### T-16 — Testar o mapeamento WMO

- **Descrição:** Verificar códigos meteorológicos conhecidos e desconhecidos.
- **Critérios de aceite:**
  - Testes cobrem os códigos mapeados, código desconhecido e valor nulo.
  - Os rótulos resultantes estão em pt-BR e não escondem indisponibilidade.
- **Dependências:** T-15.
- **Arquivos prováveis:** `tests/unit/weatherCode.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-03–04; CA-03a–b, CA-04a–b.

### T-17 — Normalizar a previsão em cinco datas

- **Descrição:** Implementar função pura que associa séries diárias às datas
  locais esperadas sem inventar ou deslocar valores.
- **Critérios de aceite:**
  - Produz exatamente cinco datas em ordem local, calculadas com fuso e relógio
    de referência explícitos.
  - Valores paralelos são associados pela data e índice de origem; lacunas
    permanecem `null`.
  - Campos inválidos ou ausentes não apagam dados válidos independentes.
- **Dependências:** T-01, T-13.
- **Arquivos prováveis:** `src/lib/normalizeWeather.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-03–04; CA-03b, CA-04a–b.

### T-18 — Testar normalização de séries diárias

- **Descrição:** Validar a normalização com fixtures de séries completas,
  parciais e inconsistentes.
- **Critérios de aceite:**
  - Testes cobrem cinco datas, dia ausente no meio, arrays de tamanhos distintos
    e campos nulos.
  - Valores de outras datas não são deslocados para cobrir lacunas.
  - Temperaturas iguais a zero permanecem zero e nenhuma ausência vira valor
    inventado.
- **Dependências:** T-17.
- **Arquivos prováveis:** `tests/unit/normalizeWeather.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-03–04; CA-03b, CA-04a–b.

## Entrega 4 — Serviço e apresentação do clima

### T-19 — Implementar o serviço de previsão

- **Descrição:** Consultar forecast para coordenadas selecionadas e validar a
  resposta da API antes de normalizar.
- **Critérios de aceite:**
  - Uma requisição HTTPS envia coordenadas, campos current/daily, `timezone=auto`,
    cinco dias, Celsius, km/h e formato ISO.
  - Valida status HTTP, JSON, estrutura essencial, fuso e unidades; falhas
    resultam em erro explícito.
  - Campos meteorológicos individuais ausentes ou nulos são preservados como
    indisponíveis.
  - Usa a normalização existente, aceita cancelamento e impõe timeout total de
    10 segundos incluindo leitura do corpo.
- **Dependências:** T-01, T-13, T-17.
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-03–04, RF-07; CA-03a–b, CA-04a–b, CA-07c; RNF-04,
  RNF-06–07.

### T-20 — Testar o serviço de previsão

- **Descrição:** Verificar parâmetros, normalização e falhas do serviço com
  `fetch` simulado.
- **Critérios de aceite:**
  - Testes confirmam coordenadas e parâmetros de current/daily, unidade, fuso e
    cinco dias.
  - Cobrem sucesso parcial, rede, HTTP 429/500, JSON/estrutura/fuso/unidades
    inválidos e payload de erro.
  - Timeout cobre corpo pendente após headers, aborta a chamada e limpa timers;
    não há retry automático nem dados fictícios.
- **Dependências:** T-19.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-03–04, RF-07; CA-03a–b, CA-04a–b, CA-07c;
  RNF-04, RNF-07.

### T-21 — Implementar conversão e formatação de temperatura

- **Descrição:** Criar funções puras para derivar temperaturas exibidas de
  valores canônicos em Celsius.
- **Critérios de aceite:**
  - Fahrenheit é calculado por `C × 9/5 + 32` antes do arredondamento.
  - Formata em pt-BR com uma casa decimal e unidade correspondente.
  - `null` resulta em “Indisponível”, sem coerção para zero.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-05; CA-05a–c.

### T-22 — Testar conversão e formatação de temperatura

- **Descrição:** Verificar conversões, arredondamento, unidades e valores
  indisponíveis.
- **Critérios de aceite:**
  - Testes cobrem zero, 100 °C, -40 °C, valores negativos e fracionários.
  - Confirmam uma casa decimal, separador pt-BR, unidade correta e
    `null → Indisponível`.
- **Dependências:** T-21.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-05; CA-05a–c.

### T-23 — Criar a apresentação das condições atuais

- **Descrição:** Implementar um componente para os dados atuais de uma
  localidade.
- **Critérios de aceite:**
  - Recebe dados normalizados e unidade por props, sem acessar rede ou estado
    global.
  - Exibe localidade, temperatura, condição, umidade, vento e horário local.
  - Campos ausentes mostram “Indisponível” sem ocultar campos válidos.
- **Dependências:** T-01, T-13, T-15, T-21.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-03, RF-05; CA-03a–b, CA-05a–c; RNF-01, RNF-03.

### T-24 — Testar a apresentação das condições atuais

- **Descrição:** Cobrir conteúdo, dados parciais e interação observável do
  componente atual.
- **Critérios de aceite:**
  - Testes verificam cidade, condição, umidade, vento, horário e temperatura.
  - Campo nulo é apresentado como “Indisponível” enquanto demais valores
    permanecem visíveis.
  - Temperatura renderizada corresponde à unidade recebida.
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
  - Exibe exatamente cinco datas, condição, mínima e máxima em cada entrada.
  - Datas e temperaturas ausentes são marcadas como “Indisponível”.
- **Dependências:** T-01, T-13, T-15, T-17, T-21.
- **Arquivos prováveis:** `src/components/DailyForecast.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-04–05; CA-04a–b, CA-05a–c; RNF-01, RNF-03.

### T-26 — Testar a apresentação da previsão diária

- **Descrição:** Verificar número e conteúdo dos dias e apresentação parcial.
- **Critérios de aceite:**
  - Testes confirmam cinco entradas em ordem, com condição, mínima e máxima.
  - Campos ausentes são apresentados como “Indisponível” sem remover outros
    dados válidos.
  - Temperaturas usam a unidade recebida pelo componente.
- **Dependências:** T-25.
- **Arquivos prováveis:** `tests/unit/DailyForecast.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** RF-04–05; CA-04a–b, CA-05a–c.

### T-27 — Orquestrar a consulta meteorológica no hook

- **Descrição:** Estender o hook para carregar clima da localidade selecionada,
  manter estados independentes e permitir retry explícito.
- **Critérios de aceite:**
  - Seleção inicia loading e chama o serviço com as coordenadas daquela cidade.
  - Falha de clima não apaga resultados de busca; retry repete a cidade da falha.
  - Nova seleção invalida a operação anterior; sucesso, erro e finalização
    obsoletos não alteram o estado vigente.
  - Cancelamento por substituição/desmontagem não vira erro visível.
- **Dependências:** T-10, T-19.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-02–04, RF-07; CA-02, CA-03a–b, CA-04a–b, CA-07c–d.

### T-28 — Testar a orquestração meteorológica no hook

- **Descrição:** Cobrir seleção, concorrência, retry e cancelamento da consulta
  de clima.
- **Critérios de aceite:**
  - Promessas controladas comprovam que resposta tardia de A não substitui
    resultado, erro ou loading de B.
  - Retry chama novamente o serviço com a mesma cidade e não há repetição
    automática.
  - Cancelamento/desmontagem não causa erro visível nem atualização obsoleta.
- **Dependências:** T-27.
- **Arquivos prováveis:** `tests/unit/useWeatherSearch.test.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-02–04, RF-07; CA-07c–d.

### T-29 — Conectar os dados meteorológicos à página

- **Descrição:** Exibir condições atuais e previsão para a localidade selecionada.
- **Critérios de aceite:**
  - Selecionar uma localidade liga o estado de clima do hook aos dois
    componentes de apresentação.
  - Carregamento ou falha meteorológica não remove opções de localidades.
  - A página não lê nem transforma o JSON bruto da API.
- **Dependências:** T-12, T-23, T-25, T-27.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-02–04; CA-02, CA-03a–b, CA-04a–b.

## Entrega 5 — Unidade, estados e recuperação

### T-30 — Criar o controle de unidade

- **Descrição:** Implementar controle acessível que recebe unidade e callback de
  mudança.
- **Critérios de aceite:**
  - Oferece Celsius e Fahrenheit com seleção atual claramente identificada.
  - Controles têm nome acessível, foco visível e operação por teclado.
  - Componente não inicia chamadas de rede nem mantém cópia independente dos
    dados meteorológicos.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-05; CA-05a–c; RNF-03.

### T-31 — Testar o controle de unidade

- **Descrição:** Verificar seleção de Celsius/Fahrenheit e callback acessível.
- **Critérios de aceite:**
  - Testes confirmam unidade selecionada, nomes acessíveis e callback com o
    valor correto.
  - Interações por teclado e foco são exercitáveis.
- **Dependências:** T-30.
- **Arquivos prováveis:** `tests/unit/TemperatureUnitToggle.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** RF-05; CA-05a–c; RNF-03.

### T-32 — Manter a unidade no estado do hook

- **Descrição:** Adicionar estado de unidade iniciado em Celsius e preservado
  entre seleções durante a montagem da página.
- **Critérios de aceite:**
  - A unidade inicial é Celsius e a ação de mudança não chama serviços.
  - Mudança de cidade preserva unidade; desmontar e montar novamente retorna a
    Celsius.
  - Mudança de unidade durante consulta aplica-se aos dados quando chegarem.
- **Dependências:** T-27.
- **Arquivos prováveis:** `src/hooks/useWeatherSearch.ts`
- **Tipo:** Data
- **Rastreabilidade:** RF-05; CA-05a–c.

### T-33 — Conectar unidade à página e aos cartões

- **Descrição:** Passar unidade e ação do hook ao controle e aos componentes de
  clima.
- **Critérios de aceite:**
  - Alternar unidade atualiza temperatura atual, mínima e máxima.
  - Trocar unidade não inicia consulta meteorológica.
  - A página não mantém uma segunda cópia da unidade.
- **Dependências:** T-24, T-26, T-29, T-30, T-32.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-05; CA-05a–c.

### T-34 — Criar a apresentação de estados e mensagens

- **Descrição:** Implementar componente de mensagem para loading, vazio e erro.
- **Critérios de aceite:**
  - Loading e ausência de resultados usam semântica de status; erro usa alerta.
  - Mensagens distinguem falha de rede/API, timeout e resposta inválida em
    pt-BR.
  - Erro pode apresentar ação de retry acessível sem guardar lógica de retry no
    componente.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/StatusMessage.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-07; CA-07a–c; RNF-01, RNF-03–04, RNF-07.

### T-35 — Testar mensagens de estado

- **Descrição:** Verificar semântica, textos e callback de retry do componente.
- **Critérios de aceite:**
  - Testes cobrem loading, vazio e erro com os roles apropriados.
  - Erros de rede, API, timeout e resposta inválida resultam em mensagens
    distintas.
  - Retry aciona somente o callback fornecido.
- **Dependências:** T-34.
- **Arquivos prováveis:** `tests/unit/StatusMessage.test.tsx`
- **Tipo:** Test
- **Rastreabilidade:** RF-07; CA-07a–c; RNF-03.

### T-36 — Conectar estados e retry à página

- **Descrição:** Ligar os estados de busca e clima às mensagens e ações de
  recuperação.
- **Critérios de aceite:**
  - Loading, vazio e erros de busca/clima são mostrados na região correta.
  - Retry de busca repete o termo submetido; retry de clima repete a localidade
    selecionada.
  - Loading é renderizado no início da ação; após falha, controles de edição e
    recuperação permanecem disponíveis.
- **Dependências:** T-12, T-27, T-34.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-07; CA-07a–c; RNF-03–04, RNF-07.

## Entrega 6 — Responsividade e validação integrada

### T-37 — Ajustar responsividade da busca

- **Descrição:** Ajustar formulário e resultados para telas estreitas e nomes
  extensos.
- **Critérios de aceite:**
  - Formulário e opções permanecem utilizáveis em 320, 375 e 768 px.
  - Não produzem rolagem horizontal do documento em larguras de 320 a 1920 px.
  - Controles têm alvos de toque de pelo menos 44 × 44 CSS px e foco visível.
- **Dependências:** T-06, T-08.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`,
  `src/components/LocationResults.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-06; CA-06; RNF-02–03.

### T-38 — Ajustar responsividade dos cartões meteorológicos

- **Descrição:** Ajustar cartões atuais e diários sem perda de campos em
  viewports suportados.
- **Critérios de aceite:**
  - Cartões permanecem legíveis e utilizáveis de 320 a 1920 px, com rolagem
    vertical quando necessária.
  - Não produzem rolagem horizontal do documento, inclusive com valores e
    localidades longos.
  - Alvos de toque e foco atendem aos requisitos de acessibilidade.
- **Dependências:** T-23, T-25, T-30.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`,
  `src/components/DailyForecast.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-06; CA-06; RNF-02–03.

### T-39 — Ajustar layout responsivo da página

- **Descrição:** Ajustar composição e espaçamento do shell da página em
  viewports desktop e mobile.
- **Critérios de aceite:**
  - Busca, mensagens, cartões, controle de unidade e atribuição cabem de 320 a
    1920 px sem rolagem horizontal do documento.
  - Fluxo de conteúdo permanece disponível por rolagem vertical.
  - Nenhum controle perde foco visível ou área mínima de toque.
- **Dependências:** T-03, T-33, T-36, T-37, T-38.
- **Arquivos prováveis:** `src/App.tsx`
- **Tipo:** UI
- **Rastreabilidade:** RF-06; CA-06; RNF-02–03.

### T-40 — Testar o fluxo principal integrado

- **Descrição:** Validar busca, seleção, consulta atual e previsão com respostas
  interceptadas.
- **Critérios de aceite:**
  - Busca com espaços externos e Unicode é enviada corretamente.
  - Seleção homônima consulta as coordenadas corretas e apresenta cidade,
    condições, horário local e exatamente cinco datas.
  - Teste usa fixtures determinísticas e não depende da API ao vivo.
- **Dependências:** T-29, T-36.
- **Arquivos prováveis:** `tests/e2e/weather-search.spec.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-01–04, RF-07–08; CA-01a–b, CA-02, CA-03a, CA-04a,
  CA-07a–b, CA-08.

### T-41 — Testar alternância de unidade integrada

- **Descrição:** Validar unidade padrão, conversões exibidas e ausência de
  consultas extras no fluxo de página.
- **Critérios de aceite:**
  - Fluxo começa em Celsius, alterna para Fahrenheit e volta a Celsius em todas
    as temperaturas.
  - Contagem de requisições comprova que alternar unidade não consulta a API.
  - Unidade persiste ao selecionar outra cidade e reinicia em Celsius após
    recarregar.
- **Dependências:** T-33.
- **Arquivos prováveis:** `tests/e2e/temperature-unit.spec.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-05; CA-05a–c.

### T-42 — Testar recuperação e concorrência integradas

- **Descrição:** Validar estados vazios, falhas, retry, respostas parciais e
  seleção concorrente ponta a ponta.
- **Critérios de aceite:**
  - Cobrem geocoding vazio, falhas de rede/HTTP e timeout, com retry explícito e
    sem repetição automática.
  - Seleção B antes da resposta de A mantém B como localidade vigente.
  - Campos e dias ausentes permanecem indisponíveis sem deslocar valores.
- **Dependências:** T-29, T-36.
- **Arquivos prováveis:** `tests/e2e/weather-recovery.spec.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-01–04, RF-07; CA-03b, CA-04b, CA-07b–d.

### T-43 — Testar responsividade e acessibilidade integradas

- **Descrição:** Verificar fluxo utilizável, semântica e dimensões em desktop e
  mobile.
- **Critérios de aceite:**
  - Fluxo de busca, seleção e unidade é exercitado em 320, 375, 768, 1024, 1440
    e 1920 px; `scrollWidth <= clientWidth`.
  - Navegação por teclado confirma foco visível e mensagens semânticas; cenário
    mobile inclui emulação de toque.
  - Fluxos essenciais rodam em Chromium, Firefox e WebKit.
- **Dependências:** T-39.
- **Arquivos prováveis:** `tests/e2e/weather-responsive.spec.ts`
- **Tipo:** Test
- **Rastreabilidade:** RF-06–08; CA-06–08; RNF-02–03, RNF-08.

### T-44 — Executar os gates de qualidade

- **Descrição:** Rodar os comandos de lint, build, testes unitários e E2E após
  integração.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build` e `pnpm test` terminam com sucesso.
  - Suíte Playwright configurada termina com sucesso.
  - Nenhum teste exige disponibilidade da Open-Meteo ao vivo.
- **Dependências:** T-40, T-41, T-42, T-43.
- **Arquivos prováveis:** Código e testes das entregas; configuração existente
  somente se necessária.
- **Tipo:** Infra
- **Rastreabilidade:** RF-01–08; CA-01a–c, CA-02, CA-03a–b, CA-04a–b,
  CA-05a–c, CA-06, CA-07a–d, CA-08; RNF-01–08.
