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

export type UsuarioCreationAttributes = Pick<
  UsuarioAttributes,
  | 'USUA_Interno'
  | 'USUA_Nombre'
  | 'USUA_Apellido'
  | 'USUA_Correo'
  | 'USUA_Telefono'
  | 'USUA_Dni'
  | 'USUA_Estado'
  | 'USUA_FechaRegistro'
  | 'USUA_UltimaSesion'
>;
