// interfaces/IPlanesUsuarios.ts
export interface PlanUsuarioAttributes {
  PLUS_Id: number;
  USUA_Interno: string;
  PLAN_Id: number;
  TIPL_Id: number;
  PLUS_TokenPago?: string;
  PLUS_MontoPagado?: number;
  PLUS_Moneda?: string;
  PLUS_FechaInicio: Date;
  PLUS_FechaExpiracion?: Date;
  PLUS_EsPremium: boolean;
  PLUS_EstadoPago: "pendiente" | "pagado" | "fallido" | "gratuito";
  PLUS_EstadoPlan: "activo" | "inactivo" | "expirado" | "cancelado";
}

export type PlanUsuarioCreationAttributes = Omit<PlanUsuarioAttributes, "PLUS_Id">;
