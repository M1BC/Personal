import type { GrupoMuscular } from "./types";

// Personagem visto de lado, virado para a direita. Ângulos em graus, sentido horário,
// 0 = apontando para cima, 90 = para a frente (direita), 180 = para baixo.
// Cada segmento aponta da articulação mais próxima do tronco para a mais distante.

export interface Pose {
  raiz: [number, number]; // quadril (ancora "quadril") ou tornozelo (ancora "pe")
  tronco: number; // quadril → ombro
  braco: number; // ombro → cotovelo
  antebraco: number; // cotovelo → mão
  coxa: number; // quadril → joelho
  canela: number; // joelho → tornozelo
}

export type Equipamento = "barra" | "halter" | "banco" | "barraCostas";

export interface Movimento {
  ancora: "quadril" | "pe";
  inicio: Pose; // posição de partida
  fim: Pose; // posição de máxima contração / amplitude
  equipamentos: Equipamento[];
  banco?: { x: number; y: number; largura: number }; // banco fixo no cenário
  duracao: number; // segundos de um ciclo completo (ida e volta)
}

const TAM = { tronco: 46, pescoco: 7, cabeca: 8.5, braco: 25, antebraco: 23, coxa: 35, canela: 34, pe: 11 };
export const CHAO = 150;

type P = [number, number];
const rad = (g: number) => (g * Math.PI) / 180;
const dir = (g: number): P => [Math.sin(rad(g)), -Math.cos(rad(g))];
const soma = (a: P, d: P, l: number): P => [a[0] + d[0] * l, a[1] + d[1] * l];
const mistura = (a: number, b: number, t: number) => a + (b - a) * t;

export interface Articulacoes {
  quadril: P; ombro: P; pescoco: P; cabeca: P; cotovelo: P; mao: P; joelho: P; tornozelo: P; ponta: P;
}

export function articulacoes(p: Pose, ancora: Movimento["ancora"]): Articulacoes {
  let quadril: P, joelho: P, tornozelo: P;
  if (ancora === "pe") {
    tornozelo = p.raiz;
    joelho = soma(tornozelo, dir(p.canela), -TAM.canela);
    quadril = soma(joelho, dir(p.coxa), -TAM.coxa);
  } else {
    quadril = p.raiz;
    joelho = soma(quadril, dir(p.coxa), TAM.coxa);
    tornozelo = soma(joelho, dir(p.canela), TAM.canela);
  }
  const ombro = soma(quadril, dir(p.tronco), TAM.tronco);
  const pescoco = soma(ombro, dir(p.tronco), TAM.pescoco);
  const cabeca = soma(pescoco, dir(p.tronco), TAM.cabeca);
  const cotovelo = soma(ombro, dir(p.braco), TAM.braco);
  const mao = soma(cotovelo, dir(p.antebraco), TAM.antebraco);
  const ponta = soma(tornozelo, dir(p.canela - 90), TAM.pe); // pé perpendicular à canela, apontando para a frente
  return { quadril, ombro, pescoco, cabeca, cotovelo, mao, joelho, tornozelo, ponta };
}

export function interpolar(a: Pose, b: Pose, t: number): Pose {
  return {
    raiz: [mistura(a.raiz[0], b.raiz[0], t), mistura(a.raiz[1], b.raiz[1], t)],
    tronco: mistura(a.tronco, b.tronco, t),
    braco: mistura(a.braco, b.braco, t),
    antebraco: mistura(a.antebraco, b.antebraco, t),
    coxa: mistura(a.coxa, b.coxa, t),
    canela: mistura(a.canela, b.canela, t),
  };
}

// Ciclo: sobe (40%), segura (10%), desce (40%), segura (10%). Suavizado nas pontas.
export function progresso(segundos: number, duracao: number): number {
  const f = (segundos % duracao) / duracao;
  const suave = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2;
  if (f < 0.4) return suave(f / 0.4);
  if (f < 0.5) return 1;
  if (f < 0.9) return 1 - suave((f - 0.5) / 0.4);
  return 0;
}

// ---------- Desenho ----------
export type Tom = "corpo" | "longe" | "primario" | "secundario" | "equip" | "chao";
// Formas na ordem em que devem ser desenhadas (a última fica por cima).
export type Forma =
  | { tipo: "poligono"; pts: [number, number][]; tom: Tom }
  | { tipo: "linha"; x1: number; y1: number; x2: number; y2: number; largura: number; tom: Tom; opacidade?: number }
  | { tipo: "circulo"; x: number; y: number; r: number; tom: Tom }
  | { tipo: "retangulo"; x: number; y: number; w: number; h: number; tom: Tom; rx?: number };

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
const PERFIL_FRENTE: [number, number][] = [[0, 7.5], [0.35, 6.8], [0.68, 10.5], [0.9, 9.5], [1, 7]];
const PERFIL_COSTAS: [number, number][] = [[1, 8], [0.78, 11], [0.45, 7.2], [0.12, 8.5], [0, 7.5]];
function tronco(quadril: P, ombro: P, tom: Tom): Forma {
  const dx = ombro[0] - quadril[0], dy = ombro[1] - quadril[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len; // aponta para a frente do corpo
  const ponto = (u: number, w: number): [number, number] => [quadril[0] + dx * u + nx * w, quadril[1] + dy * u + ny * w];
  return { tipo: "poligono", tom, pts: [...PERFIL_FRENTE.map(([u, w]) => ponto(u, w)), ...PERFIL_COSTAS.map(([u, w]) => ponto(u, -w))] };
}

export function quadro(m: Movimento, t: number, primario: GrupoMuscular, secundarios: GrupoMuscular[]): Forma[] {
  const j = articulacoes(interpolar(m.inicio, m.fim, t), m.ancora);
  const f: Forma[] = [];

  // Cenário: chão e banco.
  f.push({ tipo: "retangulo", x: 0, y: CHAO + 2, w: 240, h: 2, tom: "chao" });
  if (m.banco) {
    const { x, y, largura } = m.banco;
    f.push({ tipo: "retangulo", x: x + 8, y: y + 4, w: 4, h: CHAO - y - 2, tom: "equip" });
    f.push({ tipo: "retangulo", x: x + largura - 12, y: y + 4, w: 4, h: CHAO - y - 2, tom: "equip" });
    f.push({ tipo: "retangulo", x, y, w: largura, h: 6, tom: "equip", rx: 2 });
  }

  // Lado de longe (mais escuro e levemente deslocado), depois o lado de perto.
  const longe = (q: P): P => [q[0] - 2.5, q[1] - 1.5];
  const perna = (tom: Tom, d: (q: P) => P) => [
    ...capsula(d(j.quadril), d(j.joelho), 15, 10, tom),
    ...capsula(d(j.joelho), d(j.tornozelo), 10, 6.5, tom),
    ...capsula(d(j.tornozelo), d(j.ponta), 6.5, 4.5, tom),
  ];
  const braco = (tom: Tom, d: (q: P) => P) => [
    ...capsula(d(j.ombro), d(j.cotovelo), 10, 7, tom),
    ...capsula(d(j.cotovelo), d(j.mao), 7, 5, tom),
  ];
  const igual = (q: P) => q;
  f.push(...perna("longe", longe), ...braco("longe", longe));
  f.push(...perna("corpo", igual));
  f.push(tronco(j.quadril, j.ombro, "corpo"));
  f.push(...capsula(j.ombro, j.pescoco, 8, 6.5, "corpo"));
  f.push({ tipo: "circulo", x: j.cabeca[0], y: j.cabeca[1], r: TAM.cabeca, tom: "corpo" });

  // Músculos acesos: auxiliares primeiro, principal por cima. O principal acende mais na contração.
  const pontos: Record<Seg, [P, P]> = { tronco: [j.quadril, j.ombro], braco: [j.ombro, j.cotovelo], coxa: [j.quadril, j.joelho], canela: [j.joelho, j.tornozelo] };
  const acender = (g: GrupoMuscular, tom: Tom, opacidade: number, noBraco: boolean) => {
    for (const r of REGIAO[g]) {
      if ((r.seg === "braco") !== noBraco) continue;
      const [a, b] = pontos[r.seg];
      const [p1, p2] = trecho(a, b, r.de, r.ate, FRENTE[r.seg] * r.lado * DESLOCAMENTO[r.seg]);
      f.push({ tipo: "linha", x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], largura: LARGURA_MUSCULO[r.seg], tom, opacidade });
    }
  };
  const brilho = 0.55 + 0.45 * t;
  secundarios.forEach((g) => acender(g, "secundario", 0.8, false));
  acender(primario, "primario", brilho, false);

  // Braço de perto por cima do tronco, e os músculos do braço por cima dele.
  f.push(...braco("corpo", igual));
  secundarios.forEach((g) => acender(g, "secundario", 0.8, true));
  acender(primario, "primario", brilho, true);

  // Equipamentos por último.
  for (const e of m.equipamentos) {
    if (e === "barra" || e === "barraCostas") {
      const c = e === "barra" ? j.mao : trecho(j.quadril, j.ombro, 0.96, 0.96, -14)[0];
      f.push({ tipo: "circulo", x: c[0], y: c[1], r: 10, tom: "equip" });
      f.push({ tipo: "circulo", x: c[0], y: c[1], r: 6.5, tom: "longe" });
      f.push({ tipo: "circulo", x: c[0], y: c[1], r: 2.2, tom: "equip" });
    }
    if (e === "halter") {
      f.push({ tipo: "circulo", x: j.mao[0], y: j.mao[1], r: 6.5, tom: "equip" });
      f.push({ tipo: "circulo", x: j.mao[0], y: j.mao[1], r: 2.5, tom: "longe" });
    }
  }
  return f;
}

// ---------- Exercícios (amostra) ----------
export const MOVIMENTOS: Record<string, Movimento> = {
  "supino-reto": {
    ancora: "quadril",
    banco: { x: 44, y: 106, largura: 104 },
    equipamentos: ["barra"],
    duracao: 3,
    inicio: { raiz: [124, 96], tronco: -90, braco: 132, antebraco: -12, coxa: 118, canela: 180 },
    fim: { raiz: [124, 96], tronco: -90, braco: 8, antebraco: 0, coxa: 118, canela: 180 },
  },
  agachamento: {
    ancora: "pe",
    equipamentos: ["barraCostas"],
    duracao: 3.2,
    inicio: { raiz: [104, CHAO - 4], tronco: 6, braco: 205, antebraco: 330, coxa: 180, canela: 180 },
    fim: { raiz: [104, CHAO - 4], tronco: 42, braco: 235, antebraco: 345, coxa: 100, canela: 205 },
  },
  "remada-curvada": {
    ancora: "pe",
    equipamentos: ["barra"],
    duracao: 2.8,
    inicio: { raiz: [104, CHAO - 4], tronco: 62, braco: 178, antebraco: 178, coxa: 158, canela: 195 },
    fim: { raiz: [104, CHAO - 4], tronco: 62, braco: 245, antebraco: 168, coxa: 158, canela: 195 },
  },
};
