export interface ModuloCursoAttributes {
  MODU_Id: number;
  CURS_Id: number;
  MODU_Titulo: string;
  MODU_Descripcion?: string;
  MODU_Orden: number;
  MODU_UrlContenido?: string;
  MODU_Estado: boolean;
}

export type ModuloCursoCreationAttributes = Omit<
  ModuloCursoAttributes,
  "MODU_Id"
>;
