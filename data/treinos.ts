// Fichas educacionais. Séries, repetições e descanso seguem as faixas do ACSM para adultos saudáveis:
// 2 a 4 séries, 8 a 12 repetições para força, 2 a 3 min de descanso nos exercícios pesados.
export const OBJETIVOS = [
  { id: "saude", nome: "Saúde Geral", sub: "Corpo todo, com exercícios básicos" },
  { id: "volei", nome: "Vôlei (Potência)", sub: "Salto, ataque e aterrissagem" },
  { id: "futebol", nome: "Futebol (Força e Agilidade)", sub: "Pernas fortes e proteção contra lesões" },
  { id: "fraco", nome: "Reabilitação/Ponto Fraco", sub: "Fortalecimento de uma região" },
] as const;
export type ObjetivoId = (typeof OBJETIVOS)[number]["id"];

export const PONTOS_FRACOS = [
  { id: "pernas", nome: "Pernas" },
  { id: "costas", nome: "Costas" },
  { id: "ombros", nome: "Ombros" },
  { id: "core", nome: "Core" },
] as const;
export type PontoFracoId = (typeof PONTOS_FRACOS)[number]["id"];

export interface ItemTreino { id: string; series: string; descanso: string; porque: string }
export interface Treino { titulo: string; resumo: string; nota?: string; itens: ItemTreino[] }

const i = (id: string, series: string, descanso: string, porque: string): ItemTreino => ({ id, series, descanso, porque });

export const TREINOS: Record<string, Treino> = {
  saude: {
    titulo: "Saúde Geral",
    resumo: "Cinco exercícios básicos que trabalham o corpo todo. Faça 2 a 3 vezes por semana.",
    itens: [
      i("agachamento", "3 séries × 8 a 12 repetições", "1 a 2 min", "Treina pernas e core de uma vez: é a base de levantar, sentar e subir escadas."),
      i("supino-reto", "3 séries × 8 a 12 repetições", "1 a 2 min", "Fortalece peito, ombro e tríceps, usados em todo empurrar."),
      i("remada-sentada", "3 séries × 8 a 12 repetições", "1 a 2 min", "Equilibra o empurrar com o puxar e protege a postura e os ombros."),
      i("desenvolvimento", "2 a 3 séries × 8 a 12 repetições", "1 a 2 min", "Fortalece os ombros para levantar objetos acima da cabeça."),
      i("prancha", "3 séries × 20 a 40 segundos", "1 min", "Ensina o core a estabilizar o tronco, o que protege a lombar."),
    ],
  },
  volei: {
    titulo: "Vôlei (Potência)",
    resumo: "Força de pernas para o salto, panturrilhas e core para a aterrissagem, e ombros protegidos para o ataque.",
    nota: "Potência de salto também pede saltos e pliometria, que não estão neste banco de exercícios: peça orientação ao educador físico.",
    itens: [
      i("agachamento", "4 séries × 5 a 6 repetições", "2 a 3 min", "A força de pernas é a base da altura do salto."),
      i("leg-press", "3 séries × 8 a 10 repetições", "2 min", "Soma volume de perna sem carregar a coluna."),
      i("panturrilha-em-pe", "3 a 4 séries × 8 a 12 repetições", "1 a 2 min", "A panturrilha participa da fase final do impulso e amortece a aterrissagem."),
      i("prancha", "3 séries × 30 a 45 segundos", "1 min", "O core liga a força das pernas ao braço no ataque e dá estabilidade na aterrissagem."),
      i("face-pull", "3 séries × 12 a 15 repetições", "1 min", "Protege o ombro, que sofre com a repetição de ataques e saques."),
    ],
  },
  futebol: {
    titulo: "Futebol (Força e Agilidade)",
    resumo: "Força de base nas pernas e no tronco, para acelerar, frear e mudar de direção com menos risco de lesão.",
    nota: "Agilidade se treina em campo, com corridas e mudanças de direção. Esta ficha cobre a força de base.",
    itens: [
      i("agachamento", "4 séries × 5 a 6 repetições", "2 a 3 min", "Força de perna para acelerar e chutar, e para proteger o joelho."),
      i("afundo", "3 séries × 8 a 10 repetições por perna", "1 a 2 min", "Treina uma perna de cada vez, como na corrida e no chute, e o equilíbrio da pelve."),
      i("levantamento-terra", "3 séries × 5 a 6 repetições", "2 a 3 min", "Fortalece posteriores, glúteos e lombar, a cadeia que arranca e freia."),
      i("mesa-flexora", "3 séries × 8 a 12 repetições", "1 a 2 min", "Posteriores fortes ajudam a proteger a coxa nos sprints."),
      i("prancha-lateral", "3 séries × 20 a 30 segundos por lado", "1 min", "O core lateral e o glúteo médio estabilizam a pelve nas mudanças de direção."),
    ],
  },
  "fraco-pernas": {
    titulo: "Ponto fraco: pernas",
    resumo: "Quadríceps, posteriores, glúteos e panturrilhas com boa frequência, para corrigir o desequilíbrio.",
    itens: [
      i("agachamento", "3 séries × 8 a 10 repetições", "2 min", "Base de força para a perna toda."),
      i("leg-press", "3 séries × 10 a 12 repetições", "1 a 2 min", "Soma volume de quadríceps e glúteo com apoio nas costas."),
      i("mesa-flexora", "3 séries × 10 a 12 repetições", "1 a 2 min", "Equilibra o quadríceps com os posteriores da coxa."),
      i("elevacao-pelvica", "3 séries × 10 a 12 repetições", "1 a 2 min", "Isola o glúteo, que costuma ser o elo fraco."),
      i("panturrilha-em-pe", "3 séries × 12 a 15 repetições", "1 min", "Fortalece a base da cadeia da perna."),
    ],
  },
  "fraco-costas": {
    titulo: "Ponto fraco: costas",
    resumo: "Puxadas e remadas em vários ângulos, com exercícios que mantêm as escápulas estáveis.",
    itens: [
      i("puxada-frente", "3 séries × 8 a 12 repetições", "1 a 2 min", "Trabalha o dorsal, o principal músculo das costas."),
      i("remada-sentada", "3 séries × 10 a 12 repetições", "1 a 2 min", "Fortalece dorsais e romboides com o tronco apoiado."),
      i("remada-unilateral", "3 séries × 10 a 12 repetições por lado", "1 min", "Corrige diferenças entre os lados."),
      i("face-pull", "3 séries × 12 a 15 repetições", "1 min", "Fortalece o que mantém o ombro estável."),
      i("prancha", "3 séries × 30 a 40 segundos", "1 min", "O core sustenta o tronco e alivia a lombar."),
    ],
  },
  "fraco-ombros": {
    titulo: "Ponto fraco: ombros",
    resumo: "Força e estabilidade para o ombro, com atenção aos músculos de trás e das costas.",
    itens: [
      i("desenvolvimento", "3 séries × 8 a 12 repetições", "1 a 2 min", "Força de empurrar acima da cabeça."),
      i("elevacao-lateral", "3 séries × 12 a 15 repetições", "1 min", "Trabalha o deltoide lateral, que dá largura e estabilidade."),
      i("face-pull", "3 séries × 12 a 15 repetições", "1 min", "Fortalece a parte de trás do ombro e o manguito."),
      i("remada-sentada", "3 séries × 10 a 12 repetições", "1 a 2 min", "Costas fortes dão base estável ao ombro."),
      i("prancha", "3 séries × 30 a 40 segundos", "1 min", "O ombro também estabiliza o tronco no apoio."),
    ],
  },
  "fraco-core": {
    titulo: "Ponto fraco: core",
    resumo: "Exercícios que ensinam o tronco a resistir ao movimento, mais úteis do que muitos abdominais.",
    itens: [
      i("prancha", "3 séries × 30 a 45 segundos", "1 min", "Estabiliza o tronco contra a gravidade."),
      i("prancha-lateral", "3 séries × 20 a 30 segundos por lado", "1 min", "Fortalece as laterais do tronco e o glúteo médio."),
      i("abdominal-polia", "3 séries × 10 a 15 repetições", "1 min", "Trabalha o reto abdominal com carga ajustável."),
      i("elevacao-pernas", "3 séries × 8 a 12 repetições", "1 a 2 min", "Exige que o abdômen trave a pelve enquanto as pernas se movem."),
      i("agachamento", "3 séries × 8 a 10 repetições", "2 min", "Põe o core para trabalhar sob carga, como na vida real."),
    ],
  },
};

export const treinoDe = (obj: ObjetivoId, ponto: PontoFracoId) => TREINOS[obj === "fraco" ? `fraco-${ponto}` : obj];

export const DICAS = [
  "Treine 2 a 3 vezes por semana, com cerca de 48 horas de descanso entre treinos dos mesmos músculos.",
  "Escolha uma carga que deixe 1 a 3 repetições de reserva no fim de cada série, com técnica boa.",
  "Aqueça por 5 a 10 minutos antes. Se sentir dor (não o cansaço normal do músculo), pare.",
];
