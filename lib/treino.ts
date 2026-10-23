import { EXERCICIOS, categoriaDe } from "@/data/exercicios";
import {
  DICAS, ISOMETRICOS, MENSAGEM_POUCOS, MODELOS, MULTI, NOMES_DIAS, NOTA_PLIOMETRIA, ORDEM, PLANOS, PLIOMETRICOS, PONTOS_FRACOS,
  PRESC, TITULOS, UNILATERAIS, type Cat, type Freq, type ObjetivoId, type Presc, type Slot, type Tipo,
} from "@/data/treinos";
import type { Exercicio, GrupoMuscular } from "./types";

export interface ItemFicha {
  id: string;
  series: string; // texto pronto, ex.: "4 × 6 a 8 repetições"
  descanso: string;
  sets: number;
  repsAlvo: string; // ex.: "6 a 8" (ou segundos, nos isométricos)
  unidade: "reps" | "segundos";
  lado: string; // "", "por perna" ou "por lado"
  foco?: boolean;
}
export interface DiaFicha { dia: string; diaIdx: number; titulo: string; leve?: boolean; itens: ItemFicha[] }
export interface Ficha { titulo: string; divisao: string; justificativa: string; notas: string[]; dias: DiaFicha[] }
export type Resultado = { ficha: Ficha } | { erro: string };

type Modelo = "saude" | "volei" | "futebol";
const porId = Object.fromEntries(EXERCICIOS.map((e) => [e.id, e])) as Record<string, Exercicio>;

function candidatos(slot: Slot, modelo: Modelo): Exercicio[] {
  if (slot === "Salto") return PLIOMETRICOS.map((id) => porId[id]).filter(Boolean);
  const todos = EXERCICIOS.filter((e) => categoriaDe(e.grupo_primario) === slot && !PLIOMETRICOS.includes(e.id));
  const ordem = ORDEM[modelo][slot as Cat] ?? ORDEM.saude[slot as Cat] ?? [];
  const ordenados = ordem.map((id) => todos.find((e) => e.id === id)).filter((e): e is Exercicio => !!e);
  return [...ordenados, ...todos.filter((e) => !ordem.includes(e.id))];
}

// Escolhe um exercício por vaga. A "variante" gira a escolha (Treino A pega o 1º, Treino B o 2º...).
function escolher(slots: Slot[], variante: number, modelo: Modelo): Exercicio[] {
  const usados = new Set<string>();
  const contagem: Record<string, number> = {};
  const saida: Exercicio[] = [];
  for (const slot of slots) {
    const lista = candidatos(slot, modelo);
    if (!lista.length) continue;
    const k = contagem[slot] ?? 0;
    contagem[slot] = k + 1;
    const vezes = slots.filter((s) => s === slot).length;
    let idx = (variante * vezes + k) % lista.length;
    for (let t = 0; t < lista.length && usados.has(lista[idx].id); t++) idx = (idx + 1) % lista.length;
    if (usados.has(lista[idx].id)) continue;
    usados.add(lista[idx].id);
    saida.push(lista[idx]);
  }
  return saida;
}

// Primeiras n vagas, preferindo grupos diferentes; se faltar, repete.
function distintos(slots: Slot[], n: number): Slot[] {
  const saida: Slot[] = [];
  for (const s of slots) {
    if (!saida.includes(s)) saida.push(s);
    if (saida.length === n) return saida;
  }
  for (const s of slots) {
    if (saida.length >= n) break;
    saida.push(s);
  }
  return saida;
}

function formatar(e: Exercicio, p: Presc, leve: boolean): ItemFicha {
  const sets = leve ? Math.min(2, p.sets) : p.sets;
  const iso = ISOMETRICOS[e.id];
  const reps = iso ?? `${p.reps} repetições${UNILATERAIS[e.id] ?? ""}`;
  const lado = iso ? (iso.includes("por lado") ? "por lado" : "") : (UNILATERAIS[e.id] ?? "").trim();
  const repsAlvo = iso ? iso.replace(/ segundos( por lado)?/, "") : p.reps;
  return { id: e.id, series: `${sets} × ${reps}`, descanso: p.rest, sets, repsAlvo, unidade: iso ? "segundos" : "reps", lado };
}

function justificativa(obj: ObjetivoId, grupo: GrupoMuscular) {
  const nome = PONTOS_FRACOS.find((p) => p.id === grupo)?.nome.toLowerCase() ?? "músculo escolhido";
  switch (obj) {
    case "saude":
      return "Para Saúde Geral, usamos exercícios multiarticulares (agachamento, supino, remada), que trabalham vários músculos de uma vez e ensinam o corpo a se mover em conjunto. Três séries de 10 a 12 repetições, com 60 segundos de descanso, desenvolvem força e resistência sem sobrecarregar as articulações.";
    case "volei":
      return "Para o Vôlei, focamos em exercícios explosivos para melhorar seu salto: força de pernas com carga moderada e velocidade alta, saltos para treinar a potência, e panturrilhas e core para a aterrissagem. O descanso de 90 segundos é essencial para recuperar a força entre as séries.";
    case "futebol":
      return "Para o Futebol, priorizamos a parte de trás da coxa (stiff, mesa flexora), o core e os exercícios de estabilidade, que ajudam a acelerar, frear e mudar de direção com menos risco de lesão. O descanso de 90 segundos mantém a qualidade de cada série.";
    default:
      return `Para fortalecer seu ponto fraco (${nome}), colocamos 2 exercícios focados nele em cada sessão em que ele é treinado, com 3 séries e descanso curto de 60 segundos, e 2 exercícios de manutenção para o resto do corpo. O músculo-foco não é treinado em dias seguidos, para ter tempo de se recuperar.`;
  }
}

export function montarFicha(freq: Freq, obj: ObjetivoId, grupo: GrupoMuscular): Resultado {
  const plano = PLANOS[freq];
  const modelo: Modelo = obj === "fraco" ? "saude" : obj;
  const catFoco = categoriaDe(grupo);

  let foco: Exercicio[] = [];
  if (obj === "fraco") {
    const doGrupo = EXERCICIOS.filter((e) => e.grupo_primario === grupo && !PLIOMETRICOS.includes(e.id));
    foco = [...doGrupo.filter((e) => !MULTI.has(e.id)), ...doGrupo.filter((e) => MULTI.has(e.id))]; // isolados primeiro
    if (foco.length < 2) return { erro: MENSAGEM_POUCOS };
  }
  // Se houver pelo menos 2 isolados, o foco usa só eles (e gira entre eles, se houver mais de 2).
  const isolados = foco.filter((e) => !MULTI.has(e.id));
  const baseFoco = isolados.length >= 2 ? isolados : foco;

  const ocorrencias: Partial<Record<Tipo, number>> = {};
  let saltos = 0, ultimoSalto = -9, ultimoFoco = -9, nFoco = 0;

  const dias: DiaFicha[] = plano.tipos.map((tipo, i) => {
    const dia = plano.dias[i];
    const oc = ocorrencias[tipo] ?? 0;
    ocorrencias[tipo] = oc + 1;
    const variante = tipo === "fullA" ? 0 : tipo === "fullB" ? 1 : oc % 2;
    const leve = tipo === "fullLeve";
    let slots = MODELOS[modelo][tipo];

    if (slots.includes("Salto")) {
      // No máximo 2 sessões com saltos por semana, com 48 h entre elas.
      if (saltos < 2 && dia - ultimoSalto >= 2) { saltos++; ultimoSalto = dia; }
      else slots = slots.filter((s) => s !== "Salto");
    }

    let itens: ItemFicha[];
    if (obj === "fraco") {
      const incluiFoco = slots.includes(catFoco) && dia - ultimoFoco >= 2;
      if (incluiFoco) {
        ultimoFoco = dia;
        const par = [baseFoco[(nFoco * 2) % baseFoco.length], baseFoco[(nFoco * 2 + 1) % baseFoco.length]];
        nFoco++;
        const manut = escolher(distintos(slots.filter((s) => s !== catFoco), 2), variante, "saude");
        itens = [...par.map((e) => ({ ...formatar(e, PRESC.foco, leve), foco: true })), ...manut.map((e) => formatar(e, PRESC.manut, leve))];
      } else {
        itens = escolher(distintos(slots, 3), variante, "saude").map((e) => formatar(e, PRESC.manut, leve));
      }
    } else {
      const base = PRESC[obj];
      itens = escolher(slots, variante, modelo).map((e) => formatar(e, PLIOMETRICOS.includes(e.id) ? PRESC.salto : base, leve));
    }
    return { dia: NOMES_DIAS[dia], diaIdx: dia, titulo: TITULOS[tipo], leve, itens };
  });

  const notas: string[] = [];
  if (freq === 3) notas.push("Na semana seguinte, comece pelo Treino B (B, A, B), para alternar os estímulos.");
  if (obj === "volei") notas.push(NOTA_PLIOMETRIA);
  if (obj === "futebol") notas.push("Agilidade se treina em campo, com corridas e mudanças de direção. Esta ficha cobre a força de base.");
  notas.push(...DICAS);

  return {
    ficha: {
      titulo: `${plano.nome} · ${freq}x por semana`,
      divisao: plano.divisao,
      justificativa: justificativa(obj, grupo),
      notas,
      dias,
    },
  };
}
