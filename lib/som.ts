// Bipe curto e suave gerado pelo próprio navegador (Web Audio): sem arquivos de áudio e sem vibração.

type ConstrutorAudio = typeof AudioContext;

let contexto: AudioContext | null = null;

function obterContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!contexto) {
    const Construtor: ConstrutorAudio | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: ConstrutorAudio }).webkitAudioContext;
    if (!Construtor) return null;
    try {
      contexto = new Construtor();
    } catch {
      return null;
    }
  }
  return contexto;
}

// Chame dentro de um toque ou clique do usuário: os navegadores (principalmente o iPhone) só liberam o áudio assim.
export function prepararAudio(): void {
  const c = obterContexto();
  if (c && c.state === "suspended") c.resume().catch(() => undefined);
}

// Dois tons curtos, graves e de volume baixo: um aviso educado, não um alarme.
export function tocarBipe(): void {
  const c = obterContexto();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => undefined);
  const nota = (frequencia: number, inicio: number, duracao: number): void => {
    const oscilador = c.createOscillator();
    const ganho = c.createGain();
    oscilador.type = "sine";
    oscilador.frequency.value = frequencia;
    ganho.gain.setValueAtTime(0.0001, inicio);
    ganho.gain.exponentialRampToValueAtTime(0.1, inicio + 0.03);
    ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
    oscilador.connect(ganho);
    ganho.connect(c.destination);
    oscilador.start(inicio);
    oscilador.stop(inicio + duracao + 0.05);
  };
  const inicio = c.currentTime + 0.02;
  nota(660, inicio, 0.18);
  nota(880, inicio + 0.24, 0.22);
}
