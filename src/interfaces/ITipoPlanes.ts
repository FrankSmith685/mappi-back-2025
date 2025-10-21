export interface TipoPlanAttributes {
  TIPL_Id: number;
  TIPL_Nombre: string;
  TIPL_Descripcion?: string | null;
  TIPL_Estado: boolean;
}

export interface TipoPlanCreationAttributes
  extends Omit<TipoPlanAttributes, "TIPL_Id"> {}
