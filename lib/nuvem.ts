"use client";
import { criarCliente } from "./supabase/client";

// Dados do usuário que antes ficavam só no navegador (localStorage) e agora vão para o Supabase.
// O navegador continua guardando uma cópia, para a tela abrir na hora e funcionar sem internet.
export const CHAVES = ["perfil", "distribuicao", "pratos"] as const;
export type Chave = (typeof CHAVES)[number];
type Dados = Partial<Record<Chave, unknown>>;

let cache: Dados | null = null;
let usuario: string | null = null;
let carregando: Promise<Dados> | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

function lerLocal(): Dados {
  const d: Dados = {};
  try {
    for (const c of CHAVES) {
      const v = localStorage.getItem(c);
      if (v) d[c] = JSON.parse(v);
    }
  } catch {
    // Sem armazenamento local.
  }
  return d;
}

function gravarLocal(c: Chave, v: unknown) {
  try {
    localStorage.setItem(c, JSON.stringify(v));
  } catch {
    // Sem armazenamento local.
  }
}

async function enviar() {
  if (!usuario || !cache) return;
  await criarCliente()
    .from("dados_usuario")
    .upsert({ user_id: usuario, dados: cache, atualizado_em: new Date().toISOString() });
}

// Carrega uma vez por sessão. Na primeira vez que a conta entra, migra o que já existia no navegador.
export function carregarDados(): Promise<Dados> {
  if (cache) return Promise.resolve(cache);
  carregando ??= (async () => {
    const local = lerLocal();
    try {
      const supabase = criarCliente();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return (cache = local);
      usuario = user.id;

      const { data, error } = await supabase.from("dados_usuario").select("dados").eq("user_id", user.id).maybeSingle();
      if (error) return (cache = local); // offline ou erro: segue com a cópia local
      if (!data) {
        cache = local;
        if (Object.keys(local).length > 0) await enviar();
      } else {
        cache = (data.dados ?? {}) as Dados;
        for (const c of CHAVES) if (cache[c] !== undefined) gravarLocal(c, cache[c]);
      }
      return cache;
    } catch {
      return (cache = local);
    } finally {
      carregando = null;
    }
  })();
  return carregando;
}

// Salva na hora no navegador e, depois de meio segundo sem mudanças, na nuvem.
export function salvarDado(c: Chave, v: unknown) {
  cache = { ...(cache ?? {}), [c]: v };
  gravarLocal(c, v);
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    enviar().catch(() => {});
  }, 500);
}

// Ao sair, apaga a cópia local para o próximo login neste aparelho não ver dados de outra conta.
export async function sair() {
  if (timer) {
    clearTimeout(timer);
    await enviar().catch(() => {});
  }
  try {
    for (const c of CHAVES) localStorage.removeItem(c);
  } catch {
    // Sem armazenamento local.
  }
  cache = null;
  usuario = null;
  await criarCliente().auth.signOut();
  window.location.assign("/login");
}
