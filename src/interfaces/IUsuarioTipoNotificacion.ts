// interfaces/IUsuarioTipoNotificacion.ts
export interface UsuarioTipoNotificacionAttributes {
  UTNO_Id: number;
  USUA_Interno: string; // FK usuario
  TINO_Id: number;      // FK tipo notificacion
  UTNO_Activo: boolean;
}

export type UsuarioTipoNotificacionCreationAttributes = Pick<
  UsuarioTipoNotificacionAttributes,
  'USUA_Interno' | 'TINO_Id'
> &
  Partial<Pick<UsuarioTipoNotificacionAttributes, 'UTNO_Activo'>>;
