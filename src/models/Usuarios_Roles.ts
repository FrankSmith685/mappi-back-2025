import { Sequelize, DataTypes, Model } from 'sequelize';
import { UsuarioRolAttributes, UsuarioRolCreationAttributes } from '../interfaces/usuarios';
// import { UsuarioRolAttributes, UsuarioRolCreationAttributes } from '../interfaces/IUsuario_Roles';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<UsuarioRolAttributes, UsuarioRolCreationAttributes>>(
    'Usuarios_Roles',
    {
      USRO_Interno: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
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
      USRO_Rol: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'ROLE_Interno',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    },
    {
      modelName: 'Usuarios_Roles',
      tableName: 'usuarios_roles',
      timestamps: false,
    }
  );
};