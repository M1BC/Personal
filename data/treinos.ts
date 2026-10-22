import type { GrupoMuscular } from "@/lib/types";
import type { Categoria } from "./exercicios";

export type Cat = Exclude<Categoria, "Todos">;
export type Slot = Cat | "Salto";
export type Freq = 2 | 3 | 4 | 5;
export type Tipo = "fullA" | "fullB" | "upper" | "lower" | "peitoTriceps" | "costasBiceps" | "pernas" | "ombros" | "fullLeve";

export const FREQUENCIAS: Freq[] = [2, 3, 4, 5];

export const OBJETIVOS = [
  { id: "saude", nome: "Saúde Geral", sub: "Multiarticulares, corpo todo" },
  { id: "volei", nome: "Vôlei (Potência e Salto)", sub: "Pernas explosivas e aterrissagem" },
  { id: "futebol", nome: "Futebol (Força e Agilidade)", sub: "Posterior, core e estabilidade" },
  { id: "fraco", nome: "Fortalecer Ponto Fraco", sub: "Foco em um músculo" },
] as const;
export type ObjetivoId = (typeof OBJETIVOS)[number]["id"];

export const PONTOS_FRACOS: { id: GrupoMuscular; nome: string }[] = [
  { id: "peitoral", nome: "Peito" }, { id: "dorsais", nome: "Costas" }, { id: "ombros", nome: "Ombros" },
  { id: "biceps", nome: "Bíceps" }, { id: "triceps", nome: "Tríceps" }, { id: "quadriceps", nome: "Quadríceps" },
  { id: "posteriores", nome: "Posterior da coxa" }, { id: "gluteos", nome: "Glúteos" }, { id: "panturrilhas", nome: "Panturrilha" },
  { id: "core", nome: "Core" }, { id: "lombar", nome: "Lombar" },
];

export const MENSAGEM_POUCOS = "Ainda não temos exercícios suficientes para este grupo. Em breve adicionaremos mais!";

export const PLIOMETRICOS = ["agachamento-salto", "box-jump"];

// Exercícios multiarticulares (vários músculos e articulações). Os demais são considerados isolados.
export const MULTI = new Set([
  "agachamento", "supino-reto", "supino-inclinado", "supino-halteres", "flexao", "puxada-frente", "remada-curvada",
  "remada-sentada", "remada-maquina", "remada-unilateral", "remada-cavalinho", "barra-fixa", "leg-press", "agachamento-hack",
  "afundo", "agachamento-bulgaro", "levantamento-terra", "stiff", "elevacao-pelvica", "desenvolvimento",
  "desenvolvimento-militar", "supino-fechado", "mergulho-paralelas", "agachamento-salto", "box-jump",
]);

export const ISOMETRICOS: Record<string, string> = { prancha: "30 a 45 segundos", "prancha-lateral": "20 a 30 segundos por lado" };
export const UNILATERAIS: Record<string, string> = {
  afundo: " por perna", "agachamento-bulgaro": " por perna", "panturrilha-unilateral": " por perna", "remada-unilateral": " por lado",
};

export interface Presc { sets: number; reps: string; rest: string }
export const PRESC = {
  saude: { sets: 3, reps: "10 a 12", rest: "60 s" },
  volei: { sets: 4, reps: "6 a 8", rest: "90 s" },
  salto: { sets: 4, reps: "5", rest: "90 s" },
  futebol: { sets: 3, reps: "8 a 10", rest: "90 s" },
  foco: { sets: 3, reps: "10 a 15", rest: "60 s" },
  manut: { sets: 2, reps: "8 a 10", rest: "90 s" },
} satisfies Record<string, Presc>;

type Modelo = "saude" | "volei" | "futebol";

// Ordem de preferência por categoria (multiarticulares primeiro). O que não estiver na lista entra depois.
export const ORDEM: Record<Modelo, Partial<Record<Cat, string[]>>> = {
  saude: {
    Peito: ["supino-reto", "supino-inclinado", "supino-halteres", "flexao", "crucifixo", "peck-deck"],
    Costas: ["remada-curvada", "puxada-frente", "remada-sentada", "barra-fixa", "remada-maquina", "remada-unilateral", "remada-cavalinho", "pulldown-braco-reto"],
    Quadríceps: ["agachamento", "leg-press", "afundo", "agachamento-hack", "agachamento-bulgaro", "cadeira-extensora"],
    Posterior: ["stiff", "levantamento-terra", "elevacao-pelvica", "mesa-flexora", "cadeira-flexora", "coice-polia"],
    Ombros: ["desenvolvimento", "desenvolvimento-militar", "elevacao-lateral", "face-pull", "crucifixo-inverso", "elevacao-frontal"],
    Bíceps: ["rosca-direta", "rosca-alternada", "rosca-martelo", "rosca-scott", "rosca-polia", "rosca-concentrada"],
    Tríceps: ["supino-fechado", "mergulho-paralelas", "triceps-corda", "triceps-testa", "triceps-frances", "triceps-coice"],
    Panturrilha: ["panturrilha-em-pe", "panturrilha-sentada", "panturrilha-leg-press", "panturrilha-unilateral", "panturrilha-burrinho", "panturrilha-smith"],
    Core: ["prancha", "abdominal-polia", "prancha-lateral", "elevacao-pernas", "dead-bug", "abdominal-roda"],
  },
  volei: {
    Quadríceps: ["agachamento", "leg-press", "agachamento-hack", "afundo", "agachamento-bulgaro", "cadeira-extensora"],
    Posterior: ["elevacao-pelvica", "stiff", "levantamento-terra", "mesa-flexora", "cadeira-flexora", "coice-polia"],
    Costas: ["puxada-frente", "remada-sentada", "remada-curvada", "barra-fixa"],
    Ombros: ["face-pull", "desenvolvimento", "crucifixo-inverso", "elevacao-lateral"],
    Core: ["prancha", "prancha-lateral", "elevacao-pernas", "dead-bug", "abdominal-roda", "abdominal-polia"],
  },
  futebol: {
    Posterior: ["stiff", "mesa-flexora", "levantamento-terra", "elevacao-pelvica", "cadeira-flexora", "coice-polia"],
    Quadríceps: ["afundo", "agachamento-bulgaro", "agachamento", "leg-press", "agachamento-hack", "cadeira-extensora"],
    Core: ["prancha-lateral", "prancha", "dead-bug", "elevacao-pernas", "abdominal-polia", "abdominal-roda"],
  },
};

// Quais categorias cada tipo de sessão treina (o mesmo grupo pode aparecer mais de uma vez).
const BASE: Record<Tipo, Slot[]> = {
  fullA: ["Quadríceps", "Peito", "Costas", "Posterior", "Ombros", "Core"],
  fullB: ["Posterior", "Peito", "Costas", "Quadríceps", "Ombros", "Core"],
  upper: ["Peito", "Costas", "Ombros", "Bíceps", "Tríceps"],
  lower: ["Quadríceps", "Posterior", "Quadríceps", "Posterior", "Panturrilha", "Core"],
  peitoTriceps: ["Peito", "Peito", "Peito", "Tríceps", "Tríceps"],
  costasBiceps: ["Costas", "Costas", "Costas", "Bíceps", "Bíceps"],
  pernas: ["Quadríceps", "Quadríceps", "Posterior", "Posterior", "Panturrilha"],
  ombros: ["Ombros", "Ombros", "Ombros", "Core"],
  fullLeve: ["Quadríceps", "Costas", "Peito", "Posterior", "Panturrilha"],
};
export const MODELOS: Record<Modelo, Record<Tipo, Slot[]>> = {
  saude: BASE,
  volei: {
    ...BASE,
    fullA: ["Quadríceps", "Salto", "Posterior", "Panturrilha", "Core", "Costas"],
    fullB: ["Quadríceps", "Salto", "Posterior", "Panturrilha", "Core", "Ombros"],
    upper: ["Costas", "Peito", "Ombros", "Ombros", "Costas"],
    lower: ["Quadríceps", "Salto", "Posterior", "Panturrilha", "Core"],
    pernas: ["Quadríceps", "Salto", "Quadríceps", "Posterior", "Panturrilha"],
  },
  futebol: {
    ...BASE,
    fullA: ["Posterior", "Posterior", "Quadríceps", "Core", "Core", "Costas"],
    fullB: ["Posterior", "Posterior", "Quadríceps", "Core", "Core", "Peito"],
    upper: ["Peito", "Costas", "Ombros", "Costas", "Bíceps"],
    lower: ["Posterior", "Posterior", "Quadríceps", "Quadríceps", "Core", "Core"],
    pernas: ["Posterior", "Posterior", "Quadríceps", "Quadríceps", "Panturrilha"],
  },
};

export const TITULOS: Record<Tipo, string> = {
  fullA: "Treino A · Corpo inteiro", fullB: "Treino B · Corpo inteiro", upper: "Superiores", lower: "Inferiores",
  peitoTriceps: "Peito e Tríceps", costasBiceps: "Costas e Bíceps", pernas: "Pernas", ombros: "Ombros e Core", fullLeve: "Full Body leve",
};

// dias: 0 = segunda ... 4 = sexta. Garantem 48 a 72 h entre sessões que treinam o mesmo grupo.
export const PLANOS: Record<Freq, { tipos: Tipo[]; dias: number[]; divisao: string; nome: string }> = {
  2: { tipos: ["fullA", "fullB"], dias: [0, 3], nome: "Full Body A/B", divisao: "Full Body (Treino A e B): o corpo inteiro em todas as sessões, com pelo menos 48 horas de descanso entre elas." },
  3: { tipos: ["fullA", "fullB", "fullA"], dias: [0, 2, 4], nome: "Full Body A/B", divisao: "Full Body (Treino A e B): o corpo inteiro em todas as sessões, com pelo menos 48 horas de descanso entre elas." },
  4: { tipos: ["upper", "lower", "upper", "lower"], dias: [0, 1, 3, 4], nome: "Superiores/Inferiores", divisao: "Superiores e Inferiores: cada grupo é treinado 2 vezes por semana, com cerca de 72 horas entre as sessões." },
  5: { tipos: ["peitoTriceps", "costasBiceps", "pernas", "ombros", "fullLeve"], dias: [0, 1, 2, 3, 4], nome: "Divisão por grupos", divisao: "Divisão por grupos: cada grupo tem o seu dia. O Full Body leve da sexta usa só 2 séries e carga moderada, sem exercícios principais de ombro (treinados na quinta)." },
};
export const NOMES_DIAS = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

export const DICAS = [
  "O descanso de 48 a 72 horas entre sessões do mesmo grupo muscular segue as recomendações do ACSM.",
  "Escolha uma carga que deixe 1 a 3 repetições de reserva no fim de cada série, com técnica boa.",
  "Aqueça por 5 a 10 minutos antes. Se sentir dor (não o cansaço normal do músculo), pare.",
];
export const NOTA_PLIOMETRIA =
  "Saltos: comece com poucas repetições, aterrisse suave (joelhos alinhados aos pés), faça saltos no máximo em 2 sessões por semana, com 48 horas entre elas, e só com uma base de força e sem dor. Peça orientação ao educador físico.";
