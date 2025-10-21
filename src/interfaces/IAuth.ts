import { JwtPayload } from "jsonwebtoken";

export interface TokenPayload extends JwtPayload {
  username: string;
  data: any;
}

export interface RegisterUserData {
  nombre: string;
  apellido?: string;
  correo: string;
  telefono?: string;
  dni?:string;
  contrasena: string;
  fotoPerfil?: string;
  rolId: number;
  ubigeoCodigo: string;
  direccion: string;
  referencia?: string;
  tipoDireccion: string;
  proveedor: string;
}