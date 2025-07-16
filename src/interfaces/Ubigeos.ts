export interface UbigeoAttributes {
  cod_ubigeo?: number;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  nombre?: string;
}


export interface UbigeoCreationAttributes extends Omit<UbigeoAttributes, 'cod_ubigeo'> {}
