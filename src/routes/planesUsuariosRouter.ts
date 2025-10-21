import { Router, Request, Response } from "express";
import { authenticate } from "../config/middleware/authenticate";
import { getUserInfo } from "../controllers/userController";
import { crearPlanUsuario, getPlanesConProrrateo, getPlanesUsuario, getPlanesUsuarioActivos } from "../controllers/planesUsuariosController";

const router = Router();

/**
 * 📘 Crear un nuevo registro en planes_usuarios
 * Ejemplo: POST /planes-usuario/create
 */
router.post("/create", authenticate, async (req: Request, res: Response) => {
  try {
    const usernameFromToken = req.user?.username;

    if (!usernameFromToken) {
      return res.status(401).json({
        success: false,
        message: "Token no válido o usuario no autenticado",
      });
    }

    // 🔹 Obtener información del usuario autenticado
    const userInfo = await getUserInfo(usernameFromToken);
    if (!userInfo.success || !userInfo.data) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado con el token",
      });
    }

    // 🔹 Ejecutar la lógica de creación del plan
    const result = await crearPlanUsuario({
      ...req.body,
      USUA_Interno: userInfo.data.cod_usuario,
    });

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Error en POST /planes-usuario/create:", error);
    return res.status(400).json({
      success: false,
      message:
        error.message || "Error inesperado al registrar el plan del usuario",
    });
  }
});

/**
 * 📗 Obtener planes activos del usuario autenticado
 * Ejemplo: GET /planes-usuario/activos
 */
router.get("/activos", authenticate, async (req: Request, res: Response) => {
  try {
    const usernameFromToken = req.user?.username;

    if (!usernameFromToken) {
      return res.status(401).json({
        success: false,
        message: "Token no válido o usuario no autenticado",
      });
    }

    // 🔹 Obtener información del usuario autenticado
    const userInfo = await getUserInfo(usernameFromToken);
    if (!userInfo.success || !userInfo.data) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado con el token",
      });
    }

    // 🔹 Obtener los planes activos
    const result = await getPlanesUsuarioActivos(userInfo.data.cod_usuario);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error en GET /planes-usuario/activos:", error);
    return res.status(400).json({
      success: false,
      message:
        error.message || "Error al obtener los planes activos del usuario",
    });
  }
});

router.get("/planes-con-prorrateo", authenticate, async (req, res) => {
  try {
    const usernameFromToken = req.user?.username;

    if (!usernameFromToken) {
      return res.status(401).json({ success: false, message: "Token no válido o usuario no autenticado" });
    }

    const userInfo = await getUserInfo(usernameFromToken);
    if (!userInfo.success || !userInfo.data) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado con el token" });
    }

    const USUA_Interno = userInfo.data.cod_usuario;
    const PLAN_Tipo_Usuario =
      typeof req.query.tipo_usuario === "string"
        ? req.query.tipo_usuario
        : "independiente";

    const resultado = await getPlanesConProrrateo(USUA_Interno, PLAN_Tipo_Usuario);

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Error en GET /planes-usuario/planes-con-prorrateo:", error);
    return res.status(500).json({ success: false, message: "Error al obtener los planes con prorrateo" });
  }
});


router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const usernameFromToken = req.user?.username;

    if (!usernameFromToken) {
      return res.status(401).json({
        success: false,
        message: "Token no válido o usuario no autenticado",
      });
    }

    // 🔹 Obtener información del usuario autenticado
    const userInfo = await getUserInfo(usernameFromToken);
    if (!userInfo.success || !userInfo.data) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado con el token",
      });
    }

    // 🔹 Obtener los planes activos
    const result = await getPlanesUsuario(userInfo.data.cod_usuario);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error en GET /planes-usuario/", error);
    return res.status(400).json({
      success: false,
      message:
        error.message || "Error al obtener los planes activos del usuario",
    });
  }
});


export default router;
