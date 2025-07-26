export interface NotificacionAttributes {
  cod_notificacion: number;
  titulo: string;
  mensaje: string;
  fecha_envio: Date;
  link?: string;
}

export interface NotificacionCreationAttributes
  extends Partial<Pick<NotificacionAttributes, 'cod_notificacion'>> {}


  export interface UsuarioNotificacionAttributes {
  cod_usua_notificacion: number;
  cod_usuario: number;
  cod_notificacion: number;
  leida?: boolean;
  fecha_leida?: Date;
}

export interface UsuarioNotificacionCreationAttributes
  extends Omit<UsuarioNotificacionAttributes, 'id'> {}
