// interfaces/IPlanesBeneficios.ts
export interface PlanBeneficioAttributes {
  PLBE_Id: number;
  PLAN_Id: number;
  PLBE_Descripcion: string;
  TIPL_Id: number;
  PLAN_TipoUsuario: string;
}

export interface PlanBeneficioCreationAttributes
  extends Omit<PlanBeneficioAttributes, "PLBE_Id"> {}
