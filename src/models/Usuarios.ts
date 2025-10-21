import { Sequelize, DataTypes, Model } from 'sequelize';
import {
  UsuarioAttributes,
  UsuarioCreationAttributes,
} from '../interfaces/IUsuario';
export default (sequelize: Sequelize) => {
  sequelize.define<Model<UsuarioAttributes, UsuarioCreationAttributes>>(
    'Usuarios',
    {
      USUA_Interno: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      USUA_Nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      USUA_Apellido: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      USUA_Correo: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      USUA_Telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      USUA_Dni: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      USUA_Estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      USUA_FechaRegistro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      USUA_UltimaSesion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      modelName: 'Usuarios',
      tableName: 'usuarios',
      timestamps: false,
    }
  );
};