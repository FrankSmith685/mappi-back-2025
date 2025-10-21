import { Router, Request, Response } from "express";
import { authenticate } from "../config/middleware/authenticate";
// import { saveDireccion } from "../controllers/direccionesController";
import { getUserInfo } from "../controllers/userController";
import { getEmpresaByUserId } from "../controllers/empresaController";
import { getDireccionByEntidad, saveDireccion, updateDireccion } from "../controllers/direccionController";

const router = Router();

router.post("/create", authenticate, async (req: Request, res: Response) => {
  try {
    const usernameFromToken = req.user?.username;

    if (!usernameFromToken) {
      return res.status(401).json({
        success: false,
        message: "Token no válido o usuario no autenticado",
      });
    }

    // Obtenemos la información del usuario desde el token
    const userInfo = await getUserInfo(usernameFromToken);
    if (!userInfo.success || !userInfo.data) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado con el token",
      });
    }

    let tipo_entidad = req.body.tipo_entidad || "usuario";
    let cod_entidad = req.body.cod_entidad;

    // Si no se envía cod_entidad, lo inferimos automáticamente
    if (!cod_entidad) {
      if (tipo_entidad === "usuario") {
        cod_entidad = userInfo.data.cod_usuario;
      } else if (tipo_entidad === "empresa") {
        const empresa = await getEmpresaByUserId(userInfo.data.cod_usuario);
        if (!empresa) {
          return res.status(404).json({
            success: false,
            message: "No se encontró una empresa asociada al usuario",
          });
        }
        cod_entidad = empresa.cod_empresa;
      } else {
        return res.status(400).json({
          success: false,
          message:
            "Debes proporcionar un cod_entidad para entidades distintas a usuario o empresa",
        });
      }
    }

    // Inyectamos los datos procesados al body antes de llamar al controlador
    req.body.cod_entidad = cod_entidad;
    req.body.tipo_entidad = tipo_entidad;

    // Ejecutar controlador de creación
    return saveDireccion(req, res);
  } catch (error: any) {
    console.error("Error en POST /direcciones/create:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error inesperado al crear la dirección",
    });
  }
});

router.get("/:tipo_entidad/:cod_entidad", authenticate, async (req: Request, res: Response) => {
  try {
    return getDireccionByEntidad(req, res);
  } catch (error: any) {
    console.error("Error en GET /direcciones/:tipo_entidad/:cod_entidad:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error inesperado al obtener la dirección",
    });
  }
});

router.put("/update", authenticate, async (req: Request, res: Response) => {
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
        message: "Usuario no encontrado con el token",
      });
    }

    let tipo_entidad = req.body.tipo_entidad || "usuario";
    let cod_entidad = req.body.cod_entidad;

    // Inferir automáticamente el código de entidad si no se envía
    if (!cod_entidad) {
      if (tipo_entidad === "usuario") {
        cod_entidad = userInfo.data.cod_usuario;
      } else if (tipo_entidad === "empresa") {
        const empresa = await getEmpresaByUserId(userInfo.data.cod_usuario);
        if (!empresa) {
          return res.status(404).json({
            success: false,
            message: "No se encontró una empresa asociada al usuario",
          });
        }
        cod_entidad = empresa.cod_empresa;
      } else {
        return res.status(400).json({
          success: false,
          message:
            "Debes proporcionar un cod_entidad para entidades distintas a usuario o empresa",
        });
      }
    }

    req.body.cod_entidad = cod_entidad;
    req.body.tipo_entidad = tipo_entidad;

    // Ejecutar la función del controlador
    return updateDireccion(req, res);
  } catch (error: any) {
    console.error("Error en PUT /direcciones/update:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error inesperado al actualizar la dirección",
    });
  }
});




export default router;
