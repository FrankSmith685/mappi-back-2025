// 🧩 interfaces/IUsuarioModulos.ts
export interface UsuarioModuloAttributes {
  USUM_Id: number;
  USUA_Interno: string;        // FK → usuarios.USUA_Interno
  MODU_Id: number;             // FK → modulos_curso.MODU_Id
  USUM_Orden: number;          // orden del módulo dentro del curso
  USUM_Desbloqueado: boolean;  // si el usuario puede acceder al módulo
  USUM_PorcentajeProgreso: number; // porcentaje (0 a 100)
  USUM_TiempoActual?: number | null; // segundos (posición actual)
  USUM_Completado: boolean;    // indica si terminó el módulo
  USUM_FechaUltimoProgreso: Date; // última vez que interactuó
  USUM_FechaCompletado?: Date | null; // fecha de completado
}

// Para crear un registro nuevo (sin id y fechas opcionales)
export interface UsuarioModuloCreationAttributes
  extends Omit<
    UsuarioModuloAttributes,
    "USUM_Id" | "USUM_FechaUltimoProgreso" | "USUM_FechaCompletado"
  > {}
