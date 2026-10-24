// "90" -> "01:30"
export const formatarTempo = (segundos: number): string =>
  `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;

// "90 s" -> 90 (usado para o timer de descanso)
export function segundosDoDescanso(texto: string): number {
  const achado = texto.match(/(\d+)/);
  return achado ? Number(achado[1]) : 60;
}
