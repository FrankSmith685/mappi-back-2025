import { Documento } from "./Documento";
import { TipoDocumento } from "./TipoDocumentos";
import { TipoUsuarios } from "./TipoUsuario";

export type EstadoUsuario = 'Activo' | 'Inactivo' | 'Bloqueado';
export type TipoRegistro = 'Completo' | 'Parcial' | 'Google' | 'Facebook';

export interface UsuarioAttributes {
  cod_usuario: string;
  correo: string;
  contraseña?: string;
  nombre?: string;
  apellido?: string;
  razon_social?: string;
  telefono?: string;
  telefono_movil?: string;
  fecha_registro?: Date;
  estado?: EstadoUsuario;
  ultimo_inicio_sesion?: Date;
  tipo_registro?: TipoRegistro;
}

export type UsuarioCreationAttributes = Partial<
  Pick<
    UsuarioAttributes,
    | 'contraseña'
    | 'nombre'
    | 'apellido'
    | 'razon_social'
    | 'telefono'
    | 'telefono_movil'
    | 'ultimo_inicio_sesion'
  >
> &
  Pick<UsuarioAttributes, 'cod_usuario' | 'correo' | 'estado' | 'fecha_registro' | 'tipo_registro'>;

  export interface UsuarioResponse {
    cod_usuario: string;
    correo: string;
    nombre?: string;
    apellido?: string;
    razon_social?: string;
    telefono?: string;
    telefono_movil?: string;
    tipo_usuario?:TipoUsuarios;
    documento?: Documento;
  }


export interface UpdateUsuarioCompleto {
  cod_usuario: string;
  nombre?: string;
  apellido?: string;
  razon_social?: string;
  telefono?: string;
  telefono_movil?: string;
  tipo_registro?: 'Completo' | 'Parcial' | 'Google' | 'Facebook';
  estado?: 'Activo' | 'Inactivo' | 'Bloqueado';
  documento?: Documento;
  tipo_usuario?: TipoUsuarios;
}
