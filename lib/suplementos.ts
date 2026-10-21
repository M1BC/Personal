import type { Suplemento } from "./types";

export type Orcamento = "apertado" | "moderado" | "folgado";
export type MetaPeso = "perda" | "manutencao" | "ganho";

export interface SuplementoDetalhe extends Suplemento {
  oQueE: string;
  paraQueServe: string;
  ciencia: string;
  comoUsar: string;
  marcas: string[];
}

export const METAS: Record<MetaPeso, string> = { perda: "Perda de Peso", manutencao: "Manutenção", ganho: "Ganho de Peso" };

export const PRECOS_REF =
  "Preços estimados em outubro de 2026, a partir de anúncios de lojas online no Brasil. Mudam conforme marca, loja e promoção.";
export const MARCAS_REF =
  "Marcas nacionais conhecidas e de ampla venda. Isso não é recomendação nem garantia de qualidade: confira o rótulo, o lote, a validade e, se possível, o laudo de análise do fabricante.";

export const SUPLEMENTOS: Record<string, SuplementoDetalhe> = {
  creatina: {
    id: "creatina",
    nome: "Creatina monohidratada",
    funcao_principal: "Mais força e rendimento em séries pesadas. É o melhor custo-benefício da lista.",
    evidencia_cientifica: "Fortíssima",
    faixa_preco_brl: "cerca de R$ 40 a R$ 70 o pote de 300 g, que rende uns 100 dias com 3 g por dia",
    publico_alvo: "Quem treina força ou esportes de esforço intenso, inclusive com orçamento apertado.",
    alerta_uso: "Em doses de 3 a 5 g por dia, a creatina é segura para pessoas saudáveis e não causa dano aos rins. Apenas quem já tem doença renal deve consultar o médico antes de usar. Se fizer exame de sangue, avise que usa creatina: ela pode aumentar a creatinina no exame sem indicar lesão nos rins.",
    oQueE: "Substância que o próprio corpo produz e que também vem da carne e do peixe. Guarda energia rápida dentro do músculo. A forma em pó chamada monohidratada é a mais estudada.",
    paraQueServe: "Ajuda em esforços curtos e intensos, como séries pesadas de musculação, e na recuperação entre elas. Com o tempo, ajuda a ganhar força e massa magra.",
    ciencia: "Evidência fortíssima para força, potência e massa magra. A posição da sociedade internacional de nutrição esportiva (ISSN) é que a monohidratada é a forma mais eficaz e bem estudada. Estudos de curto e longo prazo, de até anos de uso, não mostram dano aos rins nem ao fígado em pessoas saudáveis.",
    comoUsar: "3 a 5 g por dia, todos os dias, inclusive nos dias sem treino. Em medida caseira, 5 g ≈ 1 colher de chá cheia, e 3 g ≈ 1 colher de chá rasa (aproximado; use o dosador da embalagem, se houver). Não precisa de fase de carga: com 3 g por dia, o músculo enche os estoques em cerca de 4 semanas.",
    marcas: ["Growth Supplements", "Max Titanium", "Integralmedica", "DUX Nutrition", "Probiótica"],
  },
  whey: {
    id: "whey",
    nome: "Whey protein",
    funcao_principal: "Ajuda a bater a meta de proteína do dia. Não é obrigatório se a comida der conta.",
    evidencia_cientifica: "Boa, como fonte de proteína",
    faixa_preco_brl: "cerca de R$ 150 a R$ 260 o pote de 900 g do concentrado",
    publico_alvo: "Quem tem dificuldade de bater a meta de proteína só com comida.",
    alerta_uso: "Quem tem alergia ao leite deve evitar. Quem tem intolerância à lactose pode sentir desconforto com o concentrado. Quem tem doença nos rins deve falar com o médico antes de aumentar a proteína.",
    oQueE: "Proteína do soro do leite, vendida em pó. É uma forma prática de comer proteína, não um produto mágico.",
    paraQueServe: "Ajuda a chegar à meta de proteína quando a comida não é suficiente. Se você já atinge a meta comendo, o whey não traz vantagem extra.",
    ciencia: "É uma fonte de proteína de boa qualidade. O que mais pesa para o músculo é a proteína total do dia e o treino: a mesma quantidade vinda de comida de verdade funciona.",
    comoUsar: "Uma dose: 30 g de pó ≈ 1 scoop (dosador da embalagem, que costuma ter de 30 a 35 g; confira o rótulo). Cada dose traz cerca de 20 a 25 g de proteína, conforme a marca. Use quando faltar proteína no dia.",
    marcas: ["Growth Supplements", "Max Titanium", "Integralmedica", "DUX Nutrition", "Probiótica"],
  },
  cafeina: {
    id: "cafeina",
    nome: "Cafeína pré-treino",
    funcao_principal: "Mais energia e disposição no treino. Opcional.",
    evidencia_cientifica: "Boa, em doses moderadas",
    faixa_preco_brl: "cerca de R$ 25 a R$ 65 por 60 cápsulas de 200 a 210 mg; o café comum também serve e custa menos",
    publico_alvo: "Quem treina cedo ou sente falta de energia e tolera bem a cafeína.",
    alerta_uso: "Evite à noite, porque atrapalha o sono. Pode causar ansiedade, tremor e coração acelerado. Quem tem pressão alta, problema no coração ou está grávida deve falar com o médico antes.",
    oQueE: "Estimulante que está no café, no chá e nos pré-treinos. Em cápsula, vem em doses fixas, em geral de 200 a 210 mg.",
    paraQueServe: "Aumenta o estado de alerta e pode melhorar o desempenho e a sensação de esforço no treino.",
    ciencia: "A ISSN diz que a cafeína melhora o desempenho de forma consistente em doses de 3 a 6 mg por kg de peso, e que doses muito altas (cerca de 9 mg/kg) aumentam os efeitos colaterais sem benefício extra.",
    comoUsar: "Cerca de 1 hora antes do treino, na faixa de 3 a 6 mg por kg. Em medida caseira: 1 cápsula de 200 mg, ou, segundo a ISSN, 2 a 4 xícaras grandes de café (cerca de 240 ml cada) para uma pessoa média. Comece pelo lado baixo e some o café e os energéticos que você já toma.",
    marcas: ["Growth Supplements", "Max Titanium", "DUX Nutrition", "ou cápsulas de farmácia de manipulação"],
  },
  hipercalorico: {
    id: "hipercalorico",
    nome: "Hipercalórico",
    funcao_principal: "Soma calorias para quem não consegue comer o suficiente.",
    evidencia_cientifica: "Fraca como produto: funciona só por fornecer calorias",
    faixa_preco_brl: "cerca de R$ 60 a R$ 130 o pacote de 3 kg",
    publico_alvo: "Quem tem dificuldade para ganhar peso mesmo comendo bastante.",
    alerta_uso: "Só use se você realmente não consegue comer o suficiente para ganhar peso. Pode causar desconforto gástrico.",
    oQueE: "Pó com muitas calorias, em geral carboidrato com um pouco de proteína, para somar calorias sem precisar comer mais comida.",
    paraQueServe: "Facilita ganhar peso para quem não consegue comer o suficiente. Ele não constrói músculo sozinho: o que gera ganho é treinar com sobra de calorias.",
    ciencia: "Não tem nada de especial além das calorias. O mesmo resultado vem de comida comum, como leite, banana, aveia e pasta de amendoim.",
    comoUsar: "Uma dose por dia, entre as refeições, só se faltarem calorias. Use o dosador da própria embalagem e leia o rótulo: algumas doses passam de 600 kcal.",
    marcas: ["Max Titanium", "FTW", "Dark Lab", "Soldiers Nutrition"],
  },
};

export const ORCAMENTOS: Record<Orcamento, { nome: string; curto: string; resumo: string; ids: string[]; opcionais?: string[] }> = {
  apertado: { nome: "Apertado", curto: "Só o essencial", resumo: "Com pouco dinheiro, priorize só a creatina: é a que tem mais evidência e o menor custo por dose. O resto vem da comida.", ids: ["creatina"] },
  moderado: { nome: "Moderado", curto: "O essencial e mais um", resumo: "Creatina primeiro. O whey entra para ajudar a bater a meta de proteína, mas não é obrigatório se a comida der conta.", ids: ["creatina", "whey"] },
  folgado: { nome: "Folgado", curto: "Com um extra", resumo: "Creatina e whey, com cafeína como extra opcional antes do treino.", ids: ["creatina", "whey", "cafeina"], opcionais: ["cafeina"] },
};
