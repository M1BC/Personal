-- Já aplicado no projeto (migração criar_dados_usuario). Para recriar em outro projeto: SQL Editor → cole tudo → Run.
-- Cria a tabela onde ficam perfil, distribuição de refeições e pratos de cada usuário.

create table if not exists public.dados_usuario (
  user_id uuid primary key references auth.users (id) on delete cascade,
  dados jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

-- Segurança: cada pessoa só enxerga e altera a própria linha.
alter table public.dados_usuario enable row level security;

drop policy if exists "ler os próprios dados" on public.dados_usuario;
create policy "ler os próprios dados" on public.dados_usuario
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "criar os próprios dados" on public.dados_usuario;
create policy "criar os próprios dados" on public.dados_usuario
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "alterar os próprios dados" on public.dados_usuario;
create policy "alterar os próprios dados" on public.dados_usuario
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
