"use client";
import type { Dia } from "@/components/DiasFicha";
import { criarCliente } from "./supabase/client";

export type Papel = "aluno" | "treinador" | "admin";
export interface Perfil { id: string; nome: string; email: string; papel: Papel; criado_em: string }

// Ficha montada pelo treinador (guardada em fichas.conteudo).
export interface FichaTreinador { titulo: string; observacoes: string; dias: Dia[] }
export interface RegistroFicha { aluno_id: string; conteudo: FichaTreinador; treinador_id: string | null; atualizado_em: string }

export const ehEquipe = (p?: Papel | null) => p === "treinador" || p === "admin";
export const NOME_PAPEL: Record<Papel, string> = { aluno: "Aluno", treinador: "Treinador", admin: "Administrador" };
export const nomeOuEmail = (p: Pick<Perfil, "nome" | "email">) => p.nome.trim() || p.email;

export const FICHA_VAZIA: FichaTreinador = { titulo: "", observacoes: "", dias: [] };

// Normaliza o que vier do banco, para a tela nunca quebrar com dados incompletos.
export function lerFicha(conteudo: unknown): FichaTreinador {
  const c = (conteudo ?? {}) as Partial<FichaTreinador>;
  return {
    titulo: typeof c.titulo === "string" ? c.titulo : "",
    observacoes: typeof c.observacoes === "string" ? c.observacoes : "",
    dias: Array.isArray(c.dias)
      ? c.dias.map((d) => ({
          dia: String(d?.dia ?? ""),
          titulo: String(d?.titulo ?? ""),
          itens: Array.isArray(d?.itens)
            ? d.itens.map((i) => ({ id: String(i?.id ?? ""), series: String(i?.series ?? ""), descanso: String(i?.descanso ?? ""), obs: i?.obs ? String(i.obs) : "" }))
            : [],
        }))
      : [],
  };
}

let meuCache: Promise<Perfil | null> | null = null;

export function meuPerfil(): Promise<Perfil | null> {
  meuCache ??= (async () => {
    const supabase = criarCliente();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("perfis").select("*").eq("id", user.id).maybeSingle();
    return (data as Perfil | null) ?? null;
  })().catch(() => null);
  return meuCache;
}

export async function minhaFicha(): Promise<RegistroFicha | null> {
  const perfil = await meuPerfil();
  if (!perfil) return null;
  const { data } = await criarCliente().from("fichas").select("*").eq("aluno_id", perfil.id).maybeSingle();
  return data ? { ...(data as RegistroFicha), conteudo: lerFicha(data.conteudo) } : null;
}

export async function salvarFicha(alunoId: string, ficha: FichaTreinador) {
  const eu = await meuPerfil();
  const { error } = await criarCliente()
    .from("fichas")
    .upsert({ aluno_id: alunoId, conteudo: ficha, treinador_id: eu?.id ?? null, atualizado_em: new Date().toISOString() });
  if (error) throw error;
}

export async function apagarFicha(alunoId: string) {
  const { error } = await criarCliente().from("fichas").delete().eq("aluno_id", alunoId);
  if (error) throw error;
}

export async function mudarPapel(id: string, papel: Papel) {
  const { error } = await criarCliente().from("perfis").update({ papel }).eq("id", id);
  if (error) throw error;
}

export async function mudarMeuNome(nome: string) {
  const eu = await meuPerfil();
  if (!eu) return;
  const { error } = await criarCliente().from("perfis").update({ nome }).eq("id", eu.id);
  if (error) throw error;
  meuCache = Promise.resolve({ ...eu, nome });
}
