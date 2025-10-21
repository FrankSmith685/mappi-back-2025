import { Sequelize, DataTypes, Model } from "sequelize";
import { ModuloCursoAttributes, ModuloCursoCreationAttributes } from "../interfaces/IModuloCurso";

export default (sequelize: Sequelize) => {
  sequelize.define<Model<ModuloCursoAttributes, ModuloCursoCreationAttributes>>(
    "ModulosCurso",
    {
      MODU_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      CURS_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "cursos",
          key: "CURS_Id",
        },
        onDelete: "CASCADE",
      },
      MODU_Titulo: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      MODU_Descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      MODU_Orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      MODU_UrlContenido: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      MODU_Estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "modulos_curso",
      timestamps: false,
    }
  );
};
