import { sequelize } from "../db";
import { TipoNotificacionAttributes } from "../interfaces/ITipoNotificacion";
import { UsuarioTipoNotificacionAttributes } from "../interfaces/IUsuarioTipoNotificacion";

const {
  TipoNotificaciones,
  Usuario_TipoNotificaciones,
  Usuarios,
} = sequelize.models;

/**
 * Respuesta tipada para operaciones de actualización
 */
export interface NotificacionResponse {
  success: boolean;
  message: string;
}

/**
 * Obtener todos los tipos de notificaciones
 */
export const getAllTipoNotificaciones = async (): Promise<
  TipoNotificacionAttributes[]
> => {
  try {
    const tipos = await TipoNotificaciones.findAll();

    return tipos.map(
      (t) => t.get({ plain: true }) as TipoNotificacionAttributes
    );
  } catch (error: any) {
    throw new Error(
      "Error al obtener tipos de notificaciones: " + error.message
    );
  }
};

/**
 * Obtener notificaciones configuradas de un usuario por su correo
 */
export const getNotificacionesPorUsuario = async (
  userId: string
): Promise<UsuarioTipoNotificacionAttributes[]> => {
  try {
    const notifs = await Usuario_TipoNotificaciones.findAll({
        where: { USUA_Interno: userId },
        include: [
            {
            model: TipoNotificaciones,
            as: "TipoNotificacion",
            attributes: ["TINO_Codigo", "TINO_Nombre", "TINO_Descripcion"],
            },
        ],
        });


    return notifs.map(
      (n) => n.get({ plain: true }) as UsuarioTipoNotificacionAttributes
    );
  } catch (error: any) {
    throw new Error(
      "Error al obtener notificaciones del usuario: " + error.message
    );
  }
};



/**
 * Actualizar el estado de una notificación de usuario
 */
export const actualizarEstadoNotificacion = async (
  userId: string,
  codTipoNotificacion: number,
  activo: boolean
): Promise<NotificacionResponse> => {
  try {
    const registro = await Usuario_TipoNotificaciones.findOne({
      where: {
        USUA_Interno: userId,
        TINO_Id: codTipoNotificacion,
      },
    });

    if (!registro) {
      return {
        success: false,
        message: "La notificación no existe para este usuario",
      };
    }

    await registro.update({ UTNO_Activo: activo });


    return {
      success: true,
      message: `Notificación ${
        activo ? "activada" : "desactivada"
      } correctamente`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Error al actualizar la notificación: " + error.message,
    };
  }
};

