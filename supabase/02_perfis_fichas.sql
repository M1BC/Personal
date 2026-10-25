-- Já aplicado no projeto (migração perfis_papeis_e_fichas).
-- Papéis (aluno, treinador, admin) e fichas montadas pelo treinador.

create schema if not exists private;
grant usage on schema private to authenticated;

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  email text not null default '',
  papel text not null default 'aluno' check (papel in ('aluno', 'treinador', 'admin')),
  criado_em timestamptz not null default now()
);
alter table public.perfis enable row level security;

create or replace function private.papel_atual()
returns text language sql stable security definer set search_path = ''
as $$ select papel from public.perfis where id = (select auth.uid()); $$;
revoke all on function private.papel_atual() from public, anon;
grant execute on function private.papel_atual() to authenticated;

create policy "ver o próprio perfil ou equipe vê todos" on public.perfis
  for select to authenticated
  using (id = (select auth.uid()) or (select private.papel_atual()) in ('treinador', 'admin'));
create policy "editar o próprio nome sem mudar o papel" on public.perfis
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and papel = (select private.papel_atual()));
create policy "admin define papéis" on public.perfis
  for update to authenticated
  using ((select private.papel_atual()) = 'admin')
  with check ((select private.papel_atual()) = 'admin');

revoke insert, update, delete on public.perfis from authenticated, anon;
grant update (nome, papel) on public.perfis to authenticated;

-- Perfil criado no cadastro; a conta do dono do app nasce como admin.
create or replace function private.criar_perfil()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.perfis (id, email, nome, papel)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'nome', ''),
          case when lower(new.email) = 'm1bc009@gmail.com' then 'admin' else 'aluno' end)
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.criar_perfil() from public, anon, authenticated;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function private.criar_perfil();

create table public.fichas (
  aluno_id uuid primary key references public.perfis (id) on delete cascade,
  conteudo jsonb not null default '{}'::jsonb,
  treinador_id uuid references public.perfis (id) on delete set null,
  atualizado_em timestamptz not null default now()
);
create index fichas_treinador_id_idx on public.fichas (treinador_id);
alter table public.fichas enable row level security;

create policy "aluno vê a própria ficha e equipe vê todas" on public.fichas
  for select to authenticated
  using (aluno_id = (select auth.uid()) or (select private.papel_atual()) in ('treinador', 'admin'));
create policy "equipe cria fichas" on public.fichas
  for insert to authenticated with check ((select private.papel_atual()) in ('treinador', 'admin'));
create policy "equipe edita fichas" on public.fichas
  for update to authenticated
  using ((select private.papel_atual()) in ('treinador', 'admin'))
  with check ((select private.papel_atual()) in ('treinador', 'admin'));
create policy "equipe apaga fichas" on public.fichas
  for delete to authenticated using ((select private.papel_atual()) in ('treinador', 'admin'));
