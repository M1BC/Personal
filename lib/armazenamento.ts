// Dados do usuário (perfil, refeições, treino criado) guardados só neste aparelho, no navegador.
export const CHAVES = ["perfil", "distribuicao", "pratos", "meuTreino"] as const;
export type Chave = (typeof CHAVES)[number];
type Dados = Partial<Record<Chave, unknown>>;

let cache: Dados | null = null;

function lerLocal(): Dados {
  const d: Dados = {};
  try {
    for (const c of CHAVES) {
      const v = localStorage.getItem(c);
      if (v) d[c] = JSON.parse(v);
    }
  } catch {
    // Sem armazenamento local (modo anônimo ou bloqueado): o app funciona, mas não guarda.
  }
  return d;
}

export function carregarDados(): Promise<Dados> {
  cache ??= lerLocal();
  return Promise.resolve(cache);
}

export function salvarDado(c: Chave, v: unknown) {
  cache = { ...(cache ?? lerLocal()), [c]: v };
  try {
    localStorage.setItem(c, JSON.stringify(v));
  } catch {
    // Sem armazenamento local.
  }
}
