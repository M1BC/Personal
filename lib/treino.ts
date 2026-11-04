import { EXERCICIOS, categoriaDe } from "@/data/exercicios";
import {
  APOIOS, FOCO_ORDEM, FOCO_POR_SESSAO, ISOMETRICOS, MENSAGEM_VARIADA, MIN_FOCO, NIVEIS, NOMES_DIAS, NOME_MUSCULO,
  NOTAS_HIPER, NOTA_CICLO_MEIO, NOTA_FOCO_FREQ, ORDEM_GERAL, PLANOS_HIPER, PLANO_FOCO, PLIOMETRICOS, PONTOS_FRACOS,
  PRESC, PRESC_VARIADA, PRINCIPAIS, REPS_HIPER, REPS_HIPER_VARIADA, RESERVA_HIPER, SERIES_MAX_EXERCICIO, SERIES_MAX_SESSAO,
  SESSOES_HIPER, UNILATERAIS, VAGAS, VOLUME_ALVO, mensagemPoucos,
  type Ciclo, type Freq, type Musculo, type Nivel, type NomeVaga, type ObjetivoId, type Presc,
} from "@/data/treinos";
import type { Exercicio, GrupoMuscular } from "./types";

export interface ItemFicha { id: string; series: string; descanso: string; obs?: string }
export interface DiaFicha { dia: string; titulo: string; nota?: string; leve?: boolean; itens: ItemFicha[] }
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
  volume?: { musculo: string; series: number; alvo: number }[]; // séries diretas por semana (hipertrofia)
}
export type Resultado = { ficha: Ficha } | { erro: string };

const porId = Object.fromEntries(EXERCICIOS.map((e) => [e.id, e])) as Record<string, Exercicio>;

function posicao(e: Exercicio): number {
  const ordem = ORDEM_GERAL[categoriaDe(e.grupo_primario)] ?? [];
  const i = ordem.indexOf(e.id);
  return i >= 0 ? i : 100 + EXERCICIOS.indexOf(e);
}

// Troca até 2 exercícios principais por variações do MESMO grupo muscular (nunca saltos nem isométricos).
function variar(exercicios: Exercicio[], proibidos: Set<string> = new Set()): { lista: Exercicio[]; trocas: { de: Exercicio; para: Exercicio }[] } {
  const usados = new Set([...exercicios.map((e) => e.id), ...proibidos]);
  const lista = [...exercicios];
  const trocas: { de: Exercicio; para: Exercicio }[] = [];
  for (let i = 0; i < lista.length && trocas.length < 2; i++) {
    const atual = lista[i];
    if (!PRINCIPAIS.has(atual.id)) continue;
    const alternativas = EXERCICIOS.filter(
      (x) => !x.cardio && x.grupo_primario === atual.grupo_primario && !PLIOMETRICOS.includes(x.id) && !usados.has(x.id)
    ).sort((a, b) => Number(!PRINCIPAIS.has(a.id)) - Number(!PRINCIPAIS.has(b.id)) || posicao(a) - posicao(b));
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
  const reps = ISOMETRICOS[e.id] ?? `${p.reps} repetições${UNILATERAIS[e.id] ?? ""}`;
  return { id: e.id, series: `${sets} × ${reps}`, descanso: p.rest };
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
      const v = variar(alvo);
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
    return { dia: NOMES_DIAS[dia], titulo: `${nome} + apoio · sessão ${i + 1}`, nota: NOTAS_HIPER.aquecimento, itens };
  });

  const notas: string[] = [];
  if (freq >= 4) notas.push(NOTA_FOCO_FREQ);
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

// Hipertrofia: divisão pela frequência; o nível define o volume semanal, as repetições e o esforço.
// 1) Cada vaga da semana recebe séries = alvo semanal do músculo ÷ vezes que ele aparece (2 a 4 por exercício).
// 2) Se a sessão passar do limite de séries, corta primeiro dos isolados com mais séries (nunca abaixo de 2).
function montarHipertrofia(freq: Freq, nivel: Nivel, ciclo: Ciclo): Resultado {
  const plano = PLANOS_HIPER[freq];
  const variada = ciclo === "longo";
  const reps = (variada ? REPS_HIPER_VARIADA : REPS_HIPER)[nivel];
  const alvo = VOLUME_ALVO[nivel];
  const maxEx = SERIES_MAX_EXERCICIO[nivel];
  const trocas: Troca[] = [];

  // Quantas vezes cada músculo aparece na semana.
  const aparicoes: Partial<Record<Musculo, number>> = {};
  for (const s of plano.sessoes) for (const n of SESSOES_HIPER[s].vagas) aparicoes[VAGAS[n].musculo] = (aparicoes[VAGAS[n].musculo] ?? 0) + 1;

  // Séries planejadas por músculo na semana (antes dos cortes), para cortar de quem passou do alvo.
  // Multiarticulares pesados: pelo menos 3 séries (2 para iniciante).
  const minimo = (vaga: NomeVaga) => (VAGAS[vaga].peso === "pesado" && nivel !== "iniciante" ? 3 : 2);
  const serieDe = (vaga: NomeVaga) => Math.max(minimo(vaga), Math.min(maxEx, Math.round(alvo[VAGAS[vaga].musculo] / (aparicoes[VAGAS[vaga].musculo] ?? 1))));
  const planejado: Partial<Record<Musculo, number>> = {};
  for (const s of plano.sessoes) for (const n of SESSOES_HIPER[s].vagas) planejado[VAGAS[n].musculo] = (planejado[VAGAS[n].musculo] ?? 0) + serieDe(n);

  const usosDaVaga: Partial<Record<NomeVaga, number>> = {};
  const semana: Partial<Record<Musculo, number>> = {};

  const dias: DiaFicha[] = plano.sessoes.map((sessao, i) => {
    const dia = plano.dias[i];

    // Escolhe o exercício de cada vaga. Cada vez que a mesma vaga volta na semana, pega o seguinte da lista (outro ângulo).
    const usados = new Set<string>();
    const escolhas: { vaga: NomeVaga; ex: Exercicio }[] = [];
    for (const nome of SESSOES_HIPER[sessao].vagas) {
      const pool = VAGAS[nome].pool;
      const uso = usosDaVaga[nome] ?? 0;
      usosDaVaga[nome] = uso + 1;
      for (let t = 0; t < pool.length; t++) {
        const id = pool[(uso + t) % pool.length];
        if (!usados.has(id) && porId[id]) { usados.add(id); escolhas.push({ vaga: nome, ex: porId[id] }); break; }
      }
    }
    if (variada) {
      const v = variar(escolhas.map((c) => c.ex));
      v.lista.forEach((ex, k) => (escolhas[k].ex = ex));
      trocas.push(...v.trocas.map((t) => ({ dia: `${NOMES_DIAS[dia]} (${SESSOES_HIPER[sessao].titulo})`, de: t.de.nome, para: t.para.nome })));
    }

    // Séries por exercício.
    const series = escolhas.map(({ vaga }) => serieDe(vaga));
    // Sessão longa demais: corta 1 série por vez do músculo que mais passou do alvo semanal (nunca abaixo de 2).
    const limite = SERIES_MAX_SESSAO[nivel];
    const total = () => series.reduce((a, b) => a + b, 0);
    while (total() > limite) {
      let idx = -1, pior = -Infinity;
      series.forEach((n, k) => {
        const { musculo: m, peso } = VAGAS[escolhas[k].vaga];
        if (n <= minimo(escolhas[k].vaga)) return;
        // Quem mais passou do alvo perde primeiro; multiarticulares pesados um pouco depois.
        const folga = (planejado[m] ?? 0) / alvo[m] - (peso === "pesado" ? 0.25 : 0) + n / 100;
        if (folga > pior) { pior = folga; idx = k; }
      });
      if (idx < 0) break;
      series[idx]--;
      const m = VAGAS[escolhas[idx].vaga].musculo;
      planejado[m] = (planejado[m] ?? 0) - 1;
    }

    const itens = escolhas.map(({ vaga, ex }, k) => {
      const { musculo, peso } = VAGAS[vaga];
      semana[musculo] = (semana[musculo] ?? 0) + series[k];
      const r = reps[peso];
      const p = ISOMETRICOS[ex.id] ? { ...PRESC.isometrico, sets: series[k] } : { sets: series[k], reps: r.reps, rest: r.rest };
      const item = formatar(ex, p, false);
      if (ex.id === "triceps-frances") item.obs = "Braços acima da cabeça: alonga a cabeça longa do tríceps, a que mais cresce assim";
      if (ex.id === "cadeira-flexora") item.obs = "Sentado, o posterior trabalha alongado e cresce mais do que deitado";
      return item;
    });
    // Sem cardio na lista: o aquecimento são séries leves do próprio exercício (aviso no topo do dia).
    return { dia: NOMES_DIAS[dia], titulo: SESSOES_HIPER[sessao].titulo, nota: NOTAS_HIPER.aquecimento, itens };
  });

  const ordem = Object.keys(alvo) as Musculo[];
  const volume = ordem.filter((m) => semana[m]).map((m) => ({ musculo: NOME_MUSCULO[m], series: semana[m] ?? 0, alvo: alvo[m] }));
  const abaixo = volume.filter((x) => x.series < x.alvo - 1).length > 2;
  const nomeNivel = NIVEIS.find((n) => n.id === nivel)?.nome ?? "";
  const notas = [
    RESERVA_HIPER[nivel],
    NOTAS_HIPER.progressao,
    NOTAS_HIPER.amplitude,
    NOTAS_HIPER.deload,
    ...(abaixo && freq <= 3 ? [`Com ${freq} treinos por semana, alguns músculos ficam abaixo do volume ideal para o nível ${nomeNivel.toLowerCase()}, porque cada sessão tem um limite de séries para não ficar longa demais. Se puder, treine 4 vezes.`] : []),
    ...(freq === 2 ? ["Com 2 treinos, panturrilha e abdômen ficam fora para manter 6 exercícios por dia. Se quiser, inclua 2 a 3 séries de cada no fim de um dos treinos."] : []),
    NOTAS_HIPER.recuperacao,
  ];
  const r = reps;
  return {
    ficha: {
      titulo: `Hipertrofia · ${nomeNivel} · ${freq}x por semana${variada ? " · Ficha variada" : ""}`,
      divisao: plano.divisao,
      justificativa: `Cada músculo é treinado pelo menos 2 vezes por semana, com o volume ajustado ao seu nível. Os multiarticulares vêm primeiro, mais pesados (${r.pesado.reps} repetições, descanso de ${r.pesado.rest}); depois os isolados (${r.medio.reps}, descanso de ${r.medio.rest}) e os exercícios menores, como elevação lateral, panturrilha e abdômen (${r.leve.reps}). Sempre que possível, a ficha usa variações que trabalham o músculo alongado, que nos estudos dão mais crescimento.`,
      notas,
      dias,
      variada,
      trocas,
      avisoCiclo: avisoDoCiclo(ciclo),
      volume,
    },
  };
}

export function montarFicha(freq: Freq, obj: ObjetivoId, grupo: GrupoMuscular, ciclo: Ciclo = "novo", nivel: Nivel = "intermediario"): Resultado {
  return obj === "fraco" ? montarFoco(freq, grupo, ciclo) : montarHipertrofia(freq, nivel, ciclo);
}
