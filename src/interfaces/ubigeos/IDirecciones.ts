import { EntidadProvider } from "./IEntidadProvider";

export interface DireccionAttributes {
  DIUS_Interno: number;
  DIUS_CodigoUbigeo: string;
  DIUS_Direccion: string;
  DIUS_Referencia?: string | null;
  DIUS_Tipo: string;
  DIUS_Predeterminada: boolean;
  DIUS_Tipo_Entidad: EntidadProvider;
  DIUS_Cod_Entidad: string;
  DIUS_Latitud: number;
  DIUS_Longitud: number;
}

export type DireccionCreationAttributes = Partial<
  Pick<
    DireccionAttributes,
    'DIUS_Referencia' | 'DIUS_Predeterminada' | 'DIUS_Latitud' | 'DIUS_Longitud'
  >
> &
  Pick<
    DireccionAttributes, 
    | 'DIUS_CodigoUbigeo'
    | 'DIUS_Direccion'
    | 'DIUS_Tipo'
    | 'DIUS_Tipo_Entidad'
    | 'DIUS_Cod_Entidad'
  >;
