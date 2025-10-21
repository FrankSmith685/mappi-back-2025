import { Sequelize, DataTypes, Model } from 'sequelize';
import {
  UsuarioLoginAttributes,
  UsuarioLoginCreationAttributes,
} from '../interfaces/usuarios';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<UsuarioLoginAttributes, UsuarioLoginCreationAttributes>>(
    'Usuarios_Login',
    {
      USL_Interno: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      USUA_Interno: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'USUA_Interno',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      USL_Proveedor: {
        type: DataTypes.ENUM('correo', 'google', 'facebook'),
        allowNull: false,
      },
      USL_Email_Proveedor: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      USL_Clave: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      USL_FechaVinculacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      modelName: 'Usuarios_Login',
      tableName: 'usuarios_login',
      timestamps: false,
    }
  );
};
