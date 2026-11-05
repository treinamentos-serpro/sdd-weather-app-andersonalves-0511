# Discovery: Aplicação de previsão do tempo

## Contexto

A empresa solicitou uma aplicação de previsão do tempo. Os usuários precisam pesquisar cidades, consultar o clima atual e a previsão de cinco dias, escolher entre Celsius e Fahrenheit e usar a aplicação em dispositivos móveis.

## Requisitos funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise cidades por nome.
- **RF-02 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** exibir a previsão para cinco dias.
- **RF-04 — Alternar unidade:** permitir alternar entre Celsius e Fahrenheit para as temperaturas exibidas.
- **RF-05 — Usar em dispositivos móveis:** oferecer uma interface utilizável em dispositivos móveis.

## Requisitos não funcionais

Os itens abaixo são necessidades esperadas para que as funcionalidades sejam úteis; métricas e limites ainda precisam ser definidos.

- **RNF-01 — Responsividade:** adaptar a interface a diferentes dimensões de tela, com prioridade para dispositivos móveis.
- **RNF-02 — Usabilidade:** tornar pesquisa, leitura das informações e troca de unidade claras e diretas.
- **RNF-03 — Desempenho:** responder à pesquisa e carregar os dados em tempo adequado.
- **RNF-04 — Confiabilidade:** comunicar estados de carregamento, erro e ausência de resultados, sem apresentar dados indisponíveis como atuais.
- **RNF-05 — Acessibilidade:** oferecer controles com rótulos compreensíveis e navegação por teclado.
- **RNF-06 — Atualidade dos dados:** informar a referência temporal dos dados, especialmente se houver atraso ou cache.
- **RNF-07 — Compatibilidade:** funcionar nos navegadores e dispositivos móveis definidos como suportados.

## Riscos

- **Ambiguidade na busca:** cidades com nomes iguais podem levar o usuário a selecionar a localidade errada.
- **Indisponibilidade da fonte de dados:** falhas, lentidão ou limites de uso do provedor podem impedir a consulta.
- **Dados desatualizados:** previsões sem indicação de horário de atualização podem induzir decisões com base em informação antiga.
- **Interpretação do período:** “previsão de cinco dias” pode incluir ou não o dia atual e pode representar dias civis ou intervalos de 24 horas.
- **Experiência móvel insuficiente:** informações ou controles podem ficar difíceis de ler e operar em telas pequenas.
- **Unidades inconsistentes:** algumas temperaturas podem permanecer na unidade anterior após a alternância.

## Perguntas em aberto

- A busca deve aceitar somente nomes de cidades ou também estados, países e códigos postais?
- Como distinguir cidades homônimas: país, região, população ou outro dado?
- A previsão de cinco dias inclui o dia atual? Deve ser diária, horária ou ambas?
- Quais dados devem ser exibidos além da temperatura e da condição do tempo (por exemplo, sensação térmica, precipitação e vento)?
- A unidade escolhida deve persistir entre visitas ou sessões?
- Haverá cidade padrão, localização automática ou possibilidade de salvar cidades favoritas?
- A aplicação deve oferecer algum funcionamento sem conexão ou armazenar dados recentes?
- Quais idiomas, navegadores e tamanhos de tela devem ser suportados?
- Quais são as metas de tempo de resposta e disponibilidade?
- Qual provedor de dados será utilizado e quais são seus limites e requisitos de atribuição?