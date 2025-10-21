// modelos/Servicio.ts
import { Sequelize, DataTypes, Model } from "sequelize";
import { ServicioAttributes, ServicioCreationAttributes } from "../interfaces/IServicios";

export default (sequelize: Sequelize) => {
  sequelize.define<Model<ServicioAttributes, ServicioCreationAttributes>>(
    "Servicios",
    {
      SERV_Interno: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      SERV_Nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      SERV_Descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      SERV_Estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      SERV_Archivado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      SERV_FechaRegistro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      USUA_Interno: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "USUA_Interno",
        },
      },
      SUBC_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "subcategorias",
          key: "SUBC_Id",
        },
      },
      SERV_Abierto24h: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      SERV_HoraInicio: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      SERV_HoraFin: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      SERV_Delivery: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "servicios",
      timestamps: false,
    }
  );
};
