// Leitura e escrita segura no localStorage do navegador: o "caderno de academia".
// Todas as funções verificam se há `window` (no servidor não há) e tratam erros (modo privado, armazenamento cheio).

export const CHAVE_HISTORICO = "caderno-academia:historico:v1";
export const CHAVE_RASCUNHOS = "caderno-academia:rascunhos:v1";

export interface SerieRegistro { peso: number | null; reps: number | null }
export interface ExercicioRegistro {
  id: string;
  nome: string;
  unidade: "reps" | "segundos";
  concluido: boolean;
  series: SerieRegistro[];
}
export interface TreinoRegistrado {
  id: string;
  data: string; // ISO, momento em que o treino foi finalizado
  dia: string; // AAAA-MM-DD no horário local
  nome: string; // ex.: "Treino A · Corpo inteiro"
  diaPlanejado: string; // ex.: "Segunda-feira"
  objetivo: string;
  freq: number;
  exercicios: ExercicioRegistro[];
}

// Treino em andamento (ainda não finalizado). Uma entrada por treino, identificada pela "chave".
export interface Rascunho {
  f: number;
  o: string;
  g: string;
  d: number;
  titulo: string;
  diaPlanejado: string;
  atualizadoEm: string;
  valores: Record<string, { peso: string; reps: string }[]>;
  concluidos: Record<string, boolean>;
}

const temStorage = (): boolean => {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
};

function ler(chave: string): unknown {
  if (!temStorage()) return null;
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

function gravar(chave: string, valor: unknown): boolean {
  if (!temStorage()) return false;
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

const ehNumOuNulo = (x: unknown): boolean => x === null || (typeof x === "number" && Number.isFinite(x));

function ehExercicio(x: unknown): x is ExercicioRegistro {
  const e = x as ExercicioRegistro | null;
  return (
    !!e && typeof e.id === "string" && typeof e.nome === "string" && Array.isArray(e.series) &&
    e.series.every((s) => !!s && ehNumOuNulo(s.peso) && ehNumOuNulo(s.reps))
  );
}

function ehTreino(x: unknown): x is TreinoRegistrado {
  const t = x as TreinoRegistrado | null;
  return (
    !!t && typeof t.id === "string" && typeof t.data === "string" && !Number.isNaN(Date.parse(t.data)) &&
    typeof t.nome === "string" && Array.isArray(t.exercicios) && t.exercicios.every(ehExercicio)
  );
}

export const novoId = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// ---------- histórico ----------

// Do mais recente para o mais antigo. Registros inválidos (de versões antigas ou alterados à mão) são ignorados.
export function lerHistorico(): TreinoRegistrado[] {
  const bruto = ler(CHAVE_HISTORICO);
  const lista = Array.isArray(bruto) ? bruto.filter(ehTreino) : [];
  return lista.sort((a, b) => Date.parse(b.data) - Date.parse(a.data));
}

export function salvarTreino(treino: TreinoRegistrado): boolean {
  return gravar(CHAVE_HISTORICO, [treino, ...lerHistorico()]);
}

export function apagarTreino(id: string): TreinoRegistrado[] {
  const restante = lerHistorico().filter((t) => t.id !== id);
  gravar(CHAVE_HISTORICO, restante);
  return restante;
}

// ---------- rascunhos ----------

export const chaveRascunho = (f: number, o: string, g: string, d: number): string => `${f}-${o}-${g}-${d}`;
export const urlAtivo = (f: number, o: string, g: string, d: number): string => `/treinos/ativo?f=${f}&o=${o}&g=${g}&d=${d}`;

export function lerRascunhos(): Record<string, Rascunho> {
  const bruto = ler(CHAVE_RASCUNHOS);
  return bruto && typeof bruto === "object" && !Array.isArray(bruto) ? (bruto as Record<string, Rascunho>) : {};
}

export function salvarRascunho(chave: string, rascunho: Rascunho): boolean {
  return gravar(CHAVE_RASCUNHOS, { ...lerRascunhos(), [chave]: rascunho });
}

export function limparRascunho(chave: string): void {
  const todos = lerRascunhos();
  if (!(chave in todos)) return;
  delete todos[chave];
  gravar(CHAVE_RASCUNHOS, todos);
}

// O treino em andamento mais recente (para o aviso "Continuar treino").
export function ultimoRascunho(): Rascunho | null {
  const validos = Object.values(lerRascunhos()).filter(
    (r) => !!r && typeof r.f === "number" && typeof r.o === "string" && typeof r.g === "string" && typeof r.d === "number" && typeof r.atualizadoEm === "string"
  );
  validos.sort((a, b) => Date.parse(b.atualizadoEm) - Date.parse(a.atualizadoEm));
  return validos[0] ?? null;
}

// ---------- datas e textos ----------

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const dois = (n: number): string => String(n).padStart(2, "0");

export const chaveDoDia = (d: Date): string => `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;

// "Segunda, 20/10 - Treino A · Corpo inteiro"
export function cabecalhoDoTreino(t: TreinoRegistrado): string {
  const d = new Date(t.data);
  return `${DIAS_SEMANA[d.getDay()]}, ${dois(d.getDate())}/${dois(d.getMonth() + 1)} - ${t.nome}`;
}

const num = (n: number): string => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

// "20 kg · 3 × 10" quando todas as séries são iguais; senão, "20 kg × 10, 22 kg × 8".
export function descreverExercicio(ex: ExercicioRegistro): string {
  const feitas = ex.series.filter((s) => s.peso !== null || s.reps !== null);
  if (feitas.length === 0) return ex.concluido ? "concluído" : "sem registro";
  const sufixo = ex.unidade === "segundos" ? " s" : "";
  const peso = (s: SerieRegistro): string => (s.peso !== null ? `${num(s.peso)} kg` : "");
  const reps = (s: SerieRegistro): string => (s.reps !== null ? `${num(s.reps)}${sufixo}` : "?");
  const iguais = feitas.length > 1 && feitas.every((s) => s.peso === feitas[0].peso && s.reps === feitas[0].reps);
  if (iguais) return [peso(feitas[0]), `${feitas.length} × ${reps(feitas[0])}`].filter(Boolean).join(" · ");
  return feitas.map((s) => (s.peso !== null ? `${peso(s)} × ${reps(s)}` : reps(s))).join(", ");
}

// Último registro daquele exercício (o histórico já vem do mais recente para o mais antigo).
export function ultimaVez(historico: TreinoRegistrado[], exercicioId: string): string | null {
  for (const t of historico) {
    const ex = t.exercicios.find((e) => e.id === exercicioId);
    if (ex && ex.series.some((s) => s.peso !== null || s.reps !== null)) return descreverExercicio(ex);
  }
  return null;
}
