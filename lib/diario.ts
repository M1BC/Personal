import { alimentoPorId, passo, porMedida } from "./cardapio";

export interface ItemPrato { id: string; q: number } // q = quantidade em medidas caseiras

export function macrosDoPrato(itens: ItemPrato[]) {
  let proteina = 0, carbo = 0, gordura = 0;
  for (const i of itens) {
    const a = alimentoPorId[i.id];
    if (!a) continue;
    const m = porMedida(a);
    proteina += m.p * i.q; carbo += m.c * i.q; gordura += m.g * i.q;
  }
  return { proteina, carbo, gordura, kcal: proteina * 4 + carbo * 4 + gordura * 9 };
}

// Aumenta (+1) ou diminui (-1) um passo da medida; chegando a zero, o item sai do prato.
export function mudarQuantidade(itens: ItemPrato[], idx: number, sinal: 1 | -1): ItemPrato[] {
  const item = itens[idx];
  const a = item && alimentoPorId[item.id];
  if (!a) return itens;
  const q = item.q + sinal * passo(a);
  return q <= 0 ? remover(itens, idx) : itens.map((x, k) => (k === idx ? { ...x, q } : x));
}

export const remover = (itens: ItemPrato[], idx: number) => itens.filter((_, k) => k !== idx);

// Alimento novo entra com 1 medida; se já está no prato, soma um passo.
export function adicionar(itens: ItemPrato[], id: string): ItemPrato[] {
  const a = alimentoPorId[id];
  if (!a) return itens;
  const k = itens.findIndex((x) => x.id === id);
  if (k >= 0) return itens.map((x, j) => (j === k ? { ...x, q: x.q + passo(a) } : x));
  return [...itens, { id, q: 1 }];
}

// Troca um alimento por outro, mantendo a quantidade (ajustada ao passo do novo alimento).
export function trocar(itens: ItemPrato[], idx: number, novoId: string): ItemPrato[] {
  const novo = alimentoPorId[novoId];
  const atual = itens[idx];
  if (!novo || !atual) return itens;
  const st = passo(novo);
  const q = Math.max(st, Math.ceil(atual.q / st) * st);
  const j = itens.findIndex((x, k) => k !== idx && x.id === novoId);
  if (j >= 0) return itens.map((x, k) => (k === j ? { ...x, q: x.q + q } : x)).filter((_, k) => k !== idx);
  return itens.map((x, k) => (k === idx ? { id: novoId, q } : x));
}
