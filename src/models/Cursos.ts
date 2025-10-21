import { Sequelize, DataTypes, Model } from "sequelize";
import { CursoAttributes, CursoCreationAttributes } from "../interfaces/ICursos";

export default (sequelize: Sequelize) => {
  sequelize.define<Model<CursoAttributes, CursoCreationAttributes>>(
    "Cursos",
    {
      CURS_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      CURS_Titulo: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      CURS_Descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      CURS_Tipo: {
        type: DataTypes.ENUM("audio", "video"),
        allowNull: false,
      },
      CURS_Autor: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      CURS_Avatar: {
        type: DataTypes.STRING(255), // URL o ruta local de imagen
        allowNull: true,
      },
      CURS_Estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "cursos",
      timestamps: false,
    }
  );
};
