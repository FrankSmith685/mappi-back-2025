// models/Empresas.ts
import { Sequelize, DataTypes, Model } from "sequelize";
import {
  EmpresaAttributes,
  EmpresaCreationAttributes,
} from "../interfaces/IEmpresa";

export default (sequelize: Sequelize) => {
  sequelize.define<Model<EmpresaAttributes, EmpresaCreationAttributes>>(
    "Empresas",
    {
      EMPR_Interno: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      EMPR_RazonSocial: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      EMPR_Ruc: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      EMPR_Telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      EMPR_Estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      EMPR_FechaRegistro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      USUA_Interno: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "USUA_Interno",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      modelName: "Empresas",
      tableName: "empresas",
      timestamps: false,
    }
  );
};
