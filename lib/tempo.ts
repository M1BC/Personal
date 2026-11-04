// "90" -> "01:30"
export const formatarTempo = (segundos: number): string =>
  `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;

// "90 s" -> 90, "2 a 3 min" -> 120, "90 s a 2 min" -> 90 (usado para o timer de descanso: vale o menor tempo)
export function segundosDoDescanso(texto: string): number {
  const achado = texto.match(/(\d+)\s*(?:a\s*\d+\s*)?(min|s)?/);
  if (!achado) return 60;
  return Number(achado[1]) * (achado[2] === "min" ? 60 : 1);
}
