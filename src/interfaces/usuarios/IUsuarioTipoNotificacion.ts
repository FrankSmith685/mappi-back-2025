export interface UsuarioTipoNotificacionAttributes {
  UTNO_Id: number;
  USUA_Interno: string;
  TINO_Id: number;
  UTNO_Activo: boolean;
}

export type UsuarioTipoNotificacionCreationAttributes = Pick<
  UsuarioTipoNotificacionAttributes,
  'USUA_Interno' | 'TINO_Id'
> &
  Partial<Pick<UsuarioTipoNotificacionAttributes, 'UTNO_Activo'>>;
