export interface AvisoAttributes {
  AVIS_Id: number;
  AVIS_Estado: "borrador" | "publicado" | "pausado" | "eliminado";
  AVIS_Progreso: number; // porcentaje 0 - 100
  AVIS_FechaRegistro: Date;
  AVIS_FechaPublicacion?: Date | null;
  SERV_Interno: string; // FK hacia Servicios
  USUA_Interno: string;
  EMPR_Interno: string;
}

export interface AvisoCreationAttributes
  extends Omit<AvisoAttributes, "AVIS_Id" | "AVIS_FechaRegistro"> {}


export interface AvisoCreateInput
  extends Omit<AvisoCreationAttributes, "AVIS_Progreso"> {
  isCompleted?: number; // campo temporal para calcular progreso
}


