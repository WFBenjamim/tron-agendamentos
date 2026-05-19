# Tron Agendamentos

Sistema de agendamento online para barbearias brasileiras, com painel do dono, link publico para clientes e integracao com Supabase.

## O que ja existe

- Landing page comercial em dark mode.
- Login e cadastro com Supabase Auth.
- Cadastro de barbearia com slug publico.
- Dashboard protegido.
- Agenda com criacao de horarios em lote.
- Bloqueio, liberacao e remocao de horarios.
- Link publico `/b/[slug]` para cliente agendar sem login.
- Agendamentos com acoes de marcar como feito e cancelar.
- Clientes e fila preparada para mensagens.
- Financeiro com entradas, saidas e saldo.
- Configuracoes com dados da barbearia, QR Code e upload/URL de logo.
- Gerador de imagem vertical para status com horarios do dia.
- Supabase RLS e migrations versionadas.

## Stack

- Next.js 15 App Router
- React 19
- Tailwind CSS v4
- Supabase Auth, Database, Storage e RLS
- Framer Motion
- Lenis
- GSAP
- Recharts
- qrcode.react

## Rotas principais

```txt
/                         Landing publica
/login                    Login do dono
/cadastro                 Cadastro da barbearia
/dashboard/agenda         Gestao de horarios
/dashboard/agendamentos   Agendamentos recebidos
/dashboard/clientes       Clientes
/dashboard/financeiro     Caixa e lancamentos
/dashboard/configuracoes  Dados, logo e QR Code
/b/[slug]                 Link publico de agendamento
```

## Variaveis de ambiente

Crie `.env.local` no desenvolvimento e configure as mesmas variaveis no Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://oyqrmyuyzurmniifkipt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
```

Importante:

- Nao coloque `sb_secret` ou service role no frontend.
- No Vercel, adicione essas variaveis em Project Settings > Environment Variables.
- Depois de alterar variaveis no Vercel, faca um novo deploy.

## Supabase

O projeto Supabase usado no desenvolvimento:

```txt
project_ref: oyqrmyuyzurmniifkipt
```

As migrations ficam em:

```txt
supabase/migrations
```

Para aplicar em um Supabase vinculado:

```bash
npx supabase link --project-ref oyqrmyuyzurmniifkipt
npx supabase db push
```

O banco inclui:

- `barbershops`
- `available_slots`
- `clients`
- `appointments`
- `transactions`
- `notification_queue`
- bucket Storage `barbershop-logos`

## Rodar localmente

```bash
npm install
npm run dev
```

Abra:

```txt
http://localhost:3000
```

## Validacao

```bash
npm run lint
npm run build
```

## Deploy na Vercel

1. Importe o repositorio no Vercel.
2. Framework preset: Next.js.
3. Build command: `npm run build`.
4. Output: automatico do Next.js.
5. Configure:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

6. Deploy.

Depois do deploy, atualize no Supabase Auth as URLs do projeto:

- Site URL: URL de producao da Vercel.
- Redirect URLs: URL de producao e `URL/dashboard/agenda`.

## Observacoes

- A integracao real com WhatsApp ainda esta preparada como fila (`notification_queue`), sem envio externo.
- A logo da barbearia pode ser enviada pelo menu Configuracoes e fica no bucket publico `barbershop-logos`.
- O gerador de imagem para status usa a logo salva, os horarios livres e os horarios marcados do dia escolhido.
