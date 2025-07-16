export interface MediosAttributes {
  cod_medios: number;
  nombre: string;
}


export interface MediosCreationAttributes extends Omit<MediosAttributes, 'cod_medios'> {}
