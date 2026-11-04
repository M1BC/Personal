import type { GrupoMuscular } from "@/lib/types";
import type { Categoria } from "./exercicios";

export type Cat = Exclude<Categoria, "Todos">;

export type Freq = 2 | 3 | 4 | 5;
export const FREQUENCIAS: Freq[] = [2, 3, 4, 5];

export const OBJETIVOS = [
  { id: "hipertrofia", nome: "Hipertrofia", sub: "Ganho de massa muscular" },
  { id: "fraco", nome: "Fortalecer Ponto Fraco", sub: "O músculo e os que dão apoio a ele" },
  { id: "criar", nome: "Criar meu treino", sub: "Monte os dias e os exercícios" },
] as const;
export type ObjetivoTela = (typeof OBJETIVOS)[number]["id"];
export type ObjetivoId = Exclude<ObjetivoTela, "criar">; // objetivos que geram ficha automática

// ---------- Hipertrofia ----------
// Base científica (resumo):
// - Volume: mais séries semanais por músculo dão mais crescimento, com retorno decrescente
//   (Schoenfeld, Ogborn e Krieger, 2017; Pelland e colegas, 2024). Faixa usada: ~8 a 18 séries diretas.
// - Frequência: cada músculo pelo menos 2 vezes por semana (Schoenfeld, Ogborn e Krieger, 2016).
//   Por sessão, acima de ~8 a 10 séries diretas do mesmo músculo o ganho extra é difícil de detectar (Pelland, 2024).
// - Proximidade da falha: mais perto da falha, mais hipertrofia; 0 a 3 repetições de reserva (Robinson e colegas, 2024).
// - Descanso: mais de 60 s ajuda um pouco; multiarticulares pesados pedem 2 a 3 min (Singer e colegas, 2024).
// - Amplitude: ênfase no músculo alongado (tríceps acima da cabeça, Maeo 2022; flexora sentada, Maeo 2021).
// - Progressão: subir carga ou repetições funcionam igual para hipertrofia (Plotkin e colegas, 2022).
export type Nivel = "iniciante" | "intermediario" | "avancado";
export const NIVEIS: { id: Nivel; nome: string; sub: string }[] = [
  { id: "iniciante", nome: "Iniciante", sub: "Menos de 6 meses treinando" },
  { id: "intermediario", nome: "Intermediário", sub: "De 6 meses a 2 anos" },
  { id: "avancado", nome: "Avançado", sub: "Mais de 2 anos, com constância" },
];

// Músculo que cada vaga conta para o volume semanal.
export type Musculo =
  | "peito" | "costas" | "ombroFrente" | "ombroLateral" | "ombroPosterior" | "biceps" | "triceps"
  | "quadriceps" | "posteriores" | "gluteos" | "panturrilha" | "abdomen";
export const NOME_MUSCULO: Record<Musculo, string> = {
  peito: "Peito", costas: "Costas", ombroFrente: "Ombro (frente)", ombroLateral: "Ombro (lateral)", ombroPosterior: "Ombro (posterior)",
  biceps: "Bíceps", triceps: "Tríceps", quadriceps: "Quadríceps", posteriores: "Posterior da coxa", gluteos: "Glúteos",
  panturrilha: "Panturrilha", abdomen: "Abdômen",
};

// Séries diretas por semana, por nível. Os multiarticulares ainda somam trabalho indireto
// (supinos para tríceps e ombro da frente, remadas e puxadas para bíceps, agachamentos para glúteos).
export const VOLUME_ALVO: Record<Nivel, Record<Musculo, number>> = {
  iniciante: { peito: 8, costas: 9, ombroFrente: 3, ombroLateral: 6, ombroPosterior: 3, biceps: 4, triceps: 4, quadriceps: 8, posteriores: 6, gluteos: 3, panturrilha: 6, abdomen: 4 },
  intermediario: { peito: 12, costas: 14, ombroFrente: 3, ombroLateral: 9, ombroPosterior: 6, biceps: 8, triceps: 8, quadriceps: 12, posteriores: 9, gluteos: 4, panturrilha: 8, abdomen: 6 },
  avancado: { peito: 15, costas: 17, ombroFrente: 4, ombroLateral: 12, ombroPosterior: 8, biceps: 10, triceps: 10, quadriceps: 14, posteriores: 12, gluteos: 6, panturrilha: 10, abdomen: 6 },
};
// Limites de séries: por exercício e por sessão (sessões longas demais perdem qualidade no fim).
export const SERIES_MAX_EXERCICIO: Record<Nivel, number> = { iniciante: 3, intermediario: 4, avancado: 4 };
export const SERIES_MAX_SESSAO: Record<Nivel, number> = { iniciante: 17, intermediario: 24, avancado: 28 };

// Tipo do exercício define repetições, descanso e quão perto da falha ir.
export type Peso = "pesado" | "medio" | "leve";
type Vaga = { musculo: Musculo; peso: Peso; pool: string[] };
const v = (musculo: Musculo, peso: Peso, pool: string[]): Vaga => ({ musculo, peso, pool });

// Exercícios equivalentes, em ordem de preferência. Os que treinam o músculo alongado vêm primeiro.
// Cada vez que a mesma vaga volta na semana, pega o exercício seguinte da lista (outro ângulo).
export const VAGAS = {
  peitoPesado: v("peito", "pesado", ["supino-reto", "supino-halteres"]),
  peitoInclinado: v("peito", "pesado", ["supino-inclinado", "supino-halteres"]),
  peitoAlongado: v("peito", "medio", ["crucifixo", "peck-deck"]),
  costasVertical: v("costas", "pesado", ["puxada-frente", "barra-fixa"]),
  costasHorizontal: v("costas", "pesado", ["remada-sentada", "remada-unilateral", "remada-curvada", "remada-cavalinho", "remada-maquina"]),
  costasIsolado: v("costas", "medio", ["pulldown-braco-reto"]),
  ombroPress: v("ombroFrente", "pesado", ["desenvolvimento", "desenvolvimento-militar"]),
  ombroLateral: v("ombroLateral", "leve", ["elevacao-lateral"]),
  ombroPosterior: v("ombroPosterior", "leve", ["crucifixo-inverso", "face-pull"]),
  biceps: v("biceps", "medio", ["rosca-alternada", "rosca-scott", "rosca-direta", "rosca-polia", "rosca-martelo"]),
  triceps: v("triceps", "medio", ["triceps-frances", "triceps-testa", "triceps-corda"]),
  quadPesado: v("quadriceps", "pesado", ["agachamento", "agachamento-hack", "leg-press"]),
  quadUnilateral: v("quadriceps", "medio", ["agachamento-bulgaro", "afundo"]),
  quadIsolado: v("quadriceps", "medio", ["cadeira-extensora"]),
  posteriorQuadril: v("posteriores", "pesado", ["stiff"]),
  posteriorJoelho: v("posteriores", "medio", ["cadeira-flexora", "mesa-flexora"]),
  gluteo: v("gluteos", "medio", ["elevacao-pelvica", "coice-polia"]),
  panturrilhaEmPe: v("panturrilha", "leve", ["panturrilha-em-pe", "panturrilha-leg-press", "panturrilha-smith"]),
  panturrilhaSentada: v("panturrilha", "leve", ["panturrilha-sentada"]),
  abdomen: v("abdomen", "leve", ["abdominal-polia", "elevacao-pernas", "abdominal-roda"]),
} satisfies Record<string, Vaga>;
export type NomeVaga = keyof typeof VAGAS;

export type SessaoHiper = "fullA" | "fullB" | "fullC" | "superiorA" | "superiorB" | "inferiorA" | "inferiorB" | "empurrar" | "puxar" | "pernas";
// No máximo 6 exercícios por sessão. Multiarticulares todo treino; os músculos pequenos alternam entre os dias
// (supinos já treinam tríceps e ombro da frente; remadas e puxadas já treinam bíceps e ombro posterior).
// Ordem: multiarticulares pesados primeiro, isolados e "leves" no fim.
export const SESSOES_HIPER: Record<SessaoHiper, { titulo: string; vagas: NomeVaga[] }> = {
  fullA: { titulo: "Treino A · Corpo inteiro", vagas: ["quadPesado", "peitoPesado", "costasVertical", "posteriorJoelho", "ombroLateral", "triceps"] },
  fullB: { titulo: "Treino B · Corpo inteiro", vagas: ["posteriorQuadril", "costasHorizontal", "peitoInclinado", "quadUnilateral", "ombroLateral", "biceps"] },
  fullC: { titulo: "Treino C · Corpo inteiro", vagas: ["quadPesado", "costasVertical", "peitoAlongado", "gluteo", "panturrilhaSentada", "abdomen"] },
  superiorA: { titulo: "Superiores A", vagas: ["peitoPesado", "costasVertical", "peitoInclinado", "costasHorizontal", "ombroLateral", "triceps"] },
  superiorB: { titulo: "Superiores B", vagas: ["peitoInclinado", "costasHorizontal", "costasVertical", "ombroLateral", "ombroPosterior", "biceps"] },
  inferiorA: { titulo: "Inferiores A", vagas: ["quadPesado", "posteriorQuadril", "quadUnilateral", "posteriorJoelho", "panturrilhaEmPe", "abdomen"] },
  inferiorB: { titulo: "Inferiores B", vagas: ["quadPesado", "posteriorJoelho", "quadIsolado", "gluteo", "panturrilhaSentada", "abdomen"] },
  empurrar: { titulo: "Empurrar · Peito, ombros e tríceps", vagas: ["peitoInclinado", "ombroPress", "peitoAlongado", "ombroLateral", "triceps"] },
  puxar: { titulo: "Puxar · Costas e bíceps", vagas: ["costasHorizontal", "costasVertical", "costasIsolado", "ombroPosterior", "biceps"] },
  pernas: { titulo: "Pernas · Quadríceps, posterior e glúteos", vagas: ["quadPesado", "posteriorJoelho", "quadIsolado", "gluteo", "panturrilhaSentada", "abdomen"] },
};

// Cada músculo é treinado pelo menos 2 vezes por semana, com 48 h ou mais entre sessões que o repetem.
export type PlanoHiper = { sessoes: SessaoHiper[]; dias: number[]; nome: string; divisao: string };
export const PLANOS_HIPER: Record<Freq, PlanoHiper> = {
  2: { sessoes: ["fullA", "fullB"], dias: [0, 3], nome: "Corpo inteiro A/B", divisao: "Dois treinos de corpo inteiro (segunda e quinta). Cada músculo é treinado 2 vezes por semana, o mínimo que as pesquisas indicam para hipertrofia." },
  3: { sessoes: ["fullA", "fullB", "fullC"], dias: [0, 2, 4], nome: "Corpo inteiro A/B/C", divisao: "Três treinos de corpo inteiro diferentes (segunda, quarta e sexta), com 48 horas entre eles. Os músculos grandes são treinados 2 a 3 vezes por semana, por ângulos diferentes." },
  4: { sessoes: ["superiorA", "inferiorA", "superiorB", "inferiorB"], dias: [0, 1, 3, 4], nome: "Superiores/Inferiores", divisao: "Superiores e Inferiores, duas vezes cada (segunda e quinta; terça e sexta), com 72 horas entre sessões do mesmo grupo. A segunda sessão de cada grupo usa outros exercícios, e os músculos pequenos alternam entre os dias." },
  5: { sessoes: ["superiorA", "inferiorA", "empurrar", "puxar", "pernas"], dias: [0, 1, 2, 3, 4], nome: "Superiores/Inferiores + Empurrar/Puxar/Pernas", divisao: "Começa a semana com Superiores e Inferiores e termina com Empurrar, Puxar e Pernas. Cada músculo é treinado 2 vezes por semana, com pelo menos 48 horas entre as sessões." },
};

export interface Presc { sets: number; reps: string; rest: string }
// Repetições e descanso por tipo de exercício e nível.
export const REPS_HIPER: Record<Nivel, Record<Peso, { reps: string; rest: string }>> = {
  iniciante: { pesado: { reps: "8 a 12", rest: "2 min" }, medio: { reps: "10 a 15", rest: "90 s" }, leve: { reps: "12 a 20", rest: "60 a 90 s" } },
  intermediario: { pesado: { reps: "6 a 10", rest: "2 a 3 min" }, medio: { reps: "8 a 12", rest: "90 s" }, leve: { reps: "12 a 20", rest: "60 a 90 s" } },
  avancado: { pesado: { reps: "6 a 10", rest: "2 a 3 min" }, medio: { reps: "8 a 12", rest: "90 s a 2 min" }, leve: { reps: "12 a 20", rest: "60 a 90 s" } },
};
// Ficha variada (mais de 3 meses): troca exercícios e muda a faixa de repetições para um estímulo novo.
export const REPS_HIPER_VARIADA: Record<Nivel, Record<Peso, { reps: string; rest: string }>> = {
  iniciante: { pesado: { reps: "6 a 10", rest: "2 min" }, medio: { reps: "12 a 15", rest: "90 s" }, leve: { reps: "15 a 20", rest: "60 a 90 s" } },
  intermediario: { pesado: { reps: "5 a 8", rest: "3 min" }, medio: { reps: "12 a 15", rest: "90 s" }, leve: { reps: "15 a 25", rest: "60 a 90 s" } },
  avancado: { pesado: { reps: "5 a 8", rest: "3 min" }, medio: { reps: "12 a 15", rest: "90 s" }, leve: { reps: "15 a 25", rest: "60 a 90 s" } },
};
// Quão perto da falha terminar cada série.
export const RESERVA_HIPER: Record<Nivel, string> = {
  iniciante: "Esforço: termine as séries com 2 a 3 repetições de reserva (você ainda faria mais 2 ou 3). Nos primeiros meses, a técnica vem antes da carga.",
  intermediario: "Esforço: nos multiarticulares, pare com 1 a 2 repetições de reserva; nos isolados, vá até 0 a 1 de reserva na última série. Treinar perto da falha é o que mais conta para crescer.",
  avancado: "Esforço: multiarticulares com 1 a 2 repetições de reserva; isolados e a última série de cada exercício até 0 a 1 de reserva (a falha técnica, sem roubar).",
};
export const NOTAS_HIPER = {
  progressao: "Progressão (dupla progressão): use a mesma carga até fazer o topo da faixa de repetições em todas as séries; aí suba a carga (cerca de 2 a 5%) e volte ao início da faixa. Subir repetições ou carga funciona igual para crescer: o importante é anotar e progredir.",
  amplitude: "Amplitude: desça até o músculo ficar bem alongado (peito no fundo do supino, braços estendidos acima da cabeça no tríceps, quadril bem para trás no stiff). Controle 2 a 3 segundos na descida.",
  aquecimento: "Aquecimento: 2 a 3 séries leves no primeiro exercício (subindo a carga) e 1 nos seguintes do mesmo músculo. Elas não contam no volume.",
  dor: "Se sentir dor (não o cansaço normal do músculo), pare o exercício.",
  deload: "A cada 5 a 6 semanas, faça uma semana mais leve (metade das séries, mesma carga, longe da falha). Ela ajuda articulações e recuperação e prepara a próxima fase.",
  recuperacao: "Recuperação: proteína ao longo do dia (cerca de 1,6 g por kg de peso) e 7 a 9 horas de sono. Sem isso, o treino rende menos.",
};

// ---------- Ponto Fraco: músculos de apoio ----------
// Cada ponto fraco tem dois grupos de apoio. As sessões giram entre os exercícios de cada lista.
export const APOIOS: Record<GrupoMuscular, { nomes: string; porque: string; a: string[]; b: string[] }> = {
  peitoral: { nomes: "costas (escápulas) e tríceps", porque: "O peitoral empurra junto com o tríceps, e quem segura o ombro no lugar durante o empurrão são os músculos das costas que prendem a escápula. Fortalecer esses apoios evita que o ombro vire o ponto de lesão.", a: ["face-pull", "remada-sentada", "crucifixo-inverso", "remada-maquina"], b: ["triceps-corda", "triceps-testa", "triceps-frances"] },
  dorsais: { nomes: "bíceps e lombar/core", porque: "O bíceps ajuda em toda puxada, e a lombar e o core seguram o tronco firme nas remadas. Se eles cansam antes, as costas perdem a base e a coluna sobrecarrega.", a: ["rosca-martelo", "rosca-direta", "rosca-alternada"], b: ["perdigueiro", "prancha", "hiperextensao-lombar"] },
  ombros: { nomes: "costas (escápulas) e core", porque: "O ombro é a articulação mais móvel do corpo e depende de escápulas firmes, presas pelos músculos das costas. O core dá a base para empurrar acima da cabeça sem arquear a lombar.", a: ["remada-sentada", "remada-maquina", "puxada-frente"], b: ["prancha", "prancha-lateral", "perdigueiro"] },
  biceps: { nomes: "costas e tríceps", porque: "O bíceps trabalha junto das costas em toda puxada, e o tríceps, do outro lado do braço, equilibra o cotovelo. Músculos equilibrados em volta da articulação protegem o tendão do bíceps.", a: ["remada-sentada", "puxada-frente", "remada-unilateral"], b: ["triceps-corda", "triceps-frances", "triceps-coice"] },
  triceps: { nomes: "peito e ombros (estabilizadores)", porque: "O tríceps termina os empurrões que o peitoral começa, e o ombro precisa estar estável para o cotovelo trabalhar sem dor. Por isso o peito e os estabilizadores do ombro entram como apoio.", a: ["supino-halteres", "flexao", "supino-reto"], b: ["face-pull", "crucifixo-inverso"] },
  quadriceps: { nomes: "glúteos e posteriores da coxa", porque: "O joelho fica entre o quadríceps, na frente, e os posteriores, atrás. Glúteos e posteriores fortes dividem a carga e mantêm o joelho alinhado, a principal proteção contra dor e lesão no joelho.", a: ["elevacao-pelvica", "coice-polia"], b: ["mesa-flexora", "stiff", "cadeira-flexora"] },
  posteriores: { nomes: "glúteos e lombar/core", porque: "Os posteriores estendem o quadril junto com os glúteos, e a lombar segura a coluna enquanto eles trabalham. Glúteo fraco faz o posterior trabalhar dobrado, a causa mais comum de estiramento.", a: ["elevacao-pelvica", "coice-polia"], b: ["perdigueiro", "hiperextensao-lombar", "prancha"] },
  gluteos: { nomes: "posteriores da coxa e core lateral", porque: "Os glúteos estendem o quadril com os posteriores, e o glúteo médio trabalha com o core lateral para segurar a pelve. Esse conjunto protege o joelho e a lombar.", a: ["mesa-flexora", "cadeira-flexora", "stiff"], b: ["prancha-lateral", "perdigueiro", "prancha"] },
  panturrilhas: { nomes: "pernas em apoio unilateral e core lateral", porque: "A panturrilha é a base da perna inteira. Exercícios em uma perna treinam o joelho e o quadril a ficarem alinhados em cima do tornozelo, e o core lateral segura a pelve, tirando sobrecarga do tendão de Aquiles.", a: ["agachamento-bulgaro", "afundo"], b: ["prancha-lateral", "perdigueiro"] },
  core: { nomes: "lombar e glúteos", porque: "O core forma um cinto com a lombar em volta da coluna, e os glúteos firmam a pelve, onde esse cinto se apoia. Treinar os três juntos é o que protege a coluna de verdade.", a: ["perdigueiro", "hiperextensao-lombar", "bom-dia"], b: ["elevacao-pelvica", "coice-polia"] },
  lombar: { nomes: "core e glúteos", porque: "A lombar não trabalha sozinha: o abdômen segura a frente da coluna e os glúteos estendem o quadril. Quando eles estão fortes, a lombar deixa de compensar, que é o que costuma causar a dor.", a: ["prancha", "dead-bug", "prancha-lateral"], b: ["elevacao-pelvica", "stiff"] },
};
export const FOCO_POR_SESSAO = 3;

export const PONTOS_FRACOS: { id: GrupoMuscular; nome: string }[] = [
  { id: "peitoral", nome: "Peito" }, { id: "dorsais", nome: "Costas" }, { id: "ombros", nome: "Ombros" },
  { id: "biceps", nome: "Bíceps" }, { id: "triceps", nome: "Tríceps" }, { id: "quadriceps", nome: "Quadríceps" },
  { id: "posteriores", nome: "Posterior da coxa" }, { id: "gluteos", nome: "Glúteos" }, { id: "panturrilhas", nome: "Panturrilha" },
  { id: "core", nome: "Core" }, { id: "lombar", nome: "Lombar" },
];

// ---------- Ponto Fraco: treino 100% focado em um músculo ----------
export const MIN_FOCO = 3; // menos que isso: mensagem de "poucos exercícios"
export const MAX_FOCO = 3;
export const MAX_SESSOES_FOCO = 3; // o mesmo músculo não é treinado em dias seguidos (48 h entre sessões)

export const mensagemPoucos = (n: number): string =>
  n === 0
    ? "Ainda não temos exercícios para este grupo. Em breve adicionaremos mais."
    : `Temos apenas ${n} ${n === 1 ? "exercício" : "exercícios"} para este grupo no momento. Em breve adicionaremos mais.`;

// Ordem dos exercícios por ângulos diferentes (os que não estiverem na lista entram depois).
export const FOCO_ORDEM: Record<GrupoMuscular, string[]> = {
  peitoral: ["supino-reto", "supino-inclinado", "crucifixo", "peck-deck", "flexao", "supino-halteres"],
  dorsais: ["puxada-frente", "remada-curvada", "remada-sentada", "pulldown-braco-reto", "remada-unilateral", "remada-maquina", "barra-fixa", "remada-cavalinho"],
  ombros: ["desenvolvimento-militar", "elevacao-lateral", "elevacao-frontal", "face-pull", "crucifixo-inverso", "desenvolvimento"],
  biceps: ["rosca-direta", "rosca-martelo", "rosca-scott", "rosca-alternada", "rosca-polia", "rosca-concentrada"],
  triceps: ["supino-fechado", "triceps-corda", "triceps-testa", "triceps-frances", "mergulho-paralelas", "triceps-coice"],
  quadriceps: ["agachamento", "leg-press", "agachamento-bulgaro", "agachamento-hack", "afundo", "cadeira-extensora"],
  posteriores: ["stiff", "mesa-flexora", "levantamento-terra", "cadeira-flexora"],
  gluteos: ["elevacao-pelvica", "agachamento-bulgaro", "coice-polia", "afundo"],
  panturrilhas: ["panturrilha-em-pe", "panturrilha-sentada", "panturrilha-leg-press", "panturrilha-unilateral", "panturrilha-burrinho", "panturrilha-smith"],
  core: ["prancha", "abdominal-polia", "prancha-lateral", "elevacao-pernas", "dead-bug", "abdominal-roda"],
  lombar: ["hiperextensao-lombar", "perdigueiro", "bom-dia"],
};

export const PLANO_FOCO: Record<Freq, { dias: number[]; divisao: string }> = {
  2: { dias: [0, 3], divisao: "Duas sessões por semana (segunda e quinta), com pelo menos 48 horas de descanso entre elas." },
  3: { dias: [0, 2, 4], divisao: "Três sessões por semana (segunda, quarta e sexta), com pelo menos 48 horas de descanso entre elas." },
  4: { dias: [0, 2, 4], divisao: "Três sessões por semana (segunda, quarta e sexta), com pelo menos 48 horas de descanso entre elas." },
  5: { dias: [0, 2, 4], divisao: "Três sessões por semana (segunda, quarta e sexta), com pelo menos 48 horas de descanso entre elas." },
};
export const NOTA_FOCO_FREQ =
  "No Ponto Fraco, o músculo escolhido é treinado no máximo 3 vezes por semana, para ter pelo menos 48 horas de descanso entre as sessões.";

// ---------- Exercícios especiais ----------
export const PLIOMETRICOS = ["agachamento-salto", "box-jump", "saltos-tornozelo"]; // ficam fora das fichas automáticas
export const ISOMETRICOS: Record<string, string> = { prancha: "30 a 45 segundos", "prancha-lateral": "20 a 30 segundos por lado" };
export const UNILATERAIS: Record<string, string> = {
  perdigueiro: " por lado, segurando 2 s", "coice-polia": " por perna",
  afundo: " por perna", "agachamento-bulgaro": " por perna", "panturrilha-unilateral": " por perna", "remada-unilateral": " por lado",
};

export const PRESC = {
  apoio: { sets: 3, reps: "12 a 15", rest: "60 s" },
  foco: { sets: 3, reps: "10 a 15", rest: "60 s" },
  isometrico: { sets: 3, reps: "", rest: "60 s" },
} satisfies Record<string, Presc>;

// ---------- Ciclos de treino (variação) ----------
export type Ciclo = "novo" | "meio" | "longo";
export const CICLOS: { id: Ciclo; nome: string }[] = [
  { id: "novo", nome: "Menos de 4 semanas" },
  { id: "meio", nome: "De 1 a 3 meses" },
  { id: "longo", nome: "Mais de 3 meses" },
];
export const MENSAGEM_VARIADA =
  "Como você está há mais de 3 meses neste treino, geramos uma variação: outros exercícios para os mesmos músculos e outra faixa de repetições. Use esta ficha pelas próximas 4 a 6 semanas.";
export const NOTA_CICLO_MEIO =
  "Você está no meio do ciclo: mantenha a ficha e continue subindo carga ou repetições aos poucos antes de trocar.";
export const PRESC_VARIADA = {
  foco: { sets: 4, reps: "8 a 12", rest: "75 s" },
} satisfies Record<string, Presc>;

// Exercícios principais (multiarticulares): são os que a variação pode trocar por outro do mesmo grupo.
export const PRINCIPAIS = new Set<string>([
  "agachamento", "leg-press", "agachamento-hack", "afundo", "agachamento-bulgaro", "levantamento-terra", "stiff", "elevacao-pelvica",
  "supino-reto", "supino-inclinado", "supino-halteres", "flexao", "puxada-frente", "remada-curvada", "remada-sentada", "remada-maquina",
  "remada-unilateral", "remada-cavalinho", "barra-fixa", "desenvolvimento", "desenvolvimento-militar", "supino-fechado", "mergulho-paralelas",
]);

// Ordem de preferência por categoria, usada para escolher a troca na ficha variada.
export const ORDEM_GERAL: Partial<Record<Cat, string[]>> = {
  Peito: ["supino-reto", "supino-inclinado", "supino-halteres", "flexao", "crucifixo", "peck-deck"],
  Costas: ["remada-sentada", "puxada-frente", "remada-curvada", "barra-fixa", "remada-unilateral", "remada-maquina", "remada-cavalinho", "pulldown-braco-reto"],
  Quadríceps: ["agachamento", "leg-press", "agachamento-hack", "agachamento-bulgaro", "afundo", "cadeira-extensora"],
  Posterior: ["stiff", "levantamento-terra", "elevacao-pelvica", "cadeira-flexora", "mesa-flexora", "coice-polia"],
  Ombros: ["desenvolvimento", "desenvolvimento-militar", "elevacao-lateral", "crucifixo-inverso", "face-pull", "elevacao-frontal"],
  Bíceps: ["rosca-alternada", "rosca-scott", "rosca-direta", "rosca-polia", "rosca-martelo", "rosca-concentrada"],
  Tríceps: ["triceps-frances", "triceps-testa", "supino-fechado", "triceps-corda", "mergulho-paralelas", "triceps-coice"],
  Panturrilha: ["panturrilha-em-pe", "panturrilha-sentada", "panturrilha-leg-press", "panturrilha-unilateral", "panturrilha-burrinho", "panturrilha-smith"],
  Core: ["abdominal-polia", "prancha", "prancha-lateral", "elevacao-pernas", "dead-bug", "abdominal-roda"],
};

export const NOMES_DIAS = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

export const DICAS = [
  "Aqueça por 5 a 10 minutos antes. Se sentir dor (não o cansaço normal do músculo), pare.",
];

// ---------- Cardio nas fichas ----------
export const CARDIO = {
  fraco: { id: "bicicleta", series: "5 a 8 min · aquecimento leve", onde: "inicio" },
} as const;
export const NOTA_CARDIO: Record<ObjetivoId, string> = {
  hipertrofia: "Cardio leve (bike, elíptico ou caminhada inclinada) 2 a 3 vezes por semana ajuda o coração e a recuperação sem atrapalhar o ganho de massa. Deixe para o fim dos treinos de superiores e evite cardio intenso antes das pernas.",
  fraco: "Aqueça 5 a 8 minutos antes: músculo aquecido rende mais e se protege melhor.",
};
