# Treino & Nutrição Consciente

App educativo de treino e nutrição (Next.js 14, React 18, TypeScript e Tailwind CSS).
Não há servidor nem banco de dados: o app roda inteiro no navegador. As preferências (tema, peso e distribuição de refeições) ficam no `localStorage`.

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

- `app/`: páginas (Anatomia, Refeições, Suplementos, Treinos)
- `components/`: componentes de tela
- `data/`: bancos de dados (exercícios, alimentos, fichas de treino)
- `lib/`: cálculos e utilitários (nutrição, cardápios, montagem das fichas de treino)

Conteúdo educativo: não substitui médico, nutricionista ou educador físico.
