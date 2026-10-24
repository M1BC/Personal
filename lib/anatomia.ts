import type { GrupoMuscular } from "./types";

// Desenho anatômico em meia-figura (lado direito, x >= 0, centro em x = 0).
// O componente espelha cada forma para montar o corpo inteiro.
// Coordenadas no espaço de cada vista: largura -80..80, altura 0..420.

export const SILHUETA =
  "M -1 8 C 12 8 19 16 19 30 C 19 40 15 47 11 50 L 11 58 C 22 61 36 61 48 65 C 60 69 67 82 66 100 " +
  "C 66 120 67 140 68 160 C 71 182 73 205 72 226 C 75 236 76 250 70 258 C 66 262 62 258 61 250 " +
  "C 60 240 59 232 60 226 C 57 205 53 184 52 166 C 50 148 48 130 47 110 C 41 130 35 150 35 168 " +
  "C 35 180 41 190 42 205 C 44 225 43 250 39 286 C 38 300 41 312 41 328 C 41 346 35 364 30 378 " +
  "C 32 385 36 392 34 396 L 14 396 C 13 390 15 384 16 378 C 14 360 13 340 15 322 C 15 305 13 292 12 282 " +
  "C 10 260 6 235 3 218 L -1 216 Z";

export type Forma = { grupo: GrupoMuscular; d: string };

export const MUSCULOS_FRENTE: Forma[] = [
  // Reto abdominal
  { grupo: "core", d: "M 1.5 118 C 9 116 16 117 19 121 L 20 196 C 14 204 7 208 1.5 208 Z" },
  // Oblíquo externo
  { grupo: "core", d: "M 22 124 C 30 122 37 128 39 140 C 36 156 34 172 37 192 C 32 198 27 200 22 200 Z" },
  // Peitoral maior (leque que converge para a axila)
  { grupo: "peitoral", d: "M 2 76 C 14 70 30 67 44 73 C 50 77 52 86 50 94 C 46 102 40 108 30 112 C 20 116 10 116 3 112 C 1.5 100 1.5 88 2 76 Z" },
  // Deltoide anterior e lateral
  { grupo: "ombros", d: "M 42 67 C 54 63 67 74 66 92 C 66 104 62 114 56 122 C 52 112 50 98 47 86 C 46 80 44 73 42 67 Z" },
  // Bíceps braquial
  { grupo: "biceps", d: "M 50 124 C 57 120 64 130 64 146 C 64 156 61 163 57 165 C 52 161 49 148 49 134 Z" },
  // Quadríceps (vasto lateral, reto femoral e vasto medial em gota)
  { grupo: "quadriceps", d: "M 9 216 C 18 206 34 200 40 212 C 43 238 41 262 36 282 C 33 292 26 296 20 294 C 14 290 12 282 13 274 C 8 256 7 236 9 216 Z" },
  // Gastrocnêmio aparecendo nas bordas da perna
  { grupo: "panturrilhas", d: "M 33 300 C 40 314 41 338 34 360 C 29 352 27 330 28 310 Z" },
  { grupo: "panturrilhas", d: "M 17 316 C 21 328 21 344 18 358 C 15 346 14 330 17 316 Z" },
];

export const MUSCULOS_COSTAS: Forma[] = [
  // Trapézio (conta como costas)
  { grupo: "dorsais", d: "M 0.5 50 L 11 56 C 22 60 36 61 47 66 C 40 74 28 84 18 96 C 10 110 4 124 0.5 138 Z" },
  // Grande dorsal em V
  { grupo: "dorsais", d: "M 16 104 C 28 94 42 94 47 110 C 45 130 38 152 28 176 C 20 180 12 176 7 168 C 9 146 11 124 16 104 Z" },
  // Eretores da espinha
  { grupo: "lombar", d: "M 1.5 140 C 7 142 11 152 12 166 C 13 180 11 190 7 198 C 4 198 2.5 196 1.5 194 Z" },
  // Deltoide posterior
  { grupo: "ombros", d: "M 46 67 C 58 67 67 80 66 98 C 63 108 58 115 53 118 C 51 102 49 88 44 78 Z" },
  // Tríceps braquial (ferradura)
  { grupo: "triceps", d: "M 50 120 C 58 117 65 128 65 145 C 64 155 61 162 57 165 C 52 156 48 142 48 128 Z" },
  // Glúteo máximo
  { grupo: "gluteos", d: "M 1.5 200 C 14 190 35 190 42 205 C 45 222 39 238 27 242 C 17 244 7 240 1.5 234 Z" },
  // Isquiotibiais
  { grupo: "posteriores", d: "M 8 246 C 20 242 36 240 40 250 C 42 266 39 280 35 290 C 28 294 18 294 13 290 C 9 276 7 260 8 246 Z" },
  // Gastrocnêmio
  { grupo: "panturrilhas", d: "M 14 304 C 22 295 38 297 39 316 C 40 334 34 350 29 358 C 22 354 15 346 14 328 C 13 316 13 309 14 304 Z" },
];

// Músculos que não são grupo de treino do app: entram só no desenho, sem clique.
export const DECORATIVOS_FRENTE = [
  "M 54 170 C 62 174 68 192 68 210 C 66 218 64 222 62 224 C 58 205 55 188 54 170 Z", // antebraço
  "M 4 222 C 8 234 12 254 13 270 C 9 256 5 238 4 222 Z", // adutores
  "M 27 300 C 31 318 31 342 27 366 C 24 346 23 322 27 300 Z", // tibial anterior
  "M 34 102 L 42 104 L 36 108 Z M 34 110 L 41 112 L 35 116 Z M 34 118 L 40 120 L 35 124 Z", // serrátil
].join(" ");

export const DECORATIVOS_COSTAS = [
  "M 56 170 C 63 176 68 194 68 212 C 66 218 64 222 62 224 C 59 206 56 188 56 170 Z", // antebraço
  "M 20 106 C 26 104 32 106 36 112 C 32 116 26 118 20 116 Z", // infraespinhal
].join(" ");

// Linhas de definição (decorativas).
export const DETALHES_FRENTE =
  "M 2 136 L 19 136 M 2 156 L 19 157 M 2 176 L 20 178 " + // gomos do abdômen
  "M 6 112 C 18 110 34 106 48 96 " + // borda inferior do peitoral
  "M 50 92 C 54 100 56 110 56 120 " + // divisão deltoide anterior
  "M 22 216 C 24 240 22 262 20 284 " + // reto femoral
  "M 31 226 C 35 246 35 266 31 284 " + // vasto lateral
  "M 13 262 C 16 272 20 280 26 284"; // vasto medial

export const DETALHES_COSTAS =
  "M 0.5 60 L 0.5 198 " + // coluna
  "M 6 98 C 12 104 16 112 18 120 " + // borda da escápula
  "M 2 218 C 12 224 24 226 37 220 " + // dobra do glúteo
  "M 25 250 L 24 290 " + // bíceps femoral / semitendinoso
  "M 26 306 L 26 352 " + // cabeças do gastrocnêmio
  "M 56 122 C 58 134 58 146 57 156"; // cabeça lateral do tríceps

export const VISTAS = [
  { nome: "Frente", cx: 90, musculos: MUSCULOS_FRENTE, decorativos: DECORATIVOS_FRENTE, detalhes: DETALHES_FRENTE },
  { nome: "Costas", cx: 270, musculos: MUSCULOS_COSTAS, decorativos: DECORATIVOS_COSTAS, detalhes: DETALHES_COSTAS },
] as const;

// Tamanho total do desenho (frente à esquerda, costas à direita).
export const LARGURA = 360;
export const ALTURA = 420;
