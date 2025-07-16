export interface TipoNotificacionesAttributes {
  cod_tipo_notificaciones: number;
  nombre?: string;
  description?: string;
}

export interface TipoNotificacionesCreationAttributes extends Omit<TipoNotificacionesAttributes, 'cod_tipo_notificaciones'> {}
