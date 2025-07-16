export interface TipoDocumentoAttributes {
  cod_tipo_documento: number;
  nombre: string;
}

export interface TipoDocumentoCreationAttributes extends Omit<TipoDocumentoAttributes, 'cod_tipo_documento'> {}

export interface TipoDocumento {
  cod_tipo_documento: number;
  descripcion: string;
}
