export interface PlanAttributes {
  PLAN_Id: number;
  TIPL_Id: number; // Relación con TipoPlanes
  PLAN_TipoUsuario: "independiente" | "empresa";
  PLAN_Precio: number;
  PLAN_DuracionMeses: number;
  PLAN_Moneda: string;
  PLAN_Estado: boolean;
}

export interface PlanCreationAttributes
  extends Omit<PlanAttributes, "PLAN_Id"> {} 
  