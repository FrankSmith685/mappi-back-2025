import { Sequelize, DataTypes, Model } from 'sequelize';
import {
  UsuarioTipoNotificacionesAttributes,
  UsuarioTipoNotificacionesCreationAttributes
} from '../interfaces/TipoNotificaciones';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<UsuarioTipoNotificacionesAttributes, UsuarioTipoNotificacionesCreationAttributes>>('UsuaTipNotificaciones', {
    cod_usua_tip_notificacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    cod_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
            model: 'Usuarios',
            key: 'cod_usuario',
        }
    },
    cod_tipo_notificaciones: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: 'TipoNotificaciones',
          key: 'cod_tipo_notificaciones',
        }
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: false,
  });
};
