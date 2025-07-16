export interface TipoUsuarioAttributes {
  cod_tipo_usuario: number;
  descripcion: string;
}

export interface TipoUsuarioCreationAttributes extends Omit<TipoUsuarioAttributes, 'cod_tipo_usuario'> {}


export interface TipoUsuarios {
  cod_tipo_usuario: number;
  descripcion: string;
}
