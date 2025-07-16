export interface MultimediaAttributes {
  cod_multimedia: number;
  ruta?: string;
  tipo?: string;
  descripcion?: string;
  fecha_subida?: Date;
}

export interface MultimediaCreationAttributes
  extends Partial<Pick<MultimediaAttributes, 'cod_multimedia'>> {}
