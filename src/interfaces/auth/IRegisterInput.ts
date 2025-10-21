import { AuthProvider } from "./IAuthProvider";

export interface IRegisterInput {
  nombre?: string;
  apellido?: string;
  correo: string;
  telefono?: string | null;
  dni?: string | null;
  contrasena: string;
  rolId?: number;
  ubigeoCodigo?: string;
  direccion?: string;
  referencia?: string;
  tipoDireccion?: string;
  proveedor?: AuthProvider;
}