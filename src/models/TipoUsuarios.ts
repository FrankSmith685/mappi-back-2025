import { Sequelize, DataTypes, Model } from 'sequelize';
import { TipoUsuarioAttributes, TipoUsuarioCreationAttributes } from '../interfaces/TipoUsuario';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<TipoUsuarioAttributes, TipoUsuarioCreationAttributes>>('TipoUsuarios', {
    cod_tipo_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
  });
};
