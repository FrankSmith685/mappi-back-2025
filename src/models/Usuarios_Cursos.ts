import { Sequelize, DataTypes, Model } from "sequelize";
import {
  UsuarioCursoAttributes,
  UsuarioCursoCreationAttributes,
} from "../interfaces/IUsuarioCurso";

export default (sequelize: Sequelize) => {
  sequelize.define<Model<UsuarioCursoAttributes, UsuarioCursoCreationAttributes>>(
    "Usuarios_Cursos",
    {
      USUC_Id: {
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
      CURS_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "cursos",
          key: "CURS_Id",
        },
        onDelete: "CASCADE",
      },

      // 🔢 Orden secuencial del curso (1,2,3,...)
      USUC_Orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Orden secuencial del curso asignado al usuario",
      },

      // 🔓 Curso desbloqueado (solo el primero al iniciar)
      USUC_Desbloqueado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Indica si el curso está desbloqueado para el usuario",
      },

      // ☑️ Curso completado
      USUC_Completado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Indica si el usuario completó el curso",
      },

      // 📈 Porcentaje general del curso (promedio de módulos)
      USUC_PorcentajeProgreso: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      // 📅 Fecha en la que el curso fue desbloqueado
      USUC_FechaDesbloqueo: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // 🏁 Fecha de completado
      USUC_FechaCompletado: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "usuarios_cursos",
      timestamps: false,
    }
  );
};
