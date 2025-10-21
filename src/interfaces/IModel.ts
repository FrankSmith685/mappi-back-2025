// models/IModels.ts
import { Model, ModelStatic } from "sequelize";
import { 
    UsuarioAttributes, UsuarioCreationAttributes,
    UsuarioLoginAttributes, UsuarioLoginCreationAttributes,
    RolAttributes, RolCreationAttributes,
    UsuarioRolAttributes,
    UsuarioRolCreationAttributes
    } from "./usuarios";
import { DireccionAttributes, DireccionCreationAttributes, UbigeoAttributes, UbigeoCreationAttributes } from "./ubigeos";
import { TipoNotificacionAttributes, TipoNotificacionCreationAttributes } from "./notificaciones.ts";
import { UsuarioTipoNotificacionAttributes, UsuarioTipoNotificacionCreationAttributes } from "./usuarios/IUsuarioTipoNotificacion";

export interface IModels {
  Usuarios: ModelStatic<Model<UsuarioAttributes, UsuarioCreationAttributes>>;
  Usuarios_Login: ModelStatic<Model<UsuarioLoginAttributes, UsuarioLoginCreationAttributes>>;
  Roles: ModelStatic<Model<RolAttributes, RolCreationAttributes>>;
  Ubigeos: ModelStatic<Model<UbigeoAttributes, UbigeoCreationAttributes>>;
  Usuarios_Roles: ModelStatic<Model<UsuarioRolAttributes, UsuarioRolCreationAttributes>>;
  Direcciones: ModelStatic<Model<DireccionAttributes, DireccionCreationAttributes>>;
  TipoNotificaciones: ModelStatic<Model<TipoNotificacionAttributes, TipoNotificacionCreationAttributes>>;
  Usuario_TipoNotificaciones: ModelStatic<Model<UsuarioTipoNotificacionAttributes, UsuarioTipoNotificacionCreationAttributes>>;
}
