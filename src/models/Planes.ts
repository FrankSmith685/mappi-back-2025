import { Sequelize, DataTypes, Model } from "sequelize";
import { PlanAttributes, PlanCreationAttributes } from "../interfaces/IPlanes";

export default (sequelize: Sequelize) => {
  sequelize.define<Model<PlanAttributes, PlanCreationAttributes>>(
    "Planes",
    {
      PLAN_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      TIPL_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "tipo_planes",
          key: "TIPL_Id",
        },
      },
      PLAN_TipoUsuario: {
        type: DataTypes.ENUM("independiente", "empresa"),
        allowNull: false,
      },
      PLAN_Precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      PLAN_DuracionMeses: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      PLAN_Moneda: {
        type: DataTypes.STRING(5),
        allowNull: false,
        defaultValue: "USD",
      },
      PLAN_Estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "planes",
      timestamps: false,
    }
  );
};
