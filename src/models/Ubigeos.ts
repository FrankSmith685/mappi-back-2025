import { Sequelize, DataTypes, Model } from 'sequelize';
import { UbigeoAttributes, UbigeoCreationAttributes } from '../interfaces/ubigeos';
// import { UbigeoAttributes, UbigeoCreationAttributes } from '../interfaces/IUbigeos';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<UbigeoAttributes, UbigeoCreationAttributes>>(
    'Ubigeos',
    {
      UBIG_Codigo: {
        type: DataTypes.STRING(6),
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      UBIG_Departamento: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      UBIG_Provincia: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      UBIG_Distrito: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      modelName: 'Ubigeos',
      tableName: 'ubigeos',
      timestamps: false,
    }
  );
};