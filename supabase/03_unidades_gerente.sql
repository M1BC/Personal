-- Já aplicado no projeto (migrações unidades_e_gerente, unidades_visiveis_no_cadastro, transferir_pessoa).
-- Filiais da rede, papel de gerente e regras de acesso por unidade.

create table public.unidades (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) > 0),
  cidade text not null default '',
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);
alter table public.unidades enable row level security;
create policy "visitante vê unidades ativas" on public.unidades for select to anon using (ativa);
create policy "logado vê ativas e admin vê todas" on public.unidades
  for select to authenticated using (ativa or (select private.papel_atual()) = 'admin');
create policy "admin cria unidades" on public.unidades
  for insert to authenticated with check ((select private.papel_atual()) = 'admin');
create policy "admin edita unidades" on public.unidades
  for update to authenticated
  using ((select private.papel_atual()) = 'admin') with check ((select private.papel_atual()) = 'admin');
revoke delete on public.unidades from anon, authenticated;

alter table public.perfis add column unidade_id uuid references public.unidades (id) on delete set null;
create index perfis_unidade_id_idx on public.perfis (unidade_id);
alter table public.perfis drop constraint perfis_papel_check;
alter table public.perfis add constraint perfis_papel_check check (papel in ('aluno', 'treinador', 'gerente', 'admin'));
grant update (unidade_id) on public.perfis to authenticated;

create or replace function private.unidade_atual()
returns uuid language sql stable security definer set search_path = ''
as $$ select unidade_id from public.perfis where id = (select auth.uid()); $$;
revoke all on function private.unidade_atual() from public, anon;
grant execute on function private.unidade_atual() to authenticated;

create or replace function private.unidade_de(pessoa uuid)
returns uuid language sql stable security definer set search_path = ''
as $$
  select p.unidade_id from public.perfis p
  where p.id = pessoa
    and (select papel from public.perfis where id = (select auth.uid())) in ('treinador', 'gerente', 'admin');
$$;
revoke all on function private.unidade_de(uuid) from public, anon;
grant execute on function private.unidade_de(uuid) to authenticated;

-- Perfis
drop policy "ver o próprio perfil ou equipe vê todos" on public.perfis;
create policy "ver perfis conforme o papel" on public.perfis
  for select to authenticated
  using (
    id = (select auth.uid())
    or (select private.papel_atual()) = 'admin'
    or ((select private.papel_atual()) in ('treinador', 'gerente') and unidade_id = (select private.unidade_atual()))
  );
drop policy "editar o próprio nome sem mudar o papel" on public.perfis;
create policy "editar o próprio nome" on public.perfis
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and papel = (select private.papel_atual())
              and unidade_id is not distinct from (select private.unidade_atual()));
create policy "gerente cuida da própria unidade" on public.perfis
  for update to authenticated
  using ((select private.papel_atual()) = 'gerente' and unidade_id = (select private.unidade_atual()) and papel in ('aluno', 'treinador'))
  with check ((select private.papel_atual()) = 'gerente' and papel in ('aluno', 'treinador'));

-- Cadastro grava a unidade escolhida (se existir e estiver ativa).
create or replace function private.criar_perfil()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare escolhida uuid;
begin
  begin escolhida := nullif(new.raw_user_meta_data ->> 'unidade_id', '')::uuid;
  exception when others then escolhida := null; end;
  if escolhida is not null and not exists (select 1 from public.unidades where id = escolhida and ativa) then
    escolhida := null;
  end if;
  insert into public.perfis (id, email, nome, papel, unidade_id)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'nome', ''),
          case when lower(new.email) = 'm1bc009@gmail.com' then 'admin' else 'aluno' end, escolhida)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Fichas: admin todas; treinador e gerente, só alunos da própria unidade.
drop policy "aluno vê a própria ficha e equipe vê todas" on public.fichas;
drop policy "equipe cria fichas" on public.fichas;
drop policy "equipe edita fichas" on public.fichas;
drop policy "equipe apaga fichas" on public.fichas;
create policy "ver fichas conforme o papel" on public.fichas for select to authenticated
  using (aluno_id = (select auth.uid()) or (select private.papel_atual()) = 'admin'
         or ((select private.papel_atual()) in ('treinador', 'gerente') and private.unidade_de(aluno_id) = (select private.unidade_atual())));
create policy "equipe cria fichas da unidade" on public.fichas for insert to authenticated
  with check ((select private.papel_atual()) = 'admin'
              or ((select private.papel_atual()) in ('treinador', 'gerente') and private.unidade_de(aluno_id) = (select private.unidade_atual())));
create policy "equipe edita fichas da unidade" on public.fichas for update to authenticated
  using ((select private.papel_atual()) = 'admin'
         or ((select private.papel_atual()) in ('treinador', 'gerente') and private.unidade_de(aluno_id) = (select private.unidade_atual())))
  with check ((select private.papel_atual()) = 'admin'
              or ((select private.papel_atual()) in ('treinador', 'gerente') and private.unidade_de(aluno_id) = (select private.unidade_atual())));
create policy "equipe apaga fichas da unidade" on public.fichas for delete to authenticated
  using ((select private.papel_atual()) = 'admin'
         or ((select private.papel_atual()) in ('treinador', 'gerente') and private.unidade_de(aluno_id) = (select private.unidade_atual())));

-- Transferência de unidade (o gerente perde a visão de quem transfere, por isso passa por esta função).
create or replace function public.transferir_pessoa(pessoa uuid, nova_unidade uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  eu uuid := (select auth.uid());
  meu_papel text; minha_unidade uuid; alvo_papel text; alvo_unidade uuid;
begin
  select papel, unidade_id into meu_papel, minha_unidade from public.perfis where id = eu;
  select papel, unidade_id into alvo_papel, alvo_unidade from public.perfis where id = pessoa;
  if alvo_papel is null then raise exception 'Pessoa não encontrada'; end if;
  if nova_unidade is not null and not exists (select 1 from public.unidades where id = nova_unidade and ativa) then
    raise exception 'Unidade inválida';
  end if;
  if meu_papel = 'admin' then null;
  elsif meu_papel = 'gerente' and alvo_unidade = minha_unidade and alvo_papel in ('aluno', 'treinador') and nova_unidade is not null then null;
  else raise exception 'Sem permissão para transferir esta pessoa';
  end if;
  update public.perfis set unidade_id = nova_unidade where id = pessoa;
end;
$$;
revoke all on function public.transferir_pessoa(uuid, uuid) from public, anon;
grant execute on function public.transferir_pessoa(uuid, uuid) to authenticated;
