import { ALIMENTOS } from "@/data/alimentos";
import type { Alimento } from "./types";

const A = Object.fromEntries(ALIMENTOS.map((a) => [a.id, a])) as Record<string, Alimento>;

type Item = { id: string; papel: "proteina" | "carbo"; parte?: number };
export interface Cardapio { itens: Item[]; extra: string; azeite?: boolean }

// 3 opções por refeição: misturam carnes grelhadas e opções simples. Cada prato divide os carboidratos
// entre 2 ou 3 acompanhamentos, para que as quantidades caibam em um prato de verdade.
export const CARDAPIOS: Record<string, Cardapio[]> = {
  cafe: [
    { itens: [{ id: "ovo-mexido", papel: "proteina" }, { id: "pao-frances", papel: "carbo", parte: 0.6 }, { id: "banana", papel: "carbo", parte: 0.4 }], extra: "café" },
    { itens: [{ id: "iogurte-natural", papel: "proteina", parte: 0.5 }, { id: "queijo-minas", papel: "proteina", parte: 0.5 }, { id: "aveia", papel: "carbo", parte: 0.3 }, { id: "banana", papel: "carbo", parte: 0.4 }, { id: "pao-integral", papel: "carbo", parte: 0.3 }], extra: "" },
    { itens: [{ id: "ovo-cozido", papel: "proteina", parte: 0.5 }, { id: "queijo-minas", papel: "proteina", parte: 0.5 }, { id: "pao-integral", papel: "carbo", parte: 0.6 }, { id: "banana", papel: "carbo", parte: 0.4 }], extra: "café" },
  ],
  almoco: [
    { itens: [{ id: "frango-grelhado", papel: "proteina" }, { id: "arroz-branco", papel: "carbo", parte: 0.45 }, { id: "feijao-carioca", papel: "carbo", parte: 0.25 }, { id: "batata-inglesa", papel: "carbo", parte: 0.3 }], extra: "salada" },
    { itens: [{ id: "patinho-grelhado", papel: "proteina" }, { id: "arroz-branco", papel: "carbo", parte: 0.45 }, { id: "feijao-preto", papel: "carbo", parte: 0.25 }, { id: "mandioca", papel: "carbo", parte: 0.3 }], extra: "1 porção de legumes" },
    { itens: [{ id: "atum-lata", papel: "proteina" }, { id: "arroz-integral", papel: "carbo", parte: 0.45 }, { id: "lentilha", papel: "carbo", parte: 0.25 }, { id: "batata-doce", papel: "carbo", parte: 0.3 }], extra: "salada", azeite: true },
  ],
  lanche: [
    { itens: [{ id: "iogurte-natural", papel: "proteina", parte: 0.6 }, { id: "queijo-minas", papel: "proteina", parte: 0.4 }, { id: "banana", papel: "carbo", parte: 0.5 }, { id: "aveia", papel: "carbo", parte: 0.5 }], extra: "" },
    { itens: [{ id: "ovo-cozido", papel: "proteina" }, { id: "pao-integral", papel: "carbo", parte: 0.7 }, { id: "banana", papel: "carbo", parte: 0.3 }], extra: "tomate" },
    { itens: [{ id: "queijo-minas", papel: "proteina", parte: 0.5 }, { id: "ovo-cozido", papel: "proteina", parte: 0.5 }, { id: "pao-frances", papel: "carbo", parte: 0.6 }, { id: "banana", papel: "carbo", parte: 0.4 }], extra: "" },
  ],
  jantar: [
    { itens: [{ id: "frango-grelhado", papel: "proteina" }, { id: "batata-doce", papel: "carbo", parte: 0.35 }, { id: "arroz-branco", papel: "carbo", parte: 0.4 }, { id: "feijao-carioca", papel: "carbo", parte: 0.25 }], extra: "1 porção de legumes", azeite: true },
    { itens: [{ id: "patinho-grelhado", papel: "proteina" }, { id: "mandioca", papel: "carbo", parte: 0.4 }, { id: "arroz-branco", papel: "carbo", parte: 0.4 }, { id: "feijao-preto", papel: "carbo", parte: 0.2 }], extra: "salada" },
    { itens: [{ id: "ovo-mexido", papel: "proteina" }, { id: "arroz-branco", papel: "carbo", parte: 0.45 }, { id: "feijao-carioca", papel: "carbo", parte: 0.3 }, { id: "batata-inglesa", papel: "carbo", parte: 0.25 }], extra: "salada" },
  ],
};

const porMedida = (a: Alimento) => {
  const f = a.medida_g / a.porcao_g;
  return { p: a.proteina_g * f, c: a.carboidratos_g * f, g: a.gorduras_g * f };
};
const limite = (a: Alimento) => a.max_por_refeicao ?? 4;
// Alimentos muito proteicos (filé, bife, lata de atum) podem entrar em meias porções.
const passo = (a: Alimento) => (porMedida(a).p >= 20 ? 0.5 : 1);

function frase(a: Alimento, q: number) {
  const comp = a.de ? " " + a.de : "";
  if (q === 1) return `${a.medida_caseira}${comp}`;
  if (q === 0.5) return `1/2 ${a.medida_caseira.replace(/^1 /, "")}${comp}`;
  const n = Number.isInteger(q) ? String(q) : String(q).replace(".", ",");
  return `${n} ${a.medida_plural}${comp}`;
}

// Escala as quantidades (em medidas caseiras) para chegar perto dos macros da refeição, sem passar do limite
// realista de cada alimento. A proteína dos acompanhamentos é descontada da dos alimentos principais.
// Quando o limite impede de chegar à meta, o prato fica abaixo dela (o app avisa na tela).
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
      qp[k] = Math.min(limite(a), Math.max(st, Math.round(quer / st) * st));
    });
    const cDasProteinas = prot.reduce((s, i, k) => s + porMedida(A[i.id]).c * qp[k], 0);
    const falta = Math.max(0, alvo.carbo - cDasProteinas);
    carb.forEach((i, k) => {
      const a = A[i.id];
      qc[k] = Math.min(limite(a), Math.max(1, Math.round((falta * (i.parte ?? 1 / carb.length)) / porMedida(a).c)));
    });
    // O que sobrou é distribuído, uma porção por vez, entre os acompanhamentos que ainda têm espaço.
    let atual = cDasProteinas + carb.reduce((s, i, k) => s + porMedida(A[i.id]).c * qc[k], 0);
    for (let n = 0; n < 30; n++) {
      const livres = carb.map((_, k) => k).filter((k) => qc[k] < limite(A[carb[k].id]));
      if (!livres.length) break;
      const k = livres.reduce((x, y) => (qc[x] / limite(A[carb[x].id]) <= qc[y] / limite(A[carb[y].id]) ? x : y));
      const c1 = porMedida(A[carb[k].id]).c;
      if (alvo.carbo - atual < c1 / 2) break;
      qc[k] += 1;
      atual += c1;
    }
  }

  const linhas: [Alimento, number][] = [
    ...prot.map((i, k) => [A[i.id], qp[k]] as [Alimento, number]),
    ...carb.map((i, k) => [A[i.id], qc[k]] as [Alimento, number]),
  ];
  let g = linhas.reduce((s, [a, q]) => s + porMedida(a).g * q, 0);
  if (c.azeite) {
    const az = A["azeite"];
    const q = Math.min(limite(az), Math.max(0, Math.round((alvo.gordura - g) / porMedida(az).g)));
    if (q > 0) { linhas.push([az, q]); g += porMedida(az).g * q; }
  }
  const proteina = linhas.reduce((s, [a, q]) => s + porMedida(a).p * q, 0);
  const carbo = linhas.reduce((s, [a, q]) => s + porMedida(a).c * q, 0);
  return { partes: linhas.map(([a, q]) => frase(a, q)), extra: c.extra, proteina, carbo, gordura: g, kcal: proteina * 4 + carbo * 4 + g * 9 };
}
