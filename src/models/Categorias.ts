import { Sequelize, DataTypes, Model } from "sequelize";
import { CategoriaAttributes, CategoriaCreationAttributes } from "../interfaces/ICategoria";

export default (sequelize: Sequelize) => {
  sequelize.define<Model<CategoriaAttributes, CategoriaCreationAttributes>>(
    "Categorias",
    {
      CATE_Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      CATE_Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      CATE_Descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "categorias",
      timestamps: false,
    }
  );
};
