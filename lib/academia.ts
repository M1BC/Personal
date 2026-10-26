// Horário da BGS Pro Fitness, tirado do cartaz da academia. Para mudar o horário, edite só este arquivo.
// O domingo não aparece no cartaz: fica como fechado até a academia confirmar.
export const FUSO = "America/Sao_Paulo";

type Faixa = { abre: string; fecha: string } | null;

// Índice 0 = domingo, igual a Date.getDay().
export const HORARIO: readonly Faixa[] = [
  null,
  { abre: "05:00", fecha: "22:00" },
  { abre: "05:00", fecha: "22:00" },
  { abre: "05:00", fecha: "22:00" },
  { abre: "05:00", fecha: "22:00" },
  { abre: "05:00", fecha: "22:00" },
  { abre: "07:00", fecha: "12:00" },
];

const NOME_DIA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

// Linhas do quadro de horários, como no cartaz.
export const QUADRO: readonly { dias: string; horario: string; indices: number[] }[] = [
  { dias: "Segunda a sexta", horario: "05:00 às 22:00", indices: [1, 2, 3, 4, 5] },
  { dias: "Sábado", horario: "07:00 às 12:00", indices: [6] },
  { dias: "Domingo", horario: "Fechada", indices: [0] },
];

const minutos = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// Dia da semana e minuto do dia no fuso da academia, seja qual for o fuso do aparelho.
export function agoraNaAcademia(d = new Date()) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const valor = (t: string) => partes.find((p) => p.type === t)?.value ?? "";
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(valor("weekday"));
  return { dia, minuto: Number(valor("hour")) * 60 + Number(valor("minute")) };
}

export type Situacao = { aberta: boolean; titulo: string; detalhe: string; fechaLogo: boolean };

export function situacao(d = new Date()): Situacao {
  const { dia, minuto } = agoraNaAcademia(d);
  const hoje = HORARIO[dia];
  if (hoje && minuto >= minutos(hoje.abre) && minuto < minutos(hoje.fecha)) {
    const falta = minutos(hoje.fecha) - minuto;
    return {
      aberta: true,
      titulo: "Aberta agora",
      detalhe: falta <= 60 ? `Fecha às ${hoje.fecha}, daqui a ${falta} min` : `Fecha às ${hoje.fecha}`,
      fechaLogo: falta <= 60,
    };
  }
  if (hoje && minuto < minutos(hoje.abre)) {
    return { aberta: false, titulo: "Fechada agora", detalhe: `Abre hoje às ${hoje.abre}`, fechaLogo: false };
  }
  for (let i = 1; i <= 7; i++) {
    const outro = HORARIO[(dia + i) % 7];
    if (outro) {
      const quando = i === 1 ? "amanhã" : NOME_DIA[(dia + i) % 7];
      return { aberta: false, titulo: "Fechada agora", detalhe: `Abre ${quando} às ${outro.abre}`, fechaLogo: false };
    }
  }
  return { aberta: false, titulo: "Fechada agora", detalhe: "", fechaLogo: false };
}
