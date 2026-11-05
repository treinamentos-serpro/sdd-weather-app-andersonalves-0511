# Plano Técnico — Weather App

Este plano deriva da especificação em [weather-app-spec.md](../specs/weather-app-spec.md). Os requisitos RF, critérios CA e RNF citados abaixo são rastreáveis a essa fonte.

## Architecture

Aplicação cliente React, organizada em apresentação, estado de interface e serviços HTTP. A UI não conhece o formato bruto das respostas externas: os serviços validam e convertem os dados da Open-Meteo para os contratos internos.

```text
Busca e seleção ──> hook de consulta ──> serviço de geocodificação ──> Open-Meteo
                           │
                           └──────────> serviço de previsão ─────────> Open-Meteo
                           │
                           └──────────> estado da página ───────────> componentes
```

- Busca explícita por envio, apresentação das localidades e seleção (RF-01, RF-02).
- Consulta de condições atuais e cinco dias de previsão para as coordenadas selecionadas (RF-03, RF-04).
- Conversão de unidade apenas na apresentação; os valores internos permanecem em Celsius (RF-05).
- Interface responsiva, localizada em pt-BR, acessível por teclado e com atribuição da fonte (RF-06, RF-08; RNF-01 a RNF-03).

## Tech Stack

- **TypeScript strict, React e Vite:** stack definida pelo projeto; tipos e componentes simples para a aplicação cliente.
- **Tailwind CSS:** estilos responsivos e tema do produto, preservando controles acessíveis e alvos de toque de pelo menos 44 × 44 CSS px.
- **Fetch API:** chamadas HTTPS sem chave de usuário; `AbortController` para timeout e cancelamento.
- **Vitest e Testing Library:** testes unitários e de componentes; **Playwright** para fluxos e viewports reais.
- **Biome:** lint e formatação conforme configuração existente.

Não introduzir biblioteca de estado, cliente HTTP ou camada de cache: o escopo cabe nos recursos nativos da plataforma e no estado React.

## Project Structure

Estrutura proposta, alinhada às convenções existentes:

```text
src/
  components/
    SearchForm.tsx
    LocationResults.tsx
    CurrentWeather.tsx
    DailyForecast.tsx
    TemperatureUnitToggle.tsx
    StatusMessage.tsx
    SourceAttribution.tsx
  hooks/
    useWeatherSearch.ts
  services/
    geocodingService.ts
    weatherService.ts
  types/
    weather.ts
  utils/
    temperature.ts
    weatherCode.ts
tests/
  unit/
  e2e/
```

Componentes cuidam da renderização e interação; o hook coordena estados e operações; serviços fazem requisições e normalização; tipos e utilitários mantêm os contratos e conversões compartilhados. Localizar os testes seguindo a organização já adotada pelo repositório, sem duplicar convenções.

## Data Model

Contratos internos sugeridos. Valores numéricos de clima são anuláveis para representar campos ausentes sem convertê-los em zero (CA-03b, CA-04b).

```ts
type TemperatureUnit = "celsius" | "fahrenheit";

interface Location {
  id?: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface CurrentConditions {
  temperatureC: number | null;
  weatherCode: number | null;
  relativeHumidity: number | null;
  windSpeedKmh: number | null;
  observedAtLocal: string | null;
}

interface DailyForecast {
  date: string; // Data local ISO yyyy-MM-dd
  weatherCode: number | null;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
}

interface WeatherReport {
  location: Location;
  timezone: string;
  current: CurrentConditions;
  forecast: DailyForecast[]; // Exatamente cinco datas locais, em ordem
}
```

Resultados da busca são identificados por identidade geográfica — coordenadas e, quando disponível, o ID da fonte — e não pelo texto do rótulo. `admin1` é opcional; não renderizar região vazia. `weatherCode` é interpretado por um mapeamento local de códigos WMO para rótulos em pt-BR, com fallback explícito de indisponibilidade para códigos não reconhecidos. Valores de temperatura permanecem em Celsius e são arredondados a uma casa decimal depois da conversão para exibição.

## Data Flow

1. A pessoa envia a busca. Remover espaços externos; se ficar vazia, mostrar orientação e não chamar o serviço (RF-01, CA-01a–c).
2. O hook ativa o estado de carregamento e solicita localidades ao serviço de geocodificação. Resultados preservam a consulta associada e são exibidos como texto, sem interpretar HTML (CA-01b, RNF-06).
3. Sem resultados, informar ausência de correspondências e manter a consulta editável (CA-07b). Com resultados, exibir nome, país e região quando disponível.
4. Ao selecionar uma opção, o serviço meteorológico usa suas coordenadas e solicita condições atuais e previsão. A resposta é normalizada no modelo interno; nenhuma consulta ocorre para resultados não selecionados (RF-02, RF-03, RF-04).
5. A previsão usa as datas locais retornadas pela API, preservando a sequência de hoje mais quatro dias. Ausências são preenchidas como campos nulos nas datas esperadas, nunca com dados inventados (CA-04a–b).
6. A UI apresenta temperaturas atuais e previstas na unidade escolhida, formata datas e horários no fuso da localidade, e mostra a atribuição Open-Meteo (RNF-01, RF-05, RF-08).

## External APIs

Todas as chamadas são HTTPS, sem chave de API. Consultas devem ser montadas com `URLSearchParams`, preservando caracteres Unicode corretamente.

- **Geocodificação:** `https://geocoding-api.open-meteo.com/v1/search`
  - Parâmetros: `name` (termo aparado), `count` (limitar quantidade de opções), `language=pt` e `format=json`.
  - Normalizar resultados para `Location`; tratar a lista ausente ou vazia como nenhum resultado.
- **Previsão:** `https://api.open-meteo.com/v1/forecast`
  - Parâmetros: `latitude`, `longitude`, `current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`, `daily=weather_code,temperature_2m_max,temperature_2m_min`, `temperature_unit=celsius`, `wind_speed_unit=kmh`, `timezone=auto` e `forecast_days=5`.
  - A resposta deve fornecer fuso e séries diárias alinhadas por índice; usar os valores `current_units` e `daily_units` para interpretar unidades da fonte e validar os campos disponíveis.

Validar status HTTP, JSON e estrutura mínima antes da normalização. Um corpo malformado não deve ser apresentado como dado atual. Campos individuais ausentes ou nulos são preservados como indisponíveis, sem descartar os demais campos válidos.

## State Management

Manter estado local React no hook que coordena a tela. Não persistir consulta, localidade ou unidade em servidor ou armazenamento do navegador.

```ts
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "empty" }
  | { status: "error"; message: string; retry: () => void };
```

O hook mantém separadamente o texto da busca, resultados, localidade selecionada, estado meteorológico e unidade. A unidade inicial é Celsius e permanece em memória até recarregar ou durante a seleção de outra cidade. O relatório canônico em Celsius permite alternar a exibição sem nova chamada. Uma identificação monotônica de operação (ou cancelamento com verificação da seleção atual) impede que uma resposta atrasada de uma localidade anterior substitua a seleção mais recente (CA-07d). O formulário continua utilizável após erro para permitir repetição explícita.

## Error Handling

- Mostrar carregamento imediatamente na submissão/início da consulta; meta de renderização em até 200 ms (CA-07a, RNF-04).
- Cada operação externa tem timeout total de 10 segundos. Cancelar a requisição ao expirar e distinguir timeout de falha de rede, resposta HTTP inválida e resposta malformada.
- Erros removem o indicador de carregamento, informam que os dados não puderam ser obtidos e oferecem nova tentativa explícita para a mesma busca ou localidade. Não repetir automaticamente (RF-07, CA-07c).
- A busca sem correspondência tem estado próprio, distinto de falha. Requisição vazia não é erro de API e não faz chamada.
- Resposta parcialmente válida mantém os campos válidos; campo atual ou previsão ausente é exibido como “Indisponível”. Não usar zero, cache antigo ou dados de outra localidade.
- Isolar erros e respostas tardias por operação/seleção. Exibir conteúdo remoto como texto, nunca HTML.

## Testing Strategy

- **Unitários (Vitest):** aparar busca e evitar chamada vazia; codificação Unicode; normalização de localização e identidade de homônimos; conversão C/F e arredondamento a uma casa; mapeamento de códigos meteorológicos; normalização de valores ausentes e dias previstos; tratamento de resposta inválida, timeout e falha HTTP.
- **Componentes (Testing Library):** estados idle/loading/empty/error/success, retry explícito, anúncios semânticos, navegação por teclado, nomes acessíveis e unidade consistente em todas as temperaturas.
- **E2E (Playwright):** busca, seleção de localidade, clima atual, cinco dias, troca de unidade sem nova consulta e atribuição Open-Meteo; simular resposta vazia, falha, timeout e respostas fora de ordem.
- **Responsividade e acessibilidade:** testar larguras 320, 375, 768, 1024, 1440 e 1920 px, sem rolagem horizontal; verificar os alvos de toque e complementar automação com revisão manual por teclado/leitor de tela e contraste (CA-06, RNF-02–03).
- Validar que o indicador aparece em até 200 ms e que requisições expiram em até 10 segundos. Testes com APIs devem usar respostas controladas, sem depender de disponibilidade externa.

## Risks & Trade-offs

- **Disponibilidade, limites e qualidade da Open-Meteo (R-01):** não há garantia própria nem dados de fallback; comunicar a fonte, horário e erros. Confirmar termos e limites antes do lançamento.
- **Localidades homônimas (R-02):** rótulos podem não bastar; mostrar país/região disponíveis e selecionar por identidade geográfica, não pelo rótulo.
- **Fuso e virada de dia (R-03):** usar `timezone=auto` e as datas locais da API, não o fuso/data do dispositivo; testar casos de diferenças de data local.
- **Acessibilidade (R-04):** automação não comprova WCAG 2.2 AA; requer validação manual de foco, leitor de tela e contraste.
- **Uma única consulta de previsão com `forecast_days=5`:** reduz chamadas e mantém dados coerentes; normalizar cuidadosamente séries diárias parciais para não inventar valores.
- **Sem cache ou persistência:** reduz risco de mostrar dados desatualizados e evita persistir preferências/dados pessoais; novas seleções podem gerar consultas repetidas.
- **Privacidade e política:** a busca é enviada à Open-Meteo e não há conta, GPS ou persistência em servidor. Antes do lançamento, confirmar requisitos legais de aviso, retenção e privacidade levantados pela spec.
