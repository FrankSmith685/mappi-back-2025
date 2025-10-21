export interface ArchivoAttributes {
  ARCH_ID: string;
  ARCH_Entidad: string;       // usuario, negocio, producto, etc.
  ARCH_EntidadId: string;     // ID del registro de la entidad
  ARCH_Tipo: 'perfil' | 'portada' | 'documento' | 'imagen' | 'otro';
  ARCH_NombreOriginal: string;
  ARCH_Ruta: string;
  ARCH_FechaSubida: Date;
}

export type ArchivoCreationAttributes = Partial<
  Pick<ArchivoAttributes, 'ARCH_FechaSubida' | 'ARCH_ID'>
> &
  Pick<
    ArchivoAttributes,
    'ARCH_Entidad' | 'ARCH_EntidadId' | 'ARCH_Tipo' | 'ARCH_NombreOriginal' | 'ARCH_Ruta'
  >;

