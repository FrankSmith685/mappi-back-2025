// src/models/Usuario.ts
import { Sequelize, DataTypes, Model } from 'sequelize';
import {
  UsuarioAttributes,
  UsuarioCreationAttributes,
} from '../interfaces/Usuario';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<UsuarioAttributes, UsuarioCreationAttributes>>('Usuarios', {
    cod_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contraseña: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razon_social: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telefono_movil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('Activo', 'Inactivo', 'Bloqueado'),
      defaultValue: 'Activo',
      allowNull: false,
    },
    ultimo_inicio_sesion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    tipo_registro: {
      type: DataTypes.ENUM('Completo', 'Parcial', 'Google', 'Facebook'),
      allowNull: false,
    },
  }, {
    modelName: 'Usuarios',
    timestamps: false,
  });
};
