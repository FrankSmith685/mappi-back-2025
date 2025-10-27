import { sequelize } from "../db";
import { calcularProgreso } from "../helpers/calcularProgreso";
import { AvisoAttributes, AvisoCreateInput, AvisoCreationAttributes } from "../interfaces/IAvisos";

const { Avisos, Servicios, PlanesUsuarios, Subcategorias,Archivos, Direcciones  } = sequelize.models;

// Obtener todos los avisos
export const getAvisos = async (
  userId: string
): Promise<{
  success: boolean;
  message: string;
  data: {
    avisos: AvisoAttributes[];
    avisos_incompletos: number;
    avisos_duplicados: number;
    consultas_pendientes: number;
    reportes_pendientes: number;
    planes_disponibles: number;
  };
}> => {
  try {
    const avisos = await Avisos.findAll({
      where: { USUA_Interno: userId },
      include: [
        {
          model: Servicios,
          as: "Servicio",
          required: false,
          include: [
            {
              model: Subcategorias,
              as: "Subcategoria",
              required: false,
              attributes: ["SUBC_Id", "SUBC_Nombre", "SUBC_Descripcion"],
            },
            {
              model: Archivos,
              as: "Archivos",
              required: false,
              where: {
                ARCH_Tipo: "imagen",
                ARCH_Entidad: "servicio",
              },
              attributes: ["ARCH_Ruta"],
              limit: 1, // solo la primera imagen
              separate: true, // <- importante para que `limit` funcione dentro del include
              order: [["ARCH_Id", "ASC"]], // opcional, para que la primera sea la más antigua
            }
          ],
        },
      ],
    });

    const planes_disponibles = await PlanesUsuarios.count({
      where: {
        USUA_Interno: userId,
        PLUS_EstadoPlan: "activo", // solo planes activos
      },
    });

    if (avisos.length === 0) {
      return {
        success: true,
        message: "No se encontraron avisos para este usuario",
        data: {
          avisos: [],
          consultas_pendientes: 0,
          avisos_incompletos: 0,
          avisos_duplicados: 0,
          reportes_pendientes: 0,
          planes_disponibles,
        },
      };
    }

    const avisosPlain: AvisoAttributes[] = avisos.map((aviso: any) =>
      aviso.get({ plain: true })
    );

    // Consultas pendientes = todos los borradores
    const consultas_pendientes = 0;

    // Avisos incompletos = borradores con progreso menor a 100
    const avisos_incompletos = avisosPlain.filter(
      (a) => a.AVIS_Estado === "borrador" && a.AVIS_Progreso < 100
    ).length;

    // Avisos duplicados = mismo SERV_Interno repetido
    const duplicados = new Set<string>();
    const vistos = new Set<string>();
    avisosPlain.forEach((a) => {
      if (a.SERV_Interno) {
        if (vistos.has(a.SERV_Interno)) duplicados.add(a.SERV_Interno);
        else vistos.add(a.SERV_Interno);
      }
    });
    const avisos_duplicados = duplicados.size;

    // Reportes pendientes = pausados o eliminados sin publicación
    const reportes_pendientes = avisosPlain.filter(
      (a) =>
        (a.AVIS_Estado === "pausado" || a.AVIS_Estado === "eliminado") &&
        !a.AVIS_FechaPublicacion
    ).length;

    return {
      success: true,
      message: "Avisos del usuario encontrados",
      data: {
        avisos: avisosPlain,
        consultas_pendientes,
        avisos_incompletos,
        avisos_duplicados,
        reportes_pendientes,
        planes_disponibles,
      },
    };
  } catch (error: any) {
    throw new Error(
      JSON.stringify({ success: false, message: error.message })
    );
  }
};



// Crear un aviso
export const createAviso = async (
  data: Omit<AvisoCreationAttributes, "AVIS_Progreso">
    & { isCompleted: number } // lo agregamos solo para el payload
): Promise<{ success: boolean; message: string; data?: AvisoAttributes }> => {
  try {
    // calcular progreso con el helper
    const progreso = calcularProgreso(data.isCompleted);

    // crear aviso sin `isCompleted` ya que no existe en la tabla
    const aviso = await Avisos.create({
      ...data,
      AVIS_Progreso: progreso,
    });

    return {
      success: true,
      message: "Aviso creado correctamente",
      data: aviso.get({ plain: true }) as AvisoAttributes,
    };
  } catch (error: any) {
    throw new Error(
      JSON.stringify({ success: false, message: error.message })
    );
  }
};


// Actualizar un aviso
export const updateAviso = async (
  id: number,
  data: Partial<AvisoAttributes> & { isCompleted?: number } //añadimos el campo opcional
): Promise<{ success: boolean; message: string; data?: AvisoAttributes }> => {
  try {
    const aviso = await Avisos.findByPk(id);

    if (!aviso) {
      throw new Error("Aviso no encontrado");
    }

    // 👇 Si el payload incluye isCompleted, recalculamos el progreso
    if (typeof data.isCompleted === "number") {
      const progreso = calcularProgreso(data.isCompleted);
      data.AVIS_Progreso = progreso;
      delete (data as any).isCompleted; // eliminamos del payload para no guardar en BD
    }

    await aviso.update(data);

    return {
      success: true,
      message: "Aviso actualizado correctamente",
      data: aviso.get({ plain: true }) as AvisoAttributes,
    };
  } catch (error: any) {
    throw new Error(
      JSON.stringify({ success: false, message: error.message })
    );
  }
};


// Eliminar un aviso
export const deleteAviso = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const transaction = await sequelize.transaction();
  try {
    const aviso = await Avisos.findByPk(id, { transaction });

    if (!aviso) {
      throw new Error("Aviso no encontrado");
    }

    const servicioId = aviso.getDataValue("SERV_Interno");

    //  1. Si el aviso tiene un servicio, eliminar sus relaciones
    if (servicioId) {
      // Eliminar archivos del servicio
      await Archivos.destroy({
        where: {
          ARCH_EntidadId: servicioId,
          ARCH_Entidad: "servicio",
        },
        transaction,
      });

      // Eliminar dirección asociada al servicio
      await Direcciones.destroy({
        where: {
          DIUS_Cod_Entidad: servicioId,
          DIUS_Tipo_Entidad: "servicio",
        },
        transaction,
      });

      // Eliminar servicio
      await Servicios.destroy({
        where: { SERV_Interno: servicioId },
        transaction,
      });
    }

    //  2. Eliminar archivos del aviso (si existen)
    const avisoId = aviso.getDataValue("AVIS_Id");

    await Archivos.destroy({
      where: {
        ARCH_EntidadId: avisoId,
        ARCH_Entidad: "aviso",
      },
      transaction,
    });


    //  3. Eliminar el aviso
    await aviso.destroy({ transaction });

    //  4. Confirmar cambios
    await transaction.commit();

    return {
      success: true,
      message: "Aviso y todos sus datos relacionados eliminados correctamente",
    };
  } catch (error: any) {
    await transaction.rollback();
    throw new Error(
      JSON.stringify({ success: false, message: error.message })
    );
  }
};

