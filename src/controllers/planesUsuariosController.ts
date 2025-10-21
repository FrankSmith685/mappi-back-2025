import { sequelize } from "../db";
import { PlanUsuarioCreationAttributes } from "../interfaces/IPlanesUsuarios";
import { PlanAttributes } from "../interfaces/IPlanes";
import { calcularProrrateo } from "../helpers/calcularProrrateo";

const { PlanesUsuarios, Planes, Usuarios, TipoPlanes } = sequelize.models;

interface CrearPlanUsuarioParams
  extends PlanUsuarioCreationAttributes {
  PLAN_Tipo_Usuario: string; // "empresa" o "independiente"
}



export const crearPlanUsuario = async ({
  USUA_Interno,
  PLAN_Id,
  TIPL_Id,
  PLAN_Tipo_Usuario,
  PLUS_TokenPago,
  PLUS_Moneda,
  PLUS_EsPremium,
  PLUS_EstadoPago,
}: CrearPlanUsuarioParams) => {
  const transaction = await sequelize.transaction();

  try {
    // 🔹 Buscar el plan elegido según el tipo de usuario
    const planRecord = await Planes.findOne({
      where: { PLAN_Id, PLAN_TipoUsuario: PLAN_Tipo_Usuario },
    });

    if (!planRecord) {
      throw new Error(
        `El plan seleccionado (ID ${PLAN_Id}) no existe para el tipo de usuario "${PLAN_Tipo_Usuario}".`
      );
    }

    const plan = planRecord.get({ plain: true }) as PlanAttributes;

    // 🔹 Convertir precio
    const precioNuevo =
      typeof plan.PLAN_Precio === "string"
        ? parseFloat(plan.PLAN_Precio)
        : plan.PLAN_Precio;

    const esGratis = precioNuevo === 0;

    // 🔹 Validar duplicado de plan gratuito
    if (esGratis) {
      const planGratisActivo = await PlanesUsuarios.findOne({
        where: { USUA_Interno, PLUS_EstadoPago: "gratuito", PLUS_EstadoPlan: "activo", },
        order: [["PLUS_FechaExpiracion", "DESC"]],
        transaction,
      });

      if (planGratisActivo) {
        const ahora = new Date();
        const expira = new Date(
          planGratisActivo.get("PLUS_FechaExpiracion") as Date
        );

        if (expira > ahora) {
          throw new Error(
            "Ya tienes un plan gratuito activo. Espera a que expire antes de activar otro."
          );
        }
      }
    }

    // 🔹 Buscar el plan activo actual
    const planActivo = await PlanesUsuarios.findOne({
      where: { USUA_Interno, PLUS_EstadoPlan: "activo"},
      order: [["PLUS_FechaExpiracion", "DESC"]],
      transaction,
    });

    let montoFinal = esGratis ? 0 : precioNuevo;

    if (planActivo) {
      const ahora = new Date();
      const expira = new Date(planActivo.get("PLUS_FechaExpiracion") as Date);
      const fechaInicioAnterior = new Date(
        planActivo.get("PLUS_FechaInicio") as Date
      );

      if (expira > ahora) {
        const planActivoId = planActivo.get("PLAN_Id") as number;
        const precioAnterior = planActivo.get("PLUS_MontoPagado") as number;

        // ⚠️ Evitar repetir el mismo plan
        if (planActivoId === PLAN_Id) {
          throw new Error(
            "Ya tienes este mismo plan activo. No puedes comprarlo nuevamente hasta que expire."
          );
        }

        // 🔹 Calcular prorrateo con la función reutilizable
        const { saldoRestante } = calcularProrrateo(
          precioAnterior,
          fechaInicioAnterior,
          expira,
          ahora
        );

        // 🔹 Calcular monto final
        if (precioNuevo > precioAnterior) {
          montoFinal = precioNuevo - saldoRestante;
          if (montoFinal < 0) montoFinal = 0;
        } else {
          throw new Error(
            "No puedes cambiar a un plan de menor o igual precio antes del vencimiento."
          );
        }

        // 🔹 Desactivar plan anterior
        await planActivo.update(
          {
            PLUS_FechaExpiracion: ahora,
            PLUS_EstadoPlan: "cancelado",
          },
          { transaction }
        );
      }
    }

    // 🔹 Calcular fechas del nuevo plan
    const fechaInicio = new Date();
    const fechaExpiracion = new Date(fechaInicio);
    fechaExpiracion.setMonth(fechaInicio.getMonth() + plan.PLAN_DuracionMeses);

    // 🔹 Crear el nuevo registro
    const nuevoPlanUsuario = await PlanesUsuarios.create(
      {
        USUA_Interno,
        PLAN_Id,
        TIPL_Id,
        PLUS_TokenPago: esGratis ? null : PLUS_TokenPago,
        PLUS_MontoPagado: montoFinal,
        PLUS_Moneda: PLUS_Moneda || plan.PLAN_Moneda || "PEN",
        PLUS_FechaInicio: fechaInicio,
        PLUS_FechaExpiracion: fechaExpiracion,
        PLUS_EsPremium: !!PLUS_EsPremium,
        PLUS_EstadoPago: esGratis ? "gratuito" : PLUS_EstadoPago || "pagado",
        PLUS_EstadoPlan: "activo",
      },
      { transaction }
    );

    await transaction.commit();

    const usuario = await Usuarios.findOne({
      where: { USUA_Interno },
      attributes: ["USUA_Correo", "USUA_Dni"],
    });

    const usuarioData = usuario ? usuario.get({ plain: true }) : {};

    return {
      success: true,
      message: esGratis
        ? "Plan gratuito activado correctamente."
        : "Plan adquirido correctamente con ajuste proporcional.",
      data: {
        ...nuevoPlanUsuario.get({ plain: true }),
        USUA_Correo: usuarioData.USUA_Correo || null,
        USUA_Dni: usuarioData.USUA_Dni || null,
      },
    };
  } catch (error: any) {
    await transaction.rollback();
    throw new Error(error.message || "Error al registrar el plan del usuario.");
  }
};


export const getPlanesConProrrateo = async (
  USUA_Interno: string,
  PLAN_Tipo_Usuario: string
) => {
  try {
    const ahora = new Date();

    // 1️⃣ Buscar plan activo actual
    const planActivo = await PlanesUsuarios.findOne({
      where: { USUA_Interno, PLUS_EstadoPlan: "activo" },
      order: [["PLUS_FechaExpiracion", "DESC"]],
    });

    // 2️⃣ Obtener todos los planes del tipo de usuario
    const planesDisponibles = await Planes.findAll({
      where: { PLAN_TipoUsuario: PLAN_Tipo_Usuario },
    });

    // ⚠️ Si no hay plan activo → devolver todos sin prorrateo
    if (!planActivo) {
      const data = planesDisponibles.map((plan: any) => ({
        PLAN_Id: plan.PLAN_Id,
        PLAN_Precio: parseFloat(plan.PLAN_Precio),
        PLAN_Moneda: plan.PLAN_Moneda,
        PLAN_DuracionMeses: plan.PLAN_DuracionMeses,
        PLAN_TipoUsuario: plan.PLAN_TipoUsuario,
        esPlanActual: false,
        prorrateo: null,
        precioConProrrateo: parseFloat(plan.PLAN_Precio),
      }));

      return {
        success: true,
        message: "Planes obtenidos (sin prorrateo, usuario sin plan activo).",
        data,
      };
    }

    // 3️⃣ Datos del plan activo
    const planActivoData = planActivo.get({ plain: true });
    const planActivoId = planActivoData.PLAN_Id;

    // 🔹 Buscar el plan anterior en la tabla Planes para obtener su precio original
    const planAnterior = await Planes.findByPk(planActivoId);
    const precioAnterior = planAnterior
      ? parseFloat(planAnterior.get({ plain: true }).PLAN_Precio)
      : 0;


    const fechaInicioAnterior = new Date(planActivoData.PLUS_FechaInicio);
    const fechaExpiracionAnterior = new Date(planActivoData.PLUS_FechaExpiracion);

    // 4️⃣ Calcular prorrateo solo para los planes más caros
    const resultado = planesDisponibles.map((plan: any) => {
      const precioNuevo = parseFloat(plan.PLAN_Precio);

      // 🟣 Mismo plan → no aplica prorrateo
      if (plan.PLAN_Id === planActivoId) {
        return {
          PLAN_Id: plan.PLAN_Id,
          PLAN_Precio: precioNuevo,
          PLAN_Moneda: plan.PLAN_Moneda,
          PLAN_DuracionMeses: plan.PLAN_DuracionMeses,
          PLAN_TipoUsuario: plan.PLAN_TipoUsuario,
          esPlanActual: true,
          prorrateo: null,
          precioConProrrateo: precioNuevo,
        };
      }

      // 🟡 Si el nuevo plan es más barato o igual → no se aplica prorrateo
      if (precioNuevo <= precioAnterior) {
        return {
          PLAN_Id: plan.PLAN_Id,
          PLAN_Precio: precioNuevo,
          PLAN_Moneda: plan.PLAN_Moneda,
          PLAN_DuracionMeses: plan.PLAN_DuracionMeses,
          PLAN_TipoUsuario: plan.PLAN_TipoUsuario,
          esPlanActual: false,
          prorrateo: null,
          precioConProrrateo: precioNuevo,
        };
      }

      // 🟢 Calcular saldo restante si el nuevo plan es superior
      const { saldoRestante, diasRestantes } = calcularProrrateo(
        precioAnterior,
        fechaInicioAnterior,
        fechaExpiracionAnterior,
        ahora
      );

      const precioConProrrateo = Math.max(precioNuevo - saldoRestante, 0);

      return {
        PLAN_Id: plan.PLAN_Id,
        PLAN_Precio: precioNuevo,
        PLAN_Moneda: plan.PLAN_Moneda,
        PLAN_DuracionMeses: plan.PLAN_DuracionMeses,
        PLAN_TipoUsuario: plan.PLAN_TipoUsuario,
        esPlanActual: false,
        prorrateo: {
          saldoRestante,
          diasRestantes,
        },
        precioConProrrateo: parseFloat(precioConProrrateo.toFixed(2)),
      };
    });

    return {
      success: true,
      message: "Planes obtenidos con prorrateo aplicado (solo planes superiores).",
      data: resultado,
    };
  } catch (error: any) {
    console.error("Error en getPlanesConProrrateo:", error);
    throw new Error(error.message || "Error al calcular los planes con prorrateo.");
  }
};



export const getPlanesUsuarioActivos = async (USUA_Interno: string) => {
  try {
    const planesActivos = await PlanesUsuarios.findAll({
      where: { USUA_Interno, PLUS_EstadoPlan: "activo" },
      include: [
        {
          model: Planes,
          as: "Plan", // alias usado en la asociación
          attributes: [
            "PLAN_Id",
            "TIPL_Id",
            "PLAN_Precio",
            "PLAN_Moneda",
            "PLAN_DuracionMeses",
            "PLAN_TipoUsuario",
            "PLAN_Estado",
          ],
        },
      ],
      order: [["PLUS_FechaExpiracion", "DESC"]],
    });

    if (!planesActivos || planesActivos.length === 0) {
      return {
        success: true,
        message: "No se encontraron planes activos para este usuario.",
        data: [],
      };
    }

    // 🔹 Mapeo del resultado con datos limpios
    const resultado = planesActivos.map((plan: any) => ({
      USUA_Interno: plan.USUA_Interno,
      PLAN_Id: plan.PLAN_Id,
      TIPL_Id: plan.TIPL_Id,
      PLUS_TokenPago: plan.PLUS_TokenPago,
      PLUS_MontoPagado: plan.PLUS_MontoPagado,
      PLUS_Moneda: plan.PLUS_Moneda,
      PLUS_FechaInicio: plan.PLUS_FechaInicio,
      PLUS_FechaExpiracion: plan.PLUS_FechaExpiracion,
      PLUS_EsPremium: plan.PLUS_EsPremium,
      PLUS_EstadoPago: plan.PLUS_EstadoPago,
      PLUS_EstadoPlan: plan.PLUS_EstadoPlan,
      PLAN: plan.Plan
        ? {
            PLAN_Id: plan.Plan.PLAN_Id,
            TIPL_Id: plan.Plan.TIPL_Id,
            PLAN_Precio: plan.Plan.PLAN_Precio,
            PLAN_Moneda: plan.Plan.PLAN_Moneda,
            PLAN_DuracionMeses: plan.Plan.PLAN_DuracionMeses,
            PLAN_TipoUsuario: plan.Plan.PLAN_TipoUsuario,
            PLAN_Estado: plan.Plan.PLAN_Estado,
          }
        : null,
    }));

    return {
      success: true,
      message: "Planes activos obtenidos correctamente.",
      data: resultado,
    };
  } catch (error: any) {
    throw new Error(
      error.message || "Error al obtener los planes activos del usuario."
    );
  }
};
export const getPlanesUsuario = async (USUA_Interno: string) => {
  try {
    const planesUsuario = await PlanesUsuarios.findAll({
      where: { USUA_Interno },
      include: [
        {
          model: Planes,
          as: "Plan",
          attributes: [
            "PLAN_Id",
            "TIPL_Id",
            "PLAN_Precio",
            "PLAN_Moneda",
            "PLAN_DuracionMeses",
            "PLAN_TipoUsuario",
            "PLAN_Estado",
          ],
          include: [
            {
              model: TipoPlanes,
              as: "TipoPlan",
              attributes: ["TIPL_Id", "TIPL_Nombre"], // nombre del tipo de plan
            },
          ],
        },
      ],
      order: [["PLUS_FechaExpiracion", "DESC"]],
    });

    if (!planesUsuario || planesUsuario.length === 0) {
      return {
        success: true,
        message: "No se encontraron planes registrados para este usuario.",
        data: [],
      };
    }

    // 🔹 Mapeo limpio
    const resultado = planesUsuario.map((plan: any) => ({
      USUA_Interno: plan.USUA_Interno,
      PLAN_Id: plan.PLAN_Id,
      TIPL_Id: plan.TIPL_Id,
      PLUS_TokenPago: plan.PLUS_TokenPago,
      PLUS_MontoPagado: plan.PLUS_MontoPagado,
      PLUS_Moneda: plan.PLUS_Moneda,
      PLUS_FechaInicio: plan.PLUS_FechaInicio,
      PLUS_FechaExpiracion: plan.PLUS_FechaExpiracion,
      PLUS_EsPremium: plan.PLUS_EsPremium,
      PLUS_EstadoPago: plan.PLUS_EstadoPago,
      PLUS_EstadoPlan: plan.PLUS_EstadoPlan,
      PLAN: plan.Plan
        ? {
            PLAN_Id: plan.Plan.PLAN_Id,
            TIPL_Id: plan.Plan.TIPL_Id,
            PLAN_Precio: plan.Plan.PLAN_Precio,
            PLAN_Moneda: plan.Plan.PLAN_Moneda,
            PLAN_DuracionMeses: plan.Plan.PLAN_DuracionMeses,
            PLAN_TipoUsuario: plan.Plan.PLAN_TipoUsuario,
            PLAN_Estado: plan.Plan.PLAN_Estado,
            TipoPlan: plan.Plan.TipoPlan
              ? {
                  TIPL_Id: plan.Plan.TipoPlan.TIPL_Id,
                  TIPL_Nombre: plan.Plan.TipoPlan.TIPL_Nombre, // 🔹 Aquí está el nombre del plan
                }
              : null,
          }
        : null,
    }));

    return {
      success: true,
      message: "Planes del usuario obtenidos correctamente.",
      data: resultado,
    };
  } catch (error: any) {
    throw new Error(error.message || "Error al obtener los planes del usuario.");
  }
};
