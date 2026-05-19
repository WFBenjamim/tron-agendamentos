# SSD — Tron Agendamento (SaaS de Agendamento para Barbearias)

> Documento técnico de especificação. O desenvolvimento usa `PORTFOLIO_FRONTEND_SKILL.md` para todas as decisões de design e stack.

---

## 1. Visão Geral do Produto

SaaS de agendamento online para barbearias brasileiras. Cada barbearia assinante tem seu próprio painel de gestão e um link/QR Code público de agendamento para seus clientes.

**Três faces do sistema:**

| Face | Rota | Quem acessa |
|------|------|------------|
| **Landing de cadastro/login** | `/` e `/login` | Donos de barbearia (novos e recorrentes) |
| **Painel do barbeiro** | `/dashboard/*` | Dono autenticado |
| **Página de agendamento** | `/b/[slug]` | Clientes da barbearia (público, sem login) |

---

## 2. Identidade Visual

### Estética
Masculina, moderna, premium — sem ser agressiva. Referência: tecnologia + barbearia urbana carioca. Dark mode como padrão.

### Paleta
```css
:root {
  --bg: #0c0c0e;                /* fundo principal: preto azulado */
  --surface: #141418;           /* cards e superfícies */
  --surface-2: #1c1c22;         /* camada elevada */
  --border: #2a2a35;            /* bordas sutis */
  --text: #f0ede8;              /* texto principal: off-white quente */
  --text-muted: #6b6b7a;        /* texto secundário */
  --accent: #c8ff00;            /* verde neon — acento primário (tech/moderno) */
  --accent-dim: #8fb300;        /* acento escurecido para hover */
  --danger: #ff4444;            /* cancelamentos, alertas */
  --success: #22c55e;           /* confirmações */

  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Tipografia
- **Display**: `Syne` — geométrica expressiva, forte presença, gratuita Google Fonts
- **UI / corpo**: `DM Sans` — limpa, legível, moderna
- **Mono / dados**: `Geist Mono` — para números, horários, códigos
- **NUNCA**: Inter, Roboto, Arial sozinhas

### Efeitos visuais obrigatórios (SKILL)
- Grain texture sutil no fundo (SVG feTurbulence)
- Smooth scroll (Lenis)
- Reveal de texto no hero da landing (GSAP SplitText)
- Cards com hover glow (box-shadow com cor do acento)
- Transições de página com curtain (Framer Motion)
- Botão com efeito magnético no hero

---

## 3. Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router, SSG + SSR) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Motion | Framer Motion + Lenis + GSAP |
| Banco | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Auth | Supabase Auth (email/senha) |
| QR Code | `qrcode.react` |
| Gráficos | Recharts |
| Deploy | Vercel |
| Notificações WhatsApp | **TODO** — estrutura preparada (campo `whatsapp_number` e tabela `notification_queue` criados, integração pendente) |

---

## 4. Arquitetura de Rotas

```
/                          → Landing pública do SaaS (venda do produto)
/login                     → Login dos donos de barbearia
/cadastro                  → Cadastro de nova barbearia + trial/pagamento
/dashboard                 → Redirect para /dashboard/agenda após login
/dashboard/agenda          → Gestão de datas e horários
/dashboard/agendamentos    → Lista de agendamentos recebidos
/dashboard/clientes        → Base de clientes cadastrados + envio de mensagens
/dashboard/financeiro      → Controle de caixa diário/mensal + metas + análises
/dashboard/configuracoes   → Dados da barbearia, slug, mensagem da página pública, assinatura
/b/[slug]                  → Página pública de agendamento da barbearia (sem login)
```

---

## 5. Modelo de Dados (Supabase)

### Isolamento por RLS
Cada tabela possui `barbershop_id`. As políticas RLS do Supabase garantem que cada dono autenticado acesse **apenas seus próprios dados**. Nenhum dado se cruza entre barbearias.

### Tabelas

```sql
-- Barbearias (uma por dono/assinante)
barbershops (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES auth.users,
  name TEXT,
  slug TEXT UNIQUE,            -- ex: "barbearia-joao" → /b/barbearia-joao
  custom_message TEXT,         -- mensagem exibida no topo da página pública
  whatsapp_number TEXT,        -- número do dono (para futuras notificações)
  plan TEXT DEFAULT 'active',  -- 'active' | 'inactive' | 'trial'
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Horários disponíveis (criados pelo dono)
available_slots (
  id UUID PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops,
  slot_datetime TIMESTAMPTZ,   -- data + hora exata
  is_booked BOOL DEFAULT false,
  is_blocked BOOL DEFAULT false, -- bloqueado manualmente pelo dono
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Clientes (upsert por barbershop_id + whatsapp)
clients (
  id UUID PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops,
  name TEXT,
  whatsapp TEXT,
  UNIQUE(barbershop_id, whatsapp),  -- evita duplicatas por barbearia
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now()
)

-- Agendamentos
appointments (
  id UUID PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops,
  slot_id UUID REFERENCES available_slots,
  client_id UUID REFERENCES clients,
  status TEXT DEFAULT 'confirmed', -- 'confirmed' | 'cancelled' | 'done'
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Transações financeiras (lançadas manualmente pelo dono)
transactions (
  id UUID PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops,
  amount DECIMAL(10,2),
  type TEXT,                   -- 'income' | 'expense'
  description TEXT,
  category TEXT,               -- 'corte' | 'produto' | 'aluguel' | etc.
  transaction_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Fila de notificações WhatsApp (estrutura preparada, integração TODO)
notification_queue (
  id UUID PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops,
  client_id UUID REFERENCES clients,
  message TEXT,
  type TEXT,                   -- 'confirmation' | 'promo' | 'reminder'
  status TEXT DEFAULT 'pending', -- 'pending' | 'sent' | 'failed'
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

---

## 6. Landing Page do SaaS (`/`)

Objetivo: converter donos de barbearia em assinantes.

### Seções
1. **Hero** — headline de impacto + CTA "Começar agora" + subtext com proposta de valor
2. **Como funciona** — 3 passos: Cadastre → Configure → Compartilhe o link
3. **Funcionalidades** — cards com os recursos do painel
4. **Demonstração** — preview/mockup da tela de agendamento e do painel
5. **Preço** — card único com plano mensal, valor, lista de recursos e CTA
6. **FAQ** — 5-6 perguntas frequentes em accordion
7. **Footer** — logo + links + contato

### Design
- Dark mode total
- Efeito de grain no fundo
- Animações de entrada nas seções (scroll-triggered)
- Navegação: top bar com blur + logo esquerda + links direita + botão CTA destacado
- Mobile: hamburger overlay

---

## 7. Página de Agendamento Pública (`/b/[slug]`)

Interface **direta e simples**. O cliente abre, escolhe, confirma. Sem distrações.

### Layout
```
┌─────────────────────────────┐
│  TRON AGENDAMENTO  (centro) │
│  [mensagem do dono]         │
├─────────────────────────────┤
│  Selecione uma data         │
│  [calendário visual]        │
├─────────────────────────────┤
│  Horários disponíveis       │
│  [grade de botões de hora]  │
├─────────────────────────────┤
│  Seus dados                 │
│  Nome / WhatsApp            │
│  [Confirmar]                │
└─────────────────────────────┘
```

### Regras
- Exibe apenas datas a partir de hoje até **30 dias à frente**
- Dias sem horários disponíveis: bloqueados no calendário
- Horários `is_booked = true` ou `is_blocked = true`: acinzentados, não clicáveis
- Nome e WhatsApp sempre obrigatórios — sem login para o cliente
- **Lógica de upsert no backend**: se `(barbershop_id, whatsapp)` já existe na tabela `clients`, atualiza `last_seen_at` em vez de criar novo registro
- Após confirmação: tela de sucesso com resumo (nome, data, hora, nome da barbearia)
- Anti-conflito: verificar disponibilidade do slot no momento da confirmação (não apenas na exibição)
- **QR Code**: a URL `/b/[slug]` é usada para gerar o QR Code no painel do dono

### Design
- Fundo dark, tipografia grande e clara
- Fontes mínimo 16px (acessibilidade)
- Botões de horário grandes (mínimo 44x44px)
- Sem menu de navegação, sem sidebar
- Nome "TRON AGENDAMENTO" centralizado no topo
- Logo ou nome da barbearia abaixo do sistema

---

## 8. Painel do Dono (`/dashboard/*`)

### 8.1 Navegação do dashboard
Top bar com: logo Tron + nome da barbearia + links de menu + avatar/logout.
**Sem sidebar esquerda.**

Itens do menu: `Agenda · Agendamentos · Clientes · Financeiro · Configurações`

---

### 8.2 Agenda (`/dashboard/agenda`)

**Gestão de horários disponíveis.**

- Visualização em calendário mensal + lista semanal (toggle)
- Criar horários: seleção de data + horários (múltiplos de uma vez, ex: 09:00, 09:30, 10:00...)
- Criar horários em lote: definir dias da semana + faixa de horário + intervalo (ex: seg-sex, 09h–18h, a cada 30min)
- Bloquear horário: impede novos agendamentos (ex: compromisso pessoal)
- Cancelar agendamento existente: libera o slot (status → 'cancelled', `is_booked = false`)
- Indicadores visuais:
  - Verde: disponível
  - Amarelo: agendado/ocupado
  - Cinza: bloqueado manualmente
  - Vermelho: cancelado

---

### 8.3 Agendamentos (`/dashboard/agendamentos`)

- Lista com: nome do cliente, WhatsApp, data/hora, status
- Filtros: por data, por status
- Ações por agendamento: marcar como realizado, cancelar
- Cancelar → libera o slot automaticamente

---

### 8.4 Clientes (`/dashboard/clientes`)

- Tabela com: nome, WhatsApp, data do primeiro agendamento, data do último agendamento
- Busca por nome ou WhatsApp
- **Envio de mensagem em massa**: campo de texto + botão "Enviar para todos"
  - Gera registros em `notification_queue` com `type = 'promo'` e `status = 'pending'`
  - Exibe confirmação: "Mensagem enfileirada para X clientes"
  - **TODO**: integração real com WhatsApp API (estrutura pronta no banco)
  - Por enquanto: exibir banner informativo "Integração WhatsApp em breve"

---

### 8.5 Financeiro (`/dashboard/financeiro`)

Seguir padrões de mercado (estilo Mobills, Organizze, Minhas Economias adaptado para negócio).

**Visão do dia (padrão ao abrir)**
- Total de entradas do dia
- Total de saídas do dia
- Saldo líquido do dia
- Lista de transações do dia

**Visão mensal**
- Cards: receita total, despesas total, lucro líquido
- Gráfico de barras: receita vs despesa por dia do mês (Recharts)
- Gráfico de pizza: distribuição por categoria de receita

**Comparativos**
- Comparação mês atual vs mês anterior (variação % em destaque)
- Comparação semana atual vs semana anterior
- Histórico anual: gráfico de linha mês a mês

**Metas**
- Definir meta mensal de receita
- Barra de progresso visual (ex: "R$ 3.200 / R$ 5.000 — 64%")
- Alerta visual quando atingir 100%

**Lançamentos**
- Formulário rápido: valor + tipo (entrada/saída) + categoria + descrição + data
- Categorias sugeridas: Corte, Barba, Combo, Produto vendido, Aluguel, Material, Outros
- Editar e excluir transação

---

### 8.6 Configurações (`/dashboard/configuracoes`)

- Nome da barbearia
- Slug (URL pública) — com preview: `tron.app/b/[slug]`
- Mensagem personalizada exibida na página pública
- WhatsApp da barbearia (para futuras notificações)
- **QR Code**: gerado automaticamente a partir do slug
  - Exibido na tela com botão "Baixar PNG"
  - Botão "Copiar link"
- Dados da assinatura: plano ativo, data de vencimento, botão para gerenciar

---

## 9. Autenticação e Multi-tenant

- Cadastro: nome da barbearia + e-mail + senha + slug desejado
- Login: e-mail + senha (Supabase Auth)
- Após login: redirect para `/dashboard/agenda`
- RLS no Supabase: todas as queries filtradas por `barbershop_id = auth.uid()` ou via join com `barbershops.owner_id = auth.uid()`
- Cada barbearia é completamente isolada — dados nunca se cruzam
- Sessão persistente com refresh token automático

---

## 10. Limite de 30 Dias

- A página `/b/[slug]` busca slots com `slot_datetime BETWEEN now() AND now() + interval '30 days'`
- O painel do dono permite criar slots além de 30 dias, mas eles não aparecem para os clientes
- Índice no banco: `CREATE INDEX ON available_slots (barbershop_id, slot_datetime, is_booked)`

---

## 11. Notificações WhatsApp (TODO — Estrada Preparada)

**O que está pronto:**
- Campo `whatsapp_number` em `barbershops` e `clients`
- Tabela `notification_queue` com todos os campos necessários
- Lógica de enfileiramento no backend ao confirmar agendamento e ao enviar promoção
- Comentários `// TODO: WhatsApp integration` nos pontos de disparo

**O que falta (futuro):**
- Escolher provider: Twilio, Z-API, Evolution API (open source), ou Meta Cloud API direta
- Criar worker/cron que processa `notification_queue` onde `status = 'pending'`
- Templates de mensagem aprovados pelo Meta

---

## 12. Efeitos Visuais por Área (SKILL)

| Área | Efeitos |
|------|---------|
| Landing hero | GSAP SplitText reveal + botão magnético + grain bg |
| Landing seções | ScrollTrigger fade+slide ao entrar no viewport |
| Login/Cadastro | Transição curtain entre as telas |
| Dashboard | Micro-animações em cards (Framer Motion layout) |
| Calendário agenda | Transição suave entre meses |
| Gráficos financeiro | Animação de entrada das barras (Recharts built-in) |
| Página pública /b/[slug] | Minimalista — apenas transição de etapa (slide horizontal) |

---

## 13. Performance e Acessibilidade

- `prefers-reduced-motion` desativa todas as animações
- Página pública: fonte mínima 16px, botões 44x44px, navegação por teclado
- RLS + validação server-side em todas as mutations
- Índices no banco nos campos de query frequente
- ISR para páginas públicas (revalidate a cada 60s)

---

*Referência de skill: `PORTFOLIO_FRONTEND_SKILL.md`*
