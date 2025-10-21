import { Sequelize, DataTypes, Model } from "sequelize";
import { AvisoAttributes, AvisoCreationAttributes } from "../interfaces/IAvisos";

export default (sequelize: Sequelize) => {
  sequelize.define<Model<AvisoAttributes, AvisoCreationAttributes>>(
    "Avisos",
    {
      AVIS_Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      AVIS_Estado: {
        type: DataTypes.ENUM("borrador", "publicado", "pausado", "eliminado"),
        allowNull: false,
        defaultValue: "borrador",
      },
      AVIS_Progreso: {
        type: DataTypes.INTEGER, // 0 - 100
        allowNull: false,
        defaultValue: 0,
      },
      AVIS_FechaRegistro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      AVIS_FechaPublicacion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      SERV_Interno: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: "servicios",
          key: "SERV_Interno",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      USUA_Interno: {
        type: DataTypes.STRING,
        allowNull: false,
        },
        EMPR_Interno: {
        type: DataTypes.STRING,
        allowNull: true, // algunos usuarios publican a título personal
        references: {
            model: "empresas",
            key: "EMPR_Interno",
        },
        },
    },
    {
      tableName: "avisos",
      timestamps: false,
    }
  );
};
