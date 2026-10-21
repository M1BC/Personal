export type Sexo = "m" | "f";
export type Atividade = "sedentario" | "leve" | "moderado" | "intenso";
export type Objetivo = "perder" | "manter" | "ganhar";

export interface Perfil { peso: string; pesoMeta: string; altura: string; idade: string; sexo: Sexo; atividade: Atividade }
export const PERFIL_PADRAO: Perfil = { peso: "75", pesoMeta: "", altura: "175", idade: "30", sexo: "m", atividade: "moderado" };

export const ATIVIDADES: Record<Atividade, string> = {
  sedentario: "Sedentário (pouco ou nenhum exercício)",
  leve: "Leve (exercício 1 a 3 vezes por semana)",
  moderado: "Moderado (exercício 3 a 5 vezes por semana)",
  intenso: "Intenso (exercício quase todos os dias)",
};
const FATOR: Record<Atividade, number> = { sedentario: 1.2, leve: 1.375, moderado: 1.55, intenso: 1.725 };

export const LIMITES = { peso: [30, 250], altura: [120, 230], idade: [14, 90] } as const;
export const G_POR_KG = 1.6; // proteína por kg
const PISO: Record<Sexo, number> = { m: 1500, f: 1200 }; // calorias mínimas por dia, sem acompanhamento
const KCAL_POR_KG = 7700; // aproximação: energia de 1 kg de peso corporal

export const REFEICOES = [
  { id: "cafe", nome: "Café da Manhã", pct: 0.25 },
  { id: "almoco", nome: "Almoço", pct: 0.3 },
  { id: "lanche", nome: "Lanche", pct: 0.15 },
  { id: "jantar", nome: "Jantar", pct: 0.3 },
] as const;

export const fmt = (n: number, casas = 1) => n.toLocaleString("pt-BR", { maximumFractionDigits: casas });
const num = (s: string) => Number(s.replace(",", "."));

export interface Dados { peso: number; altura: number; idade: number; sexo: Sexo; atividade: Atividade; pesoMeta: number | null }

export function validar(p: Perfil): { dados?: Dados; erros: string[] } {
  const erros: string[] = [];
  const dentro = (v: number, [a, b]: readonly [number, number]) => Number.isFinite(v) && v >= a && v <= b;
  const peso = num(p.peso), altura = num(p.altura), idade = num(p.idade);
  if (!dentro(peso, LIMITES.peso)) erros.push(`Peso atual: informe entre ${LIMITES.peso[0]} e ${LIMITES.peso[1]} kg.`);
  if (!dentro(altura, LIMITES.altura)) erros.push(`Altura: informe entre ${LIMITES.altura[0]} e ${LIMITES.altura[1]} cm.`);
  if (!dentro(idade, LIMITES.idade)) erros.push(`Idade: informe entre ${LIMITES.idade[0]} e ${LIMITES.idade[1]} anos.`);
  let pesoMeta: number | null = null;
  if (p.pesoMeta.trim() !== "") {
    const m = num(p.pesoMeta);
    if (dentro(m, LIMITES.peso)) pesoMeta = m;
    else erros.push(`Peso meta: informe entre ${LIMITES.peso[0]} e ${LIMITES.peso[1]} kg.`);
  }
  if (erros.length) return { erros };
  return { erros, dados: { peso, altura, idade, sexo: p.sexo, atividade: p.atividade, pesoMeta } };
}

export interface Plano {
  tmb: number; get: number; kcal: number; proteina: number; gordura: number; carbo: number;
  objetivo: Objetivo; abaixoDoPiso: boolean; piso: number; imcMeta: number;
}

export function calcularPlano(d: Dados): Plano {
  // Mifflin-St Jeor
  const tmb = 10 * d.peso + 6.25 * d.altura - 5 * d.idade + (d.sexo === "m" ? 5 : -161);
  const get = tmb * FATOR[d.atividade];
  const imcMeta = (d.pesoMeta ?? d.peso) / (d.altura / 100) ** 2;
  const diff = d.pesoMeta === null ? 0 : d.pesoMeta - d.peso;
  let objetivo: Objetivo = Math.abs(diff) < 0.5 ? "manter" : diff < 0 ? "perder" : "ganhar";
  if (objetivo === "perder" && imcMeta < 18.5) objetivo = "manter"; // meta abaixo do peso saudável: não emagrece mais
  const piso = PISO[d.sexo];
  const kcal = objetivo === "perder" ? Math.max(get - 400, Math.min(get, piso)) : objetivo === "ganhar" ? get + 400 : get;
  const proteina = d.peso * G_POR_KG;
  const gordura = (kcal * 0.25) / 9;
  const carbo = Math.max(0, (kcal - proteina * 4 - gordura * 9) / 4);
  return { tmb, get, kcal, proteina, gordura, carbo, objetivo, abaixoDoPiso: objetivo === "perder" && get - 400 < piso, piso, imcMeta };
}

export type Projecao =
  | { tipo: "perto" }
  | { tipo: "sem_margem" }
  | { tipo: "imc_baixo"; imc: number }
  | { tipo: "perder" | "ganhar"; kg: number; semanasMin: number; semanasMax: number; ajusteMin: number; ajusteMax: number; ritmoMin: number; ritmoMax: number };

export function projetar(d: Dados, p: Plano): Projecao | null {
  if (d.pesoMeta === null) return null;
  const diff = d.pesoMeta - d.peso;
  const kg = Math.abs(diff);
  if (kg < 0.5) return { tipo: "perto" };
  if (diff < 0 && p.imcMeta < 18.5) return { tipo: "imc_baixo", imc: p.imcMeta };
  let ajusteMax = 500;
  if (diff < 0) {
    ajusteMax = Math.min(500, p.get - p.piso);
    if (ajusteMax < 100) return { tipo: "sem_margem" };
  }
  const ajusteMin = Math.min(300, ajusteMax);
  const semanas = (aj: number) => (kg * KCAL_POR_KG) / (aj * 7);
  return {
    tipo: diff < 0 ? "perder" : "ganhar", kg,
    semanasMin: semanas(ajusteMax), semanasMax: semanas(ajusteMin), ajusteMin, ajusteMax,
    ritmoMin: (ajusteMin * 7) / KCAL_POR_KG, ritmoMax: (ajusteMax * 7) / KCAL_POR_KG,
  };
}

export function dividir(p: Plano, pcts?: Record<string, number>) {
  return REFEICOES.map((r) => {
    const pct = pcts?.[r.id] ?? r.pct;
    return { id: r.id, nome: r.nome, pct, kcal: p.kcal * pct, proteina: p.proteina * pct, carbo: p.carbo * pct, gordura: p.gordura * pct };
  });
}
