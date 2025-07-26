import { Sequelize, DataTypes, Model } from 'sequelize';
import { UsuarioNotificacionAttributes, UsuarioNotificacionCreationAttributes } from '../interfaces/Notificaciones';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<UsuarioNotificacionAttributes, UsuarioNotificacionCreationAttributes>>('UsuaNotificaciones', {
    cod_usua_notificacion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cod_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
            model: 'Usuarios',
            key: 'cod_usuario',
        },
    },
    cod_notificacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
            model: 'Notificaciones',
            key: 'cod_notificacion',
        },
    },
    leida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fecha_leida: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    timestamps: false,
  });
};
