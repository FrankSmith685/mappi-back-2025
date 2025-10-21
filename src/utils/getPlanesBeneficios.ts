// services/getPlanesBeneficios.ts
import { sequelize } from "../db";
import { Model, ModelStatic } from "sequelize";
import { PlanBeneficioCreationAttributes } from "../interfaces/IPlanesBeneficios";

const Planes = sequelize.models.Planes;
const PlanesBeneficios = sequelize.models.PlanesBeneficios as ModelStatic<
  Model<any, PlanBeneficioCreationAttributes>
>;

const beneficiosPorPlan: Record<
  "independiente" | "empresa",
  Record<number, string[]>
> = {
  independiente: {
    1: [
      "Aparece en el mapa por 30 días",
      "1 promoción destacada",
      "Sin prioridad en búsquedas",
      "Curso de audios disponibles",
      "Publicar máximo hasta 1 huarique",
    ],
    2: [
      "Aparece en el mapa por 6 meses",
      "Hasta 2 promociones simultáneas",
      "Mayor visibilidad en búsquedas",
      "Aparece primero en resultados",
      "Curso de audios disponibles",
      "Publicar máximo hasta 2 huariques",
      // "Acceso a soporte básico por correo",
    ],
    3: [
      "Aparece en el mapa por 1 año",
      "Hasta 3 promociones activas",
      "Máxima visibilidad y prioridad en resultados",
      "Curso de audios disponibles",
      "Aparece en el carrusel o sección destacada",
      "Posibilidad de subir un video (además de fotos)",
      "Publicar máximo hasta 3 huariques",
      // "Acceso a soporte prioritario por chat o correo",
    ],
  },

  empresa: {
    1: [
      "Aparece en el mapa por 30 días",
      "1 promoción destacada",
      "Sin prioridad en búsquedas",
      "Cursos de video disponibles",
      "Publicar máximo hasta 2 huariques",
      // "Panel de estadísticas básico (vistas y clics)",
    ],
    2: [
      "Aparece en el mapa por 6 meses",
      "Hasta 3 promociones activas",
      "Alta visibilidad y prioridad en búsquedas",
      "Cursos de video disponibles",
      "Publicar máximo hasta 3 huariques",
      // "Panel de estadísticas avanzado (clics, contactos, conversiones)",
      // "Soporte técnico prioritario",
      "Opción de destacar en el carrusel de empresas",
    ],
    3: [
      "Aparece en el mapa por 1 año",
      "Hasta 5 promociones activas",
      "Máxima visibilidad y prioridad total en resultados",
      "Cursos exclusivos de video",
      "Publicar máximo hasta 5 huariques",
      "Aparece en el carrusel principal y secciones destacadas",
      // "Panel de estadísticas profesional (reportes mensuales y métricas detalladas)",
      // "Soporte VIP personalizado",
    ],
  },
};

/**
 * Crea los beneficios asociados a cada plan y tipo de usuario
 */
export const getPlanesBeneficios = async (): Promise<void> => {
  try {
    const planes = await Planes.findAll();

    if (planes.length === 0) {
      console.log("❌ No existen planes registrados. Ejecuta primero getPlanes().");
      return;
    }

    let beneficiosCreados = 0;
    let beneficiosExistentes = 0;

    for (const plan of planes) {
      const tipoUsuario = plan.get("PLAN_TipoUsuario") as "independiente" | "empresa";
      const tipoPlanId = plan.get("TIPL_Id") as number;
      const planId = plan.get("PLAN_Id") as number;

      const beneficios = beneficiosPorPlan[tipoUsuario]?.[tipoPlanId];
      if (!beneficios) continue;

      // Verificar si ya existen beneficios para este plan
      const existentes = await PlanesBeneficios.count({
        where: { PLAN_Id: planId, TIPL_Id: tipoPlanId, PLAN_TipoUsuario: tipoUsuario },
      });

      if (existentes > 0) {
        beneficiosExistentes++;
        console.log(
          `ℹ Beneficios ya existen para el plan ${tipoUsuario} (PLAN_Id=${planId}, TIPL_Id=${tipoPlanId}).`
        );
        continue;
      }

      // Crear los beneficios nuevos
      const data: PlanBeneficioCreationAttributes[] = beneficios.map((descripcion) => ({
        PLAN_Id: planId,
        TIPL_Id: tipoPlanId,
        PLAN_TipoUsuario: tipoUsuario, 
        PLBE_Descripcion: descripcion,
      }));

      await PlanesBeneficios.bulkCreate(data);
      beneficiosCreados++;

      console.log(
        `Beneficios agregados para el plan ${tipoUsuario} (PLAN_Id=${planId}, TIPL_Id=${tipoPlanId}).`
      );
    }

    console.log(
      `\n Resumen: ${beneficiosCreados} plan(es) con beneficios nuevos creados, ${beneficiosExistentes} plan(es) ya tenían beneficios.`
    );
  } catch (error: any) {
    console.error("❌ Error al crear los beneficios:", error.message);
  }
};
