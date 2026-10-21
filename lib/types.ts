export type GrupoMuscular =
  | "peitoral" | "ombros" | "triceps" | "biceps" | "dorsais"
  | "lombar" | "core" | "quadriceps" | "gluteos" | "posteriores" | "panturrilhas";

export interface Exercicio {
  id: string;
  nome: string;
  grupo_primario: GrupoMuscular;
  grupos_secundarios: GrupoMuscular[];
  explicacao_anatomica: string;
  equipamento: string;
}

// Macros referem-se à porcao_referencia (porcao_g gramas). medida_g = gramas da medida caseira.
export interface Alimento {
  id: string;
  nome: string;
  porcao_referencia: string;
  porcao_g: number;
  proteina_g: number;
  carboidratos_g: number;
  gorduras_g: number;
  medida_caseira: string; // singular, com o número 1 (ex.: "1 filé médio")
  medida_plural: string; // ex.: "filés médios"
  medida_g: number;
  de: string; // complemento da frase (ex.: "de frango grelhado")
  grupo: "proteina" | "carboidrato" | "gordura";
}

export interface Refeicao {
  id: string;
  nome: "Café da Manhã" | "Almoço" | "Lanche" | "Jantar";
  meta_proteina_g: number;
  sugestoes_alimentos: Alimento[];
}

export interface PerfilUsuario {
  peso_kg: number;
  altura_cm: number;
  idade: number;
  objetivo: "saude" | "volei" | "futebol" | "ponto_fraco";
  orcamento_suplementos: "baixo" | "medio" | "alto";
}

export interface Suplemento {
  id: string;
  nome: string;
  funcao_principal: string;
  evidencia_cientifica: string;
  faixa_preco_brl: string;
  publico_alvo: string;
  alerta_uso: string;
}
