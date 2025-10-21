// interfaces/IEmpresa.ts
export interface EmpresaAttributes {
  EMPR_Interno: string;
  EMPR_RazonSocial: string;
  EMPR_Ruc: string;
  EMPR_Telefono?: string | null;
  EMPR_Estado: boolean;
  EMPR_FechaRegistro: Date;
  USUA_Interno: string;
}

// Para creación, algunos campos pueden ser opcionales (p. ej. PK y fecha)
export interface EmpresaCreationAttributes
  extends Omit<EmpresaAttributes, "EMPR_Interno" | "EMPR_FechaRegistro"> {
  EMPR_Interno?: string;
  EMPR_FechaRegistro?: Date;
}
