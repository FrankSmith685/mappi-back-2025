import { Sequelize, DataTypes, Model } from 'sequelize';
import { ArchivoAttributes, ArchivoCreationAttributes } from '../interfaces/IArchivos';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<ArchivoAttributes, ArchivoCreationAttributes>>(
    'Archivos',
    {
      ARCH_ID: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      ARCH_Entidad: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ARCH_EntidadId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ARCH_Tipo: {
        type: DataTypes.ENUM('perfil', 'logo','portada','video', 'documento', 'imagen', 'otro'),
        allowNull: false,
      },
      ARCH_NombreOriginal: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      ARCH_Ruta: {
        type: DataTypes.STRING(500),
        allowNull: false, // path o url del archivo
      },
      ARCH_FechaSubida: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      modelName: 'Archivos',
      tableName: 'archivos',
      timestamps: false,
    }
  );
};
