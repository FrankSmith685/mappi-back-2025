// src/models/TipoNotificaciones.ts
import { Sequelize, DataTypes, Model } from 'sequelize';
import { TipoNotificacionAttributes, TipoNotificacionCreationAttributes } from '../interfaces/notificaciones.ts';
// import { TipoNotificacionAttributes, TipoNotificacionCreationAttributes } from '../interfaces/ITipoNotificacion';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<TipoNotificacionAttributes, TipoNotificacionCreationAttributes>>(
    'TipoNotificaciones',
    {
      TINO_Codigo: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      TINO_Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      TINO_Descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'tipo_notificaciones',
      timestamps: false,
    }
  );
};
