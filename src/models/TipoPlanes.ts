// modelos/TipoPlanes.ts
import { Sequelize, DataTypes, Model } from "sequelize";
import { TipoPlanAttributes, TipoPlanCreationAttributes } from "../interfaces/ITipoPlanes";

export default (sequelize: Sequelize) => {
  sequelize.define<Model<TipoPlanAttributes, TipoPlanCreationAttributes>>(
    "TipoPlanes",
    {
      TIPL_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      TIPL_Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      TIPL_Descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      TIPL_Estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "tipo_planes",
      timestamps: false,
    }
  );
};
