import { AuthProvider } from "./IAuthProvider";

export interface ILoginInput {
  correo: string;
  proveedor: AuthProvider;
  contraseña?: string;
}