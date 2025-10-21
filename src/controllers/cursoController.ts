import { sequelize } from "../db";
import { CursoAttributes } from "../interfaces/ICursos";

const { Cursos, ModulosCurso, Usuarios_Cursos, Usuarios_Modulos } = sequelize.models;

/**
 * Obtiene todos los cursos con (opcionalmente) sus módulos.
 */
export const getCursos = async (): Promise<{
  success: boolean;
  message: string;
  data: CursoAttributes[];
}> => {
  try {
    const cursos = await Cursos.findAll({
      include: [
        {
          model: ModulosCurso,
          attributes: [
            "MODU_Id",
            "MODU_Titulo",
            "MODU_Descripcion",
            "MODU_Orden",
            "MODU_UrlContenido",
            "MODU_Estado",
          ],
        },
      ],
      order: [
        ["CURS_Id", "ASC"],
        [ModulosCurso, "MODU_Orden", "ASC"],
      ],
    });

    if (cursos.length === 0) {
      throw new Error("No se encontraron cursos registrados");
    }

    const cursosPlain: CursoAttributes[] = cursos.map((curso: any) =>
      curso.get({ plain: true })
    );

    return {
      success: true,
      message: "Cursos obtenidos correctamente",
      data: cursosPlain,
    };
  } catch (error: any) {
    throw new Error(
      JSON.stringify({
        success: false,
        message: error.message || "Error al obtener los cursos",
      })
    );
  }
};

export const getCursosByUsuario = async (
  tipo: "audio" | "video",
  USUA_Interno: string
): Promise<{
  success: boolean;
  message: string;
  data: any[];
}> => {
  try {
    // 🔹 Obtener todos los cursos con sus módulos ordenados
    const cursos = await Cursos.findAll({
      where: { CURS_Tipo: tipo },
      include: [
        {
          model: ModulosCurso,
          attributes: [
            "MODU_Id",
            "MODU_Titulo",
            "MODU_Descripcion",
            "MODU_Orden",
            "MODU_UrlContenido",
          ],
        },
      ],
      order: [
        ["CURS_Id", "ASC"],
        [ModulosCurso, "MODU_Orden", "ASC"],
      ],
    });

    if (!cursos.length) {
      throw new Error(`No se encontraron cursos de tipo ${tipo}`);
    }

    // 🔹 Obtener progreso de cursos y módulos
    const [usuarioCursos, usuarioModulos]: any[] = await Promise.all([
      Usuarios_Cursos.findAll({ where: { USUA_Interno }, raw: true }),
      Usuarios_Modulos.findAll({ where: { USUA_Interno }, raw: true }),
    ]);

    // 🔹 Mapear cursos con estado y módulos desbloqueados
    const cursosConEstado = cursos.map((curso: any, index: number) => {
      const cursoPlain = curso.get({ plain: true });
      const cursoProgreso = usuarioCursos.find(
        (uc: any) => uc.CURS_Id === cursoPlain.CURS_Id
      );

      let desbloqueado = false;
      let completado = false;
      let porcentaje = 0;

      if (cursoProgreso) {
        desbloqueado = Boolean(cursoProgreso.USUC_Desbloqueado);
        completado = Boolean(cursoProgreso.USUC_Completado);
        porcentaje = parseFloat(cursoProgreso.USUC_PorcentajeProgreso);
      } else {
        // 🔓 Desbloquear primer curso si no hay progreso
        desbloqueado = index === 0;
      }

      // 🔹 Calcular módulos con su progreso
      const modulosConEstado = cursoPlain.ModulosCursos.map(
        (modulo: any, modIndex: number) => {
          const moduloProgreso = usuarioModulos.find(
            (um: any) => um.MODU_Id === modulo.MODU_Id
          );

          let desbloqueadoModulo = false;
          let completadoModulo = false;
          let porcentajeModulo = 0;

          if (moduloProgreso) {
            desbloqueadoModulo = Boolean(moduloProgreso.USUM_Desbloqueado);
            completadoModulo = Boolean(moduloProgreso.USUM_Completado);
            porcentajeModulo = parseFloat(moduloProgreso.USUM_PorcentajeProgreso);
          } else {
            // 🔓 Si no hay progreso, desbloquear solo el primer módulo del curso
            desbloqueadoModulo = modIndex === 0;
          }

          return {
            ...modulo,
            desbloqueado: desbloqueadoModulo,
            completado: completadoModulo,
            porcentaje: porcentajeModulo,
          };
        }
      );

      // 🧩 Nueva lógica: desbloquear automáticamente el siguiente módulo si el anterior está completado
      for (let i = 0; i < modulosConEstado.length - 1; i++) {
        if (modulosConEstado[i].completado) {
          modulosConEstado[i + 1].desbloqueado = true;
        }
      }

      return {
        ...cursoPlain,
        desbloqueado,
        completado,
        porcentaje,
        modulos: modulosConEstado,
      };
    });

    return {
      success: true,
      message: "Cursos obtenidos correctamente con estado de módulos",
      data: cursosConEstado,
    };
  } catch (error: any) {
    throw new Error(
      JSON.stringify({
        success: false,
        message:
          error.message ||
          "Error al obtener los cursos y módulos del usuario con su progreso",
      })
    );
  }
};


interface ModuloCursoRaw {
  MODU_Id: number;
  CURS_Id: number;
  MODU_Orden: number;
  MODU_Titulo: string;
  MODU_Descripcion?: string;
  MODU_UrlContenido: string;
}

interface UsuarioModuloRaw {
  MODU_Id: number;
  USUA_Interno: string;
  USUM_PorcentajeProgreso: number;
  USUM_Completado: boolean;
  USUM_TiempoActual?: number;
}

export const guardarProgresoCursoYModulo = async (params: {
  USUA_Interno: string;
  CURS_Id: number;
  MODU_Id: number;
  porcentajeModulo: number; // 0-100
  completadoModulo: boolean;
  tiempoActual?: number; // 👈 nuevo parámetro opcional
}) => {
  const {
    USUA_Interno,
    CURS_Id,
    MODU_Id,
    porcentajeModulo,
    completadoModulo,
    tiempoActual,
  } = params;

  const transaction = await sequelize.transaction();

  try {
    // 🧩 1️⃣ Buscar módulo y curso
    const modulo = (await ModulosCurso.findOne({
      where: { MODU_Id },
      raw: true,
    })) as ModuloCursoRaw | null;

    if (!modulo) throw new Error("Módulo no encontrado");

    // 🟢 2️⃣ Crear o actualizar registro en Usuarios_Modulos
    const usuarioModuloExistente = await Usuarios_Modulos.findOne({
      where: { USUA_Interno, MODU_Id },
      transaction,
    });

    if (usuarioModuloExistente) {
      // 🔸 Actualizamos el progreso existente
      await usuarioModuloExistente.update(
        {
          USUM_PorcentajeProgreso: porcentajeModulo,
          USUM_Completado: completadoModulo,
          USUM_TiempoActual:
            tiempoActual ??
            usuarioModuloExistente.getDataValue("USUM_TiempoActual"),
          USUM_FechaUltimoProgreso: new Date(),
          USUM_FechaCompletado: completadoModulo ? new Date() : null,
        },
        { transaction }
      );
    } else {
      // 🔸 Creamos un nuevo registro
      await Usuarios_Modulos.create(
        {
          USUA_Interno,
          MODU_Id,
          USUM_Orden: modulo.MODU_Orden,
          USUM_Desbloqueado: true,
          USUM_PorcentajeProgreso: porcentajeModulo,
          USUM_Completado: completadoModulo,
          USUM_TiempoActual: tiempoActual ?? 0,
          USUM_FechaUltimoProgreso: new Date(),
          USUM_FechaCompletado: completadoModulo ? new Date() : null,
        },
        { transaction }
      );
    }

    // =======================
// 🟣 3️⃣ Calcular progreso total del curso
// =======================
const modulosCurso = (await ModulosCurso.findAll({
  where: { CURS_Id },
  raw: true,
})) as unknown as ModuloCursoRaw[];

const modulosUsuario = (await Usuarios_Modulos.findAll({
  where: { USUA_Interno },
  raw: true,
})) as unknown as UsuarioModuloRaw[];

const modulosCursoIds = modulosCurso.map((m) => m.MODU_Id);
let modulosUsuarioCurso = modulosUsuario.filter((u) =>
  modulosCursoIds.includes(u.MODU_Id)
);

// ⚡️ Actualizar manualmente el módulo actual (por si el query aún no refleja el update)
const existeEnMemoria = modulosUsuarioCurso.find((u) => u.MODU_Id === MODU_Id);
if (existeEnMemoria) {
  existeEnMemoria.USUM_PorcentajeProgreso = porcentajeModulo;
  existeEnMemoria.USUM_Completado = completadoModulo;
} else {
  modulosUsuarioCurso.push({
    MODU_Id,
    USUA_Interno,
    USUM_PorcentajeProgreso: porcentajeModulo,
    USUM_Completado: completadoModulo,
    USUM_TiempoActual: tiempoActual ?? 0,
  });
}

// 📈 Calcular promedio de progreso
const porcentajeTotal =
  modulosUsuarioCurso.length > 0
    ? modulosUsuarioCurso.reduce(
        (acc, curr) => acc + Number(curr.USUM_PorcentajeProgreso || 0),
        0
      ) / modulosCurso.length
    : 0;

// ✅ Considerar curso completado si TODOS los módulos están completados O si el progreso total es 100%
const completadoCurso =
  modulosCurso.length > 0 &&
  (
    modulosCurso.every((mod) =>
      modulosUsuarioCurso.some(
        (u) => u.MODU_Id === mod.MODU_Id && u.USUM_Completado === true
      )
    ) ||
    porcentajeTotal >= 99.9 // margen para decimales
  );



// 🔵 Crear o actualizar el curso del usuario
const [usuarioCurso, creado] = await Usuarios_Cursos.findOrCreate({
  where: { USUA_Interno, CURS_Id },
  defaults: {
    USUA_Interno,
    CURS_Id,
    USUC_Orden: CURS_Id,
    USUC_Desbloqueado: true,
    USUC_PorcentajeProgreso: porcentajeTotal,
    USUC_Completado: completadoCurso,
    USUC_FechaDesbloqueo: new Date(),
    USUC_FechaCompletado: completadoCurso ? new Date() : null,
  },
  transaction,
});

// 🟩 Si ya existía, lo actualizamos con los datos nuevos
if (!creado) {
  await usuarioCurso.update(
    {
      USUC_PorcentajeProgreso: porcentajeTotal,
      USUC_Completado: completadoCurso,
      USUC_FechaCompletado: completadoCurso
        ? new Date()
        : (usuarioCurso.get("USUC_FechaCompletado") as Date | null),
    },
    { transaction }
  );
} else if (completadoCurso) {
  // Si se acaba de crear y ya está completo
  await usuarioCurso.update(
    { USUC_FechaCompletado: new Date() },
    { transaction }
  );
}



// 🧠 Si el curso fue completado, log especial
if (completadoCurso) {
  console.log(
    `🎉 Curso ${CURS_Id} COMPLETADO por ${USUA_Interno} — Fecha: ${new Date().toISOString()}`
  );
}




    // ✅ Guardar cambios
    await transaction.commit();

    console.log("✅ Guardado curso:", {
      CURS_Id,
      porcentajeTotal,
      completadoCurso,
    });


    // 🔁 Retornar respuesta
    return {
      success: true,
      message: "✅ Progreso guardado correctamente",
      data: {
        curso: {
          CURS_Id,
          porcentaje: porcentajeTotal.toFixed(2),
          completado: completadoCurso,
        },
        modulo: {
          MODU_Id,
          porcentaje: porcentajeModulo,
          completado: completadoModulo,
          tiempoActual: tiempoActual ?? null,
        },
      },
    };
  } catch (error: any) {
    await transaction.rollback();
    throw new Error(
      JSON.stringify({
        success: false,
        message: error.message || "❌ Error al guardar el progreso",
      })
    );
  }
};
