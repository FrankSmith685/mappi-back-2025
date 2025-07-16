import { JwtPayload } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
  username: string;
  data: any;
}

export interface RegisterUserData {
  tipoUsuario: number;
  correo: string;
  contraseña: string;
  nombre?: string;
  apellido?: string;
  razon_social?: string;
  tipoDocumento?: number;
  nroDocumento?: string;
  telefono?: string;
  telefono_movil?: string;
}