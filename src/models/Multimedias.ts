import { Sequelize, DataTypes, Model } from 'sequelize';
import { MultimediaAttributes, MultimediaCreationAttributes } from '../interfaces/Multimedias';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<MultimediaAttributes, MultimediaCreationAttributes>>('Multimedias', {
    cod_multimedia: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    ruta: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_subida: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    timestamps: false,
  });
};
