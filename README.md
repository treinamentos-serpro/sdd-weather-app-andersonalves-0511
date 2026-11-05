<div align="center">

# SDD Weather App

### Treinamento hands-on de **Spec-Driven Development** com **GitHub Copilot**

**Brief → Spec → Plan → Tasks → Code → Test → Review → Ship**

</div>

---

Este repositório é um **laboratório de treinamento de 8 horas** que ensina a
construir software guiado por especificação (**Spec-Driven Development**) usando
o **GitHub Copilot** em todas as etapas. O projeto final é um **Weather App** em
React + TypeScript que consome a API Open-Meteo.

> ## Princípio central
> **NÃO COMECE PELO CÓDIGO.** Sempre: **Spec → Plan → Tasks → Code.**

---

## O workshop

Comece pelo **[Guia do Workshop](workshop/GUIDE.md)** e siga os módulos em ordem.

| # | Módulo | Fase | Duração |
| --- | --- | --- | --- |
| 01 | [Setup](workshop/module-01-setup/README.md) | Preparação | 30 min |
| 02 | [Understanding the Problem](workshop/module-02-discovery/README.md) | Discovery | 45 min |
| 03 | [Writing the Specification](workshop/module-03-spec/README.md) | Spec | 50 min |
| 04 | [Creating the Technical Plan](workshop/module-04-plan/README.md) | Plan | 45 min |
| 05 | [Breaking Down Tasks](workshop/module-05-tasks/README.md) | Tasks | 40 min |
| 06 | [Building the UI](workshop/module-06-ui/README.md) | Code | 60 min |
| 07 | [Integrating APIs](workshop/module-07-api/README.md) | Code | 60 min |
| 08 | [Testing](workshop/module-08-testing/README.md) | Test | 55 min |
| 09 | [Hardening](workshop/module-09-hardening/README.md) | Test | 50 min |
| 10 | [Pull Request Review](workshop/module-10-review/README.md) | Review | 45 min |
| 11 | [Delivery (GitHub Pages)](workshop/module-11-delivery/README.md) | Ship | 30 min |

Cada módulo tem **README.md**, **challenge.md**, **prompts.md** e
**solution.md**.

---

## Começando

### Pré-requisitos

- **Node.js**
- **pnpm** (único gerenciador de pacotes suportado — habilite com `corepack enable`)
- **GitHub Copilot** habilitado no VS Code
- Git e uma conta no GitHub (para PR e deploy)

> O repositório inclui um **DevContainer** com tudo pré-configurado. Abra em um
> Codespace ou em "Reopen in Container" e pule a instalação manual.

### Instalação

```bash
pnpm install
pnpm exec playwright install   # navegadores para os testes E2E
```

### Scripts

```bash
pnpm dev             # servidor de desenvolvimento (Vite)
pnpm build           # build de produção
pnpm preview         # serve o build localmente
pnpm lint            # Biome (lint)
pnpm format          # Biome (formatação)
pnpm check           # Biome (lint + formatação)
pnpm test            # testes unitários (Vitest)
pnpm test:coverage   # cobertura
pnpm test:e2e        # testes E2E (Playwright)
```

---

## Arquitetura do app

```text
src/
├── components/      # apresentação (um componente por arquivo)
│   └── states/      # loading, erro, vazio
├── hooks/           # orquestração (useWeather)
├── services/        # acesso a dados (Open-Meteo) isolado
├── lib/             # funções puras (conversão, formatação, códigos WMO)
├── types/           # contratos compartilhados
├── styles/          # Tailwind + estilos globais
├── App.tsx          # composição da tela
└── main.tsx         # bootstrap React
```

Decisões-chave:

- **Temperaturas em Celsius** internamente; conversão só na apresentação (o
  toggle °C/°F **não** faz nova requisição).
- **Rede isolada** em `services/` — componentes e hooks não conhecem URLs.
- Sempre tratar **loading**, **erro** e **vazio**.

---

## Mock para desenvolvimento da UI

Os contratos estão em [`src/types/weather.ts`](src/types/weather.ts). Para
desenvolver componentes sem consultar a API, importe o objeto tipado:

```ts
import { MOCK_WEATHER } from './mocks/weather';
```

O exemplo considera um arquivo na raiz de `src/`. O mock em
[`src/mocks/weather.ts`](src/mocks/weather.ts) contém São Paulo, clima atual e
cinco dias consecutivos, de 10 a 14/01/2026, com condições WMO variadas.
São dados fictícios e fixos, não uma previsão atualizada. Temperaturas estão em
Celsius, vento em km/h e umidade em %. Datas e horário são locais ao fuso
`America/Sao_Paulo`; o horário não tem offset nem sufixo `Z`.
Os contratos aceitam `null` nos campos meteorológicos indisponíveis.

## Busca de cidades

[`SearchBar`](src/components/SearchBar.tsx) recebe `onSearch(city: string)` e
`disabled?: boolean` (padrão `false`). O formulário envia pelo botão ou Enter,
remove espaços externos e preserva os demais caracteres. Consultas vazias
exibem orientação acessível sem disparar o callback. `disabled` bloqueia o
campo, o botão e o envio; o componente não realiza chamadas à API.

## Controle de unidade

[`UnitToggle`](src/components/UnitToggle.tsx) recebe `unit: Unit` e
`onChange(unit: Unit)`. O componente é controlado: o pai mantém a unidade e
atualiza a prop após o callback. Os botões °C/°F expõem `aria-pressed` dentro
do grupo “Unidade de temperatura”. Use Tab/Shift+Tab para navegar e
Enter/Espaço para selecionar. Selecionar a unidade já ativa não emite mudança.
O controle não converte dados nem faz requisições.

## Clima atual

[`CurrentWeather`](src/components/CurrentWeather.tsx) recebe `city`, `current`
e `unit`. O hero exibe temperatura, ícone WMO decorativo, condição em pt-BR,
umidade (%), vento (km/h), precipitação (mm), pressão (hPa) e horário local.
`current.precipitationMm` e `current.pressureHpa` são opcionais para manter
compatibilidade com dados existentes. Ausências e valores não finitos aparecem
como “Indisponível”, sem substituir por zero.

Os helpers [`temperature`](src/lib/temperature.ts) e
[`weatherCodes`](src/lib/weatherCodes.ts) podem ser reutilizados na previsão.
A temperatura é convertida só na apresentação, com uma casa decimal.
[`dateTime`](src/lib/dateTime.ts) formata a observação ISO local sem aplicar
o fuso do dispositivo. O componente não acessa a API; loading, erro e vazio
da consulta ficam a cargo da composição da tela.

## Previsão diária

[`ForecastList`](src/components/ForecastList.tsx) recebe `forecast: ForecastDay[]`
e `unit: Unit`. Use `<ForecastList forecast={MOCK_WEATHER.forecast} unit={unit} />`.
O grid usa duas colunas no mobile, três em `sm` e cinco em `lg`.
A lista preserva as datas normalizadas recebidas; lista vazia mostra
“Previsão indisponível”, sem inventar dias.

[`ForecastCard`](src/components/ForecastCard.tsx) recebe `day: ForecastDay` e
`unit: Unit`. Cada card exibe dia da semana e data, ícone decorativo, condição,
máxima, mínima e probabilidade de chuva. O helper
[`formatDay`](src/lib/format.ts) não depende do relógio ou fuso do dispositivo.
`precipitationProbability` é opcional, de 0 a 100 (%); ausências ou valores
inválidos aparecem como “Indisponível”. O mock inclui probabilidades de exemplo.
Loading e erro da consulta continuam sob responsabilidade da composição da tela.

## Estados da interface

- [`LoadingState`](src/components/states/LoadingState.tsx): `role="status"`,
  mensagem padrão de carregamento e prop opcional `message`.
- [`ErrorState`](src/components/states/ErrorState.tsx): recebe `message: string`
  e `onRetry: () => void`; anuncia a mensagem com `role="alert"` e oferece
  “Tentar novamente”, acessível por teclado, sem retry automático.
- [`EmptyState`](src/components/states/EmptyState.tsx): `role="status"` com
  título e dica; props opcionais `title` e `hint` permitem personalizar o
  estado inicial ou a ausência de resultados.

A composição escolhe o estado e fornece mensagens específicas da operação.
Os componentes não fazem requisições nem alteram o foco automaticamente.

## Stack

- **TypeScript** (strict) · **React** · **Vite**
- **Tailwind CSS** (tema dark glassmorphism)
- **Vitest** + **Testing Library** (unit) · **Playwright** (E2E)
- **Biome** (lint + formatação)
- **pnpm** (gerenciador de pacotes)
- **Open-Meteo** (geocoding + forecast, sem API key)

---

## Copilot no fluxo SDD

A pasta `.github/` traz a inteligência do laboratório:

- **`agents/`** — personas especializadas: Spec, Plan, Task, Code, Test, Review.
- **`prompts/`** — prompts de produção para cada etapa.
- **`instructions/`** — convenções (React, Tailwind, Testing) aplicadas
  automaticamente.
- **`workflows/`** — CI (lint/build/test/e2e), deploy no Pages e validações que
  **impõem a ordem Spec → Plan → Tasks**.

Veja [AGENTS.md](AGENTS.md) para a descrição de cada agente.

---

## Idioma

- Narrativa, comentários e documentação: **pt-BR**.
- Identificadores de código, nomes de arquivos e termos técnicos: **en-US**.

---

<div align="center">

Construído com ❤️ para capacitar times em **Spec-Driven Development** usando o poder do GitHub Copilot.

</div>
