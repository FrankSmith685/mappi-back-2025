// modelos/PlanesBeneficios.ts
import { Sequelize, DataTypes, Model } from "sequelize";
import { PlanBeneficioAttributes, PlanBeneficioCreationAttributes } from "../interfaces/IPlanesBeneficios";

export default (sequelize: Sequelize) => {
  sequelize.define<Model<PlanBeneficioAttributes, PlanBeneficioCreationAttributes>>(
    "PlanesBeneficios",
    {
      PLBE_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      PLAN_TipoUsuario: {
        type: DataTypes.ENUM("empresa", "independiente"),
        allowNull: false,
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
      PLBE_Descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: "planes_beneficios",
      timestamps: false,
    }
  );
};
