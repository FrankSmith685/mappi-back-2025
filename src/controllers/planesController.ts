// services/getPlanesByTipoUsuario.ts
import { sequelize } from "../db";
import { PlanAttributes } from "../interfaces/IPlanes";
import { PlanBeneficioAttributes } from "../interfaces/IPlanesBeneficios";
import { TipoPlanAttributes } from "../interfaces/ITipoPlanes";

// Modelos
const { Planes, PlanesBeneficios, TipoPlanes } = sequelize.models;

/**
 * Obtener planes según tipo de usuario (empresa o independiente)
 */export const getPlanesByTipoUsuario = async (
  tipoUsuario: "empresa" | "independiente"
): Promise<{ success: boolean; message: string; data: any[] }> => {
  try {
    console.log("🔍 Tipo de usuario:", tipoUsuario);

    const planes = await Planes.findAll({
      where: { PLAN_TipoUsuario: tipoUsuario },
      include: [
        {
          model: TipoPlanes,
          as: "TipoPlan",
          attributes: ["TIPL_Id", "TIPL_Nombre", "TIPL_Descripcion"],
        },
        {
          model: PlanesBeneficios,
          as: "Beneficios",
          attributes: [
            "PLBE_Id",
            "PLBE_Descripcion",
            "PLAN_Id",
            "PLAN_TipoUsuario",
            "TIPL_Id",
          ],
          required: false,
          where: {
            PLAN_TipoUsuario: tipoUsuario,
          },
        },
      ],
      order: [["PLAN_Precio", "ASC"]],
    });

    if (!planes.length) {
      throw new Error(`No se encontraron planes para el tipo de usuario: ${tipoUsuario}`);
    }

    const planesFiltrados = planes.map((plan: any) => {
      const plain = plan.get({ plain: true });

      plain.Beneficios = plain.Beneficios.filter(
        (b: any) =>
          b.PLAN_Id === plain.PLAN_Id &&
          b.PLAN_TipoUsuario === plain.PLAN_TipoUsuario &&
          b.TIPL_Id === plain.TIPL_Id
      );

      return plain;
    });

    return {
      success: true,
      message: `Planes encontrados para el tipo de usuario: ${tipoUsuario}`,
      data:planesFiltrados,
    };
  } catch (error: any) {
    throw new Error(
      JSON.stringify({
        success: false,
        message: error.message || "Error al obtener los planes",
      })
    );
  }
};



/**
 * Obtener todos los planes (filtrando beneficios por tipo de usuario)
 */
export const getTodosLosPlanes = async (): Promise<{
  success: boolean;
  message: string;
  data: any[];
}> => {
  try {
    const planes = await Planes.findAll({
      include: [
        {
          model: TipoPlanes,
          as: "TipoPlan",
          attributes: ["TIPL_Id", "TIPL_Nombre", "TIPL_Descripcion"],
        },
        {
          model: PlanesBeneficios,
          as: "Beneficios",
          attributes: [
            "PLBE_Id",
            "PLBE_Descripcion",
            "PLAN_Id",
            "PLAN_TipoUsuario",
            "TIPL_Id",
          ],
        },
      ],
      order: [
        ["PLAN_TipoUsuario", "ASC"],
        ["PLAN_Precio", "ASC"],
      ],
    });

    if (planes.length === 0) {
      throw new Error("No se encontraron planes registrados.");
    }

    // Filtramos los beneficios por PLAN_Id, PLAN_TipoUsuario y TIPL_Id
    const planesFiltrados = planes.map((plan: any) => {
      const plain = plan.get({ plain: true });

      plain.Beneficios = plain.Beneficios.filter(
        (b: any) =>
          b.PLAN_Id === plain.PLAN_Id &&
          b.PLAN_TipoUsuario === plain.PLAN_TipoUsuario &&
          b.TIPL_Id === plain.TIPL_Id
      );

      return plain;
    });

    return {
      success: true,
      message: "Todos los planes encontrados correctamente.",
      data: planesFiltrados,
    };
  } catch (error: any) {
    throw new Error(
      JSON.stringify({
        success: false,
        message: error.message || "Error al obtener los planes",
      })
    );
  }
};