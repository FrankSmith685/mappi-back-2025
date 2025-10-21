import { Sequelize, DataTypes, Model } from 'sequelize';
import { RolAttributes, RolCreationAttributes } from '../interfaces/usuarios';
// import { RolAttributes, RolCreationAttributes } from '../interfaces/IRoles';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<RolAttributes, RolCreationAttributes>>(
    'Roles',
    {
      ROLE_Interno: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },
      ROLE_Nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      ROLE_Descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      modelName: 'Roles',
      tableName: 'roles',
      timestamps: false,
    })
}