import { Model } from 'sequelize';
import { sequelize } from '../db';
import { PreferenciaUpdate, TipoNotificacionesAttributes } from '../interfaces/TipoNotificaciones';
import { NotificacionAttributes } from '../interfaces/Notificaciones';
import { UsuarioAttributes } from '../interfaces/Usuario';

const { TipoNotificaciones, Usuarios, UsuaTipNotificaciones  } = sequelize.models;

// Obtener todos los tipos de notificaciones
export const getTipoNotificaciones = async (): Promise<{
  success: boolean;
  message: string;
  data: TipoNotificacionesAttributes[];
}> => {
  try {
    const tipos = await TipoNotificaciones.findAll();

    if (tipos.length === 0) {
      throw new Error('No se encontraron tipos de notificación');
    }

    const tiposPlain: TipoNotificacionesAttributes[] = tipos.map((t: Model) =>
      t.get({ plain: true })
    );

    return {
      success: true,
      message: 'Tipos de notificación encontrados',
      data: tiposPlain,
    };
  } catch (error: any) {
    throw new Error(JSON.stringify({ success: false, message: error.message }));
  }
};
export const getUsuarioTipoNotificacionesPorCorreo = async (correo: string) => {
  try {
    const usuarioInstance = await Usuarios.findOne({
      where: { correo },
      attributes: ['cod_usuario', 'nombre', 'correo']
    });

    const usuario = usuarioInstance?.get({ plain: true }) as UsuarioAttributes;

    if (!usuario) {
      return {
        success: false,
        message: "Usuario no encontrado.",
        data: []
      };
    }

    const preferencias = await UsuaTipNotificaciones.findAll({
        where: { cod_usuario: usuario.cod_usuario },
        include: [
            {
            model: TipoNotificaciones,
            attributes: ['nombre']
            }
        ]
    });


    return {
      success: true,
      message: "Preferencias encontradas.",
      data: preferencias.map(p => p.get({ plain: true }))
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Error al obtener preferencias.",
      data: []
    };
  }
};

export const updateUsuarioTipoNotificaciones = async (
  updates: PreferenciaUpdate[]
) => {
  try {
    for (const { cod_usua_tip_notificacion, activo } of updates) {
      await UsuaTipNotificaciones.update(
        { activo },
        { where: { cod_usua_tip_notificacion } }
      );
    }

    return {
      success: true,
      message: "Preferencias actualizadas correctamente.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Error al actualizar preferencias.",
    };
  }
};