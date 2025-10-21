import { Sequelize, DataTypes, Model } from 'sequelize';
import { DireccionCreationAttributes, DireccionAttributes } from '../interfaces/IDirecciones';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<DireccionAttributes, DireccionCreationAttributes>>(
    'Direcciones',
    {
      DIUS_Interno: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      DIUS_CodigoUbigeo: {
        type: DataTypes.STRING(6),
        allowNull: false,
        references: {
          model: 'ubigeos',
          key: 'UBIG_Codigo', 
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
      },
      DIUS_Direccion: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      DIUS_Referencia: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      DIUS_Tipo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      DIUS_Predeterminada: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, 
      },
      DIUS_Tipo_Entidad: {
        type: DataTypes.ENUM('servicio', 'usuario', 'empresa'),
        allowNull: false,
      },
      DIUS_Cod_Entidad: {
        type: DataTypes.STRING,
        allowNull: false,
      }, 
      DIUS_Latitud: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "0",
      },
      DIUS_Longitud: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "0",
      },

    },
    {
      timestamps: false,
    }
  );
};