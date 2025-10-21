export interface UsuarioCursoAttributes {
  USUC_Id: number;
  USUA_Interno: string;         // FK → usuarios.USUA_Interno
  CURS_Id: number;              // FK → cursos.CURS_Id
  USUC_Orden: number;           // orden secuencial del curso
  USUC_Desbloqueado: boolean;   // indica si el curso está disponible
  USUC_Completado: boolean;     // indica si fue completado
  USUC_PorcentajeProgreso: number; // porcentaje general del curso
  USUC_FechaDesbloqueo?: Date | null; // fecha cuando se desbloqueó
  USUC_FechaCompletado?: Date | null; // fecha cuando se completó
}

// Para crear un registro nuevo (sin id ni fechas opcionales)
export interface UsuarioCursoCreationAttributes
  extends Omit<
    UsuarioCursoAttributes,
    "USUC_Id" | "USUC_FechaDesbloqueo" | "USUC_FechaCompletado"
  > {}
