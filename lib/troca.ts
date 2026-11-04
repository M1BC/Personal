import { EXERCICIOS } from "@/data/exercicios";
import { ISOMETRICOS, UNILATERAIS } from "@/data/treinos";
import type { Exercicio } from "./types";
import type { ItemFicha } from "./treino";

// Exercícios que fazem o mesmo trabalho: mesmo músculo principal e mesmo padrão de movimento.
// Um exercício pode estar em mais de um grupo; as opções de troca são a união dos grupos dele.
const EQUIVALENTES: string[][] = [
  ["supino-reto", "supino-halteres", "supino-inclinado", "flexao"],
  ["crucifixo", "peck-deck"],
  ["puxada-frente", "barra-fixa", "pulldown-braco-reto"],
  ["remada-sentada", "remada-unilateral", "remada-curvada", "remada-cavalinho", "remada-maquina"],
  ["desenvolvimento", "desenvolvimento-militar"],
  ["crucifixo-inverso", "face-pull"],
  ["rosca-alternada", "rosca-scott", "rosca-direta", "rosca-polia", "rosca-martelo", "rosca-concentrada"],
  ["triceps-frances", "triceps-testa", "triceps-corda", "triceps-coice", "mergulho-paralelas", "supino-fechado"],
  ["agachamento", "agachamento-hack", "leg-press", "agachamento-bulgaro", "afundo"],
  ["stiff", "levantamento-terra"],
  ["cadeira-flexora", "mesa-flexora"],
  ["elevacao-pelvica", "coice-polia"],
  ["panturrilha-em-pe", "panturrilha-leg-press", "panturrilha-smith", "panturrilha-sentada", "panturrilha-burrinho", "panturrilha-unilateral"],
  ["abdominal-polia", "elevacao-pernas", "abdominal-roda"],
  ["prancha", "prancha-lateral", "dead-bug", "perdigueiro"],
  ["hiperextensao-lombar", "bom-dia", "perdigueiro"],
];

const porId = Object.fromEntries(EXERCICIOS.map((e) => [e.id, e])) as Record<string, Exercicio>;

// Equivalentes de um exercício, sem os que já estão no mesmo dia.
export function alternativas(id: string, noDia: string[] = []): Exercicio[] {
  const ids = new Set<string>();
  for (const g of EQUIVALENTES) if (g.includes(id)) g.forEach((x) => ids.add(x));
  ids.delete(id);
  return [...ids].filter((x) => porId[x] && !noDia.includes(x)).map((x) => porId[x]);
}

export const temAlternativa = (id: string) => EQUIVALENTES.some((g) => g.includes(id) && g.some((x) => x !== id && porId[x]));

// Troca o exercício mantendo as séries, as repetições e o descanso da vaga.
// Só ajusta o que é do exercício: "por perna/por lado" e os exercícios de segurar (prancha).
export function trocarItem(item: ItemFicha, novoId: string): ItemFicha {
  const [series, resto = ""] = item.series.split(" × ");
  let reps: string;
  if (ISOMETRICOS[novoId]) reps = ISOMETRICOS[novoId];
  else if (ISOMETRICOS[item.id]) reps = `10 a 15 repetições${UNILATERAIS[novoId] ?? ""}`;
  else {
    const sufixo = UNILATERAIS[item.id];
    const base = sufixo && resto.endsWith(sufixo) ? resto.slice(0, -sufixo.length) : resto;
    reps = base + (UNILATERAIS[novoId] ?? "");
  }
  // Observações que falam do exercício original não valem para o novo; a de músculo de apoio continua.
  const obs = item.obs?.startsWith("Músculo de apoio") ? item.obs : undefined;
  return { id: novoId, series: `${series} × ${reps}`, descanso: item.descanso, ...(obs ? { obs } : {}) };
}
