-- Rode este arquivo uma vez no Supabase: menu "SQL Editor" → "New query" → cole tudo → "Run".
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
  for select using (auth.uid() = user_id);

drop policy if exists "criar os próprios dados" on public.dados_usuario;
create policy "criar os próprios dados" on public.dados_usuario
  for insert with check (auth.uid() = user_id);

drop policy if exists "alterar os próprios dados" on public.dados_usuario;
create policy "alterar os próprios dados" on public.dados_usuario
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
