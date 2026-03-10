# Teleprompter — Especificação Funcional

## Visão Geral

O Teleprompter é uma funcionalidade da aplicação de aprendizado de línguas que permite ao usuário praticar leitura em voz alta em inglês ou tcheco. O texto pode ser gerado automaticamente pela IA com base em configurações do usuário, ou inserido manualmente. O texto rola na tela em velocidade controlada, simulando um teleprompter profissional.

---

## Fluxo Principal

```
Tela de Configuração → [Gerar com IA] → Tela de Carregamento → Tela do Teleprompter
                     → [Texto próprio] → Tela do Teleprompter (direto)
```

---

## Telas

### 1. Tela de Configuração

Ponto de entrada da funcionalidade. O usuário define todos os parâmetros antes de iniciar.

#### Idioma alvo
- Opções disponíveis: **Inglês** e **Tcheco**
- Determina o idioma em que o texto será gerado ou exibido

#### Nível de proficiência (CEFR)
- Opções: A1, A2, B1, B2, C1, C2
- Usado pela IA para calibrar vocabulário e complexidade gramatical do texto gerado
- Não afeta textos inseridos manualmente

#### Tema do texto
- Categorias pré-definidas: Viagem, Negócios, Cotidiano, Tecnologia, Saúde, Culinária, Cultura, Esportes, Ciência, Notícias
- Usado apenas na geração por IA

#### Duração estimada
- Intervalo: 30 segundos a 3 minutos
- A IA calcula a quantidade aproximada de palavras com base na duração (referência: ~130 palavras/minuto)
- Não afeta textos inseridos manualmente

#### Velocidade de rolagem
- Configurável antes de iniciar (também ajustável durante a leitura)
- Escala numérica de 10 (lento) a 120 (rápido)

#### Tamanho da fonte
- Configurável antes de iniciar (também ajustável durante a leitura)
- Intervalo: 24px a 96px

#### Família tipográfica
- Três opções: Sans-serif, Serif, Monoespaçada
- Afeta apenas a exibição no teleprompter

#### Modo espelho
- Quando ativo, o texto é exibido horizontalmente invertido
- Útil para leitura via reflexo em superfície espelhada

#### Linha guia
- Quando ativa, exibe uma linha/faixa horizontal no centro da tela
- Serve como referência visual para manter o foco de leitura

---

### 2. Modos de Texto

Na parte inferior da tela de configuração, o usuário escolhe entre dois modos:

#### Modo IA (padrão)
- A IA gera um texto inédito com base nos parâmetros configurados (idioma, nível, tema, duração)
- O texto é fluido e contínuo, adequado para leitura em voz alta
- A IA também gera uma tradução completa para o português brasileiro
- O usuário clica em **"Gerar texto com IA"** para iniciar

#### Modo Texto Próprio
- O usuário cola ou digita livremente qualquer texto
- Não há geração de tradução automática
- O botão **"Iniciar"** fica desabilitado enquanto o campo estiver vazio
- Um contador de palavras é exibido em tempo real
- As configurações de nível, tema e duração são ignoradas; apenas as de exibição se aplicam

---

### 3. Tela de Carregamento

Exibida apenas no modo IA, enquanto a requisição para a API está em andamento.

- Exibe os parâmetros selecionados (idioma, nível, tema)
- Em caso de erro na requisição, o usuário retorna à tela de configuração com uma mensagem de erro

---

### 4. Tela do Teleprompter

Tela principal de leitura. Ocupa 100% da viewport.

#### Área de texto
- O texto rola verticalmente de cima para baixo de forma contínua e suave
- A rolagem é baseada em animação por frame (requestAnimationFrame), não em scroll nativo
- O texto começa centralizado verticalmente e termina com espaço suficiente para a última linha atingir o centro
- Quando a rolagem chega ao fim, a reprodução para automaticamente

#### Barra de progresso
- Faixa horizontal no topo da tela
- Indica visualmente o percentual do texto já percorrido (0% a 100%)

#### Linha guia (quando ativa)
- Faixa horizontal centralizada na viewport
- Marca visualmente o ponto de leitura ideal

#### Modo espelho (quando ativo)
- Todo o texto é renderizado com `scaleX(-1)`

#### Painel de tradução
- Disponível apenas para textos gerados por IA
- Ativado/desativado por um botão na barra superior
- Exibido como painel flutuante sobre a área de texto, na parte inferior da tela
- Mostra a tradução completa gerada pela IA, com scroll interno próprio

#### Barra superior (top bar)
- Exibe badges com: idioma, nível e tema (ou "Texto próprio" no modo manual)
- Botão para alternar exibição da tradução
- Botão para fechar e voltar à tela de configuração (reseta a rolagem)

#### Controles inferiores (sempre visíveis)
- **⏮ Reiniciar** — volta ao início do texto e pausa
- **▶ / ⏸ Play/Pause** — inicia ou pausa a rolagem
- **↺ Novo texto** — dispara nova geração de IA (apenas modo IA; no modo manual, retorna à configuração)
- **Velocidade** — slider em tempo real (10–120), afeta imediatamente a rolagem em curso
- **Tamanho da fonte** — slider em tempo real (24px–96px), recalcula a altura total do conteúdo

---

## Geração de Texto via IA

### Prompt
A requisição enviada à API instrui o modelo a:
- Gerar um texto contínuo e natural no idioma alvo
- Adequar vocabulário e gramática ao nível CEFR selecionado
- Manter o tema escolhido
- Produzir aproximadamente `(duração_em_segundos / 60) × 130` palavras
- Não usar títulos, subtítulos ou marcadores
- Incluir uma tradução completa para o português brasileiro após o marcador `TRADUÇÃO:`

### Parsing da resposta
O texto retornado é dividido pelo marcador `TRADUÇÃO:`:
- Parte anterior → texto principal exibido no teleprompter
- Parte posterior → texto da tradução exibido no painel

### Modelo utilizado
`claude-sonnet-4-20250514`

---

## Estados da Aplicação

| Estado | Descrição |
|---|---|
| `config` | Tela de configuração inicial |
| `generating` | Aguardando resposta da API (modo IA) |
| `prompter` | Tela de leitura ativa |

---

## Comportamentos Importantes

- Fechar o teleprompter (botão ✕) **reseta a posição de rolagem e o progresso**
- Alterar velocidade ou fonte **durante a reprodução** tem efeito imediato, sem reiniciar
- No modo texto próprio, **não há tradução disponível** — o botão de tradução fica oculto
- A rolagem **não usa scroll nativo** — é calculada por delta de tempo entre frames para garantir suavidade independente do framerate
- A altura total rolável é recalculada sempre que o texto ou o tamanho da fonte muda