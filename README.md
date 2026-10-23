# Treino & Nutrição Consciente

App educativo de treino e nutrição (Next.js 14, React 18, TypeScript e Tailwind CSS).
Os registros do caderno de treinos ficam no `localStorage` do navegador, sem servidor nem banco de dados.

## Rodar no computador

Requer Node.js 18.18 ou mais novo.

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
3. Não há variáveis de ambiente.

## Estrutura

- `app/`: páginas (Anatomia, Refeições, Suplementos, Treinos, Treino ativo, Histórico)
- `components/`: componentes de tela
- `data/`: bancos de dados (exercícios, alimentos, fichas de treino)
- `lib/`: cálculos e utilitários (inclui `historico.ts`, o acesso ao `localStorage`)
- `hooks/`: hooks do React (`useHistoricoTreinos`)

Conteúdo educativo: não substitui médico, nutricionista ou educador físico.
