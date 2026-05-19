---
name: portfolio-frontend
description: Skill universal para projetos de portfólio frontend de alta qualidade visual. Anti-AI-slop. Usa efeitos avançados, tipografia incomum, frameworks modernos, navegação variada, integração com Figma via MCP/plugin para visualização, e design totalmente distinto entre projetos.
---

# Portfolio Frontend Skill — Universal

Skill para criação de interfaces frontend de portfólio que **fogem completamente do padrão genérico de IA**. Cada projeto deve ser visualmente único, com personalidade, efeitos reais e código production-grade.

---

## 1. Filosofia de Design

Antes de escrever qualquer linha de código:

- **Direção estética única por projeto**: escolha um universo visual e execute com radicalidade. Exemplos: editorial de revista europeia, brutalist tipográfico, sci-fi terminal, art nouveau digital, motion-first minimalista, maximalism expressivo, retrofuturismo analógico, dark luxury, organic/neubrutalism, etc.
- **Anti-padrão**: NUNCA use sidebar esquerda com logo + menu. NUNCA use Inter, Roboto, Arial, Space Grotesk, ou qualquer fonte "padrão de IA". NUNCA use gradiente roxo/azul genérico. NUNCA replique o mesmo layout entre projetos.
- **O que vai ser lembrado?** Defina UMA coisa marcante por projeto: uma transição de página absurda, um cursor custom, um efeito de texto, uma grid quebrada, um scroll cinematográfico.

---

## 2. Navegação — Variações Permitidas (nunca sidebar esquerda)

Escolha ou invente variações:

| Tipo | Descrição |
|------|-----------|
| **Top bar minimalista** | Links inline, sem background, letras pequenas, posição fixa com blur no scroll |
| **Top bar fullwidth com mega-hover** | Menu que expande para fullscreen ao hover |
| **Hamburger centrado** | Ícone centralizado que abre overlay com animação de cortina |
| **Menu radial** | Abre em círculo ao redor do cursor |
| **Scroll-reveal nav** | Aparece só ao scrollar para cima |
| **Vertical top-right** | Links empilhados no canto superior direito, pequenos, rotacionados |
| **Tab bar inferior (mobile-first)** | Barra fixa embaixo, ícones + labels |
| **Dot navigation** | Bullets laterais direitos para seções, sem texto |
| **Número de seção** | Navegação por numeração estilo editorial (01, 02, 03) |
| **Invisible nav** | Sem menu visível, navegação por atalhos de teclado ou gestos |

---

## 3. Stack de Frameworks e Ferramentas

### CSS / Styling
- **Tailwind CSS v4** — utility-first, sem classes genéricas sem contexto
- **CSS custom properties** para temas coesos (`--color-primary`, `--ease-spring`, etc.)
- **CSS `@layer`** para organização de estilos
- **Animate.css** ou animações manuais com `@keyframes`

### Motion / Animação
- **GSAP** (GreenSock) — para timelines complexas, ScrollTrigger, morphSVG
- **Framer Motion** — para React, transições de página, layout animations
- **Motion One** — leve, Web Animations API nativa
- **Lenis** — smooth scroll com controle granular
- **Theatre.js** — animações de design no-code + exportáveis

### 3D / Visual
- **Three.js** + `@react-three/fiber` — cenas 3D, shaders GLSL, WebGL
- **Spline** — 3D interativo embedável sem setup pesado
- **Rive** — animações vetoriais interativas (substituto do Lottie)
- **Ogl** — WebGL leve para efeitos de distorção/ruído

### React Meta-Frameworks
- **Next.js 15** (App Router) — preferido para portfólios com SSG/ISR
- **Astro** — ideal para sites estáticos ultrarrápidos com ilhas
- **Remix** — quando há forms e interatividade server-side

### UI Components (sem defaults genéricos)
- **Radix UI** (primitivos acessíveis, sem estilo) + estilização própria
- **shadcn/ui** APENAS como base — sempre sobrescrever estilos completamente
- **Aceternity UI** — componentes com efeitos visuais avançados (spotlight, border-beam, etc.)
- **Magic UI** — animações e componentes de portfólio
- **Cult UI** — componentes minimalistas de alta qualidade

---

## 4. Tipografia — Fontes Não-Genéricas

**Regra**: nunca use Inter, Roboto, Arial, Helvetica, Space Grotesk, Poppins sozinhas.

### Display / Heading
- **Neue Montreal** — grotesca moderna com personalidade
- **Playfair Display** — serifada elegante para editorial
- **Cabinet Grotesk** — grotesca com temperamento
- **Clash Display** — geométrica forte
- **Syne** — geométrica expressiva (Google Fonts)
- **Bebas Neue** — condensada impactante
- **Editorial New** — serifada editorial italiana
- **Instrument Serif** — serifada refinada
- **Array** — display técnica/sci-fi
- **DM Serif Display** — serifada clássica com charme

### Body / UI
- **Plus Jakarta Sans** — humanista clara
- **DM Sans** — leve e legível
- **Epilogue** — grotesca com personalidade
- **Manrope** — moderna e arejada
- **General Sans** — grotesca versátil
- **Figtree** — round, amigável

### Mono / Código
- **Geist Mono** (Vercel)
- **JetBrains Mono**
- **Fira Code** com ligatures
- **Berkeley Mono** (paga, premium)

**Pairing**: sempre combinar uma display forte com body legível. Exemplo: `Clash Display` + `Epilogue`, `Playfair` + `DM Sans`, `Syne` + `Manrope`.

---

## 5. Efeitos Visuais Obrigatórios no Portfólio

Mínimo: **3 efeitos de alto impacto por projeto**. Escolha entre:

### Texto
- Texto com efeito split/reveal por letra ou palavra (GSAP SplitText ou splitting.js)
- Scramble text / glitch text ao hover
- Text stroke (apenas outline, sem fill)
- SVG text com mask em vídeo ou gradiente
- Marquee / ticker infinito com easing

### Background / Atmosfera
- **Noise texture** via SVG `<feTurbulence>` ou CSS `backdrop-filter`
- **Gradient mesh** animado com CSS `@property` ou canvas
- **Grain overlay** com mix-blend-mode
- **Aurora effect** — blobs coloridos com blur extremo e mix-blend-mode
- **Dot/grid pattern** com SVG background
- **Parallax layers** via scroll

### Hover / Cursor
- Cursor customizado (círculo magnético, seguidor com lag, shape-shift)
- Magnetic buttons (GSAP)
- Card 3D tilt (VanillaTilt.js ou CSS perspective)
- Image reveal ao hover em links
- Distorção de imagem com WebGL ao hover

### Scroll
- ScrollTrigger com pinning e scrub (GSAP)
- Horizontal scroll em seções
- Parallax de múltiplas velocidades
- Progress bar de scroll
- Números de seção que atualizam ao scroll

### Transições de Página
- Curtain wipe (div que cobre a tela e retrai)
- Morph de elemento entre páginas (Framer Motion layoutId)
- Fade + slide com easing personalizado
- Transição com logo centrada expandindo

---

## 6. Paletas de Cores — Diretrizes

**Nunca**: `#6C63FF` (roxo IA), `#00B4D8` (azul genérico), branco puro + cinza sem acento.

### Estrutura recomendada
```css
:root {
  --bg: #0a0a0a;           /* fundo primário */
  --surface: #141414;      /* cards, superfícies */
  --border: #222;          /* bordas sutis */
  --text: #e8e4dc;         /* texto principal (não branco puro) */
  --text-muted: #666;      /* secundário */
  --accent: #c8ff00;       /* acento único e forte */
  --accent-2: #ff3d00;     /* segundo acento (opcional) */
  
  /* Easing customizado */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
}
```

### Esquemas com personalidade
- **Dark + neon único**: preto profundo + verde neon / laranja elétrico / amarelo limão
- **Cream + marrom**: off-white quente + marrom escuro + accent terracota
- **White + preto + sangue**: minimalista brutal com vermelho vivo
- **Azul escuro + dourado**: premium, elegante
- **Cinza escuro + verde sage**: contemporâneo, calmante
- **Papel + tinta**: tons de creme, kraft, com preto puro

---

## 7. Layout — Regras de Grid e Composição

- **Assimetria intencional**: evite layouts perfeitamente centrados em tudo
- **Whitespace dramático**: use espaçamentos extremos (muito tight ou muito loose)
- **Overlapping elements**: sobreposição de texto e imagem com z-index
- **Full-bleed images**: imagens que sangram até a borda sem padding
- **Viewport units**: use `vw`, `vh`, `svh`, `dvh` liberalmente
- **CSS Grid avançado**: `grid-template-areas` nomeadas, `subgrid`, `masonry` (quando disponível)
- **Proporções fixas**: `aspect-ratio` para elementos consistentes

```css
/* Exemplo de grid editorial */
.editorial-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto;
  gap: clamp(1rem, 3vw, 3rem);
}
```

---

## 8. Integração com Figma via MCP/Plugin

### Workflow obrigatório para visualização
Quando o usuário tem o plugin Figma + MCP (Codex/Claude Code):

1. **Gerar código primeiro** → depois exportar para Figma para aprovação visual
2. **Ou**: criar frames no Figma via MCP antes de codar, usando como referência

### Comandos MCP Figma a usar
```
// Criar frame de componente
create_frame({ name: "Hero Section", width: 1440, height: 900 })

// Inserir elementos
create_text({ content: "Heading", fontSize: 72, fontFamily: "Clash Display" })

// Aplicar estilos
set_fill({ color: "#c8ff00" })
set_effects({ blur: 40, opacity: 0.6 })

// Exportar para visualização
export_frame({ format: "PNG", scale: 2 })
```

### Regras de uso com Figma
- Sempre nomear layers de forma semântica (não "Frame 1", "Rectangle 3")
- Criar componentes Figma para elementos reutilizáveis
- Usar Auto Layout para responsividade no Figma
- Definir variáveis de cor no Figma espelhando as CSS custom properties
- Exportar assets como SVG sempre que possível (não PNG)

---

## 9. Performance e Acessibilidade

- **Imagens**: `next/image` ou `<img loading="lazy">`, formato WebP/AVIF
- **Fontes**: `font-display: swap`, preload críticas, subset quando possível
- **Animações**: `prefers-reduced-motion` media query para desativar
- **Contraste**: mínimo WCAG AA (4.5:1 para texto normal)
- **Semântica**: HTML5 correto (`<nav>`, `<main>`, `<section>`, `<article>`)
- **Core Web Vitals**: LCP < 2.5s, CLS < 0.1, INP < 200ms

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Checklist por Projeto

Antes de entregar qualquer projeto de portfólio, verificar:

- [ ] Tipografia: usa combinação de fontes não-genéricas?
- [ ] Navegação: é diferente de sidebar esquerda? É diferente do projeto anterior?
- [ ] Cores: paleta tem acento forte e coeso? Sem roxo/azul genérico?
- [ ] Efeitos: tem mínimo 3 efeitos de alto impacto implementados?
- [ ] Motion: animações usam easing personalizado (não `ease` ou `linear`)?
- [ ] Layout: tem elemento de assimetria ou quebra de grid?
- [ ] Figma: foi gerado via MCP para visualização antes do code final?
- [ ] Responsivo: funciona bem em mobile sem perder a identidade?
- [ ] Performance: imagens otimizadas, fontes com preload?
- [ ] `prefers-reduced-motion` implementado?

---

## 11. Referências de Estética (para inspiração, não cópia)

Sites de referência com design de portfólio de alto nível:
- **awwwards.com** — site of the day
- **cssdesignawards.com**
- **onepagelove.com**
- **lapa.ninja**
- **godly.website**
- **land-book.com**

Portfólios técnicos de referência (buscar no Awwwards):
- Bruno Simon (3D/WebGL)
- Antfu (minimalismo técnico)
- Paco Coursey (motion sutil)
- Rauno Freiberg (tipografia + interação)
