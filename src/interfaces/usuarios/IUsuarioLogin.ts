import { AuthProvider } from "../auth";

export interface UsuarioLoginAttributes {
  USL_Interno: number;
  USUA_Interno: string;
  USL_Proveedor: AuthProvider;
  USL_Email_Proveedor?: string | null;
  USL_Clave?: string | null;
  USL_FechaVinculacion: Date;
}

export interface UsuarioLoginCreationAttributes
  extends Omit<UsuarioLoginAttributes, 'USL_Interno' | 'USL_FechaVinculacion'> {}