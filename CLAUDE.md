# CLAUDE.md — FinançasPessoais App

## Visão Geral
Web app de gestão financeira pessoal com Next.js 14+, Supabase e shadcn/ui.

## Stack
- **Next.js 14+** (App Router, TypeScript)
- **Tailwind CSS + shadcn/ui** — componentes de UI
- **Supabase** — PostgreSQL + Auth + Row Level Security
- **Recharts** — gráficos
- **Vercel** — deploy

## Estrutura de Pastas
```
src/
  app/
    login/          ← página de login
    signup/         ← página de cadastro
    dashboard/      ← dashboard principal (rota protegida)
      transactions/ ← listagem de transações
  components/
    ui/             ← shadcn/ui components
    dashboard/      ← componentes do dashboard
    transactions/   ← componentes de transações
    layout/         ← header, sidebar, etc.
  lib/
    supabase/
      client.ts     ← cliente browser
      server.ts     ← cliente server (Server Components/Actions)
      middleware.ts  ← atualização de sessão
    utils.ts        ← utilitários (cn, formatação)
  types/
    index.ts        ← tipos TypeScript do domínio
  actions/          ← Server Actions
  middleware.ts     ← proteção de rotas
```

## Convenções
- Usar Server Actions para mutações (criar, editar, excluir transações)
- Usar Server Components por padrão; Client Components apenas quando necessário ('use client')
- Sempre usar `createClient()` do `server.ts` em Server Components e Actions
- Sempre usar `createClient()` do `client.ts` em Client Components
- Tipos centralizados em `src/types/index.ts`

## Variáveis de Ambiente
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Perfil do Usuário
Profissional não técnico em aprendizado (curso nocode). Explicar mudanças em linguagem simples, sem jargões. Comunicação sempre em português (pt-BR).
