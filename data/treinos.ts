import type { GrupoMuscular } from "@/lib/types";
import type { Categoria } from "./exercicios";

export type Cat = Exclude<Categoria, "Todos">;
export type Slot = Cat | "Salto";
export type Freq = 2 | 3 | 4 | 5;
export type Tipo = "fullA" | "fullB" | "upper" | "lower" | "peitoTriceps" | "costasBiceps" | "pernas" | "ombros" | "fullLeve";

export const FREQUENCIAS: Freq[] = [2, 3, 4, 5];

export const OBJETIVOS = [
  { id: "saude", nome: "Saúde Geral", sub: "Multiarticulares, corpo todo" },
  { id: "hipertrofia", nome: "Hipertrofia", sub: "Ganho de massa muscular" },
  { id: "volei", nome: "Vôlei (Potência e Salto)", sub: "Pliometria, impulsão e tornozelo" },
  { id: "futebol", nome: "Futebol (Força e Agilidade)", sub: "Posterior, joelho e core" },
  { id: "fraco", nome: "Fortalecer Ponto Fraco", sub: "O músculo e os que dão apoio a ele" },
  { id: "criar", nome: "Criar meu treino", sub: "Monte os dias e os exercícios" },
] as const;
export type ObjetivoTela = (typeof OBJETIVOS)[number]["id"];
export type ObjetivoId = Exclude<ObjetivoTela, "criar">; // objetivos que geram ficha automática

// ---------- Hipertrofia ----------
export type Nivel = "iniciante" | "intermediario" | "avancado";
export const NIVEIS: { id: Nivel; nome: string; sub: string }[] = [
  { id: "iniciante", nome: "Iniciante", sub: "Menos de 6 meses treinando" },
  { id: "intermediario", nome: "Intermediário", sub: "De 6 meses a 2 anos" },
  { id: "avancado", nome: "Avançado", sub: "Mais de 2 anos, com constância" },
];

// Grupos de exercícios equivalentes, em ordem de preferência. Cada vaga da sessão sorteia um deles
// (a 2ª sessão igual pega o próximo da lista, para variar o ângulo).
export const POOL = {
  peitoComposto: ["supino-reto", "supino-halteres", "supino-inclinado"],
  peitoInclinado: ["supino-inclinado", "supino-halteres", "flexao"],
  peitoIsolado: ["crucifixo", "peck-deck"],
  costasVertical: ["puxada-frente", "barra-fixa", "pulldown-braco-reto"],
  costasHorizontal: ["remada-curvada", "remada-sentada", "remada-maquina", "remada-cavalinho", "remada-unilateral"],
  ombroPress: ["desenvolvimento", "desenvolvimento-militar"],
  ombroLateral: ["elevacao-lateral"],
  ombroPosterior: ["face-pull", "crucifixo-inverso"],
  biceps: ["rosca-direta", "rosca-alternada", "rosca-martelo", "rosca-scott", "rosca-polia", "rosca-concentrada"],
  triceps: ["triceps-corda", "triceps-testa", "triceps-frances", "supino-fechado", "mergulho-paralelas", "triceps-coice"],
  quadComposto: ["agachamento", "leg-press", "agachamento-hack", "agachamento-bulgaro", "afundo"],
  quadIsolado: ["cadeira-extensora"],
  posteriorQuadril: ["stiff", "levantamento-terra", "bom-dia"],
  posteriorJoelho: ["mesa-flexora", "cadeira-flexora"],
  gluteo: ["elevacao-pelvica", "coice-polia"],
  panturrilha: ["panturrilha-em-pe", "panturrilha-sentada", "panturrilha-leg-press", "panturrilha-smith"],
  core: ["abdominal-polia", "elevacao-pernas", "abdominal-roda", "prancha"],
} satisfies Record<string, string[]>;
export type Pool = keyof typeof POOL;

export type SessaoHiper = "fullA" | "fullB" | "fullC" | "superior" | "inferior" | "empurrar" | "puxar" | "pernas";
export const SESSOES_HIPER: Record<SessaoHiper, { titulo: string; vagas: Pool[] }> = {
  fullA: { titulo: "Treino A · Corpo inteiro", vagas: ["quadComposto", "peitoComposto", "costasVertical", "posteriorQuadril", "ombroLateral", "triceps"] },
  fullB: { titulo: "Treino B · Corpo inteiro", vagas: ["quadComposto", "costasHorizontal", "peitoInclinado", "posteriorJoelho", "ombroPress", "biceps"] },
  fullC: { titulo: "Treino C · Corpo inteiro", vagas: ["gluteo", "peitoComposto", "costasVertical", "quadIsolado", "ombroPosterior", "core"] },
  superior: { titulo: "Superiores", vagas: ["peitoComposto", "costasVertical", "peitoInclinado", "costasHorizontal", "ombroLateral", "biceps", "triceps"] },
  inferior: { titulo: "Inferiores", vagas: ["quadComposto", "posteriorQuadril", "quadComposto", "posteriorJoelho", "gluteo", "panturrilha", "core"] },
  empurrar: { titulo: "Empurrar · Peito, ombros e tríceps", vagas: ["peitoComposto", "ombroPress", "peitoInclinado", "peitoIsolado", "ombroLateral", "triceps", "triceps"] },
  puxar: { titulo: "Puxar · Costas e bíceps", vagas: ["costasVertical", "costasHorizontal", "costasHorizontal", "ombroPosterior", "biceps", "biceps"] },
  pernas: { titulo: "Pernas · Quadríceps, posterior e glúteos", vagas: ["quadComposto", "posteriorQuadril", "quadIsolado", "posteriorJoelho", "gluteo", "panturrilha", "core"] },
};

// Cada músculo é treinado pelo menos 2 vezes por semana, com 48 h entre sessões que o repetem.
type PlanoHiper = { sessoes: SessaoHiper[]; dias: number[]; nome: string; divisao: string };
const FULL_AB = (dias: number[]): PlanoHiper => ({ sessoes: dias.length === 2 ? ["fullA", "fullB"] : ["fullA", "fullB", "fullA"], dias, nome: "Full Body A/B", divisao: "Corpo inteiro em todas as sessões, alternando A e B, com 48 horas ou mais entre elas. Cada músculo é treinado 2 a 3 vezes por semana." });
const FULL_ABC: PlanoHiper = { sessoes: ["fullA", "fullB", "fullC"], dias: [0, 2, 4], nome: "Full Body A/B/C", divisao: "Três treinos de corpo inteiro diferentes (A, B e C), com 48 horas entre eles. Cada músculo é treinado 3 vezes por semana, por ângulos diferentes." };
const UL: PlanoHiper = { sessoes: ["superior", "inferior", "superior", "inferior"], dias: [0, 1, 3, 4], nome: "Superiores/Inferiores", divisao: "Superiores e Inferiores, duas vezes cada por semana, com cerca de 72 horas entre sessões do mesmo grupo." };
export const PLANOS_HIPER: Record<Nivel, Record<Freq, PlanoHiper>> = {
  iniciante: {
    2: FULL_AB([0, 3]), 3: FULL_AB([0, 2, 4]), 4: UL,
    5: { sessoes: ["superior", "inferior", "fullA", "superior", "inferior"], dias: [0, 1, 2, 3, 4], nome: "Superiores/Inferiores + Full Body", divisao: "Superiores e Inferiores duas vezes por semana, com um corpo inteiro leve na quarta. Para quem está começando, 3 a 4 treinos por semana já dão ótimo resultado: a 5ª sessão é opcional." },
  },
  intermediario: {
    2: FULL_AB([0, 3]), 3: FULL_ABC, 4: UL,
    5: { sessoes: ["superior", "inferior", "empurrar", "puxar", "pernas"], dias: [0, 1, 2, 3, 4], nome: "Superiores/Inferiores + Empurrar/Puxar/Pernas", divisao: "Começa a semana com Superiores e Inferiores e termina com Empurrar, Puxar e Pernas. Cada músculo é treinado 2 vezes por semana, com pelo menos 48 horas entre as sessões." },
  },
  avancado: {
    2: FULL_AB([0, 3]), 3: FULL_ABC, 4: UL,
    5: { sessoes: ["superior", "inferior", "empurrar", "puxar", "pernas"], dias: [0, 1, 2, 3, 4], nome: "Superiores/Inferiores + Empurrar/Puxar/Pernas", divisao: "Começa a semana com Superiores e Inferiores e termina com Empurrar, Puxar e Pernas. Cada músculo é treinado 2 vezes por semana, com pelo menos 48 horas entre as sessões." },
  },
};

// Multiarticulares (pesados) e isolados (mais leves, mais repetições) têm prescrições diferentes.
export const PRESC_HIPER: Record<Nivel, { composto: Presc; isolado: Presc }> = {
  iniciante: { composto: { sets: 3, reps: "10 a 12", rest: "90 s" }, isolado: { sets: 3, reps: "12 a 15", rest: "60 s" } },
  intermediario: { composto: { sets: 4, reps: "8 a 10", rest: "120 s" }, isolado: { sets: 3, reps: "10 a 12", rest: "75 s" } },
  avancado: { composto: { sets: 4, reps: "6 a 8", rest: "150 s" }, isolado: { sets: 4, reps: "10 a 15", rest: "75 s" } },
};
export const PRESC_HIPER_VARIADA: Record<Nivel, { composto: Presc; isolado: Presc }> = {
  iniciante: { composto: { sets: 3, reps: "8 a 10", rest: "120 s" }, isolado: { sets: 3, reps: "10 a 12", rest: "75 s" } },
  intermediario: { composto: { sets: 4, reps: "6 a 8", rest: "150 s" }, isolado: { sets: 3, reps: "12 a 15", rest: "60 s" } },
  avancado: { composto: { sets: 5, reps: "5 a 7", rest: "180 s" }, isolado: { sets: 4, reps: "12 a 15", rest: "60 s" } },
};
export const RESERVA_HIPER: Record<Nivel, string> = {
  iniciante: "Termine cada série com 2 a 3 repetições de reserva: o foco agora é aprender a técnica e aumentar a carga aos poucos.",
  intermediario: "Termine as séries com 1 a 2 repetições de reserva. Quando fizer o topo da faixa de repetições em todas as séries, aumente a carga.",
  avancado: "Leve a última série de cada exercício até 0 a 1 repetição de reserva. Os multiarticulares pesados pedem descanso de 2 a 3 minutos.",
};

// ---------- Cardio nas fichas ----------
export const CARDIO = {
  saude: { id: "esteira-caminhada", series: "20 a 30 min · ritmo moderado (dá para conversar)", onde: "fim" },
  hipertrofia: { id: "eliptico", series: "8 a 10 min · aquecimento leve", onde: "inicio" },
  hipertrofiaLeve: { id: "esteira-caminhada", series: "15 a 20 min · caminhada inclinada leve", onde: "fim" },
  volei: { id: "bicicleta", series: "8 a 10 min · aquecimento leve", onde: "inicio" },
  futebol: { id: "esteira-corrida", series: "Intervalado · 6 a 8 tiros de 30 s forte + 90 s caminhando (cerca de 15 min)", onde: "fim" },
  fraco: { id: "bicicleta", series: "5 a 8 min · aquecimento leve", onde: "inicio" },
} as const;
export const NOTA_CARDIO: Record<ObjetivoId, string> = {
  saude: "Cardio: a OMS e o ACSM recomendam 150 minutos por semana de atividade moderada. Complete o que faltar com caminhadas nos outros dias.",
  hipertrofia: "Cardio leve (bike, elíptico ou caminhada inclinada) 2 a 3 vezes por semana ajuda o coração e a recuperação sem atrapalhar o ganho de massa. Evite cardio intenso logo antes do treino de pernas.",
  volei: "O treino de quadra já trabalha o condicionamento. Aqui o cardio é só um aquecimento leve antes da força e dos saltos.",
  futebol: "O intervalado imita o jogo: arrancadas curtas e recuperação. Faça depois da força, nunca antes dos saltos ou do treino de pernas pesado.",
  fraco: "Aqueça 5 a 8 minutos antes: músculo aquecido rende mais e se protege melhor.",
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

// ---------- Pliometria ----------
export const PLIOMETRICOS = ["agachamento-salto", "box-jump", "saltos-tornozelo"]; // a ordem define a rotação entre as sessões

export const ISOMETRICOS: Record<string, string> = { prancha: "30 a 45 segundos", "prancha-lateral": "20 a 30 segundos por lado" };
export const UNILATERAIS: Record<string, string> = {
  perdigueiro: " por lado, segurando 2 s", "coice-polia": " por perna",
  afundo: " por perna", "agachamento-bulgaro": " por perna", "panturrilha-unilateral": " por perna", "remada-unilateral": " por lado",
};
export const UNIDADE_ESPECIAL: Record<string, string> = { "saltos-tornozelo": "saltos" };

export interface Presc { sets: number; reps: string; rest: string }
export const PRESC = {
  apoio: { sets: 3, reps: "12 a 15", rest: "60 s" },
  saude: { sets: 3, reps: "10 a 12", rest: "60 s" },
  volei: { sets: 3, reps: "6 a 8", rest: "90 s" },
  salto: { sets: 3, reps: "5", rest: "90 s" },
  pogo: { sets: 3, reps: "10 a 15", rest: "90 s" },
  futebol: { sets: 3, reps: "8 a 10", rest: "90 s" },
  foco: { sets: 3, reps: "10 a 15", rest: "60 s" },
} satisfies Record<string, Presc>;

// ---------- Ciclos de treino (variação) ----------
export type Ciclo = "novo" | "meio" | "longo";
export const CICLOS: { id: Ciclo; nome: string }[] = [
  { id: "novo", nome: "Menos de 4 semanas" },
  { id: "meio", nome: "De 1 a 3 meses" },
  { id: "longo", nome: "Mais de 3 meses" },
];
export const MENSAGEM_VARIADA =
  "Como você está há mais de 3 meses neste treino, geramos uma variação para quebrar a homeostase e continuar desafiando seus músculos. Use esta nova ficha pelas próximas 4 a 6 semanas.";
export const NOTA_CICLO_MEIO =
  "Você está no meio do ciclo: mantenha a ficha e tente aumentar a carga ou as repetições aos poucos antes de trocar.";

// Novo estímulo: mais séries e menos repetições. Os saltos não mudam (qualidade e segurança).
export const PRESC_VARIADA = {
  saude: { sets: 4, reps: "8 a 10", rest: "90 s" },
  volei: { sets: 4, reps: "4 a 6", rest: "120 s" },
  futebol: { sets: 4, reps: "6 a 8", rest: "90 s" },
  foco: { sets: 4, reps: "8 a 12", rest: "75 s" },
} satisfies Record<string, Presc>;

// Exercícios principais (multiarticulares): são os que a variação pode trocar por outro do mesmo grupo.
export const PRINCIPAIS = new Set<string>([
  "agachamento", "leg-press", "agachamento-hack", "afundo", "agachamento-bulgaro", "levantamento-terra", "stiff", "elevacao-pelvica",
  "supino-reto", "supino-inclinado", "supino-halteres", "flexao", "puxada-frente", "remada-curvada", "remada-sentada", "remada-maquina",
  "remada-unilateral", "remada-cavalinho", "barra-fixa", "desenvolvimento", "desenvolvimento-militar", "supino-fechado", "mergulho-paralelas",
]);

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
    Panturrilha: ["panturrilha-em-pe", "panturrilha-unilateral", "panturrilha-burrinho", "panturrilha-sentada", "panturrilha-leg-press", "panturrilha-smith"],
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
    fullA: ["Quadríceps", "Salto", "Salto", "Panturrilha", "Core", "Costas"],
    fullB: ["Quadríceps", "Salto", "Salto", "Panturrilha", "Core", "Ombros"],
    upper: ["Costas", "Peito", "Ombros", "Ombros", "Costas"],
    lower: ["Quadríceps", "Salto", "Salto", "Posterior", "Panturrilha", "Core"],
    pernas: ["Quadríceps", "Salto", "Salto", "Salto", "Posterior", "Panturrilha"],
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
