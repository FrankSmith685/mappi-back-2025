// modelos/PlanesUsuarios.ts
import { Sequelize, DataTypes, Model } from "sequelize";
import { PlanUsuarioAttributes, PlanUsuarioCreationAttributes } from "../interfaces/IPlanesUsuarios";

export default (sequelize: Sequelize) => {
  sequelize.define<Model<PlanUsuarioAttributes, PlanUsuarioCreationAttributes>>(
    "PlanesUsuarios",
    {
      PLUS_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      USUA_Interno: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "USUA_Interno",
        },
        onDelete: "CASCADE",
      },
      PLAN_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "planes",
          key: "PLAN_Id",
        },
        onDelete: "CASCADE",
      },
      TIPL_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "tipo_planes",
          key: "TIPL_Id",
        },
        onDelete: "CASCADE",
      },
      PLUS_TokenPago: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      PLUS_MontoPagado: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      PLUS_Moneda: {
        type: DataTypes.STRING(5),
        allowNull: false,
        defaultValue: "PEN",
      },
      PLUS_FechaInicio: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      PLUS_FechaExpiracion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      PLUS_EsPremium: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      PLUS_EstadoPago: {
        type: DataTypes.ENUM("pendiente", "pagado", "fallido", "gratuito"),
        allowNull: false,
        defaultValue: "pendiente",
      },
      PLUS_EstadoPlan: {
        type: DataTypes.ENUM("activo", "inactivo", "expirado", "cancelado"),
        allowNull: false,
        defaultValue: "activo",
      },

    },
    {
      tableName: "planes_usuarios",
      timestamps: false,
    }
  );
};
