# Especificação de Produto — Weather App

## Overview

Aplicação web responsiva, em português do Brasil, para pesquisar cidades e
consultar condições meteorológicas atuais e previsão diária de cinco dias. A
fonte de geocodificação e meteorologia é a Open-Meteo. Não há conta, localização
automática ou persistência de dados do usuário em servidor.

O escopo da primeira versão é busca por envio explícito, seleção de localidade,
condições atuais, previsão diária, alternância Celsius/Fahrenheit e uso em
desktop e celular. A previsão inclui a data local atual da cidade e os quatro
dias locais seguintes.

## Functional Requirements

- **RF-01 — Buscar cidades:** permitir pesquisar por nome de cidade. Remover
  espaços no início e no fim, aceitar nomes Unicode (incluindo acentos,
  apóstrofos e hífens) e pesquisar somente após envio explícito. Uma consulta
  vazia não deve chamar a geocodificação. Usar a Open-Meteo Geocoding API.
- **RF-02 — Selecionar localidade:** exibir os resultados recebidos com nome da
  cidade e país, incluindo região administrativa quando fornecida. Cada opção
  deve ser selecionável e identificar uma localidade de forma inequívoca pelos
  dados de localização retornados, mesmo que os rótulos sejam iguais.
- **RF-03 — Consultar clima atual:** para a localidade selecionada, exibir
  temperatura, condição meteorológica, umidade relativa e velocidade do vento.
  Exibir também o horário de referência informado pela fonte, no fuso local da
  cidade.
- **RF-04 — Consultar previsão:** exibir cinco entradas diárias para a
  localidade selecionada: hoje no fuso local da cidade e os quatro dias locais
  seguintes. Cada entrada apresenta condição meteorológica e temperaturas
  mínima e máxima.
- **RF-05 — Alternar temperatura:** permitir alternar entre Celsius (°C) e
  Fahrenheit (°F). A unidade deve valer para todas as temperaturas atuais e
  previstas. O padrão é °C; a escolha permanece até a página ser recarregada,
  mas não precisa persistir após isso.
- **RF-06 — Usar em dispositivos móveis:** permitir concluir busca, seleção,
  consulta e alternância de unidade em viewports móveis, sem perda de conteúdo
  ou controles.
- **RF-07 — Comunicar estado e falhas:** indicar carregamento, resultados sem
  correspondência, falha e timeout. A busca ou consulta deve terminar em até
  10 segundos; após falha, permitir repetição explícita da operação.
- **RF-08 — Atribuir fonte:** identificar a Open-Meteo como fonte dos dados e
  disponibilizar um link para ela na interface.

## User Stories

- **RF-01:** Como pessoa que consulta o clima de diferentes cidades, quero
  pesquisar uma cidade pelo nome para consultar a localidade desejada.
- **RF-02:** Como pessoa que encontrou cidades homônimas, quero distinguir e
  selecionar a localidade correta para evitar consultar outra cidade.
- **RF-03:** Como pessoa que precisa saber as condições atuais, quero consultar
  os dados e seu horário de referência para decidir como me preparar.
- **RF-04:** Como pessoa que planeja os próximos dias, quero consultar a
  previsão diária de cinco dias para antecipar as condições esperadas.
- **RF-05:** Como pessoa que prefere Fahrenheit, quero alternar a unidade para
  interpretar as temperaturas na unidade que prefiro.
- **RF-06:** Como pessoa que usa um celular, quero acessar as funções principais
  em uma interface adaptada para consultar o clima em mobilidade.
- **RF-07:** Como pessoa aguardando uma consulta ou diante de uma falha, quero
  entender o estado e poder tentar novamente para continuar a tarefa.
- **RF-08:** Como pessoa que consulta dados meteorológicos, quero saber a fonte
  dos dados para entender sua procedência.

## Traceability Matrix

| User Story | Acceptance Criteria | Relevant Non-Functional Requirements |
|---|---|---|
| RF-01 — Buscar cidades | CA-01a, CA-01b, CA-01c | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07, RNF-08 |
| RF-02 — Selecionar localidade | CA-02 | RNF-01, RNF-02, RNF-03, RNF-06, RNF-07, RNF-08 |
| RF-03 — Consultar clima atual | CA-03a, CA-03b | RNF-01, RNF-02, RNF-03, RNF-04, RNF-06, RNF-07, RNF-08 |
| RF-04 — Consultar previsão | CA-04a, CA-04b | RNF-01, RNF-02, RNF-03, RNF-04, RNF-06, RNF-07, RNF-08 |
| RF-05 — Alternar temperatura | CA-05a, CA-05b, CA-05c | RNF-01, RNF-02, RNF-03, RNF-08 |
| RF-06 — Usar em dispositivos móveis | CA-06 | RNF-02, RNF-03, RNF-08 |
| RF-07 — Comunicar estado e falhas | CA-07a, CA-07b, CA-07c, CA-07d | RNF-01, RNF-02, RNF-03, RNF-04, RNF-07, RNF-08 |
| RF-08 — Atribuir fonte | CA-08 | RNF-01, RNF-03, RNF-08 |

## Acceptance Criteria

- **CA-01a (RF-01)**
  - **Given** o campo de busca está disponível
  - **When** o usuário envia um nome com espaços externos
  - **Then** a consulta enviada à geocodificação contém o nome sem os espaços
    externos e os resultados recebidos são apresentados como opções
- **CA-01b (RF-01)**
  - **Given** o usuário informou um nome com caracteres Unicode, acentos,
    apóstrofos ou hífens
  - **When** envia a busca
  - **Then** o valor da consulta, após decodificação da URL e remoção de espaços
    externos, corresponde ao texto informado e os resultados são associados à
    busca
- **CA-01c (RF-01)**
  - **Given** o campo contém apenas espaços ou está vazio
  - **When** o usuário envia a busca
  - **Then** nenhuma chamada de geocodificação é feita e a interface solicita
    um nome de cidade
- **CA-02 (RF-02)**
  - **Given** a geocodificação retorna uma ou mais localidades
  - **When** os resultados são exibidos
  - **Then** cada opção mostra nome e país e, quando fornecida, região
    administrativa
  - **When** o usuário seleciona uma opção
  - **Then** a consulta meteorológica usa as coordenadas da localidade
    selecionada, inclusive quando outra opção tem rótulo idêntico
- **CA-03a (RF-03)**
  - **Given** a consulta atual retorna temperatura, condição, umidade,
    velocidade do vento e horário de referência
  - **When** a consulta termina
  - **Then** a interface mostra a cidade, todos os campos recebidos, unidades
    especificadas e horário convertido para o fuso local informado para a cidade
- **CA-03b (RF-03)**
  - **Given** um ou mais campos da resposta atual estão ausentes ou nulos
  - **When** os dados são exibidos
  - **Then** os demais campos válidos permanecem visíveis e cada campo ausente
    é identificado como “Indisponível”, nunca como zero
- **CA-04a (RF-04)**
  - **Given** a data local da cidade é 2026-01-10 e a resposta contém dados de
    2026-01-10 a 2026-01-14
  - **When** a previsão é exibida
  - **Then** há cinco entradas nessas datas, cada uma com condição e
    temperaturas mínima e máxima
- **CA-04b (RF-04)**
  - **Given** um ou mais dias ou campos da previsão não estão disponíveis
  - **When** a previsão é exibida
  - **Then** as cinco datas permanecem na ordem local; campos ausentes são
    identificados como “Indisponível” e nenhum valor é inventado
- **CA-05a (RF-05)**
  - **Given** as temperaturas são apresentadas pela primeira vez
  - **When** a tela termina de carregar
  - **Then** todos os valores de temperatura usam °C
- **CA-05b (RF-05)**
  - **Given** a fonte retorna 0 °C e a interface apresenta temperaturas atuais
    e previstas
  - **When** o usuário seleciona °F
  - **Then** todos os valores correspondentes são apresentados como 32,0 °F
- **CA-05c (RF-05)**
  - **Given** a unidade selecionada é °F
  - **When** o usuário seleciona °C
  - **Then** todos os valores de temperatura voltam à escala Celsius, sem nova
    consulta obrigatória à fonte
- **CA-06 (RF-06)**
  - **Given** a aplicação está com dados carregados
  - **When** a viewport é testada com 320, 375, 768, 1024, 1440 e 1920 px de
    largura e o usuário completa busca, seleção e alternância de unidade
  - **Then** os controles podem ser acionados, todo o conteúdo continua
    acessível por rolagem vertical e a largura de rolagem do documento não
    excede a largura da viewport em nenhum dos tamanhos testados
- **CA-07a (RF-07)**
  - **Given** o usuário enviou uma busca ou iniciou uma consulta meteorológica
  - **When** a operação começa
  - **Then** a interface renderiza o indicador de carregamento em até 200 ms
- **CA-07b (RF-07)**
  - **Given** a geocodificação responde sem resultados
  - **When** a resposta é apresentada
  - **Then** a interface informa que nenhuma cidade foi encontrada e permite
    editar ou reenviar a consulta
- **CA-07c (RF-07)**
  - **Given** uma chamada não responde antes de completar 10 segundos ou termina
    com erro
  - **When** a operação é encerrada
  - **Then** o carregamento é removido, a interface identifica que os dados não
    puderam ser obtidos e oferece uma ação de nova tentativa
  - **And** a operação não é repetida automaticamente
  - **When** o usuário aciona nova tentativa
  - **Then** a mesma operação é repetida com a consulta ou localidade selecionada
- **CA-07d (RF-07)**
  - **Given** há uma consulta pendente para a localidade A
  - **When** o usuário seleciona a localidade B e a resposta de A chega depois
  - **Then** a interface não substitui os dados de B pelos dados de A
- **CA-08 (RF-08)**
  - **Given** a página de consulta está visível
  - **When** o usuário localiza a identificação da fonte
  - **Then** “Open-Meteo” é apresentado como link para
    `https://open-meteo.com/`

## Non-Functional Requirements

- **RNF-01 — Localização:** toda a interface, mensagens, condições
  meteorológicas e datas usam pt-BR. Datas são formatadas como `dd/MM/yyyy` e
  horários no formato de 24 horas, ambos no fuso da cidade; umidade usa % e
  velocidade do vento usa km/h.
- **RNF-02 — Responsividade:** em viewports de 320 a 1920 px, não há rolagem
  horizontal do documento. Conteúdo mais extenso pode usar rolagem vertical.
- **RNF-03 — Acessibilidade:** cumprir WCAG 2.2 nível AA. Todos os controles têm
  nome acessível, foco visível e operação por teclado; carregamento e mensagens
  de erro são anunciados semanticamente. Alvos de toque têm pelo menos 44 ×
  44 CSS px.
- **RNF-04 — Desempenho percebido:** apresentar o indicador de carregamento em
  até 200 ms após a submissão, medido do evento de ação até a renderização do
  indicador. A operação externa tem timeout de 10 segundos.
- **RNF-05 — Privacidade:** não solicitar permissão de localização, não exigir
  conta e não persistir consultas, localização ou preferência de unidade em
  servidor. O nome pesquisado é enviado à Open-Meteo para geocodificação.
- **RNF-06 — Segurança de transporte e conteúdo:** chamadas à Open-Meteo usam
  HTTPS. Texto retornado por busca é tratado como texto, nunca interpretado
  como HTML.
- **RNF-07 — Dependência externa:** não exigir chave de API do usuário. Falhas,
  limites ou indisponibilidade da Open-Meteo devem resultar nos estados
  definidos em RF-07, sem simular dados atualizados.
- **RNF-08 — Navegadores:** suportar as duas versões principais estáveis mais
  recentes de Chrome, Edge, Firefox e Safari, incluindo Safari no iOS e Chrome
  no Android.

## Edge Cases

- **Busca vazia ou só com espaços:** não enviar chamada; pedir nome de cidade.
- **Cidade inexistente ou geocoding sem resultados:** informar ausência de
  correspondências, preservar a consulta para edição e não buscar previsão.
- **Caracteres especiais ou Unicode:** preservar o valor digitado e transmiti-lo
  com codificação válida; não interpretar conteúdo da busca como marcação.
- **Localidades homônimas:** exibir país e região quando disponíveis; seleção
  deve usar a identidade geográfica da opção, não apenas seu rótulo.
- **Falha da API, resposta inválida ou timeout:** encerrar carregamento em até
  10 segundos, explicar a falha e permitir nova tentativa; não apresentar a
  resposta inválida como dado atual.
- **Resposta parcial:** mostrar campos válidos e marcar campos ou datas ausentes
  como “Indisponível”, sem preencher com zero ou dados de outra localidade.
- **Troca de cidade durante consulta:** somente a resposta da seleção mais
  recente pode atualizar a tela.
- **Troca de unidade durante carregamento:** dados que chegarem depois devem
  respeitar a unidade atualmente selecionada.
- **Região administrativa ausente:** mostrar nome e país sem rótulo regional
  vazio.
- **Data local diferente da data do dispositivo:** calcular e exibir o período
  de cinco dias com base no fuso horário da cidade.

## Assumptions

- A interface é uma aplicação web responsiva, não um aplicativo nativo.
- Busca ocorre por envio explícito; sugestões enquanto digita não fazem parte
  do escopo.
- As temperaturas são obtidas em Celsius e exibidas com uma casa decimal,
  arredondadas ao décimo mais próximo. Fahrenheit é calculado por
  `°F = °C × 9/5 + 32`.
- A previsão é diária; o dia inicial é a data local da cidade segundo o fuso
  retornado pela fonte.
- A unidade permanece ao selecionar outra cidade na mesma página, mas retorna
  ao padrão Celsius após recarregar.
- Dados ausentes são identificados como “Indisponível”; não se usa cache de
  dados antigos como se fossem atuais.
- O site apresenta atribuição à Open-Meteo e segue os termos vigentes do
  provedor.
- O suporte a navegadores cobre as duas versões principais estáveis mais
  recentes na data de cada lançamento.

## Risks

- **R-01 — Qualidade e disponibilidade da fonte:** cobertura, atualização,
  precisão, limites e disponibilidade dependem da Open-Meteo. Mitigação:
  identificar fonte e horário de referência e comunicar falhas.
- **R-02 — Ambiguidade de localidade:** resultados homônimos podem ter rótulos
  insuficientes. Mitigação: mostrar país/região disponíveis e selecionar pela
  localização retornada.
- **R-03 — Fuso horário:** usar o fuso do dispositivo pode deslocar a previsão
  em relação à cidade. Mitigação: usar o fuso retornado para datas e horários.
- **R-04 — Acessibilidade:** a meta WCAG requer validação manual além de testes
  automatizados. Mitigação: incluir teclado, leitor de tela e contraste no
  roteiro de validação.

## Out of Scope

- Aplicativos nativos, autenticação, contas, favoritos e dados sincronizados.
- Localização automática por GPS ou endereço IP.
- Sugestões de busca enquanto o usuário digita.
- Previsões horárias, alertas, notificações, mapas, radar e histórico climático.
- Idiomas além de pt-BR.
- Persistência de preferência após recarregar a página.
- Alternância de unidades que não sejam temperatura.
- Garantias próprias de precisão ou disponibilidade dos dados meteorológicos.

## Open Questions

1. Quais metas de disponibilidade e atualização da fonte são necessárias para
   o lançamento, e os termos/limites atuais da Open-Meteo atendem ao uso
   previsto? Confirmar antes do lançamento.
2. Há requisitos legais ou de produto para política de privacidade, retenção de
   logs ou aviso específico sobre o envio da busca à Open-Meteo? Confirmar com
   as áreas responsáveis antes do lançamento.

