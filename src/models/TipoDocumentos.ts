import { Sequelize, DataTypes, Model } from 'sequelize';
import {  TipoDocumentoAttributes, TipoDocumentoCreationAttributes } from '../interfaces/TipoDocumentos';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<TipoDocumentoAttributes, TipoDocumentoCreationAttributes>>('TipoDocumentos', {
    cod_tipo_documento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
  });

};
