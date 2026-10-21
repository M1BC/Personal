import { ALIMENTOS } from "@/data/alimentos";
import type { Alimento } from "./types";

const A = Object.fromEntries(ALIMENTOS.map((a) => [a.id, a])) as Record<string, Alimento>;

type Item = { id: string; papel: "proteina" | "carbo"; parte?: number };
export interface Cardapio { itens: Item[]; extra: string; azeite?: boolean }

// 3 opções por refeição: misturam carnes grelhadas e opções simples, que não precisam de grelha.
export const CARDAPIOS: Record<string, Cardapio[]> = {
  cafe: [
    { itens: [{ id: "ovo-mexido", papel: "proteina" }, { id: "pao-frances", papel: "carbo" }], extra: "café" },
    { itens: [{ id: "iogurte-natural", papel: "proteina", parte: 0.5 }, { id: "queijo-minas", papel: "proteina", parte: 0.5 }, { id: "aveia", papel: "carbo", parte: 0.4 }, { id: "banana", papel: "carbo", parte: 0.6 }], extra: "" },
    { itens: [{ id: "ovo-cozido", papel: "proteina", parte: 0.5 }, { id: "queijo-minas", papel: "proteina", parte: 0.5 }, { id: "pao-integral", papel: "carbo", parte: 0.6 }, { id: "banana", papel: "carbo", parte: 0.4 }], extra: "" },
  ],
  almoco: [
    { itens: [{ id: "frango-grelhado", papel: "proteina" }, { id: "arroz-branco", papel: "carbo", parte: 0.6 }, { id: "feijao-carioca", papel: "carbo", parte: 0.4 }], extra: "salada", azeite: true },
    { itens: [{ id: "patinho-grelhado", papel: "proteina" }, { id: "arroz-branco", papel: "carbo", parte: 0.5 }, { id: "feijao-preto", papel: "carbo", parte: 0.5 }], extra: "legumes" },
    { itens: [{ id: "atum-lata", papel: "proteina" }, { id: "arroz-integral", papel: "carbo", parte: 0.6 }, { id: "lentilha", papel: "carbo", parte: 0.4 }], extra: "salada", azeite: true },
  ],
  lanche: [
    { itens: [{ id: "iogurte-natural", papel: "proteina", parte: 0.6 }, { id: "queijo-minas", papel: "proteina", parte: 0.4 }, { id: "banana", papel: "carbo" }], extra: "" },
    { itens: [{ id: "ovo-cozido", papel: "proteina" }, { id: "pao-integral", papel: "carbo" }], extra: "tomate" },
    { itens: [{ id: "queijo-minas", papel: "proteina", parte: 0.5 }, { id: "ovo-cozido", papel: "proteina", parte: 0.5 }, { id: "pao-frances", papel: "carbo" }], extra: "" },
  ],
  jantar: [
    { itens: [{ id: "frango-grelhado", papel: "proteina" }, { id: "batata-doce", papel: "carbo" }], extra: "legumes", azeite: true },
    { itens: [{ id: "patinho-grelhado", papel: "proteina" }, { id: "mandioca", papel: "carbo" }], extra: "salada" },
    { itens: [{ id: "ovo-mexido", papel: "proteina" }, { id: "arroz-branco", papel: "carbo", parte: 0.6 }, { id: "feijao-carioca", papel: "carbo", parte: 0.4 }], extra: "salada" },
  ],
};

const porMedida = (a: Alimento) => {
  const f = a.medida_g / a.porcao_g;
  return { p: a.proteina_g * f, c: a.carboidratos_g * f, g: a.gorduras_g * f };
};
// Alimentos muito proteicos (filé, bife, lata de atum) podem entrar em meias porções.
const passo = (a: Alimento) => (porMedida(a).p >= 20 ? 0.5 : 1);

function frase(a: Alimento, q: number) {
  const comp = a.de ? " " + a.de : "";
  if (q === 1) return `${a.medida_caseira}${comp}`;
  if (q === 0.5) return `1/2 ${a.medida_caseira.replace(/^1 /, "")}${comp}`;
  const n = Number.isInteger(q) ? String(q) : String(q).replace(".", ",");
  return `${n} ${a.medida_plural}${comp}`;
}

// Escala as quantidades (em medidas caseiras) para chegar perto dos macros da refeição.
// A proteína dos acompanhamentos (arroz, feijão, pão...) é descontada da dos alimentos principais.
export function montar(c: Cardapio, alvo: { proteina: number; carbo: number; gordura: number }) {
  const prot = c.itens.filter((i) => i.papel === "proteina");
  const carb = c.itens.filter((i) => i.papel === "carbo");
  const qp = prot.map(() => 1);
  const qc = carb.map(() => 1);

  for (let volta = 0; volta < 3; volta++) {
    const pDosCarbos = carb.reduce((s, i, k) => s + porMedida(A[i.id]).p * qc[k], 0);
    prot.forEach((i, k) => {
      const a = A[i.id], st = passo(a);
      const quer = (Math.max(0, alvo.proteina - pDosCarbos) * (i.parte ?? 1 / prot.length)) / porMedida(a).p;
      qp[k] = Math.max(st, Math.round(quer / st) * st);
    });
    const cDasProteinas = prot.reduce((s, i, k) => s + porMedida(A[i.id]).c * qp[k], 0);
    const falta = Math.max(0, alvo.carbo - cDasProteinas);
    carb.forEach((i, k) => {
      const a = A[i.id];
      qc[k] = Math.max(1, Math.round((falta * (i.parte ?? 1 / carb.length)) / porMedida(a).c));
    });
  }

  const linhas: [Alimento, number][] = [...prot.map((i, k) => [A[i.id], qp[k]] as [Alimento, number]), ...carb.map((i, k) => [A[i.id], qc[k]] as [Alimento, number])];
  let g = linhas.reduce((s, [a, q]) => s + porMedida(a).g * q, 0);
  if (c.azeite) {
    const az = A["azeite"];
    const q = Math.min(2, Math.max(0, Math.round((alvo.gordura - g) / porMedida(az).g)));
    if (q > 0) { linhas.push([az, q]); g += porMedida(az).g * q; }
  }
  return {
    partes: linhas.map(([a, q]) => frase(a, q)),
    extra: c.extra,
    proteina: linhas.reduce((s, [a, q]) => s + porMedida(a).p * q, 0),
    carbo: linhas.reduce((s, [a, q]) => s + porMedida(a).c * q, 0),
    gordura: g,
  };
}
