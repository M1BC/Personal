import type { GrupoMuscular } from "./types";

// Personagem visto de lado, virado para a direita. Ângulos em graus, sentido horário,
// 0 = para cima, 90 = para a frente (direita), 180 = para baixo, 270 (ou -90) = para trás.
// Cada segmento aponta da articulação mais próxima do tronco para a mais distante.
// Campos terminados em "L" são do lado de longe (o membro do outro lado do corpo); sem eles, repete o de perto.

export type P = [number, number];

export interface Pose {
  raiz: P; // quadril, tornozelo de perto ("pe") ou mão de perto ("mao"), conforme a âncora
  tronco: number; // quadril → ombro
  braco: number; // ombro → cotovelo
  antebraco: number; // cotovelo → mão
  coxa: number; // quadril → joelho
  canela: number; // joelho → tornozelo
  bracoL?: number;
  antebracoL?: number;
  coxaL?: number;
  canelaL?: number;
  // Encurtamento do braço na perspectiva (movimentos para o lado). 1 = inteiro, 0 = apontando para a câmera, negativo = vira.
  escalaBraco?: number;
  escalaAntebraco?: number;
  // Mão ou pé presos a um ponto: o cotovelo/joelho é calculado (dobra 1 ou -1 escolhe o lado da dobra).
  maoAlvo?: P;
  dobraBraco?: 1 | -1;
  peAlvo?: P;
  dobraPerna?: 1 | -1;
  peAlvoL?: P;
  dobraPernaL?: 1 | -1;
  // Direção do pé (tornozelo → dedos). Sem isso, o pé fica perpendicular à canela.
  pe?: number;
  peL?: number;
}

export type Acessorio =
  | { tipo: "barra" } // anilha vista de lado, nas mãos
  | { tipo: "barraW" } // barra mais leve, nas mãos
  | { tipo: "halter" } // um halter em cada mão
  | { tipo: "halterPerto" } // só na mão de perto (exercícios unilaterais)
  | { tipo: "barraCostas" } // barra apoiada nas costas
  | { tipo: "barraQuadril" } // barra sobre o quadril
  | { tipo: "pesoCintura" } // carga presa na cintura
  | { tipo: "cabo"; de: P } // cabo da polia até a mão
  | { tipo: "caboPe"; de: P } // cabo da polia até o tornozelo
  | { tipo: "corda"; de: P } // polia com corda, até a mão
  | { tipo: "rolo"; onde: "tornozelo" | "canelaFrente" | "canelaTras" | "coxa" } // almofada da máquina
  | { tipo: "plataforma" } // placa sob os pés (leg press)
  | { tipo: "roda" }
  | { tipo: "pegador" }; // pegador de máquina nas mãos

export interface Movimento {
  ancora: "quadril" | "pe" | "mao";
  inicio: Pose;
  fim: Pose;
  acessorios: Acessorio[];
  cenario?: Forma[]; // bancos, máquinas, caixa, barra fixa (parados)
  semChao?: boolean;
  arco?: number; // salto: eleva o corpo num arco no meio do movimento (em unidades do desenho)
  esforco: "ida" | "volta" | "isometrico"; // qual metade é a de força; "isometrico" = segurar a posição
  fases: { ida: string; volta: string };
  trajeto: "mao" | "costas" | "quadril" | "pe" | "ombro" | "nenhum";
  dicas: string[];
}

const TAM = { tronco: 46, pescoco: 7, cabeca: 8.5, braco: 25, antebraco: 23, coxa: 35, canela: 34, pe: 11 };
export const CHAO = 150;
export const PROPORCAO = 4 / 3;

const rad = (g: number) => (g * Math.PI) / 180;
const dir = (g: number): P => [Math.sin(rad(g)), -Math.cos(rad(g))];
const soma = (a: P, d: P, l: number): P => [a[0] + d[0] * l, a[1] + d[1] * l];
const mistura = (a: number, b: number, t: number) => a + (b - a) * t;
const misturaP = (a: P, b: P, t: number): P => [mistura(a[0], b[0], t), mistura(a[1], b[1], t)];

// Cinemática inversa de dois segmentos: acha a articulação do meio para a ponta alcançar o alvo.
function ik(base: P, alvo: P, a: number, b: number, dobra: 1 | -1): P {
  const dx = alvo[0] - base[0], dy = alvo[1] - base[1];
  const d = Math.min(a + b - 0.01, Math.max(Math.abs(a - b) + 0.01, Math.hypot(dx, dy)));
  const ang = Math.atan2(dy, dx);
  const alfa = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const g = ang + dobra * alfa;
  return [base[0] + a * Math.cos(g), base[1] + a * Math.sin(g)];
}
// Ângulo (na convenção do personagem) do segmento a → b.
const angulo = (a: P, b: P) => (Math.atan2(b[0] - a[0], -(b[1] - a[1])) * 180) / Math.PI;

export interface Articulacoes {
  quadril: P; ombro: P; pescoco: P; cabeca: P;
  cotovelo: P; mao: P; joelho: P; tornozelo: P; ponta: P;
  cotoveloL: P; maoL: P; joelhoL: P; tornozeloL: P; pontaL: P;
}

export function articulacoes(p: Pose, ancora: Movimento["ancora"]): Articulacoes {
  const eb = p.escalaBraco ?? 1, ea = p.escalaAntebraco ?? 1;
  let quadril: P, ombro: P, cotovelo: P, mao: P;
  let joelho: P | undefined, tornozelo: P | undefined;

  if (ancora === "mao") {
    mao = p.raiz;
    cotovelo = soma(mao, dir(p.antebraco), -TAM.antebraco * ea);
    ombro = soma(cotovelo, dir(p.braco), -TAM.braco * eb);
    quadril = soma(ombro, dir(p.tronco), -TAM.tronco);
  } else {
    if (ancora === "pe") {
      tornozelo = p.raiz;
      joelho = soma(tornozelo, dir(p.canela), -TAM.canela);
      quadril = soma(joelho, dir(p.coxa), -TAM.coxa);
    } else {
      quadril = p.raiz;
    }
    ombro = soma(quadril, dir(p.tronco), TAM.tronco);
    if (p.maoAlvo) {
      mao = p.maoAlvo;
      cotovelo = ik(ombro, mao, TAM.braco, TAM.antebraco, p.dobraBraco ?? 1);
    } else {
      cotovelo = soma(ombro, dir(p.braco), TAM.braco * eb);
      mao = soma(cotovelo, dir(p.antebraco), TAM.antebraco * ea);
    }
  }

  if (!joelho || !tornozelo) {
    if (p.peAlvo) {
      tornozelo = p.peAlvo;
      joelho = ik(quadril, tornozelo, TAM.coxa, TAM.canela, p.dobraPerna ?? -1);
    } else {
      joelho = soma(quadril, dir(p.coxa), TAM.coxa);
      tornozelo = soma(joelho, dir(p.canela), TAM.canela);
    }
  }

  const pescoco = soma(ombro, dir(p.tronco), TAM.pescoco);
  const cabeca = soma(pescoco, dir(p.tronco), TAM.cabeca);
  const canela = angulo(joelho, tornozelo);
  const ponta = soma(tornozelo, dir(p.pe ?? canela - 90), TAM.pe);

  // Braço de longe: sem ângulos próprios, acompanha o de perto.
  let cotoveloL = cotovelo, maoL = mao;
  if (p.bracoL !== undefined || p.antebracoL !== undefined) {
    cotoveloL = soma(ombro, dir(p.bracoL ?? angulo(ombro, cotovelo)), TAM.braco * eb);
    maoL = soma(cotoveloL, dir(p.antebracoL ?? angulo(cotovelo, mao)), TAM.antebraco * ea);
  }
  // Perna de longe: alvo próprio, ângulos próprios ou acompanha a de perto.
  let joelhoL = joelho, tornozeloL = tornozelo, pontaL = ponta;
  if (p.peAlvoL) {
    tornozeloL = p.peAlvoL;
    joelhoL = ik(quadril, tornozeloL, TAM.coxa, TAM.canela, p.dobraPernaL ?? -1);
  } else if (p.coxaL !== undefined || p.canelaL !== undefined) {
    joelhoL = soma(quadril, dir(p.coxaL ?? angulo(quadril, joelho)), TAM.coxa);
    tornozeloL = soma(joelhoL, dir(p.canelaL ?? canela), TAM.canela);
  }
  if (tornozeloL !== tornozelo) pontaL = soma(tornozeloL, dir(p.peL ?? angulo(joelhoL, tornozeloL) - 90), TAM.pe);

  return { quadril, ombro, pescoco, cabeca, cotovelo, mao, joelho, tornozelo, ponta, cotoveloL, maoL, joelhoL, tornozeloL, pontaL };
}

const misturaOpc = (a: number | undefined, b: number | undefined, padraoA: number, padraoB: number, t: number) =>
  a === undefined && b === undefined ? undefined : mistura(a ?? padraoA, b ?? padraoB, t);
const misturaAlvo = (a: P | undefined, b: P | undefined, t: number) => (a && b ? misturaP(a, b, t) : a ?? b);

export function interpolar(a: Pose, b: Pose, t: number): Pose {
  return {
    raiz: misturaP(a.raiz, b.raiz, t),
    tronco: mistura(a.tronco, b.tronco, t),
    braco: mistura(a.braco, b.braco, t),
    antebraco: mistura(a.antebraco, b.antebraco, t),
    coxa: mistura(a.coxa, b.coxa, t),
    canela: mistura(a.canela, b.canela, t),
    bracoL: misturaOpc(a.bracoL, b.bracoL, a.braco, b.braco, t),
    antebracoL: misturaOpc(a.antebracoL, b.antebracoL, a.antebraco, b.antebraco, t),
    coxaL: misturaOpc(a.coxaL, b.coxaL, a.coxa, b.coxa, t),
    canelaL: misturaOpc(a.canelaL, b.canelaL, a.canela, b.canela, t),
    escalaBraco: misturaOpc(a.escalaBraco, b.escalaBraco, 1, 1, t),
    escalaAntebraco: misturaOpc(a.escalaAntebraco, b.escalaAntebraco, 1, 1, t),
    maoAlvo: misturaAlvo(a.maoAlvo, b.maoAlvo, t),
    dobraBraco: a.dobraBraco ?? b.dobraBraco,
    peAlvo: misturaAlvo(a.peAlvo, b.peAlvo, t),
    dobraPerna: a.dobraPerna ?? b.dobraPerna,
    peAlvoL: misturaAlvo(a.peAlvoL, b.peAlvoL, t),
    dobraPernaL: a.dobraPernaL ?? b.dobraPernaL,
    pe: misturaOpc(a.pe, b.pe, b.pe ?? 0, a.pe ?? 0, t),
    peL: misturaOpc(a.peL, b.peL, b.peL ?? 0, a.peL ?? 0, t),
  };
}

// Pose num ponto do movimento (0 = início, 1 = fim), com o arco do salto quando houver.
export function poseEm(m: Movimento, t: number): Pose {
  const p = interpolar(m.inicio, m.fim, t);
  if (!m.arco) return p;
  const sobe = m.arco * Math.sin(Math.PI * t);
  return { ...p, raiz: [p.raiz[0], p.raiz[1] - sobe], peAlvo: p.peAlvo && [p.peAlvo[0], p.peAlvo[1] - sobe], maoAlvo: p.maoAlvo && [p.maoAlvo[0], p.maoAlvo[1] - sobe] };
}

// Ritmo de treino: a fase de força é mais rápida, a descida é controlada, com pausa curta nas pontas.
const TEMPO = { forca: 1.1, controle: 1.9, pausa: 0.35, isometrico: 2.4 };
// Aceleração e frenagem suaves (sem trancos no começo e no fim de cada fase).
const suave = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

export interface Estado { t: number; fase: "ida" | "volta"; emEsforco: boolean; legenda: string; destino: "inicio" | "fim"; rotulo: string }

export function estado(segundos: number, m: Movimento): Estado {
  if (m.esforco === "isometrico") {
    // Segurar: entra na posição, sustenta, sai. O esforço é a sustentação.
    const total = TEMPO.controle + TEMPO.isometrico + TEMPO.forca + TEMPO.pausa;
    let x = segundos % total;
    let t: number, fase: "ida" | "volta";
    if (x < TEMPO.controle) { t = suave(x / TEMPO.controle); fase = "ida"; }
    else if ((x -= TEMPO.controle) < TEMPO.isometrico) { t = 1; fase = "ida"; }
    else if ((x -= TEMPO.isometrico) < TEMPO.forca) { t = 1 - suave(x / TEMPO.forca); fase = "volta"; }
    else { t = 0; fase = "ida"; }
    const segurando = fase === "ida" && t === 1;
    return { t, fase, emEsforco: segurando, legenda: m.fases[fase], destino: fase === "ida" ? "fim" : "inicio", rotulo: segurando ? "Segure" : fase === "ida" ? "Posição" : "Descanse" };
  }
  const dIda = m.esforco === "ida" ? TEMPO.forca : TEMPO.controle;
  const dVolta = m.esforco === "volta" ? TEMPO.forca : TEMPO.controle;
  const total = dIda + dVolta + TEMPO.pausa * 2;
  let x = segundos % total;
  let t: number, fase: "ida" | "volta";
  if (x < dIda) { t = suave(x / dIda); fase = "ida"; }
  else if ((x -= dIda) < TEMPO.pausa) { t = 1; fase = "volta"; }
  else if ((x -= TEMPO.pausa) < dVolta) { t = 1 - suave(x / dVolta); fase = "volta"; }
  else { t = 0; fase = "ida"; }
  const emEsforco = m.esforco === fase;
  return { t, fase, emEsforco, legenda: m.fases[fase], destino: fase === "ida" ? "fim" : "inicio", rotulo: emEsforco ? "Força" : "Controle" };
}

// ---------- Desenho ----------
export type Tom = "corpo" | "longe" | "primario" | "secundario" | "equip" | "chao" | "fantasma" | "trajeto";
// Formas na ordem em que devem ser desenhadas (a última fica por cima).
export type Forma =
  | { tipo: "poligono"; pts: P[]; tom: Tom }
  | { tipo: "linha"; x1: number; y1: number; x2: number; y2: number; largura: number; tom: Tom; opacidade?: number }
  | { tipo: "caminho"; pts: P[]; tom: Tom; tracejado?: boolean }
  | { tipo: "circulo"; x: number; y: number; r: number; tom: Tom }
  | { tipo: "retangulo"; x: number; y: number; w: number; h: number; tom: Tom; rx?: number };

// Peças de cenário reutilizáveis.
export const cena = {
  linha: (a: P, b: P, largura = 5, tom: Tom = "equip"): Forma => ({ tipo: "linha", x1: a[0], y1: a[1], x2: b[0], y2: b[1], largura, tom }),
  ret: (x: number, y: number, w: number, h: number, tom: Tom = "equip"): Forma => ({ tipo: "retangulo", x, y, w, h, tom, rx: 1.5 }),
  // Banco reto: tampo na altura y, de x até x + largura.
  banco: (x: number, y: number, largura: number): Forma[] => [
    { tipo: "retangulo", x: x + 8, y: y + 4, w: 4, h: CHAO - y - 2, tom: "equip" },
    { tipo: "retangulo", x: x + largura - 12, y: y + 4, w: 4, h: CHAO - y - 2, tom: "equip" },
    { tipo: "retangulo", x, y, w: largura, h: 6, tom: "equip", rx: 2 },
  ],
  poste: (x: number, topo: number): Forma => ({ tipo: "retangulo", x: x - 2, y: topo, w: 4, h: CHAO - topo + 2, tom: "equip" }),
  caixa: (x: number, y: number, w: number): Forma => ({ tipo: "retangulo", x, y, w, h: CHAO + 2 - y, tom: "equip", rx: 2 }),
  barraFixa: (x: number, y: number): Forma[] => [
    { tipo: "linha", x1: x - 40, y1: y, x2: x, y2: y, largura: 3, tom: "equip" },
    { tipo: "circulo", x, y, r: 3.5, tom: "equip" },
  ],
  // Coluna da polia, do chão até a altura da roldana.
  coluna: (x: number, topo: number): Forma => ({ tipo: "retangulo", x: x + 3, y: topo - 6, w: 6, h: CHAO + 8 - topo, tom: "equip", rx: 1 }),
};

// Onde cada grupo muscular fica no corpo: segmento, lado (+1 frente, -1 costas) e trecho do segmento.
type Seg = "tronco" | "braco" | "coxa" | "canela";
// O tronco aponta para cima a partir do quadril; braços e pernas apontam para baixo. Por isso a "frente" troca de lado.
const FRENTE: Record<Seg, 1 | -1> = { tronco: 1, braco: -1, coxa: -1, canela: -1 };
const LARGURA_MUSCULO: Record<Seg, number> = { tronco: 8, braco: 4.5, coxa: 6, canela: 4 };
const DESLOCAMENTO: Record<Seg, number> = { tronco: 5, braco: 2.2, coxa: 3.3, canela: 2 };
const REGIAO: Record<GrupoMuscular, { seg: Seg; lado: 1 | -1; de: number; ate: number }[]> = {
  peitoral: [{ seg: "tronco", lado: 1, de: 0.64, ate: 0.86 }],
  dorsais: [{ seg: "tronco", lado: -1, de: 0.5, ate: 0.86 }],
  lombar: [{ seg: "tronco", lado: -1, de: 0.12, ate: 0.4 }],
  core: [{ seg: "tronco", lado: 1, de: 0.12, ate: 0.52 }],
  ombros: [{ seg: "braco", lado: 1, de: 0.04, ate: 0.3 }, { seg: "braco", lado: -1, de: 0.04, ate: 0.3 }],
  biceps: [{ seg: "braco", lado: 1, de: 0.38, ate: 0.85 }],
  triceps: [{ seg: "braco", lado: -1, de: 0.32, ate: 0.85 }],
  quadriceps: [{ seg: "coxa", lado: 1, de: 0.15, ate: 0.85 }],
  posteriores: [{ seg: "coxa", lado: -1, de: 0.3, ate: 0.85 }],
  gluteos: [{ seg: "coxa", lado: -1, de: -0.08, ate: 0.18 }],
  panturrilhas: [{ seg: "canela", lado: -1, de: 0.12, ate: 0.55 }],
};

function trecho(a: P, b: P, de: number, ate: number, deslocar: number): [P, P] {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const p = (f: number): P => [a[0] + dx * f + nx * deslocar, a[1] + dy * f + ny * deslocar];
  return [p(de), p(ate)];
}

// Segmento que afina de uma ponta para a outra (polígono + pontas redondas).
function capsula(a: P, b: P, wa: number, wb: number, tom: Tom): Forma[] {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  return [
    {
      tipo: "poligono",
      tom,
      pts: [
        [a[0] + (nx * wa) / 2, a[1] + (ny * wa) / 2],
        [b[0] + (nx * wb) / 2, b[1] + (ny * wb) / 2],
        [b[0] - (nx * wb) / 2, b[1] - (ny * wb) / 2],
        [a[0] - (nx * wa) / 2, a[1] - (ny * wa) / 2],
      ],
    },
    { tipo: "circulo", x: a[0], y: a[1], r: wa / 2, tom },
    { tipo: "circulo", x: b[0], y: b[1], r: wb / 2, tom },
  ];
}

// Tronco em "V": medidas de frente e de costas ao longo do eixo quadril → ombro.
const PERFIL_FRENTE: P[] = [[0, 7.5], [0.35, 6.8], [0.68, 10.5], [0.9, 9.5], [1, 7]];
const PERFIL_COSTAS: P[] = [[1, 8], [0.78, 11], [0.45, 7.2], [0.12, 8.5], [0, 7.5]];
function tronco(quadril: P, ombro: P, tom: Tom): Forma {
  const dx = ombro[0] - quadril[0], dy = ombro[1] - quadril[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const ponto = (u: number, w: number): P => [quadril[0] + dx * u + nx * w, quadril[1] + dy * u + ny * w];
  return { tipo: "poligono", tom, pts: [...PERFIL_FRENTE.map(([u, w]) => ponto(u, w)), ...PERFIL_COSTAS.map(([u, w]) => ponto(u, -w))] };
}

type Desloc = (q: P) => P;
const perna = (j: Articulacoes, tom: Tom, longe: boolean, d: Desloc): Forma[] => {
  const [jo, to, po] = longe ? [j.joelhoL, j.tornozeloL, j.pontaL] : [j.joelho, j.tornozelo, j.ponta];
  return [...capsula(d(j.quadril), d(jo), 15, 10, tom), ...capsula(d(jo), d(to), 10, 6.5, tom), ...capsula(d(to), d(po), 6.5, 4.5, tom)];
};
const braco = (j: Articulacoes, tom: Tom, longe: boolean, d: Desloc): Forma[] => {
  const [co, ma] = longe ? [j.cotoveloL, j.maoL] : [j.cotovelo, j.mao];
  return [...capsula(d(j.ombro), d(co), 10, 7, tom), ...capsula(d(co), d(ma), 7, 5, tom)];
};
const igual: Desloc = (q) => q;
const deLonge: Desloc = (q) => [q[0] - 2.5, q[1] - 1.5];

// Silhueta inteira num tom só (a "sombra" da posição de destino).
function silhueta(j: Articulacoes, tom: Tom): Forma[] {
  return [
    ...perna(j, tom, true, igual), ...braco(j, tom, true, igual), ...perna(j, tom, false, igual),
    tronco(j.quadril, j.ombro, tom), ...capsula(j.ombro, j.pescoco, 8, 6.5, tom),
    { tipo: "circulo", x: j.cabeca[0], y: j.cabeca[1], r: TAM.cabeca, tom }, ...braco(j, tom, false, igual),
  ];
}

const costas = (j: Articulacoes): P => trecho(j.quadril, j.ombro, 0.96, 0.96, -14)[0];
function pontoDoTrajeto(m: Movimento, j: Articulacoes): P | null {
  switch (m.trajeto) {
    case "mao": return j.mao;
    case "quadril": return j.quadril;
    case "costas": return costas(j);
    case "pe": return j.tornozelo;
    case "ombro": return j.ombro;
    default: return null;
  }
}

// Enquadra o movimento inteiro (as duas pontas e os equipamentos) com folga, deixando o personagem grande.
export function enquadrar(m: Movimento): { x: number; y: number; w: number; h: number } {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const incluir = (q: P, r = 0) => {
    x0 = Math.min(x0, q[0] - r); y0 = Math.min(y0, q[1] - r);
    x1 = Math.max(x1, q[0] + r); y1 = Math.max(y1, q[1] + r);
  };
  const barra = m.acessorios.some((a) => a.tipo === "barra");
  for (let k = 0; k <= 12; k++) {
    const j = articulacoes(poseEm(m, k / 12), m.ancora);
    incluir(j.cabeca, TAM.cabeca + 1);
    incluir(j.mao, barra ? 12 : 7); incluir(j.maoL, 7);
    incluir(j.ombro, 11); incluir(j.quadril, 10); incluir(j.joelho, 6); incluir(j.joelhoL, 6);
    incluir(j.ponta, 4); incluir(j.pontaL, 4); incluir(j.tornozelo, 5); incluir(j.tornozeloL, 5);
    incluir(j.cotovelo, 6); incluir(j.cotoveloL, 6);
    if (m.acessorios.some((a) => a.tipo === "barraCostas")) incluir(costas(j), 12);
  }
  for (const a of m.acessorios) if ("de" in a) incluir(a.de, 6);
  const baixo = m.semChao ? y1 : Math.max(y1, CHAO + 4);
  const folga = 9;
  let w = x1 - x0 + folga * 2, h = baixo - y0 + folga * 2;
  if (w / h < PROPORCAO) w = h * PROPORCAO; else h = w / PROPORCAO;
  const cx = (x0 + x1) / 2;
  return { x: cx - w / 2, y: baixo + folga - h, w, h };
}

const anilha = (c: P, r = 10): Forma[] => [
  { tipo: "circulo", x: c[0], y: c[1], r, tom: "equip" },
  { tipo: "circulo", x: c[0], y: c[1], r: r * 0.65, tom: "longe" },
  { tipo: "circulo", x: c[0], y: c[1], r: r * 0.22, tom: "equip" },
];

export interface OpcoesQuadro { destino?: "inicio" | "fim"; emEsforco?: boolean; guias?: boolean }

export function quadro(m: Movimento, t: number, primario: GrupoMuscular, secundarios: GrupoMuscular[], op: OpcoesQuadro = {}): Forma[] {
  const j = articulacoes(poseEm(m, t), m.ancora);
  const f: Forma[] = [];
  const guias = (op.guias ?? true) && m.esforco !== "isometrico";

  if (!m.semChao) f.push({ tipo: "retangulo", x: -200, y: CHAO + 2, w: 600, h: 3, tom: "chao" });

  // Guias de aprendizado: sombra da posição de destino e o caminho percorrido.
  if (guias && op.destino) f.push(...silhueta(articulacoes(op.destino === "fim" ? m.fim : m.inicio, m.ancora), "fantasma"));
  if (m.cenario) f.push(...m.cenario);
  if (guias && m.trajeto !== "nenhum") {
    const caminho: P[] = [];
    for (let k = 0; k <= 24; k++) {
      const q = pontoDoTrajeto(m, articulacoes(poseEm(m, k / 24), m.ancora));
      if (q) caminho.push(q);
    }
    f.push({ tipo: "caminho", pts: caminho, tom: "trajeto", tracejado: true });
  }

  // Cabos (atrás do corpo) e o halter da mão de longe.
  for (const a of m.acessorios) {
    if (a.tipo === "cabo" || a.tipo === "corda") f.push(cena.linha(a.de, j.mao, 1.4));
    if (a.tipo === "caboPe") f.push(cena.linha(a.de, j.tornozelo, 1.4));
    if (a.tipo === "halter") f.push({ tipo: "circulo", x: j.maoL[0] - 2.5, y: j.maoL[1] - 1.5, r: 6, tom: "equip" });
  }

  // Lado de longe (mais escuro e levemente deslocado), depois o lado de perto.
  f.push(...perna(j, "longe", true, deLonge), ...braco(j, "longe", true, deLonge));
  f.push(...perna(j, "corpo", false, igual));
  f.push(tronco(j.quadril, j.ombro, "corpo"));
  f.push(...capsula(j.ombro, j.pescoco, 8, 6.5, "corpo"));
  f.push({ tipo: "circulo", x: j.cabeca[0], y: j.cabeca[1], r: TAM.cabeca, tom: "corpo" });

  // Músculos acesos: auxiliares primeiro, principal por cima. O principal brilha mais na fase de força.
  const pontos: Record<Seg, [P, P]> = { tronco: [j.quadril, j.ombro], braco: [j.ombro, j.cotovelo], coxa: [j.quadril, j.joelho], canela: [j.joelho, j.tornozelo] };
  const acender = (g: GrupoMuscular, tom: Tom, opacidade: number, noBraco: boolean) => {
    for (const r of REGIAO[g]) {
      if ((r.seg === "braco") !== noBraco) continue;
      const [a, b] = pontos[r.seg];
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 8) continue; // braço apontando para a câmera
      const [p1, p2] = trecho(a, b, r.de, r.ate, FRENTE[r.seg] * r.lado * DESLOCAMENTO[r.seg]);
      f.push({ tipo: "linha", x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], largura: LARGURA_MUSCULO[r.seg], tom, opacidade });
    }
  };
  const brilho = op.emEsforco === undefined ? 0.55 + 0.45 * t : op.emEsforco ? 1 : 0.6;
  secundarios.forEach((g) => acender(g, "secundario", 0.8, false));
  acender(primario, "primario", brilho, false);

  // Acessórios presos ao corpo que ficam sob o braço.
  for (const a of m.acessorios) {
    if (a.tipo === "barraQuadril") f.push(...anilha(trecho(j.quadril, j.joelho, 0.08, 0.08, 11)[0]));
    if (a.tipo === "pesoCintura") f.push({ tipo: "retangulo", x: j.quadril[0] - 6, y: j.quadril[1] + 8, w: 12, h: 12, tom: "equip", rx: 2 });
    if (a.tipo === "rolo") {
      const c =
        a.onde === "tornozelo" ? trecho(j.joelho, j.tornozelo, 0.9, 0.9, -7)[0]
        : a.onde === "canelaFrente" ? trecho(j.joelho, j.tornozelo, 0.85, 0.85, -7)[0]
        : a.onde === "canelaTras" ? trecho(j.joelho, j.tornozelo, 0.85, 0.85, 7)[0]
        : trecho(j.quadril, j.joelho, 0.85, 0.85, -9)[0]; // em cima da coxa
      f.push({ tipo: "circulo", x: c[0], y: c[1], r: 5, tom: "equip" });
    }
    if (a.tipo === "plataforma") {
      const [p1, p2] = trecho(j.tornozelo, j.ponta, -0.9, 1.6, 4.5);
      f.push({ tipo: "linha", x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], largura: 5, tom: "equip" });
    }
  }

  // Braço de perto por cima do tronco, e os músculos do braço por cima dele.
  f.push(...braco(j, "corpo", false, igual));
  secundarios.forEach((g) => acender(g, "secundario", 0.8, true));
  acender(primario, "primario", brilho, true);

  // Equipamentos nas mãos e nas costas, por último.
  for (const a of m.acessorios) {
    if (a.tipo === "barra") f.push(...anilha(j.mao));
    if (a.tipo === "barraCostas") f.push(...anilha(costas(j)));
    if (a.tipo === "barraW") f.push({ tipo: "circulo", x: j.mao[0], y: j.mao[1], r: 7, tom: "equip" }, { tipo: "circulo", x: j.mao[0], y: j.mao[1], r: 2, tom: "longe" });
    if (a.tipo === "halter" || a.tipo === "halterPerto") f.push({ tipo: "circulo", x: j.mao[0], y: j.mao[1], r: 6.5, tom: "equip" }, { tipo: "circulo", x: j.mao[0], y: j.mao[1], r: 2.5, tom: "longe" });
    if (a.tipo === "cabo" || a.tipo === "pegador") f.push({ tipo: "circulo", x: j.mao[0], y: j.mao[1], r: 3.5, tom: "equip" });
    if (a.tipo === "corda") f.push({ tipo: "circulo", x: j.mao[0], y: j.mao[1], r: 4, tom: "equip" });
    if (a.tipo === "roda") f.push({ tipo: "circulo", x: j.mao[0], y: j.mao[1] + 4, r: 8, tom: "equip" }, { tipo: "circulo", x: j.mao[0], y: j.mao[1] + 4, r: 3, tom: "longe" });
    if ("de" in a) f.push({ tipo: "circulo", x: a.de[0], y: a.de[1], r: 4, tom: "equip" });
  }

  // Seta no caminho, apontando para onde o movimento está indo.
  if (guias && op.destino && m.trajeto !== "nenhum") {
    const atual = pontoDoTrajeto(m, j);
    const adiante = pontoDoTrajeto(m, articulacoes(poseEm(m, op.destino === "fim" ? Math.min(1, t + 0.08) : Math.max(0, t - 0.08)), m.ancora));
    if (atual && adiante) {
      const dx = adiante[0] - atual[0], dy = adiante[1] - atual[1];
      const len = Math.hypot(dx, dy);
      if (len > 0.5) {
        const ux = dx / len, uy = dy / len;
        const base: P = [atual[0] + ux * 14, atual[1] + uy * 14];
        const ponta: P = [base[0] + ux * 7, base[1] + uy * 7];
        f.push({ tipo: "poligono", tom: "trajeto", pts: [ponta, [base[0] - uy * 4.5, base[1] + ux * 4.5], [base[0] + uy * 4.5, base[1] - ux * 4.5]] });
      }
    }
  }
  return f;
}
