// src/models/UsuarioDocumento.ts
import { Sequelize, DataTypes, Model } from 'sequelize';
import {
  UsuarioDocumentoAttributes,
  UsuarioDocumentoCreationAttributes,
} from '../interfaces/UsuarioDocumento';

export default (sequelize: Sequelize) => {
  sequelize.define<Model<UsuarioDocumentoAttributes, UsuarioDocumentoCreationAttributes>>(
    'UsuarioDocumentos',
    {
      cod_usuario: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'cod_usuario',
        },
      },
      cod_tipo_documento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'TipoDocumentos',
          key: 'cod_tipo_documento',
        },
      },
      nro_documento: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );
};
