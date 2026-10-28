# Acessibilidade — 28 de outubro de 2026

## Base e escopo

Branch local: `codex/acessibilidade-leitores-de-tela`, criada a partir de
`codex/melhorias-mobile`, commit `4ad2fb0`. O PR
https://github.com/sasteu/site-mundos-sonoros/pull/1 estava **aberto** na consulta
feita pelo Chrome. Portanto, este trabalho depende das melhorias desse PR.
A `main` permaneceu em `49b16aaac84564b9d13a5c63d9b4e127954ffce1`.
Não houve push, novo PR ou merge.

## Mudanças

- Apresentação única de “A reforma da natureza”, seguida de lista ordenada com
  os 11 capítulos. Links continuam funcionando sem JavaScript na página inicial.
- Ilustrações de ambientação e capas que repetem o texto dos links têm `alt=""`.
  Os ícones de redes sociais conservam o nome do destino como alternativa textual.
- Preservados o link de pular ao conteúdo, regiões e títulos, cores,
  ilustrações e pontos de quebra responsivos. Mantida a ordem natural do DOM.
  O foco visível cobre todos os elementos focáveis; o contêiner do iframe também
  recebe destaque quando o foco está dentro dele.
- Player identificado por livro e capítulo, instrução de teclado, links com número
  do capítulo de destino, retorno à lista após o player e limites sem links inválidos.
  Ausência de capítulo mostra orientação e não expõe iframe vazio.
- Histórico guarda somente o ID do último capítulo acessado neste navegador,
  não o tempo do áudio nem uma confirmação de que foi ouvido. O texto explica isso.
  Histórico inválido ou ausente oculta o atalho; armazenamento indisponível não
  interrompe o player. Retorno pelo cache de navegação atualiza o atalho.
- YouTube preservado, sem playlist no iframe e com `autoplay=0`. Não há voz
  automática nem widget de acessibilidade.

## Verificações executadas

`node --test`: quatro testes passaram, cobrindo os 11 destinos e seus vizinhos,
limites do primeiro e último, capítulo ausente/inválido, histórico ausente,
inválido, persistência, atualização ao voltar e exceções de leitura/escrita.
Esses testes usam um DOM simulado; não executam o YouTube nem demonstram
acessibilidade em navegador ou leitor de tela.

`node --check` nos três scripts e `git diff --check`: passaram.
O comando `npm` não estava no PATH da sessão; executado diretamente o mesmo
comando Node configurado em `npm test`.

Inspeção do código: lista nativa `ol/li`, títulos h1/h2/h3, links nomeados,
ausência de tabindex positivo e de autoplay. Não equivale a inspeção da árvore
de acessibilidade renderizada nem a teste real com leitor de tela.

## Limitações observadas

As tentativas de abrir a prévia local no Chrome em localhost:3000 e
127.0.0.1:3001 retornaram `ERR_CONNECTION_TIMED_OUT`. A automação nativa
encerrou o acesso ao navegador porque não conseguiu confirmar a URL atual.
O PR pôde ser consultado, mas a página local não pôde ser inspecionada.

Por isso, **não foram confirmados** reprodução/pausa por teclado, nomes e ordem
dos controles internos do YouTube, foco renderizado, navegação por teclado da
página, layout em celular, zoom ou ausência de rolagem horizontal. O bloqueio
observado é do ambiente de teste, sem evidência de bloqueio de acessibilidade
do player. Não foi proposta substituição.

Não foi encontrado NVDA nas pastas padrão verificadas nem processo ativo de
NVDA/Narrador. Não houve teste com NVDA, TalkBack, VoiceOver ou pessoa cega.

## Validação manual pendente

1. Com teclado, usar Tab desde o início: pular ao conteúdo, escolher um capítulo,
   entrar no iframe, iniciar com Enter/Espaço e pausar. Percorrer controles internos
   com Tab e Shift+Tab, sair do iframe, avançar e voltar à lista sem prender foco.
2. Confirmar com NVDA/Chrome e com pessoa cega os anúncios de títulos, regiões,
   lista de 11 itens, links, identificação do iframe, controles e estados de pausa.
   Repetir o fluxo no TalkBack/Android ou VoiceOver/iOS.
3. Testar primeiro, intermediário e último capítulos; URL sem `v` e com `v`
   inválido; navegador sem histórico, com histórico e com armazenamento bloqueado.
   O áudio deve aguardar uma ação e o atalho deve identificar apenas o capítulo.
4. Em 320, 375, 430 e 1280 px, verificar foco visível, alvos de toque, mudança de
   orientação, leitura a 200%/400% e `scrollWidth <= clientWidth`. Conferir lista,
   player e erros, inclusive com histórico visível. Repetir em aparelho real.
