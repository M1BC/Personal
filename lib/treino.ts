import { EXERCICIOS, categoriaDe } from "@/data/exercicios";
import {
  APOIOS, CARDIO, DICAS, FOCO_ORDEM, FOCO_POR_SESSAO, ISOMETRICOS, MENSAGEM_VARIADA, MIN_FOCO, MODELOS, NIVEIS, NOMES_DIAS,
  NOTA_CARDIO, NOTA_CICLO_MEIO, NOTA_FOCO_FREQ, NOTA_PLIOMETRIA, ORDEM, PLANOS, PLANOS_HIPER, PLANO_FOCO, PLIOMETRICOS, POOL,
  PONTOS_FRACOS, PRESC, PRESC_HIPER, PRESC_HIPER_VARIADA, PRESC_VARIADA, PRINCIPAIS, RESERVA_HIPER, SESSOES_HIPER, TITULOS,
  UNIDADE_ESPECIAL, UNILATERAIS, mensagemPoucos,
  type Cat, type Ciclo, type Freq, type Nivel, type ObjetivoId, type Presc, type Slot, type Tipo,
} from "@/data/treinos";
import type { Exercicio, GrupoMuscular } from "./types";

export interface ItemFicha { id: string; series: string; descanso: string; obs?: string }
export interface DiaFicha { dia: string; titulo: string; leve?: boolean; itens: ItemFicha[] }
export interface Troca { dia: string; de: string; para: string }
export interface Ficha {
  titulo: string;
  divisao: string;
  justificativa: string;
  notas: string[];
  dias: DiaFicha[];
  variada: boolean; // true na "Ficha Variada" (mais de 3 meses na mesma ficha)
  trocas: Troca[]; // exercícios trocados na variação
  avisoCiclo?: string; // mensagem exibida no topo da ficha
}
export type Resultado = { ficha: Ficha } | { erro: string };

type Modelo = "saude" | "volei" | "futebol";
const porId = Object.fromEntries(EXERCICIOS.map((e) => [e.id, e])) as Record<string, Exercicio>;

function candidatos(slot: Slot, modelo: Modelo): Exercicio[] {
  if (slot === "Salto") return PLIOMETRICOS.map((id) => porId[id]).filter(Boolean);
  const todos = EXERCICIOS.filter((e) => !e.cardio && categoriaDe(e.grupo_primario) === slot && !PLIOMETRICOS.includes(e.id));
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

function posicao(modelo: Modelo, e: Exercicio): number {
  const cat = categoriaDe(e.grupo_primario);
  const ordem = ORDEM[modelo][cat] ?? ORDEM.saude[cat] ?? [];
  const i = ordem.indexOf(e.id);
  return i >= 0 ? i : 100 + EXERCICIOS.indexOf(e);
}

// Troca até 2 exercícios principais por variações do MESMO grupo muscular (nunca saltos nem isométricos).
function variar(exercicios: Exercicio[], modelo: Modelo): { lista: Exercicio[]; trocas: { de: Exercicio; para: Exercicio }[] } {
  const usados = new Set(exercicios.map((e) => e.id));
  const lista = [...exercicios];
  const trocas: { de: Exercicio; para: Exercicio }[] = [];
  for (let i = 0; i < lista.length && trocas.length < 2; i++) {
    const atual = lista[i];
    if (!PRINCIPAIS.has(atual.id)) continue;
    const alternativas = EXERCICIOS.filter(
      (x) => !x.cardio && x.grupo_primario === atual.grupo_primario && !PLIOMETRICOS.includes(x.id) && !usados.has(x.id)
    ).sort((a, b) => Number(!PRINCIPAIS.has(a.id)) - Number(!PRINCIPAIS.has(b.id)) || posicao(modelo, a) - posicao(modelo, b));
    const novo = alternativas[0];
    if (!novo) continue;
    usados.add(novo.id);
    lista[i] = novo;
    trocas.push({ de: atual, para: novo });
  }
  return { lista, trocas };
}

const avisoDoCiclo = (ciclo: Ciclo): string | undefined =>
  ciclo === "longo" ? MENSAGEM_VARIADA : ciclo === "meio" ? NOTA_CICLO_MEIO : undefined;

function formatar(e: Exercicio, p: Presc, leve: boolean): ItemFicha {
  const sets = leve ? Math.min(2, p.sets) : p.sets;
  const reps = ISOMETRICOS[e.id] ?? `${p.reps} ${UNIDADE_ESPECIAL[e.id] ?? "repetições"}${UNILATERAIS[e.id] ?? ""}`;
  return { id: e.id, series: `${sets} × ${reps}`, descanso: p.rest };
}

function justificativa(obj: "saude" | "volei" | "futebol"): string {
  switch (obj) {
    case "saude":
      return "Para Saúde Geral, usamos exercícios multiarticulares (agachamento, supino, remada), que trabalham vários músculos de uma vez e ensinam o corpo a se mover em conjunto. Três séries de 10 a 12 repetições, com 60 segundos de descanso, desenvolvem força e resistência sem sobrecarregar as articulações.";
    case "volei":
      return "Para o Vôlei, o foco é a pliometria: exercícios explosivos que melhoram a impulsão e a rigidez do tornozelo, isto é, a capacidade do tornozelo e do tendão de Aquiles de funcionar como uma mola no salto e na aterrissagem. A força de pernas (agachamento) e a panturrilha em pé sustentam esse trabalho, com poucas repetições e velocidade alta. O descanso de 90 segundos é essencial para recuperar a força entre as séries.";
    case "futebol":
      return "Para o Futebol, o foco é a prevenção de lesões e a força da parte de trás da coxa (stiff, mesa flexora), que ajuda a estabilizar e proteger o joelho nas freadas e nas mudanças de direção. O afundo treina uma perna de cada vez, como no jogo, e o core estável mantém o tronco firme na hora de mudar de direção. O descanso de 90 segundos mantém a qualidade de cada série.";
  }
}

// Cardio de cada objetivo: aquecimento no começo ou bloco no fim da sessão.
function cardio(chave: keyof typeof CARDIO): ItemFicha {
  const c = CARDIO[chave];
  return { id: c.id, series: c.series, descanso: "—" };
}
function comCardio(itens: ItemFicha[], chave: keyof typeof CARDIO): ItemFicha[] {
  return CARDIO[chave].onde === "inicio" ? [cardio(chave), ...itens] : [...itens, cardio(chave)];
}

const nomeDoGrupo = (g: GrupoMuscular) => PONTOS_FRACOS.find((p) => p.id === g)?.nome ?? "o músculo escolhido";

// Ponto Fraco: 3 exercícios do músculo escolhido + 2 dos músculos que dão apoio a ele (para não lesionar).
function montarFoco(freq: Freq, grupo: GrupoMuscular, ciclo: Ciclo): Resultado {
  const nome = nomeDoGrupo(grupo);
  const ordem = FOCO_ORDEM[grupo].filter((id) => porId[id]);
  const extras = EXERCICIOS.filter((e) => !e.cardio && e.grupo_primario === grupo && !PLIOMETRICOS.includes(e.id) && !ordem.includes(e.id)).map((e) => e.id);
  const lista = [...ordem, ...extras].map((id) => porId[id]);
  if (lista.length < MIN_FOCO) return { erro: mensagemPoucos(lista.length) };

  const apoio = APOIOS[grupo];
  const plano = PLANO_FOCO[freq];
  const variada = ciclo === "longo";
  const presc = variada ? PRESC_VARIADA.foco : PRESC.foco;
  const trocas: Troca[] = [];

  const dias: DiaFicha[] = plano.dias.map((dia, i) => {
    // Gira a lista do músculo entre as sessões, para treinar por ângulos diferentes.
    let alvo = Array.from({ length: Math.min(FOCO_POR_SESSAO, lista.length) }, (_, k) => lista[(i + k) % lista.length]);
    if (variada) {
      const v = variar(alvo, "saude");
      alvo = v.lista;
      trocas.push(...v.trocas.map((t) => ({ dia: `${NOMES_DIAS[dia]} (sessão ${i + 1})`, de: t.de.nome, para: t.para.nome })));
    }
    const usados = new Set(alvo.map((e) => e.id));
    const deApoio = [apoio.a, apoio.b].map((pool) => {
      const livres = pool.filter((id) => !usados.has(id) && porId[id]);
      const id = livres[i % livres.length];
      usados.add(id);
      return porId[id];
    }).filter((e): e is Exercicio => !!e);
    const itens = [
      ...alvo.map((e) => formatar(e, presc, false)),
      ...deApoio.map((e) => ({ ...formatar(e, PRESC.apoio, false), obs: "Músculo de apoio: protege o ponto fraco" })),
    ];
    return { dia: NOMES_DIAS[dia], titulo: `${nome} + apoio · sessão ${i + 1}`, itens: comCardio(itens, "fraco") };
  });

  const notas: string[] = [];
  if (freq >= 4) notas.push(NOTA_FOCO_FREQ);
  notas.push(NOTA_CARDIO.fraco, ...DICAS);
  return {
    ficha: {
      titulo: `Ponto fraco: ${nome} · ${dias.length}x por semana${variada ? " · Ficha variada" : ""}`,
      divisao: plano.divisao,
      justificativa: `Cada sessão tem 3 exercícios para ${nome}, por ângulos diferentes, e 2 para os músculos que dão apoio a ele: ${apoio.nomes}. ${apoio.porque} Mantenha o resto do corpo ativo em outros dias da semana.`,
      notas,
      dias,
      variada,
      trocas,
      avisoCiclo: avisoDoCiclo(ciclo),
    },
  };
}

// Hipertrofia: divisão pela frequência e pelo nível, multiarticulares pesados primeiro e isolados depois.
function montarHipertrofia(freq: Freq, nivel: Nivel, ciclo: Ciclo): Resultado {
  const plano = PLANOS_HIPER[nivel][freq];
  const variada = ciclo === "longo";
  const presc = (variada ? PRESC_HIPER_VARIADA : PRESC_HIPER)[nivel];
  const trocas: Troca[] = [];
  const vezes: Partial<Record<string, number>> = {};
  const semana: Record<string, number> = {};

  const dias: DiaFicha[] = plano.sessoes.map((sessao, i) => {
    const dia = plano.dias[i];
    const oc = vezes[sessao] ?? 0;
    vezes[sessao] = oc + 1;
    const usados = new Set<string>();
    const contagem: Record<string, number> = {};
    let exercicios: Exercicio[] = [];
    for (const vaga of SESSOES_HIPER[sessao].vagas) {
      const pool = POOL[vaga];
      const k = contagem[vaga] ?? 0;
      contagem[vaga] = k + 1;
      // A 2ª vez que a mesma sessão aparece na semana começa do exercício seguinte da lista.
      for (let t = 0; t < pool.length; t++) {
        const id = pool[(oc + k + t) % pool.length];
        if (!usados.has(id) && porId[id]) { usados.add(id); exercicios.push(porId[id]); break; }
      }
    }
    if (variada) {
      const v = variar(exercicios, "saude");
      exercicios = v.lista;
      trocas.push(...v.trocas.map((t) => ({ dia: `${NOMES_DIAS[dia]} (${SESSOES_HIPER[sessao].titulo})`, de: t.de.nome, para: t.para.nome })));
    }
    // Iniciante com 5 dias: a sessão extra de corpo inteiro é leve.
    const leve = nivel === "iniciante" && freq === 5 && sessao === "fullA";
    const itens = exercicios.map((e) => {
      const p = ISOMETRICOS[e.id] ? PRESC.saude : PRINCIPAIS.has(e.id) ? presc.composto : presc.isolado;
      const item = formatar(e, p, leve);
      const cat = nomeDoGrupo(e.grupo_primario);
      semana[cat] = (semana[cat] ?? 0) + (leve ? Math.min(2, p.sets) : p.sets);
      return item;
    });
    // Cardio leve só nos dias de superiores (não atrapalha as pernas); nos outros, só o aquecimento.
    const comAquecimento = comCardio(itens, "hipertrofia");
    const final = sessao === "superior" || sessao === "puxar" || sessao === "empurrar" ? comCardio(comAquecimento, "hipertrofiaLeve") : comAquecimento;
    return { dia: NOMES_DIAS[dia], titulo: SESSOES_HIPER[sessao].titulo, leve, itens: final };
  });

  const nomeNivel = NIVEIS.find((n) => n.id === nivel)?.nome ?? "";
  const volume = Object.entries(semana).map(([cat, n]) => `${cat} ${n}`).join(" · ");
  const notas = [
    `Séries por semana: ${volume}. Para hipertrofia, a faixa que mais funciona é de 10 a 20 séries por músculo por semana, divididas em pelo menos 2 sessões. Ombros, braços e panturrilha também trabalham nos multiarticulares (supinos, remadas, agachamentos), por isso precisam de menos séries diretas.`,
    RESERVA_HIPER[nivel],
    "Progressão: anote cargas e repetições. Subir a carga ou uma repetição por semana é o que faz o músculo crescer.",
    NOTA_CARDIO.hipertrofia,
    "Proteína (cerca de 1,6 g por kg por dia) e sono de 7 a 9 horas fazem parte do treino: veja a aba Refeições.",
    ...DICAS.slice(2),
  ];
  return {
    ficha: {
      titulo: `Hipertrofia · ${nomeNivel} · ${freq}x por semana${variada ? " · Ficha variada" : ""}`,
      divisao: plano.divisao,
      justificativa: `Para ganhar massa muscular, o treino combina multiarticulares pesados (${presc.composto.sets} × ${presc.composto.reps}, descanso de ${presc.composto.rest}), que dão a maior carga, com exercícios isolados (${presc.isolado.sets} × ${presc.isolado.reps}, descanso de ${presc.isolado.rest}), que completam o volume de cada músculo. ${plano.nome}.`,
      notas,
      dias,
      variada,
      trocas,
      avisoCiclo: avisoDoCiclo(ciclo),
    },
  };
}

export function montarFicha(freq: Freq, obj: ObjetivoId, grupo: GrupoMuscular, ciclo: Ciclo = "novo", nivel: Nivel = "intermediario"): Resultado {
  if (obj === "fraco") return montarFoco(freq, grupo, ciclo);
  if (obj === "hipertrofia") return montarHipertrofia(freq, nivel, ciclo);

  const plano = PLANOS[freq];
  const modelo: Modelo = obj;
  const variada = ciclo === "longo";
  const base = variada ? PRESC_VARIADA[obj] : PRESC[obj];
  const trocas: Troca[] = [];
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

    let exercicios = escolher(slots, variante, modelo);
    if (variada) {
      const v = variar(exercicios, modelo);
      exercicios = v.lista;
      trocas.push(...v.trocas.map((t) => ({ dia: `${NOMES_DIAS[dia]} (${TITULOS[tipo]})`, de: t.de.nome, para: t.para.nome })));
    }
    const itens = exercicios.map((e) => {
      // Saltos e exercícios isométricos mantêm a prescrição original, mesmo na ficha variada.
      const p = e.id === "saltos-tornozelo" ? PRESC.pogo : PLIOMETRICOS.includes(e.id) ? PRESC.salto : ISOMETRICOS[e.id] ? PRESC[obj] : base;
      return formatar(e, p, leve);
    });
    // Cardio: caminhada no fim (saúde), aquecimento na bike (vôlei), intervalado nos dias sem pernas pesadas (futebol).
    const intervalado = obj === "futebol" && (tipo === "upper" || tipo === "costasBiceps" || (freq <= 3 && i === 0));
    const comCardioDoDia = obj === "saude" ? comCardio(itens, "saude") : obj === "volei" ? comCardio(itens, "volei") : intervalado ? comCardio(itens, "futebol") : itens;
    return { dia: NOMES_DIAS[dia], titulo: TITULOS[tipo], leve, itens: comCardioDoDia };
  });

  const notas: string[] = [];
  if (freq === 3) notas.push("Na semana seguinte, comece pelo Treino B (B, A, B), para alternar os estímulos.");
  if (obj === "volei") notas.push(NOTA_PLIOMETRIA);
  if (obj === "futebol") notas.push("Agilidade se treina em campo, com corridas e mudanças de direção. Esta ficha cobre a força de base.");
  notas.push(NOTA_CARDIO[obj], ...DICAS);

  return {
    ficha: {
      titulo: `${plano.nome} · ${freq}x por semana${variada ? " · Ficha variada" : ""}`,
      divisao: plano.divisao,
      justificativa: justificativa(obj),
      notas,
      dias,
      variada,
      trocas,
      avisoCiclo: avisoDoCiclo(ciclo),
    },
  };
}
