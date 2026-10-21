import type { Exercicio, GrupoMuscular } from "@/lib/types";

export const GRUPOS: Record<GrupoMuscular, { nome: string; funcao: string; ligacao: string }> = {
  peitoral: { nome: "Peitoral", funcao: "Aproxima o braço do corpo e empurra para a frente e para cima.", ligacao: "Trabalha em dupla com o deltoide anterior e o tríceps em todo empurrão. Se um deles está fraco, os outros compensam e se sobrecarregam." },
  ombros: { nome: "Ombros (deltoides)", funcao: "Elevam e giram o braço. Ajudam a iniciar quase todo empurrão.", ligacao: "Dependem de escápulas firmes, presas pelos músculos das costas. Se as costas não estabilizam, o ombro vira o elo mais frágil." },
  triceps: { nome: "Tríceps", funcao: "Estende o cotovelo, ou seja, termina o empurrão.", ligacao: "Trabalha junto do peitoral e dos ombros em todos os exercícios de empurrar." },
  biceps: { nome: "Bíceps", funcao: "Dobra o cotovelo e ajuda a puxar.", ligacao: "É ajudante nas remadas e puxadas. Se ele cansa primeiro, as costas deixam de ser o limite do exercício." },
  dorsais: { nome: "Dorsais (costas)", funcao: "Puxam o braço para baixo e para trás, em direção ao tronco.", ligacao: "Trabalham com o bíceps e com os músculos que juntam as escápulas. Costas fortes equilibram o peitoral e protegem os ombros." },
  lombar: { nome: "Lombar (eretores da espinha)", funcao: "Mantêm a coluna estável e estendida.", ligacao: "Forma com o core um cinto que segura o tronco. Se um dos dois falha, o outro sobrecarrega." },
  core: { nome: "Core (abdômen e laterais do tronco)", funcao: "Estabiliza o tronco e transmite força entre pernas e braços.", ligacao: "É a ponte entre a parte de baixo e a de cima do corpo. Core fraco faz a lombar trabalhar demais." },
  quadriceps: { nome: "Quadríceps", funcao: "Estende o joelho: é quem empurra no agachar e no levantar.", ligacao: "Divide o trabalho com glúteos e posteriores. Quando o quadríceps domina e os outros ficam para trás, o joelho sofre mais." },
  gluteos: { nome: "Glúteos", funcao: "Estendem o quadril e dão potência para subir, correr e saltar.", ligacao: "Trabalham com os posteriores da coxa e com o core para estabilizar a pelve." },
  posteriores: { nome: "Posteriores da coxa", funcao: "Dobram o joelho e ajudam a estender o quadril.", ligacao: "Equilibram o quadríceps na frente da coxa e protegem o joelho." },
  panturrilhas: { nome: "Panturrilhas", funcao: "Levantam o calcanhar e empurram o corpo do chão ao andar, correr e saltar.", ligacao: "Formam a base da cadeia da perna: tornozelo, joelho e quadril trabalham em sequência. Panturrilha fraca sobrecarrega o joelho e o tendão." },
};

export const CATEGORIAS = ["Todos", "Peito", "Costas", "Pernas", "Ombros", "Braços", "Core"] as const;
export type Categoria = (typeof CATEGORIAS)[number];

const CATEGORIA_DO_GRUPO: Record<GrupoMuscular, Exclude<Categoria, "Todos">> = {
  peitoral: "Peito", dorsais: "Costas", quadriceps: "Pernas", gluteos: "Pernas", posteriores: "Pernas",
  panturrilhas: "Pernas", ombros: "Ombros", biceps: "Braços", triceps: "Braços", core: "Core", lombar: "Core",
};
export const categoriaDe = (g: GrupoMuscular) => CATEGORIA_DO_GRUPO[g];

export const EXERCICIOS: Exercicio[] = [
  // Peito
  { id: "supino-reto", nome: "Supino reto", grupo_primario: "peitoral", grupos_secundarios: ["ombros", "triceps"], equipamento: "Barra e banco",
    explicacao_anatomica: "Tudo começa nos pés: firmes no chão, eles passam força das pernas, pelo quadril e pelo tronco, até o banco. As escápulas, juntas e presas ao banco pelos músculos das costas, formam uma base estável para o peitoral empurrar sem o ombro girar. O peitoral e o deltoide anterior empurram a barra, e o tríceps termina o movimento estendendo o cotovelo." },
  { id: "supino-inclinado", nome: "Supino inclinado com halteres", grupo_primario: "peitoral", grupos_secundarios: ["ombros", "triceps", "core"], equipamento: "Halteres e banco inclinado",
    explicacao_anatomica: "O banco inclinado leva o trabalho para a parte de cima do peitoral e exige mais do deltoide anterior. Cada haltere é independente, então as costas e o manguito rotador precisam estabilizar o ombro dos dois lados. O tríceps estende o cotovelo no fim, e o core evita que a lombar se arqueie." },
  { id: "crucifixo", nome: "Crucifixo com halteres", grupo_primario: "peitoral", grupos_secundarios: ["ombros", "biceps"], equipamento: "Halteres e banco",
    explicacao_anatomica: "Com o cotovelo levemente dobrado, o braço abre e fecha como uma porta: o peitoral aproxima os braços e o deltoide anterior ajuda. O bíceps trabalha parado, estabilizando o cotovelo, e as escápulas, presas pelas costas, impedem que o ombro vá para a frente. Sem esse controle, a carga cai no ombro e não no peitoral." },
  { id: "flexao", nome: "Flexão de braço", grupo_primario: "peitoral", grupos_secundarios: ["ombros", "triceps", "core", "gluteos"], equipamento: "Peso do corpo",
    explicacao_anatomica: "É um supino em que o corpo inteiro funciona como uma prancha: core e glúteos mantêm tudo alinhado, e o serrátil prende a escápula na caixa torácica. Se o core cede, o quadril cai e a lombar sobrecarrega. O peitoral e o tríceps fazem o empurrão." },
  // Costas
  { id: "puxada-frente", nome: "Puxada na frente", grupo_primario: "dorsais", grupos_secundarios: ["biceps", "core"], equipamento: "Polia alta",
    explicacao_anatomica: "O dorsal puxa o braço para baixo, mas antes disso as escápulas descem e se aproximam, trabalho do trapézio inferior. O bíceps ajuda a dobrar o cotovelo, e o core impede que o tronco balance para trás. Se o bíceps assumir tudo, o dorsal deixa de ser o foco." },
  { id: "remada-curvada", nome: "Remada curvada", grupo_primario: "dorsais", grupos_secundarios: ["biceps", "lombar", "posteriores"], equipamento: "Barra",
    explicacao_anatomica: "Os dorsais puxam a barra em direção ao abdômen e o bíceps ajuda a dobrar o cotovelo. O tronco inclinado é segurado pela lombar e pelos posteriores da coxa, que funcionam como uma ponte. Se eles cansam antes, o tronco sobe e o exercício vira um balanço, tirando o trabalho das costas." },
  { id: "remada-sentada", nome: "Remada sentada na polia", grupo_primario: "dorsais", grupos_secundarios: ["biceps", "lombar", "core"], equipamento: "Polia baixa",
    explicacao_anatomica: "Sentado, o apoio dos pés e o core seguram o tronco ereto, e a lombar o mantém estendido. Os dorsais e os romboides puxam a escápula para trás enquanto o bíceps dobra o cotovelo. Se o tronco balança, o quadril e a lombar roubam o trabalho das costas." },
  { id: "barra-fixa", nome: "Barra fixa", grupo_primario: "dorsais", grupos_secundarios: ["biceps", "core"], equipamento: "Barra fixa",
    explicacao_anatomica: "O corpo pendurado é uma cadeia: core e glúteos mantêm o tronco firme para que a força suba sem balanço. As escápulas descem primeiro, e só depois os dorsais puxam o corpo até a barra, ajudados pelo bíceps. Se o core solta, o corpo balança e a puxada perde força." },
  // Pernas
  { id: "agachamento", nome: "Agachamento", grupo_primario: "quadriceps", grupos_secundarios: ["gluteos", "posteriores", "core", "lombar"], equipamento: "Barra e rack, ou peso do corpo",
    explicacao_anatomica: "O quadríceps empurra, mas o core segura a coluna para você não cair, e a lombar mantém o tronco firme. Se o core falha, a lombar sobrecarrega. Os glúteos e os posteriores entram na subida, estendendo o quadril, e o conjunto trabalha em sequência: tornozelo, joelho e quadril." },
  { id: "leg-press", nome: "Leg press", grupo_primario: "quadriceps", grupos_secundarios: ["gluteos", "posteriores"], equipamento: "Máquina de leg press",
    explicacao_anatomica: "O encosto da máquina estabiliza o tronco, então a força vai quase toda para as pernas. O quadríceps estende o joelho e os glúteos estendem o quadril. Se o quadril descola do banco no fim da descida, a lombar sofre; por isso mantenha as costas apoiadas." },
  { id: "afundo", nome: "Afundo (passada)", grupo_primario: "quadriceps", grupos_secundarios: ["gluteos", "posteriores", "core"], equipamento: "Halteres ou peso do corpo",
    explicacao_anatomica: "É um agachamento sobre uma perna de cada vez, então o glúteo médio e o core precisam impedir que a pelve caia ou gire. O quadríceps e o glúteo da perna da frente fazem o empurrão, e os posteriores freiam o movimento. Se a pelve cai, o joelho tende a entrar para dentro." },
  { id: "levantamento-terra", nome: "Levantamento terra", grupo_primario: "posteriores", grupos_secundarios: ["gluteos", "lombar", "dorsais", "core"], equipamento: "Barra",
    explicacao_anatomica: "A cadeia posterior trabalha como uma corrente: os posteriores e os glúteos estendem o quadril, a lombar mantém a coluna neutra e os dorsais prendem a barra junto ao corpo. Se os dorsais soltam, a barra se afasta e a lombar paga a conta. O core cria pressão interna que trava o tronco." },
  { id: "cadeira-extensora", nome: "Cadeira extensora", grupo_primario: "quadriceps", grupos_secundarios: [], equipamento: "Máquina extensora",
    explicacao_anatomica: "Na máquina, o tronco fica apoiado e só o quadríceps trabalha, estendendo o joelho. Por isso ela isola o quadríceps sem exigir equilíbrio de glúteos ou core. O ponto de atenção é o joelho: use uma carga que permita controlar a descida." },
  { id: "elevacao-pelvica", nome: "Elevação pélvica", grupo_primario: "gluteos", grupos_secundarios: ["posteriores", "core"], equipamento: "Barra e banco",
    explicacao_anatomica: "O glúteo estende o quadril empurrando o peso para cima, com as costas apoiadas no banco e os pés firmes. Os posteriores ajudam, e o core impede que a lombar se arqueie no topo. Se a lombar assume o movimento, o glúteo perde estímulo." },
  { id: "panturrilha-em-pe", nome: "Panturrilha em pé", grupo_primario: "panturrilhas", grupos_secundarios: ["core"], equipamento: "Máquina ou degrau",
    explicacao_anatomica: "As panturrilhas levantam o corpo pelo tornozelo, e o resto da cadeia só precisa ficar alinhado: joelho estendido, quadril e core firmes. Como os pés são a base de tudo, panturrilhas fortes ajudam na corrida, no salto e no agachamento." },
  // Ombros
  { id: "desenvolvimento", nome: "Desenvolvimento com halteres", grupo_primario: "ombros", grupos_secundarios: ["triceps", "core"], equipamento: "Halteres",
    explicacao_anatomica: "O deltoide eleva o braço acima da cabeça e o tríceps estende o cotovelo no fim. As escápulas precisam subir e girar junto, com apoio do trapézio e do serrátil. Se o tronco se arqueia, o core e a lombar compensam; core firme mantém o empurrão para cima, e não para trás." },
  { id: "elevacao-lateral", nome: "Elevação lateral", grupo_primario: "ombros", grupos_secundarios: [], equipamento: "Halteres",
    explicacao_anatomica: "O deltoide lateral levanta o braço para o lado, enquanto o trapézio superior e o manguito rotador estabilizam a escápula e o ombro. Se o trapézio assume demais, o ombro sobe junto com o peso. Controle a descida e evite balançar o tronco." },
  // Braços
  { id: "rosca-direta", nome: "Rosca direta", grupo_primario: "biceps", grupos_secundarios: ["ombros", "core"], equipamento: "Barra",
    explicacao_anatomica: "O bíceps dobra o cotovelo, e o deltoide anterior segura o braço junto ao corpo. O core e a lombar impedem que o tronco balance, o que tiraria a carga do bíceps. Se o corpo balança, a rosca vira um movimento de quadril." },
  { id: "triceps-corda", nome: "Tríceps na polia com corda", grupo_primario: "triceps", grupos_secundarios: ["dorsais", "core"], equipamento: "Polia alta e corda",
    explicacao_anatomica: "O tríceps estende o cotovelo, e o dorsal mantém o braço colado ao corpo, funcionando como apoio. O core evita que o tronco se incline sobre a polia. Se os cotovelos se afastam, o ombro entra no movimento e o tríceps perde trabalho." },
  // Core
  { id: "prancha", nome: "Prancha", grupo_primario: "core", grupos_secundarios: ["ombros", "gluteos", "lombar"], equipamento: "Peso do corpo",
    explicacao_anatomica: "O core resiste a que o tronco ceda, ligando ombros e quadril: abdômen e lombar seguram a coluna, os glúteos travam o quadril e os ombros sustentam o peso. É um exercício de estabilização, então qualquer parte que cede, como o quadril caído, joga a carga para a lombar." },
];
