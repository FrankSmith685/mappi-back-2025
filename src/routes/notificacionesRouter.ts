import { Router, Request, Response } from "express";
import { authenticate } from "../config/middleware/authenticate";
import {
  getAllTipoNotificaciones,
  actualizarEstadoNotificacion,
  getNotificacionesPorUsuario,
} from "../controllers/notificacionesController";
import { getUserInfo } from "../controllers/userController";

const router = Router();

/**
 * Obtener todos los tipos de notificaciones disponibles
 */
router.get(
  "/tipos",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const tipos = await getAllTipoNotificaciones();
      return res.status(200).json({ success: true, data: tipos });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Error inesperado" });
    }
  }
);

/**
 * Obtener configuraciones de notificaciones de un usuario (por correo del token)
 */
router.get(
  "/usuario",
  authenticate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const usernameFromToken = req.user?.username;
      if (!usernameFromToken) {
        return res.status(401).json({
          success: false,
          message: "Token no válido o usuario no autenticado",
        });
      }

      // Obtener datos completos del usuario desde tu servicio
      const userInfo = await getUserInfo(usernameFromToken);
      if (!userInfo.success) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado con el token",
        });
      }

      const USUA_Interno = userInfo.data.cod_usuario;

      const notifs = await getNotificacionesPorUsuario(USUA_Interno);
      return res.status(200).json({ success: true, data: notifs });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado",
      });
    }
  }
);

/**
 * Actualizar estado de una notificación de usuario
 */
router.put(
  "/usuario/:tipoId",
  authenticate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const usernameFromToken = req.user?.username; // <- igual que en update-user
      if (!usernameFromToken) {
        return res.status(401).json({
          success: false,
          message: "Token no válido o usuario no autenticado",
        });
      }

      // Obtener datos completos del usuario desde tu servicio
      const userInfo = await getUserInfo(usernameFromToken);
      if (!userInfo.success) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado con el token",
        });
      }

      const USUA_Interno = userInfo.data.cod_usuario;
      const { tipoId } = req.params;
      const { activo } = req.body;

      const result = await actualizarEstadoNotificacion(
        USUA_Interno,
        parseInt(tipoId, 10),
        activo
      );

      return res
        .status(result.success ? 200 : 400)
        .json({ success: result.success, message: result.message });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado",
      });
    }
  }
);


export default router;
