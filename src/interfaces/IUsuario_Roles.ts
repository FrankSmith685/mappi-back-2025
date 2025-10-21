export interface UsuarioRolAttributes {
  USRO_Interno: number;
  USUA_Interno: string;
  USRO_Rol: number;
}

export type UsuarioRolCreationAttributes = Pick<
  UsuarioRolAttributes,
  'USUA_Interno' | 'USRO_Rol'
>;