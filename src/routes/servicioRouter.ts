import { Router, Request, Response } from "express";
import { authenticate } from "../config/middleware/authenticate";
import {
  createServicio,
    getServicioActivoById,
    getServicioById,
    getServicios,
    getServiciosActivos,
    getServiciosActivosConPlanChevere,
    getServiciosActivosPremium,
    getServiciosByUsuario,
//   getAllServicios,
//   getServiciosPorUsuario,
//   updateServicio,
  ServicioResponse,
  toggleArchivarServicio,
  updateServicio,
} from "../controllers/servicioController";
import { getUserInfo } from "../controllers/userController";

const router = Router();




router.get(
  "/activos",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const serviciosActivos = await getServiciosActivos();
      return res.status(200).json({
        success: true,
        message: "Servicios activos obtenidos correctamente",
        data: serviciosActivos,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado al obtener servicios activos",
      });
    }
  }
);

/**
 * Obtener servicios del usuario autenticado
 */
router.get(
  "/mis-servicios",
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

      const userInfo = await getUserInfo(usernameFromToken);
      if (!userInfo.success || !userInfo.data) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      const USUA_Interno = userInfo.data.cod_usuario;
      console.log(USUA_Interno);
      const serviciosUsuario = await getServiciosByUsuario(USUA_Interno);

      return res.status(200).json({
        success: true,
        data: serviciosUsuario,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado al obtener los servicios del usuario",
      });
    }
  }
);


/**
 * Obtener todos los servicios
 */
router.get(
  "/obtenerTodos",
  authenticate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const servicios = await getServicios(); // llama a tu función
      return res.status(200).json({ success: true, data: servicios });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error inesperado" });
    }
  }
);

/**
 * Obtener un servicio por su código
 */
router.get(
  "/:servicioId",
  authenticate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { servicioId } = req.params;
      const servicio = await getServicioById(servicioId);

      if (!servicio) {
        return res.status(404).json({ success: false, message: "Servicio no encontrado" });
      }

      return res.status(200).json({ success: true, data: servicio });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error inesperado" });
    }
  }
);

/**
 * Crear un nuevo servicio
 */
router.post(
  "/create-servicio",
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

      const userInfo = await getUserInfo(usernameFromToken);
      if (!userInfo.success) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      const USUA_Interno = userInfo.data.cod_usuario;

      // Llamada al controller
      const result: ServicioResponse = await createServicio({
        ...req.body,
        USUA_Interno,
      });

      return res
        .status(result.success ? 201 : 400)
        .json({ success: result.success, message: result.message, data: result.data });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado",
      });
    }
  }
);
router.put(
  "/archivar",
  authenticate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { archivado, servicioIds } = req.body; // puede ser un string o un array

      if (typeof archivado !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "El campo 'archivado' debe ser true o false",
        });
      }

      if (!servicioIds || (Array.isArray(servicioIds) && servicioIds.length === 0)) {
        return res.status(400).json({
          success: false,
          message: "Debe enviar uno o varios 'servicioIds'",
        });
      }

      const result = await toggleArchivarServicio(servicioIds, archivado);

      return res
        .status(result.success ? 200 : 404)
        .json({ success: result.success, message: result.message });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error al archivar/desarchivar el servicio",
      });
    }
  }
);

router.put(
  "/update-servicio/:servicioId",
  authenticate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { servicioId } = req.params;

      if (!servicioId) {
        return res.status(400).json({
          success: false,
          message: "Debe proporcionar el ID del servicio a actualizar",
        });
      }

      const result: ServicioResponse = await updateServicio(servicioId, req.body);

      return res
        .status(result.success ? 200 : 400)
        .json({ success: result.success, message: result.message, data: result.data });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado al actualizar el servicio",
      });
    }
  }
);

/**
 * Obtener solo los servicios activos
 */

router.get(
  "/activo/:servicioId",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { servicioId } = req.params;

      if (!servicioId) {
        return res.status(400).json({
          success: false,
          message: "Debe proporcionar el ID del servicio activo",
        });
      }

      const servicio = await getServicioActivoById(servicioId);

      if (!servicio.success) {
        return res.status(404).json({
          success: false,
          message: servicio.message || "Servicio activo no encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        message: servicio.message,
        data: servicio.data,
      });
    } catch (error: any) {
      console.error(" Error en /activo/:servicioId:", error.message);
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado al obtener el servicio activo",
      });
    }
  }
);


router.get(
  "/activos/chevere",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const serviciosChevere = await getServiciosActivosConPlanChevere();

      return res.status(200).json({
        success: true,
        message: "Servicios activos con plan 'chévere' obtenidos correctamente",
        data: serviciosChevere,
      });
    } catch (error: any) {
      console.error(" Error en /activos/chevere:", error.message);
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado al obtener servicios con plan 'chevere'",
      });
    }
  }
);

router.get(
  "/activos/premium",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const serviciosPremium = await getServiciosActivosPremium();

      return res.status(200).json({
        success: true,
        message: "Servicios activos con plan premium obtenidos correctamente",
        data: serviciosPremium,
      });
    } catch (error: any) {
      console.error(" Error en /activos/premium:", error.message);
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado al obtener servicios premium",
      });
    }
  }
);


export default router;
