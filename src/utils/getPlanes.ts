// services/getPlanes.ts
import { sequelize } from "../db";
import { Model, ModelStatic } from "sequelize";
import { PlanAttributes, PlanCreationAttributes } from "../interfaces/IPlanes";
import { TipoPlanAttributes } from "../interfaces/ITipoPlanes";

const Planes = sequelize.models.Planes as ModelStatic<
  Model<PlanAttributes, PlanCreationAttributes>
>;

const TipoPlanes = sequelize.models.TipoPlanes as ModelStatic<
  Model<TipoPlanAttributes>
>;

// ⚙️ Configuración base para cada tipo de usuario
const configuracionPorUsuario = {
  independiente: {
    precios: [0.0, 29.99, 49.99],
  },
  empresa: {
    precios: [9.99, 59.99, 99.99],
  },
};

// Duración según el índice del tipo de plan
const duraciones = [1, 6, 12]; // en meses

export const getPlanes = async (): Promise<void> => {
  try {
    const existentes = await Planes.findAll();

    if (existentes.length > 0) {
      console.log("ℹ Ya existen planes en la base de datos.");
      return;
    }

    // 🔍 Obtenemos los tipos de plan existentes
    const tipos = await TipoPlanes.findAll();
    if (tipos.length === 0) {
      console.log("❌ No hay tipos de planes disponibles. Ejecuta primero getTipoPlanes().");
      return;
    }

    const nuevosPlanes: PlanCreationAttributes[] = [];

    // Recorremos cada tipo de plan existente
    tipos.forEach((tipo, index) => {
      const duracion = duraciones[index] ?? 1;

      for (const tipoUsuario of ["independiente", "empresa"] as const) {
        const precio =
          configuracionPorUsuario[tipoUsuario].precios[index] ?? 0.0;

        nuevosPlanes.push({
          TIPL_Id: tipo.get("TIPL_Id") as number,
          PLAN_TipoUsuario: tipoUsuario,
          PLAN_Precio: precio,
          PLAN_DuracionMeses: duracion,
          PLAN_Moneda: "PEN",
          PLAN_Estado: true,
        });
      }
    });

    await Planes.bulkCreate(nuevosPlanes);
    console.log("✅ Planes creados correctamente de forma dinámica.");
  } catch (error: any) {
    console.error("❌ Error al crear los planes:", error.message);
  }
};
