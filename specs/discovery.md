# Discovery — Aplicação de previsão do tempo

## Contexto

A empresa solicitou uma aplicação para que usuários consultem informações
meteorológicas de cidades. O briefing estabelece cinco capacidades esperadas:
buscar cidades, consultar o clima atual, visualizar a previsão de cinco dias,
alternar unidades de temperatura e usar a aplicação em dispositivos móveis.

Esta análise organiza o que foi informado e destaca decisões ainda necessárias
antes da especificação detalhada. O briefing não define fonte de dados,
plataformas móveis suportadas, critérios de qualidade mensuráveis nem regras de
interação para a busca e a previsão.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário busque uma cidade.
- **RF-02 — Consultar clima atual:** apresentar as condições meteorológicas
  atuais da cidade escolhida.
- **RF-03 — Consultar previsão:** apresentar a previsão do tempo para os
  próximos cinco dias da cidade escolhida.
- **RF-04 — Alternar unidade de temperatura:** permitir alternar entre Celsius
  (°C) e Fahrenheit (°F) na apresentação das temperaturas.
- **RF-05 — Usar em dispositivos móveis:** disponibilizar as funcionalidades
  da aplicação em dispositivos móveis.

## Requisitos Não-Funcionais

- **RNF-01 — Compatibilidade móvel:** a interface deve ser utilizável em
  dispositivos móveis; dimensões de tela, sistemas operacionais e navegadores
  suportados ainda precisam ser definidos.
- **RNF-02 — Usabilidade:** os recursos principais — busca, consulta do clima e
  alternância de unidade — devem ser compreensíveis e operáveis pelo usuário.
  Critérios de usabilidade específicos ainda não foram definidos.

## Riscos

- **R-01 — Busca ambígua:** cidades com nomes iguais ou semelhantes podem levar
  o usuário a consultar a localidade errada se os resultados não forem
  diferenciados.
- **R-02 — Qualidade e disponibilidade dos dados:** a aplicação depende de uma
  fonte de dados meteorológicos; cobertura, atualização, precisão e
  disponibilidade dessa fonte não foram estabelecidas.
- **R-03 — Interpretação da previsão:** “cinco dias” pode significar dias
  corridos, dias a partir de hoje ou cinco períodos completos de previsão.
- **R-04 — Experiência móvel indefinida:** sem delimitar dispositivos e
  navegadores, não há critério objetivo para validar a compatibilidade móvel.
- **R-05 — Expectativas sobre as unidades:** não está definido se a alternância
  afeta apenas temperaturas ou também outras grandezas meteorológicas.

## Perguntas em Aberto

1. Como a busca deve funcionar: correspondência por nome, sugestões enquanto o
   usuário digita, busca por país/região ou outro mecanismo?
2. Como o usuário escolhe entre cidades com nomes iguais ou semelhantes? Quais
   informações de desambiguação devem ser exibidas?
3. Quais requisitos de cobertura geográfica, atualização, precisão e
   disponibilidade se aplicam à Open-Meteo?
4. Quais informações devem compor o “clima atual” e a previsão diária?
5. A previsão deve ser diária ou apresentar períodos/horários?
6. A alternância de unidade vale apenas para temperatura ou também para outras
   grandezas? A preferência deve persistir entre visitas ou dispositivos?
7. Quais dispositivos, tamanhos de tela, sistemas operacionais e navegadores
   móveis precisam ser suportados?
8. Há requisitos de acessibilidade, localização automática ou funcionamento em
   condições de conectividade limitada?
9. Quais metas mensuráveis de desempenho, disponibilidade e atualização dos
   dados são esperadas?

## Decisões

- **Fonte de dados — Open-Meteo, sem API key.** Justificativa: adota uma fonte
  definida sem exigir credenciais de API. Resolve a pergunta sobre qual
  provedor será usado; cobertura, atualização, precisão e disponibilidade
  esperadas ainda precisam ser especificadas.
- **Previsão de cinco dias — hoje mais os quatro dias seguintes.** Justificativa:
  define o intervalo que a expressão “cinco dias” representa. Resolve se o dia
  atual está incluído; o nível de detalhe (diário ou por períodos/horários)
  continua em aberto.
- **Unidade padrão — Celsius (°C).** Justificativa: estabelece a unidade inicial
  apresentada ao usuário. Resolve a escolha do padrão inicial; persistência da
  preferência e unidade de outras grandezas continuam em aberto.
- **Sem autenticação e sem persistência de servidor.** Justificativa: mantém a
  experiência sem conta e evita armazenar dados de usuário no servidor. Resolve
  se haverá autenticação ou armazenamento de preferências/dados no servidor;
  persistência local no dispositivo não foi definida.
- **Idioma da interface — português do Brasil (pt-BR).** Justificativa:
  estabelece o idioma inicial da experiência. Resolve o idioma da UI; suporte a
  outros idiomas e regras de localização regional continuam em aberto.

## Suposições

- A busca permite identificar uma cidade antes de consultar seu clima; o método
  exato de seleção ainda precisa ser confirmado.
- Clima atual e previsão de cinco dias referem-se à cidade selecionada pelo
  usuário.
- A alternância Celsius/Fahrenheit aplica-se, no mínimo, aos valores de
  temperatura apresentados.
- “Usar em dispositivos móveis” implica uma interface adaptável e utilizável em
  telas móveis, mas não define por si só suporte a aplicativos nativos.
- A interface não exige conta e não persiste dados no servidor, conforme as
  decisões registradas; a persistência local de preferências ainda não foi
  definida.
- A fonte de dados definida é a Open-Meteo; modelo de monetização e requisitos
  específicos de cobertura, atualização, precisão e disponibilidade ainda
  precisam ser confirmados.
