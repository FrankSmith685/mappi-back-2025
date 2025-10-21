// models/usuarioTipoNotificaciones.ts
import { Sequelize, DataTypes, Model } from 'sequelize';
import { UsuarioTipoNotificacionAttributes, UsuarioTipoNotificacionCreationAttributes } from '../interfaces/usuarios/IUsuarioTipoNotificacion';
// import {
//   UsuarioTipoNotificacionAttributes,
//   UsuarioTipoNotificacionCreationAttributes,
// } from '../interfaces/IUsuarioTipoNotificacion';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<UsuarioTipoNotificacionAttributes, UsuarioTipoNotificacionCreationAttributes>>(
    'Usuario_TipoNotificaciones',
    {
      UTNO_Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      USUA_Interno: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      TINO_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      UTNO_Activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      modelName: 'Usuario_TipoNotificaciones',
      tableName: 'usuario_tipo_notificaciones',
      timestamps: false,
    }
  );
};
