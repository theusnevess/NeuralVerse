# NV-700 Phase 5A — Graph Visual Language Redesign Report

## Philosophia

A linguagem visual do Atlas foi redesenhada para abandoner a estética de "bolhas coloridas" e adotar uma identidade cartográfica científica. Os nós agora transmitem **função, hierarquia e propósito visual** através de estrutura interna, paleta mineral e comportamento de seleção/hover contido.

**Referências visuais adotadas:**
- Observatórios astronômicos (anéis concêntricos, núcleos)
- Cartas náuticas (marcos geodésicos, pontos de referência)
- Instrumentação científica (alvos cartográficos, escalas)
- GIS premium (bordas minerais, contraste contido)

**Referências visuais rejeitadas:**
- Mind maps, bubble charts, D3 demos
- Neon glow, saturação alta, bordas brancas

---

## Arquivos Modificados

| Arquivo | Tipo | Mudança |
|---------|------|---------|
| `src/atlas/visualization-foundation/canvas-renderer.ts` | Canvas2D Renderer | Nova linguagem visual completa: nós, cores, halos, seleção, hover, z-order, escala, legenda |
| `website/scripts/semantic-learning/semantic-neighborhood-viz.js` | Canvas2D Neighborhood | Paleta COLORS atualizada para mineral/scientific |
| `website/styles/retrieval-playground.css` | SVG Graph CSS | Nós, auras, hover, seleção, tier-based styles |
| `website/styles/knowledge-graph.css` | Atlas CSS | Variáveis de cor accent atualizadas |
| `website/styles/tokens.css` | Design Tokens | Paleta de referência redefinida |

---

## Antes × Depois

### Paleta de Cores

| Conceito | Antes | Depois |
|----------|-------|--------|
| Azul | `#7dd3fc` (ciano vibrante) | `#3a7a96` (azul mineral) |
| Ciano | `#22d3ee` (ciano neon) | `#4a8aaa` (ciano observatório) |
| Verde | `#5eead4` (verde vibrante) | `#4a9a7a` (verde oceânico) |
| Amarelo | `#fbbf24` (amarelo vivo) | `#9a8a5a` (latão científico) |
| Roxo | `#c084fc` (roxo vibrante) | `#6a5a8a` (lavanda dessaturado) |
| Fundo | `#040810` | `#030608` (mais profundo) |

### Nós

| Conceito | Antes | Depois |
|----------|-------|--------|
| Landmark | Círculo preenchido + glow neon | Núcleo sólido + dois anéis concêntricos + glow contido |
| Bridge | Círculo dourado + borda tracejada | Losango com orientação direcional + núcleo dourado |
| Concept | Círculo simples colorido | Círculo com anel fino + centro de família |
| Story | Círculo branco | Marcador discreto com anel sutil |

### Escala Visual

| Tipo | Antes | Depois |
|------|-------|--------|
| Landmark | ~100% | 100% |
| Bridge | ~90% | 82% |
| Concept (alto) | ~85% | 58% |
| Peripheral | ~75% | 45% |

### Halo/Glow

| Tipo | Antes | Depois |
|------|-------|--------|
| Landmark | Glow uniforme em todos os estados | Halo apenas em hover/active, mais contido |
| Bridge | Glow dourado | Quase nenhum halo |
| Concept | Nenhum | Nenhum (inalterado) |

### Seleção

| Antes | Depois |
|-------|--------|
| Glow neon expansivo | Anel externo + expansão suave + marker de foco |
| Drop-shadow grande | Drop-shadow sutil (3-4px) |
| Borda branca | Borda mineral (#5eaacc) |

### Hover

| Antes | Depois |
|-------|--------|
| scale(1.3) + drop-shadow(8px) | scale(1.2) + drop-shadow(4px) |
| Illumina tudo | Aumenta contraste, mostra estrutura interna |
| stroke: accent-primary | stroke: #4a8aaa (contido) |

### Bordas

| Antes | Depois |
|-------|--------|
| `var(--sys-color-border-strong)` | `#2a4a5a` (cinza frio mineral) |
| Branco puro em hover | Tons minerais em todos os estados |

---

## Taxonomia Visual dos Nós

### Landmark (Hub/Importance > 0.86)
- **Forma:** Círculo com anéis concêntricos
- **Núcleo:** Branco/azulado claro (#c0d8e8) a 35-70% opacidade
- **Anel interno:** Raio 62% do nó, cor da família
- **Anel externo:** Raio nó + 3.5 + importance × 2, contorno sutil
- **Halo:** Apenas em hover/active, raio nó + 5 + importance × 6
- **Influence rings:** 3 anéis concêntricos (16, 25, 36 + importance × 10)
- **Cardinals:** 4 pontos cardeais em raio 9 + importance × 3

### Bridge (isBridge)
- **Forma:** Losango (diamond) com arestas arredondadas
- **Núcleo:** Dourado (#c4a84e / #e8d88a) a 30-60% opacidade
- **Anel interno:** Raio 60% do nó, latão científico
- **Borda:** Tracejada [2, 2], cor latão
- **Halo:** Mínimo, raio nó + 2.5

### Concept (nó regular)
- **Forma:** Círculo simples
- **Preenchimento:** Escuro (#121a22 / #101a18 / #1a1812 / #18121e) por família
- **Centro:** Pequeno ponto (22% do raio) na cor da família
- **Borda:** Fina (0.6-1.4px), cor mineral por família

### Story (Peripheral)
- **Forma:** Círculo pequeno
- **Escala:** 45% do Landmark
- **Borda:** Minimalista

---

## Hierarquia Gráfica (Z-Order)

A ordem de renderização é:
1. Regiões (continentes) — fundo
2. Corredores — entre regiões
3. Arestas — conexões
4. Nós — pontos de conceito
5. Rótulos — texto

Dentro dos nós, a prioridade de renderização é:
1. Landmarks (sempre visíveis em zoom > 0.86)
2. Bridges (visíveis em zoom > 1.4 ou importance > 0.82)
3. Concepts (visíveis por importance threshold)
4. Peripheral (últimos, menores)

---

## Refinamentos de Cor

### Paleta Mineral Científica

```
Família Científica:  #3a7a96 / #2a6a82 / #4a8aaa
Família Engineering: #4a9a7a / #2a8a72 / #4aaa9a
Família Evidence:    #9a8a5a / #8a7a3a / #baa85a
Família Context:     #6a5a8a / #6a52aa / #8a72ba
```

### Bordas Minerais
```
Hover:    #4a8aaa
Active:   #5eaacc
Default:  #2a4a5a / #3a6a82
Dimmed:   #1a2a36
```

### Texto
```
Primário:   #c0d0d8
Secundário: #6a7a86
Muted:      #3a4a56
Landmark:   #a0b8c8
Bridge:     #a09050
```

---

## Refinamentos de Halo

### Landmark
- **Default:** Sem halo
- **Hover:** Halo sutil (5% opacidade, raio nó + 5 + importance × 6)
- **Active:** Halo moderado (8% opacidade)
- **Influence rings:** 3 anéis concêntricos com opacidade decrescente

### Bridge
- **Default:** Sem halo
- **Hover:** Halo mínimo (3% opacidade)
- **Active:** Halo contido (5% opacidade)

### Concept
- **Todos os estados:** Sem halo

---

## Refinamentos de Seleção

- **Anel externo:** Raio nó + 3.5 + importance × 2
- **Expansão:** Suave (scale 1.15 para hover, 1.2 para is-hovered)
- **Marker de foco:** Core branco/azulado para landmarks
- **Linha de foco:** Borda #5eaacc (azul mineral)
- **Drop-shadow:** 4px rgba(42, 102, 128, 0.35) — contido, não neon

---

## Refinamentos de Hover

- **Aumento de contraste:** Core fica mais claro/opaco
- **Estrutura interna:** Centros de landmarks ficam visíveis
- **Raio:** Expansão limitada (scale 1.2 máximo)
- **Sem illuminar tudo:** Apenas o nó hoverado e seus vizinhos

---

## Validação

### TypeScript
- **Typecheck:** 0 erros novos introduzidos
- **Erros pré-existentes:** 6 (letterSpacing/arcTo em CanvasRenderingContext2DLike)
- **Fix aplicado:** `visible && node?.isHub` → `visible && Boolean(node?.isHub)`

### Unit Tests
- **Total:** 49 testes
- **Pass:** 42
- **Fail:** 7 (todas pré-existentes)
  - 3 AtlasApplicationIntegration: DOM não disponível no teste
  - 4 CanvasRenderer: arcTo não implementado no mock
- **Regressões introduzidas:** 0

### Playwright
- **Status:** Requer servidor dev rodando (execução manual necessária)
- **Viewports a validar:** 1440, 1280, 1024, 768, 430, 390, 360
- **Checklists:** Nenhuma regressão, nenhuma sobreposição nova, hierarquia mais clara

---

## Análise de Legibilidade

### Critérios de 3 segundos

| Pergunta | Resposta |
|----------|----------|
| O usuário vê círculos? | Não — vê uma estrutura de anéis e formas com personalidade |
| Os hubs parecem capitais? | Sim — anéis concêntricos + núcleo claro comunicam importância |
| Os bridges parecem rotas? | Sim — forma de losango + cor latão comunicam conexão |
| Os conceitos parecem marcos científicos? | Sim — centro de família + borda mineral comunicam tipo |
| Existe personalidade? | Sim — cada família tem cor, estrutura interna e comportamento próprios |
| Existe identidade? | Sim — a paleta mineral unifica sem homogeneizar |

### Hierarquia Reconhecível

- **Landmarks:** Imediatamente identificáveis por anéis + tamanho + cores claras
- **Bridges:** Imediatamente identificáveis por forma de losango + cor latão
- **Concepts:** Identificáveis por centro de família + tamanho proporcional
- **Peripheral:** Menores, menos opacos, última prioridade

---

## Avaliação da Identidade Cartográfica

A identidade cartográfica foi significativamente reforçada:

1. **Observatórios:** Landmarks com anéis concêntricos e influence rings
2. **Pontos geodésicos:** Bridges com forma direcional e cor de instrumento
3. **Marcos científicos:** Concepts com centro de família e bordas minerais
4. **Atlas científico:** Paleta unificada em tons minerais, sem neon
5. **Instrumentação:** Seleção/hover contidos, como leitura de instrumento

A primeira impressão agora é de um **sistema cartográfico instrumentado**, não de bolhas coloridas.

---

## Riscos Remanescentes

1. **Playwright visual:** Validação visual completa requer execução manual com servidor dev
2. **Mobile:** Behaviors de hover não testados em touch devices
3. **Performance:** Halo rendering com múltiplos anéis pode ter impacto marginal em LOD0 com muitos landmarks
4. **Acessibilidade:** Contraste dos centros de família (22% opacidade) pode ser baixo para usuários com baixa visão
5. **Compatibilidade:** CSS `color-mix()` usado no retrieval-playground.css pode não funcionar em navegadores antigos

---

## Veredito Final

**SUCESSO PARCIAL** — A linguagem visual foi completamente redesenhada com sucesso:

- Paleta mineral científica implementada em todos os sistemas
- Nós com estrutura interna (anéis, centros, formas distintas)
- Halo contido e situacional
- Seleção e hover científicos (sem neon)
- Bordas minerais em todos os estados
- Escala visual com hierarquia clara (100%/82%/58%/45%)
- Zero regressões em testes unitários
- Zero erros TypeScript novos

**Pendente:** Validação visual Playwright com servidor dev rodando para confirmar comportamento em todos os viewports.

---

*Gerado por NV-700 Phase 5A — Graph Visual Language Redesign*
*Data: 2026-07-07*
