import { EXERCICIOS, categoriaDe } from "@/data/exercicios";
import {
  DICAS, FOCO_ORDEM, ISOMETRICOS, MAX_FOCO, MIN_FOCO, MODELOS, NOMES_DIAS, NOTA_FOCO_FREQ, NOTA_PLIOMETRIA, ORDEM, PLANOS,
  PLANO_FOCO, PLIOMETRICOS, PONTOS_FRACOS, PRESC, TITULOS, UNIDADE_ESPECIAL, UNILATERAIS, mensagemPoucos,
  type Cat, type Freq, type ObjetivoId, type Presc, type Slot, type Tipo,
} from "@/data/treinos";
import type { Exercicio, GrupoMuscular } from "./types";

export interface ItemFicha { id: string; series: string; descanso: string }
export interface DiaFicha { dia: string; titulo: string; leve?: boolean; itens: ItemFicha[] }
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

function formatar(e: Exercicio, p: Presc, leve: boolean): ItemFicha {
  const sets = leve ? Math.min(2, p.sets) : p.sets;
  const reps = ISOMETRICOS[e.id] ?? `${p.reps} ${UNIDADE_ESPECIAL[e.id] ?? "repetições"}${UNILATERAIS[e.id] ?? ""}`;
  return { id: e.id, series: `${sets} × ${reps}`, descanso: p.rest };
}

function justificativa(obj: Exclude<ObjetivoId, "fraco">): string {
  switch (obj) {
    case "saude":
      return "Para Saúde Geral, usamos exercícios multiarticulares (agachamento, supino, remada), que trabalham vários músculos de uma vez e ensinam o corpo a se mover em conjunto. Três séries de 10 a 12 repetições, com 60 segundos de descanso, desenvolvem força e resistência sem sobrecarregar as articulações.";
    case "volei":
      return "Para o Vôlei, o foco é a pliometria: exercícios explosivos que melhoram a impulsão e a rigidez do tornozelo, isto é, a capacidade do tornozelo e do tendão de Aquiles de funcionar como uma mola no salto e na aterrissagem. A força de pernas (agachamento) e a panturrilha em pé sustentam esse trabalho, com poucas repetições e velocidade alta. O descanso de 90 segundos é essencial para recuperar a força entre as séries.";
    case "futebol":
      return "Para o Futebol, o foco é a prevenção de lesões e a força da parte de trás da coxa (stiff, mesa flexora), que ajuda a estabilizar e proteger o joelho nas freadas e nas mudanças de direção. O afundo treina uma perna de cada vez, como no jogo, e o core estável mantém o tronco firme na hora de mudar de direção. O descanso de 90 segundos mantém a qualidade de cada série.";
  }
}

// Ponto Fraco: 100% focado em um músculo, sem exercícios de manutenção para o resto do corpo.
function montarFoco(freq: Freq, grupo: GrupoMuscular): Resultado {
  const nome = PONTOS_FRACOS.find((p) => p.id === grupo)?.nome ?? "o músculo escolhido";
  const doGrupo = EXERCICIOS.filter((e) => e.grupo_primario === grupo && !PLIOMETRICOS.includes(e.id));
  if (doGrupo.length < MIN_FOCO) return { erro: mensagemPoucos(doGrupo.length) };

  const ordem = FOCO_ORDEM[grupo];
  const posicao = (e: Exercicio) => (ordem.includes(e.id) ? ordem.indexOf(e.id) : 100 + doGrupo.indexOf(e));
  const lista = [...doGrupo].sort((a, b) => posicao(a) - posicao(b));
  const n = Math.min(MAX_FOCO, lista.length);
  const plano = PLANO_FOCO[freq];

  const dias: DiaFicha[] = plano.dias.map((dia, i) => {
    const inicio = lista.length > n ? i % lista.length : 0; // gira a lista quando há mais exercícios do que cabem
    const escolhidos = Array.from({ length: n }, (_, k) => lista[(inicio + k) % lista.length]);
    return { dia: NOMES_DIAS[dia], titulo: `${nome} · sessão ${i + 1}`, itens: escolhidos.map((e) => formatar(e, PRESC.foco, false)) };
  });

  const notas: string[] = [];
  if (freq >= 4) notas.push(NOTA_FOCO_FREQ);
  notas.push(...DICAS);
  return {
    ficha: {
      titulo: `Foco em ${nome} · ${dias.length}x por semana`,
      divisao: plano.divisao,
      justificativa: `Este treino é focado em ${nome}. Como é um treino de fortalecimento específico, não se esqueça de manter o resto do corpo ativo em outros dias da semana. Cada exercício ataca o músculo por um ângulo diferente, em 3 séries de 10 a 15 repetições, com 60 segundos de descanso.`,
      notas,
      dias,
    },
  };
}

export function montarFicha(freq: Freq, obj: ObjetivoId, grupo: GrupoMuscular): Resultado {
  if (obj === "fraco") return montarFoco(freq, grupo);

  const plano = PLANOS[freq];
  const modelo: Modelo = obj;
  const base = PRESC[obj];
  const ocorrencias: Partial<Record<Tipo, number>> = {};
  let saltos = 0, ultimoSalto = -9;

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

    const itens = escolher(slots, variante, modelo).map((e) => {
      const p = e.id === "saltos-tornozelo" ? PRESC.pogo : PLIOMETRICOS.includes(e.id) ? PRESC.salto : base;
      return formatar(e, p, leve);
    });
    return { dia: NOMES_DIAS[dia], titulo: TITULOS[tipo], leve, itens };
  });

  const notas: string[] = [];
  if (freq === 3) notas.push("Na semana seguinte, comece pelo Treino B (B, A, B), para alternar os estímulos.");
  if (obj === "volei") notas.push(NOTA_PLIOMETRIA);
  if (obj === "futebol") notas.push("Agilidade se treina em campo, com corridas e mudanças de direção. Esta ficha cobre a força de base.");
  notas.push(...DICAS);

  return {
    ficha: { titulo: `${plano.nome} · ${freq}x por semana`, divisao: plano.divisao, justificativa: justificativa(obj), notas, dias },
  };
}
