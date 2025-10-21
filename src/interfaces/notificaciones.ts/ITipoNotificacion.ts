export interface TipoNotificacionAttributes {
  TINO_Codigo: number;
  TINO_Nombre: string;
  TINO_Descripcion: string;
}

export type TipoNotificacionCreationAttributes = Pick<
  TipoNotificacionAttributes,
  'TINO_Nombre' | 'TINO_Descripcion'
>;
