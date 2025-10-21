export interface RolAttributes {
  ROLE_Interno: number;
  ROLE_Nombre: string;
  ROLE_Descripcion?: string | null;
}

export type RolCreationAttributes = Partial<Pick<RolAttributes, 'ROLE_Descripcion'>> &
  Pick<RolAttributes, 'ROLE_Nombre'>;