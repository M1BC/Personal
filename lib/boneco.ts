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
  // Com a mão presa, mantém o antebraço no ângulo "antebraco" (ex.: vertical embaixo da barra no supino);
  // o braço vai do ombro até o cotovelo e aparece mais curto quando abre para o lado.
  antebracoFixo?: boolean;
  // Braços esticados com as mãos correndo numa linha vertical nesta posição x (barra no levantamento terra e no stiff).
  maoNaVertical?: number;
  maoAlvoL?: P; // mão de longe presa (ex.: pegador do elíptico, que vai para o lado oposto)
  peAlvo?: P;
  dobraPerna?: 1 | -1;
  peAlvoL?: P;
  dobraPernaL?: 1 | -1;
  // Direção do pé (tornozelo → dedos). Sem isso, o pé fica perpendicular à canela.
  pe?: number;
  peL?: number;
}

export type Acessorio =
  | { tipo: "barra"; raio?: number } // anilha vista de lado, nas mãos ("raio" maior = anilha grande, apoiada no chão)
  | { tipo: "barraW" } // barra mais leve, nas mãos
  | { tipo: "halter" } // um halter em cada mão
  | { tipo: "halterPerto" } // só na mão de perto (exercícios unilaterais)
  | { tipo: "barraCostas" } // barra apoiada nas costas
  | { tipo: "barraQuadril" } // barra sobre o quadril
  | { tipo: "pesoCintura" } // carga presa na cintura
  // Cabo da polia até a mão (ou tornozelo). "torre" = x da pilha de pesos, que sobe conforme o cabo é puxado.
  | { tipo: "cabo"; de: P; torre?: number }
  | { tipo: "caboPe"; de: P; torre?: number }
  | { tipo: "corda"; de: P; torre?: number }
  // Almofada da máquina; com "eixo", desenha o braço da alavanca girando em torno dele.
  | { tipo: "rolo"; onde: "tornozelo" | "canelaFrente" | "canelaTras" | "coxa"; eixo?: P; torre?: number }
  | { tipo: "plataforma" } // placa sob os pés, fixa
  // Carrinho do leg press: corre no trilho (de → ate) com a placa sempre perpendicular a ele.
  // "faixa" = trecho da placa medido para fora do trilho; "contato" = o que empurra a placa.
  | { tipo: "treno"; trilho: [P, P]; faixa: [number, number]; contato: "pe" | "ponta" }
  | { tipo: "encostoHack" } // encosto e ombreiras do hack, presos às costas
  | { tipo: "roda" }
  // Cardio: esteira (lona que corre para trás), pedivela da bicicleta e pedais/pegadores do elíptico.
  | { tipo: "esteira"; x0: number; x1: number; lona: number; console: number; corrimao: number; velocidade: number }
  | { tipo: "pedivela"; centro: P }
  | { tipo: "eliptico"; volante: P; raio: number; pivo: P }
  // Pegador nas mãos; "eixo" = alavanca girando num pivô; "suspenso" = braço do voador, pendurado de uma viga nesta altura.
  | { tipo: "pegador"; eixo?: P; suspenso?: number; torre?: number };

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
  // Cardio: movimento contínuo em ciclo (sem ida e volta). "inicio" é a postura base; t vira a fase do ciclo.
  ciclo?: Ciclo;
  // Postura no meio do caminho (opcional): o movimento passa por ela numa curva suave (ex.: barra subindo reta).
  meio?: Pose;
}

export type Ciclo =
  // Passada na esteira. Pé de perto toca a lona na frente em t = 0; o de longe meio ciclo depois.
  | { tipo: "marcha"; periodo: number; frente: number; tras: number; lona: number; apoio: number; altura: number; balanco: number; braco: number; cotovelo: number; sobe: number }
  // Pedalada: tornozelos giram num círculo em volta do centro do pedivela.
  | { tipo: "pedal"; periodo: number; centro: P; raio: number }
  // Elíptico: pés numa elipse, mãos indo e voltando ao contrário dos pés.
  | { tipo: "eliptico"; periodo: number; centro: P; a: number; b: number; mao: P; curso: number };

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
    if (p.maoNaVertical !== undefined) {
      const L = (TAM.braco * eb + TAM.antebraco * ea) * 0.995;
      const dx = Math.max(-L, Math.min(L, p.maoNaVertical - ombro[0]));
      mao = [ombro[0] + dx, ombro[1] + Math.sqrt(L * L - dx * dx)];
      cotovelo = misturaP(ombro, mao, (TAM.braco * eb) / (TAM.braco * eb + TAM.antebraco * ea));
    } else if (p.maoAlvo && p.antebracoFixo) {
      mao = p.maoAlvo;
      cotovelo = soma(mao, dir(p.antebraco), -TAM.antebraco * ea);
    } else if (p.maoAlvo) {
      mao = p.maoAlvo;
      cotovelo = ik(ombro, mao, TAM.braco * eb, TAM.antebraco * ea, p.dobraBraco ?? 1); // encurtado quando o braço abre para o lado
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
  if (p.maoAlvoL) {
    maoL = p.maoAlvoL;
    cotoveloL = ik(ombro, maoL, TAM.braco * eb, TAM.antebraco * ea, p.dobraBraco ?? 1);
  } else if (p.bracoL !== undefined || p.antebracoL !== undefined) {
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
    maoAlvoL: misturaAlvo(a.maoAlvoL, b.maoAlvoL, t),
    dobraBraco: a.dobraBraco ?? b.dobraBraco,
    antebracoFixo: a.antebracoFixo ?? b.antebracoFixo,
    maoNaVertical: misturaOpc(a.maoNaVertical, b.maoNaVertical, b.maoNaVertical ?? 0, a.maoNaVertical ?? 0, t),
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
  if (m.ciclo) return poseDoCiclo(m.inicio, m.ciclo, t);
  let p: Pose;
  if (m.meio) {
    // Curva de Bézier que passa pela postura do meio em t = 0,5.
    const controle = interpolar(interpolar(m.inicio, m.fim, 0.5), m.meio, 2);
    p = interpolar(interpolar(m.inicio, controle, t), interpolar(controle, m.fim, t), t);
  } else p = interpolar(m.inicio, m.fim, t);
  if (!m.arco) return p;
  const sobe = m.arco * Math.sin(Math.PI * t);
  return { ...p, raiz: [p.raiz[0], p.raiz[1] - sobe], peAlvo: p.peAlvo && [p.peAlvo[0], p.peAlvo[1] - sobe], maoAlvo: p.maoAlvo && [p.maoAlvo[0], p.maoAlvo[1] - sobe] };
}

const volta = (x: number) => ((x % 1) + 1) % 1;
const rampa = (x: number) => x * x * (3 - 2 * x);

// Pé na passada: na lona (apoio) ele corre de frente para trás junto com a esteira; no ar (balanço) volta
// para a frente, subindo. Devolve a posição do tornozelo (relativa ao quadril em x) e o ângulo do pé.
function passada(c: Extract<Ciclo, { tipo: "marcha" }>, fase: number): { x: number; y: number; pe?: number } {
  const f = volta(fase);
  const chao = c.lona - 4;
  if (f < c.apoio) {
    const u = f / c.apoio;
    // Calcanhar toca com a ponta para cima, o pé assenta e sai empurrando com a ponta.
    const pe = u < 0.15 ? 78 + 12 * (u / 0.15) : u < 0.7 ? 90 : 90 + 38 * ((u - 0.7) / 0.3);
    return { x: c.frente + (c.tras - c.frente) * u, y: chao, pe };
  }
  const u = (f - c.apoio) / (1 - c.apoio);
  // Sobe mais no começo do balanço (o calcanhar vai para trás) e desce estendendo a perna, sem trancos.
  const sobe = 4 * u * (1 - u) * (1 + 0.5 * (1 - 2 * u));
  // No ar, o pé acompanha a canela (sem ângulo fixo), como acontece de verdade.
  return { x: c.tras + (c.frente - c.tras) * rampa(u), y: chao - c.altura * sobe };
}

function poseDoCiclo(base: Pose, c: Ciclo, t: number): Pose {
  const ang = 2 * Math.PI * t;
  if (c.tipo === "marcha") {
    const perto = passada(c, t), longe = passada(c, t + 0.5);
    // O quadril sobe no meio do apoio de cada pé (duas vezes por ciclo).
    const q: P = [base.raiz[0], base.raiz[1] - c.sobe * Math.cos(4 * Math.PI * (t - c.apoio / 2))];
    const braco = 180 + c.braco * Math.cos(ang); // braço de perto vai para trás quando a perna de perto está na frente
    const bracoL = 180 - c.braco * Math.cos(ang);
    return {
      ...base, raiz: q,
      tronco: base.tronco + c.balanco * Math.sin(4 * Math.PI * t),
      peAlvo: [q[0] + perto.x, perto.y], dobraPerna: -1, pe: perto.pe,
      peAlvoL: [q[0] + longe.x, longe.y], dobraPernaL: -1, peL: longe.pe,
      braco, antebraco: braco - c.cotovelo, bracoL, antebracoL: bracoL - c.cotovelo,
    };
  }
  if (c.tipo === "pedal") {
    const p = (a: number): P => [c.centro[0] + c.raio * Math.cos(a), c.centro[1] + c.raio * Math.sin(a)];
    return {
      ...base,
      peAlvo: p(ang), dobraPerna: -1, pe: 96 + 14 * Math.sin(ang),
      peAlvoL: p(ang + Math.PI), dobraPernaL: -1, peL: 96 + 14 * Math.sin(ang + Math.PI),
    };
  }
  const e = (a: number): P => [c.centro[0] + c.a * Math.cos(a), c.centro[1] + c.b * Math.sin(a)];
  const m = (a: number): P => [c.mao[0] - c.curso * Math.cos(a), c.mao[1] + 2 * Math.sin(a)];
  return {
    ...base,
    // Pé à frente com a ponta um pouco para cima; atrás, o calcanhar sobe um pouco.
    peAlvo: e(ang), dobraPerna: -1, pe: 90 - 6 * Math.cos(ang),
    peAlvoL: e(ang + Math.PI), dobraPernaL: -1, peL: 90 + 6 * Math.cos(ang),
    maoAlvo: m(ang), maoAlvoL: m(ang + Math.PI),
  };
}

// Ritmo de treino: a fase de força é mais rápida, a descida é controlada, com pausa curta nas pontas.
const TEMPO = { forca: 1.1, controle: 1.9, pausa: 0.35, isometrico: 2.4 };
// Aceleração e frenagem suaves (sem trancos no começo e no fim de cada fase).
const suave = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

export interface Estado { t: number; fase: "ida" | "volta"; emEsforco: boolean; legenda: string; destino?: "inicio" | "fim"; rotulo: string }

export function estado(segundos: number, m: Movimento): Estado {
  if (m.ciclo) return { t: volta(segundos / m.ciclo.periodo), fase: "ida", emEsforco: true, legenda: m.fases.ida, rotulo: "Ritmo" };
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
  // Torre de polia vista de lado: dois montantes, tampa e base. A pilha de pesos (que se move) vem do acessório.
  torre: (x: number, topo: number): Forma[] => [
    { tipo: "retangulo", x, y: topo, w: 3, h: CHAO + 2 - topo, tom: "equip" },
    { tipo: "retangulo", x: x + LARGURA_TORRE - 3, y: topo, w: 3, h: CHAO + 2 - topo, tom: "equip" },
    { tipo: "retangulo", x: x - 1, y: topo - 3, w: LARGURA_TORRE + 2, h: 4, tom: "equip", rx: 1 },
    { tipo: "retangulo", x: x - 3, y: CHAO - 1, w: LARGURA_TORRE + 6, h: 3, tom: "equip" },
    { tipo: "linha", x1: x + LARGURA_TORRE / 2, y1: topo, x2: x + LARGURA_TORRE / 2, y2: CHAO - 1, largura: 0.8, tom: "longe" },
  ],
};
const LARGURA_TORRE = 18;

// Pilha de pesos: placas de baixo ficam paradas, as de cima sobem com o pino quando o cabo é puxado.
function pilha(x: number, sobe: number): Forma[] {
  const f: Forma[] = [];
  const placas = 9, presas = 5, h = 3.4, vao = 0.9;
  for (let i = 0; i < placas; i++) {
    const y = CHAO - 1 - (i + 1) * (h + vao) + vao - (i >= placas - presas ? sobe : 0);
    f.push({ tipo: "retangulo", x: x + 3.5, y, w: LARGURA_TORRE - 7, h, tom: "equip", rx: 0.6 });
  }
  const topoPilha = CHAO - 1 - placas * (h + vao) + vao - sobe;
  f.push({ tipo: "linha", x1: x + LARGURA_TORRE / 2, y1: topoPilha, x2: x + LARGURA_TORRE / 2, y2: topoPilha - 10, largura: 1.6, tom: "equip" });
  return f;
}

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
  const barra = m.acessorios.reduce((r, a) => (a.tipo === "barra" ? Math.max(r, (a.raio ?? 10) + 2) : r), 0);
  for (let k = 0; k <= 12; k++) {
    const j = articulacoes(poseEm(m, k / 12), m.ancora);
    incluir(j.cabeca, TAM.cabeca + 1);
    incluir(j.mao, barra || 7); incluir(j.maoL, 7);
    incluir(j.ombro, 11); incluir(j.quadril, 10); incluir(j.joelho, 6); incluir(j.joelhoL, 6);
    incluir(j.ponta, 4); incluir(j.pontaL, 4); incluir(j.tornozelo, 5); incluir(j.tornozeloL, 5);
    incluir(j.cotovelo, 6); incluir(j.cotoveloL, 6);
    if (m.acessorios.some((a) => a.tipo === "barraCostas")) incluir(costas(j), 12);
    for (const a of m.acessorios)
      if (a.tipo === "treno") {
        const { pt, up } = geometriaTreno(a, j);
        incluir(pt(up + 17, a.faixa[0] + 5), 2); incluir(pt(up, a.faixa[0]), 3); incluir(pt(up + 17, -2), 2);
      }
  }
  for (const a of m.acessorios) {
    if ("de" in a) incluir(a.de, 6);
    if (a.tipo === "pegador" && a.suspenso !== undefined) incluir([a.torre ?? 100, a.suspenso - 4], 0);
    if (a.tipo === "esteira") { incluir([a.x0, a.lona], 2); incluir([a.x1, a.lona], 2); incluir([a.x1 - 28, a.console - 8], 0); }
    if (a.tipo === "eliptico") { incluir(a.volante, a.raio + 2); incluir(a.pivo, 4); }
    if ("torre" in a && a.torre !== undefined) { incluir([a.torre - 2, CHAO], 0); incluir([a.torre + LARGURA_TORRE + 2, CHAO], 0); }
  }
  const baixo = m.semChao ? y1 : Math.max(y1, CHAO + 4);
  const folga = 9;
  let w = x1 - x0 + folga * 2, h = baixo - y0 + folga * 2;
  if (w / h < PROPORCAO) w = h * PROPORCAO; else h = w / PROPORCAO;
  const cx = (x0 + x1) / 2;
  return { x: cx - w / 2, y: baixo + folga - h, w, h };
}

const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// Esteira: base, lona com marcas correndo para trás no ritmo da passada, coluna do painel e corrimão.
function esteira(a: Extract<Acessorio, { tipo: "esteira" }>, t: number): Forma[] {
  const f: Forma[] = [
    { tipo: "retangulo", x: a.x0 + 6, y: a.lona + 6, w: 4, h: CHAO + 2 - a.lona - 6, tom: "equip" },
    { tipo: "retangulo", x: a.x1 - 12, y: a.lona + 6, w: 4, h: CHAO + 2 - a.lona - 6, tom: "equip" },
    { tipo: "retangulo", x: a.x0, y: a.lona, w: a.x1 - a.x0, h: 8, tom: "equip", rx: 4 },
  ];
  const L = a.x1 - a.x0 - 10, passo = L / Math.max(1, Math.round(L / 12));
  for (let k = 0; k * passo < L; k++) {
    const x = a.x0 + 5 + ((((k * passo - t * a.velocidade) % L) + L) % L);
    f.push({ tipo: "retangulo", x, y: a.lona + 0.6, w: 4, h: 1.6, tom: "longe" });
  }
  const topo: P = [a.x1 - 16, a.console];
  f.push(cena.linha([a.x1 - 6, a.lona + 2], topo, 4));
  f.push({ tipo: "retangulo", x: topo[0] - 12, y: topo[1] - 7, w: 16, h: 7, tom: "equip", rx: 1.5 });
  f.push(cena.linha([a.x0 + (a.x1 - a.x0) * 0.62, a.corrimao], [a.x1 - 13, a.corrimao], 3));
  return f;
}

// Braço de alavanca: barra do eixo até a peça, com o pino do eixo.
function alavanca(eixo: P, ate: P): Forma[] {
  return [cena.linha(eixo, ate, 3.2), { tipo: "circulo", x: eixo[0], y: eixo[1], r: 3, tom: "equip" }, { tipo: "circulo", x: eixo[0], y: eixo[1], r: 1.2, tom: "longe" }];
}

// Carrinho do leg press. u = distância ao longo do trilho; v = distância para fora dele (lado do corpo é negativo).
function geometriaTreno(a: Extract<Acessorio, { tipo: "treno" }>, j: Articulacoes) {
  const [A, B] = a.trilho;
  const L = dist(A, B) || 1;
  const r: P = [(B[0] - A[0]) / L, (B[1] - A[1]) / L];
  const n: P = [-r[1], r[0]]; // perpendicular ao trilho; v < 0 fica do lado do corpo
  const u = (q: P) => (q[0] - A[0]) * r[0] + (q[1] - A[1]) * r[1];
  const pt = (uu: number, vv: number): P => [A[0] + r[0] * uu + n[0] * vv, A[1] + r[1] * uu + n[1] * vv];
  // Sola do pé (calcanhar e ponta), um pouco para fora do pé.
  const [calc, dedos] = trecho(j.tornozelo, j.ponta, -0.35, 1.05, 4.5);
  const up = (a.contato === "ponta" ? u(dedos) : Math.max(u(calc), u(dedos))) + 2.5;
  return { pt, up };
}
function treno(a: Extract<Acessorio, { tipo: "treno" }>, j: Articulacoes): Forma[] {
  const { pt, up } = geometriaTreno(a, j);
  const [v0, v1] = a.faixa;
  const vm = (v0 + v1) / 2;
  return [
    { tipo: "poligono", tom: "equip", pts: [pt(up + 2, v0 + 5), pt(up + 17, v0 + 5), pt(up + 17, -2), pt(up + 2, -2)] },
    ...anilha(pt(up + 11, vm + 2), 8),
    cena.linha(pt(up, v0), pt(up, v1), 5),
  ];
}

function centroRolo(a: Extract<Acessorio, { tipo: "rolo" }>, j: Articulacoes): P {
  if (a.onde === "tornozelo") return trecho(j.joelho, j.tornozelo, 0.9, 0.9, -7)[0];
  if (a.onde === "canelaFrente") return trecho(j.joelho, j.tornozelo, 0.85, 0.85, -7)[0];
  if (a.onde === "canelaTras") return trecho(j.joelho, j.tornozelo, 0.85, 0.85, 7)[0];
  return trecho(j.quadril, j.joelho, 0.85, 0.85, -9)[0]; // em cima da coxa
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

  // Partes da máquina que se movem, atrás do corpo.
  for (const a of m.acessorios) {
    if ((a.tipo === "cabo" || a.tipo === "corda" || a.tipo === "caboPe") && a.torre !== undefined) {
      const de = a.de, torre = a.torre, peloPe = a.tipo === "caboPe";
      const ponta = (jj: Articulacoes) => (peloPe ? jj.tornozelo : jj.mao);
      const compr = (tt: number) => dist(de, ponta(articulacoes(poseEm(m, tt), m.ancora)));
      const repouso = Math.min(compr(0), compr(1));
      f.push(...pilha(torre, Math.max(0, Math.min(60, dist(de, ponta(j)) - repouso))));
    }
    if ((a.tipo === "rolo" || a.tipo === "pegador") && a.torre !== undefined) {
      // Máquina de alavanca: a pilha sobe conforme a peça se afasta da posição de descanso.
      const rolo = a.tipo === "rolo" ? a : null, torre = a.torre;
      const peca = (jj: Articulacoes) => (rolo ? centroRolo(rolo, jj) : jj.mao);
      const descanso = peca(articulacoes(poseEm(m, m.esforco === "volta" ? 1 : 0), m.ancora));
      f.push(...pilha(torre, Math.min(45, 0.6 * dist(peca(j), descanso))));
    }
    if (a.tipo === "treno") f.push(...treno(a, j));
    if (a.tipo === "esteira") f.push(...esteira(a, t));
    if (a.tipo === "pedivela") {
      for (const q of [j.tornozeloL, j.tornozelo]) f.push(cena.linha(a.centro, q, 3), cena.linha([q[0] - 4.5, q[1] + 3.5], [q[0] + 4.5, q[1] + 3.5], 2.6));
      f.push({ tipo: "circulo", x: a.centro[0], y: a.centro[1], r: 7, tom: "equip" }, { tipo: "circulo", x: a.centro[0], y: a.centro[1], r: 2.5, tom: "longe" });
    }
    if (a.tipo === "eliptico") {
      // Volante de trás: cada pedal é puxado por um ponto que gira nele, meio giro de diferença entre os lados.
      f.push(...anilha(a.volante, a.raio));
      ([[j.tornozeloL, j.pontaL, Math.PI], [j.tornozelo, j.ponta, 0]] as [P, P, number][]).forEach(([to, po, fase]) => {
        const g = 2 * Math.PI * t + fase;
        const [s1, s2] = trecho(to, po, -0.6, 1.3, 4.5);
        f.push(cena.linha([a.volante[0] + a.raio * 0.7 * Math.cos(g), a.volante[1] + a.raio * 0.7 * Math.sin(g)], [(s1[0] + s2[0]) / 2, (s1[1] + s2[1]) / 2 + 2], 3));
        f.push({ tipo: "linha", x1: s1[0], y1: s1[1], x2: s2[0], y2: s2[1], largura: 4, tom: "equip" });
      });
      f.push(cena.linha(a.pivo, j.maoL, 3), cena.linha(a.pivo, j.mao, 3), { tipo: "circulo", x: a.pivo[0], y: a.pivo[1], r: 3, tom: "equip" });
    }
    if (a.tipo === "plataforma") {
      const [p1, p2] = trecho(j.tornozelo, j.ponta, -0.9, 1.6, 4.5);
      f.push({ tipo: "linha", x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], largura: 5, tom: "equip" });
    }
    if (a.tipo === "pegador" && a.eixo) f.push(...alavanca(a.eixo, j.mao));
    if (a.tipo === "pegador" && a.suspenso !== undefined) {
      // Braço do voador: gira num eixo acima do ombro; de lado aparece a viga e a almofada ao longo do antebraço.
      f.push(cena.linha([j.ombro[0], a.suspenso], [j.mao[0], a.suspenso], 4), cena.linha([j.mao[0], a.suspenso], j.mao, 3));
      f.push(...capsula(j.cotovelo, j.mao, 10, 9, "equip"));
    }
    if (a.tipo === "encostoHack") {
      const [b1, b2] = trecho(j.quadril, j.ombro, -0.05, 1.02, -13);
      f.push(...capsula(b1, b2, 7, 7, "equip"));
    }
  }
  // Cabos e o halter da mão de longe.
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
    if (a.tipo === "barraQuadril") f.push(...anilha(trecho(j.quadril, j.joelho, 0, 0, -4)[0])); // por cima do quadril
    if (a.tipo === "pesoCintura") f.push({ tipo: "retangulo", x: j.quadril[0] - 6, y: j.quadril[1] + 8, w: 12, h: 12, tom: "equip", rx: 2 });
    if (a.tipo === "rolo") {
      const c = centroRolo(a, j);
      if (a.eixo) f.push(...alavanca(a.eixo, c));
      f.push({ tipo: "circulo", x: c[0], y: c[1], r: 5, tom: "equip" });
    }
    if (a.tipo === "encostoHack") {
      // Ombreira apoiada em cima do ombro.
      const o = trecho(j.quadril, j.ombro, 1.08, 1.08, 1)[0];
      f.push({ tipo: "circulo", x: o[0], y: o[1], r: 5, tom: "equip" });
    }
  }

  // Braço de perto por cima do tronco, e os músculos do braço por cima dele.
  f.push(...braco(j, "corpo", false, igual));
  secundarios.forEach((g) => acender(g, "secundario", 0.8, true));
  acender(primario, "primario", brilho, true);

  // Equipamentos nas mãos e nas costas, por último.
  for (const a of m.acessorios) {
    if (a.tipo === "barra") f.push(...anilha(j.mao, a.raio));
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
