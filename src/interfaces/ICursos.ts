export interface CursoAttributes {
  CURS_Id: number;
  CURS_Titulo: string;
  CURS_Descripcion?: string;
  CURS_Tipo: "audio" | "video";
  CURS_Autor: string;
  CURS_Avatar?: string;
  CURS_Estado: boolean;
}

export type CursoCreationAttributes = Omit<
  CursoAttributes,
  "CURS_Id"
>;
