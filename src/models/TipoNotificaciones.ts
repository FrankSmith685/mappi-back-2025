import { Sequelize, DataTypes, Model } from 'sequelize';
import {  TipoNotificacionesAttributes, TipoNotificacionesCreationAttributes } from '../interfaces/TipoNotificaciones';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<TipoNotificacionesAttributes, TipoNotificacionesCreationAttributes>>('TipoNotificaciones', {
    cod_tipo_notificaciones: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
  }, {
    timestamps: false,
  });

};
