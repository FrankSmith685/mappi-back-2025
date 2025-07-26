export interface TipoNotificacionesAttributes {
  cod_tipo_notificaciones: number;
  nombre?: string;
  description?: string;
}

export interface TipoNotificacionesCreationAttributes extends Omit<TipoNotificacionesAttributes, 'cod_tipo_notificaciones'> {}

 export interface UsuarioTipoNotificacionesAttributes {
  cod_usua_tip_notificacion: number;
  cod_usuario: string;
  cod_tipo_notificaciones: number;
  activo: boolean;
}

export type UsuarioTipoNotificacionesCreationAttributes = Partial<Pick<UsuarioTipoNotificacionesAttributes, 'cod_usua_tip_notificacion'>> &
  Pick<UsuarioTipoNotificacionesAttributes, 'cod_usuario' | 'cod_tipo_notificaciones' | 'activo'>;

export interface PreferenciaUpdate {
  cod_tipo_notificaciones: number;
  activo: boolean;
}