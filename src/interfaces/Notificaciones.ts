export interface NotificacionAttributes {
  cod_notificacion: number;
  titulo: string;
  mensaje: string;
  fecha_envio: Date;
  leida?: boolean;
  link?: string;
}

export interface NotificacionCreationAttributes
  extends Partial<Pick<NotificacionAttributes, 'cod_notificacion'>> {}
