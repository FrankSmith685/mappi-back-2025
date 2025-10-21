
export interface UsuarioAttributes {
  USUA_Interno: string;
  USUA_Nombre?: string | null;
  USUA_Apellido?: string | null;
  USUA_Correo: string;
  USUA_Telefono?: string | null;
  USUA_Dni?: string | null;
  USUA_Estado: boolean;
  USUA_FechaRegistro: Date;
  USUA_UltimaSesion?: Date | null;
}



export type UsuarioCreationAttributes = Partial<
  Pick<
    UsuarioAttributes,
    | 'USUA_Apellido'
    | 'USUA_Telefono'
    | 'USUA_UltimaSesion'
  >
> &
  Pick<
    UsuarioAttributes,
    | 'USUA_Nombre'
    | 'USUA_Correo'
    | 'USUA_Estado'
  >;

  
  export interface UsuarioResponse {
    cod_usuario: string;
    nombre: string | null;
    apellido: string | null;
    correo: string;
    telefono: string | null;
    dni: string | null;
    fotoPerfil: string | null;
    estado: boolean;
    fechaRegistro: Date;
    ultimaSesion: Date | null;
    tipo_usuario: {
      cod_tipo_usuario: number;
      descripcion: string;
    }[];
    metodosLogin: string[] | [];
    tieneEmpresa: boolean;
    tieneServicio: boolean;
    idUbigeo: string;
    tienePlan?: string | null;
    planActivo?: {
    PLUS_Id: number;
    PLUS_EstadoPlan: string;
    PLAN_Id: number;
      PLAN_TipoUsuario: string;
    } | null; 
    limiteServicios?: number;
    serviciosActivos?: number;
    limitePromocional?: number;
    tieneVideoPromocional?: boolean;
    tieneAviso?:boolean;
  }

