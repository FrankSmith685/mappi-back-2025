import { Sequelize, DataTypes, Model } from "sequelize";
import { UsuarioModuloAttributes, UsuarioModuloCreationAttributes } from "../interfaces/IUsuarioModulos";

export default (sequelize: Sequelize) => {
  sequelize.define<Model<UsuarioModuloAttributes, UsuarioModuloCreationAttributes>>(
    "Usuarios_Modulos",
    {
      USUM_Id: {
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
      MODU_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "modulos_curso",
          key: "MODU_Id",
        },
        onDelete: "CASCADE",
      },

      // 🔢 Orden del módulo dentro del curso
      USUM_Orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Orden secuencial del módulo dentro del curso",
      },

      // 🔓 Si el módulo está desbloqueado o no
      USUM_Desbloqueado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // ✅ Porcentaje completado (0 a 100)
      USUM_PorcentajeProgreso: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      // ⏱ Tiempo actual (en segundos)
      USUM_TiempoActual: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: "Segundos donde el usuario se quedó en el contenido",
      },


      // ☑️ Completado
      USUM_Completado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // 🕒 Fecha de última actualización
      USUM_FechaUltimoProgreso: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      // 🏁 Fecha de completado
      USUM_FechaCompletado: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "usuarios_modulos",
      timestamps: false,
    }
  );
};
