import { Router, Request, Response } from "express";
import { authenticate } from "../config/middleware/authenticate";
import { getCursos, getCursosByUsuario, guardarProgresoCursoYModulo } from "../controllers/cursoController";
import { getUserInfo } from "../controllers/userController";

const router = Router();

/**
 * 🔹 Obtener todos los cursos (con módulos incluidos)
 */
router.get(
  "/obtener-cursos",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await getCursos();
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error inesperado",
      });
    }
  }
);

router.get(
  "/obtener-cursos/:tipo",
  authenticate, // 👈 protegida con autenticación
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { tipo } = req.params;
      const usernameFromToken = req.user?.username;

      if (tipo !== "audio" && tipo !== "video") {
        return res.status(400).json({
          success: false,
          message: "Tipo inválido. Solo se permite 'audio' o 'video'.",
        });
      }

      if (!usernameFromToken) {
        return res.status(401).json({
          success: false,
          message: "Token no válido o usuario no autenticado.",
        });
      }

      // Obtener datos completos del usuario
      const userInfo = await getUserInfo(usernameFromToken);
      if (!userInfo.success) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado con el token.",
        });
      }

      const USUA_Interno = userInfo.data.cod_usuario;

      // Llamar al controlador con el tipo y el usuario
      const result = await getCursosByUsuario(tipo as "audio" | "video", USUA_Interno);

      return res.status(result.success ? 200 : 404).json(result);
    } catch (error: any) {
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch {
        parsedError = { success: false, message: "Error al obtener cursos del usuario" };
      }

      return res.status(500).json(parsedError);
    }
  }
);

router.post(
  "/guardar-progreso",
  authenticate,
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const usernameFromToken = req.user?.username;

      if (!usernameFromToken) {
        return res.status(401).json({
          success: false,
          message: "Token no válido o usuario no autenticado.",
        });
      }

      // Obtener el código interno del usuario
      const userInfo = await getUserInfo(usernameFromToken);
      if (!userInfo.success) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado con el token.",
        });
      }

      const USUA_Interno = userInfo.data.cod_usuario;

      // Extraer datos del cuerpo del request
      const { CURS_Id, MODU_Id, porcentajeModulo, completadoModulo, tiempoActual } = req.body;

      // Validar datos mínimos
      if (!CURS_Id || !MODU_Id) {
        return res.status(400).json({
          success: false,
          message: "Faltan datos requeridos: CURS_Id o MODU_Id.",
        });
      }

      // Guardar progreso
      const result = await guardarProgresoCursoYModulo({
        USUA_Interno,
        CURS_Id: Number(CURS_Id),
        MODU_Id: Number(MODU_Id),
        porcentajeModulo: Number(porcentajeModulo) || 0,
        completadoModulo: Boolean(completadoModulo),
        tiempoActual: Number(tiempoActual) || 0, // ✅ agregado
      });

      return res.status(200).json(result);
    } catch (error: any) {
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch {
        parsedError = { success: false, message: "Error al guardar progreso" };
      }

      return res.status(500).json(parsedError);
    }
  }
);


export default router;
