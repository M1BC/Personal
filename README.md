# Treino & Nutrição Consciente

App educativo de treino e nutrição (Next.js 14, React 18, TypeScript e Tailwind CSS).
Login e dados na nuvem com Supabase: perfil, distribuição e pratos das refeições ficam na tabela `dados_usuario` (com cópia no navegador para abrir rápido e funcionar sem internet). Tema e som do timer continuam só no aparelho.

## Rodar no computador

Requer Node.js 18.18 ou mais novo.

Crie um arquivo `.env.local` na pasta do projeto com:

```
NEXT_PUBLIC_SUPABASE_URL=https://cfmrzuiltpvepdoywaao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(a chave anon public do Supabase)
```

```bash
npm install
npm run dev     # http://localhost:3000
```

## Gerar a versão de produção

```bash
npm run build
npm start
```

## Publicar na Vercel

1. Envie a pasta para um repositório no GitHub (o `.gitignore` já exclui `node_modules` e `.next`).
2. Na Vercel, escolha "Add New → Project", importe o repositório e aceite as configurações padrão (Framework: Next.js).
3. Variáveis de ambiente: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (já configuradas no projeto).

## Banco de dados

Rode `supabase/schema.sql` uma vez no SQL Editor do Supabase. Ele cria a tabela `dados_usuario` com segurança por linha (cada usuário só vê os próprios dados).

## Estrutura

- `app/`: páginas (Anatomia, Refeições, Suplementos, Treinos)
- `components/`: componentes de tela
- `data/`: bancos de dados (exercícios, alimentos, fichas de treino)
- `lib/`: cálculos e utilitários (nutrição, cardápios, montagem das fichas de treino)

Conteúdo educativo: não substitui médico, nutricionista ou educador físico.
