import { Sequelize, DataTypes, Model } from "sequelize";
import { SubcategoriaAttributes, SubcategoriaCreationAttributes } from "../interfaces/ISubcategoria";

export default (sequelize: Sequelize) => {
  sequelize.define<Model<SubcategoriaAttributes, SubcategoriaCreationAttributes>>(
    "Subcategorias",
    {
      SUBC_Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      SUBC_Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      SUBC_Descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      CATE_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "categorias",
          key: "CATE_Id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "subcategorias",
      timestamps: false,
    }
  );
};
