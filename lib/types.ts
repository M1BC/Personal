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
  cardio?: boolean; // exercício cardiorrespiratório (esteira, bicicleta, elíptico): prescrito em minutos
}
