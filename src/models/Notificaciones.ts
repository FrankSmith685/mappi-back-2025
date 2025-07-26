import { Sequelize, DataTypes, Model } from 'sequelize';
import { NotificacionAttributes, NotificacionCreationAttributes } from '../interfaces/Notificaciones';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<NotificacionAttributes, NotificacionCreationAttributes>>('Notificaciones', {
    cod_notificacion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fecha_envio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: false,
  });
};