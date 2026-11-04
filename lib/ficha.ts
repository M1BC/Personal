import type { Dia } from "@/components/DiasFicha";

// Treino montado pelo próprio usuário (aba "Criar meu treino").
export interface FichaTreinador { titulo: string; observacoes: string; dias: Dia[] }

export const FICHA_VAZIA: FichaTreinador = { titulo: "", observacoes: "", dias: [] };

// Normaliza o que vier do armazenamento, para a tela nunca quebrar com dados incompletos.
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
