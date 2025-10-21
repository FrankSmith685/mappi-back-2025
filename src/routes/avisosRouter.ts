import { Router, Request, Response } from "express";
import { authenticate } from "../config/middleware/authenticate";
// import { createAviso } from "../controllers/avisosController"; // <-- importa tu lógica
import { getUserInfo } from "../controllers/userController";
import { createAviso, deleteAviso, getAvisos, updateAviso } from "../controllers/avisoController";

const router = Router();

// Obtener Avisos
router.get(
  "/obtener-avisos",
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

      // Obtener datos del usuario desde el token
      const userInfo = await getUserInfo(usernameFromToken);
      if (!userInfo.success) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado con el token",
        });
      }

      const userId = userInfo.data.cod_usuario;

      const result = await getAvisos(userId);

      return res.status(result.success ? 200 : 404).json(result);
    } catch (error: any) {
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch {
        parsedError = { success: false, message: "Error al obtener avisos" };
      }

      return res.status(500).json(parsedError);
    }
  }
);


// Crear aviso
router.post(
  "/create-aviso",
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

      // Obtener datos del usuario desde el token
      const userInfo = await getUserInfo(usernameFromToken);
      if (!userInfo.success) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado con el token",
        });
      }

      // Extraer datos del body
      const data = req.body;

      const payload = {
        ...data,
        USUA_Interno: userInfo.data.cod_usuario,
      };

      const result = await createAviso(payload);

      return res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado",
      });
    }
  }
);


// Actualizar aviso
router.put(
  "/update-aviso/:id",
  authenticate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const usernameFromToken = req.user?.username;

      if (!usernameFromToken) {
        return res.status(401).json({
          success: false,
          message: "Token no válido o usuario no autenticado",
        });
      }

      // Verificamos si el usuario existe
      const userInfo = await getUserInfo(usernameFromToken);
      if (!userInfo.success) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado con el token",
        });
      }

      // Los datos a actualizar vienen en el body
      const data = req.body;

      const result = await updateAviso(Number(id), data);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch {
        parsedError = { success: false, message: "Error al actualizar aviso" };
      }

      return res.status(500).json(parsedError);
    }
  }
);

// Eliminar aviso
router.delete(
  "/delete-aviso/:id",
  authenticate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const usernameFromToken = req.user?.username;

      if (!usernameFromToken) {
        return res.status(401).json({
          success: false,
          message: "Token no válido o usuario no autenticado",
        });
      }

      // Verificar usuario desde el token
      const userInfo = await getUserInfo(usernameFromToken);
      if (!userInfo.success) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado con el token",
        });
      }

      // Eliminar aviso (y su servicio asociado)
      const result = await deleteAviso(Number(id));

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch {
        parsedError = { success: false, message: "Error al eliminar aviso" };
      }

      return res.status(500).json(parsedError);
    }
  }
);



export default router;
