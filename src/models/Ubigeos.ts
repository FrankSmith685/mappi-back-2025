import { Sequelize, DataTypes, Model } from 'sequelize';
import { UbigeoAttributes, UbigeoCreationAttributes } from '../interfaces/Ubigeos';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<UbigeoAttributes, UbigeoCreationAttributes>>('Ubigeos', {
    cod_ubigeo: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    departamento: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provincia: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    distrito: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
  });
};
